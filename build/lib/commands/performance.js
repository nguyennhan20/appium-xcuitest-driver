'use strict';

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign2 = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _appiumSupport = require('appium-support');

var _teen_process = require('teen_process');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _utils = require('../utils');

var _asyncbox = require('asyncbox');

var commands = {};

var RECORDERS_CACHE = {};
var DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
var STOP_TIMEOUT_MS = 3 * 60 * 1000;
var START_TIMEOUT_MS = 15 * 1000;
var DEFAULT_PROFILE_NAME = 'Activity Monitor';
var DEFAULT_EXT = '.trace';

function finishPerfRecord(proc) {
  var stopGracefully = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  return _regeneratorRuntime.async(function finishPerfRecord$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (proc.isRunning) {
          context$1$0.next = 2;
          break;
        }

        return context$1$0.abrupt('return');

      case 2:
        if (!stopGracefully) {
          context$1$0.next = 7;
          break;
        }

        _logger2['default'].debug('Sending SIGINT to the running instruments process');
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(proc.stop('SIGINT', STOP_TIMEOUT_MS));

      case 6:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 7:
        _logger2['default'].debug('Sending SIGTERM to the running instruments process');
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(proc.stop());

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function uploadTrace(localFile) {
  var remotePath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
  var uploadOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  return _regeneratorRuntime.async(function uploadTrace$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap((0, _utils.encodeBase64OrUpload)(localFile, remotePath, uploadOptions));

      case 3:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 4:
        context$1$0.prev = 4;
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(localFile));

      case 7:
        return context$1$0.finish(4);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0,, 4, 8]]);
}

/**
 * @typedef {Object} StartPerfRecordOptions
 *
 * @property {?number|string} timeout [300000] - The maximum count of milliseconds to record the profiling information.
 * @property {?string} profileName [Activity Monitor] - The name of existing performance profile to apply.
 *                                                      Execute `instruments -s` to show the list of available profiles.
 *                                                      Note, that not all profiles are supported on mobile devices.
 * @property {?string|number} pid - The ID of the process to meassure the performance for.
 *                                  Set it to `current` in order to meassure the performance of
 *                                  the process, which belongs to the currently active application.
 *                                  All processes running on the device are meassured if
 *                                  pid is unset (the default setting).
 */

/**
 * Starts performance profiling for the device under test.
 * The `instruments` developer utility is used for this purpose under the hood.
 * It is possible to record multiple profiles at the same time.
 * Read https://developer.apple.com/library/content/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/Recording,Pausing,andStoppingTraces.html
 * for more details.
 *
 * @param {?StartPerfRecordOptions} opts - The set of possible start record options
 */
commands.mobileStartPerfRecord = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _opts$timeout, timeout, _opts$profileName, profileName, pid, runningRecorders, _runningRecorders$opts$device$udid, _proc, _localPath, localPath, args, appInfo, proc;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!this.relaxedSecurityEnabled && !this.isRealDevice()) {
          _logger2['default'].errorAndThrow('Appium server must have relaxed security flag set in order ' + 'for Simulator performance measurement to work');
        }

        _opts$timeout = opts.timeout;
        timeout = _opts$timeout === undefined ? DEFAULT_TIMEOUT_MS : _opts$timeout;
        _opts$profileName = opts.profileName;
        profileName = _opts$profileName === undefined ? DEFAULT_PROFILE_NAME : _opts$profileName;
        pid = opts.pid;
        runningRecorders = RECORDERS_CACHE[profileName];

        if (!(_lodash2['default'].isPlainObject(runningRecorders) && runningRecorders[this.opts.device.udid])) {
          context$1$0.next = 19;
          break;
        }

        _runningRecorders$opts$device$udid = runningRecorders[this.opts.device.udid];
        _proc = _runningRecorders$opts$device$udid.proc;
        _localPath = _runningRecorders$opts$device$udid.localPath;
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(finishPerfRecord(_proc, false));

      case 13:
        context$1$0.next = 15;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(_localPath));

      case 15:
        if (!context$1$0.sent) {
          context$1$0.next = 18;
          break;
        }

        context$1$0.next = 18;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(_localPath));

      case 18:
        delete runningRecorders[this.opts.device.udid];

      case 19:
        context$1$0.next = 21;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.which('instruments'));

      case 21:
        if (context$1$0.sent) {
          context$1$0.next = 23;
          break;
        }

        _logger2['default'].errorAndThrow('Cannot start performance recording, because \'instruments\' ' + 'tool cannot be found in PATH. Are Xcode development tools installed?');

      case 23:
        context$1$0.next = 25;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.path({
          prefix: ('appium_perf_' + profileName + '_' + Date.now()).replace(/\W/g, '_'),
          suffix: DEFAULT_EXT
        }));

      case 25:
        localPath = context$1$0.sent;
        args = ['-w', this.opts.device.udid, '-t', profileName, '-D', localPath, '-l', timeout];

        if (!pid) {
          context$1$0.next = 36;
          break;
        }

        if (!(('' + pid).toLowerCase() === 'current')) {
          context$1$0.next = 35;
          break;
        }

        context$1$0.next = 31;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/activeAppInfo', 'GET'));

      case 31:
        appInfo = context$1$0.sent;

        args.push('-p', appInfo.pid);
        context$1$0.next = 36;
        break;

      case 35:
        args.push('-p', pid);

      case 36:
        proc = new _teen_process.SubProcess('instruments', args);

        _logger2['default'].info('Starting \'instruments\' with arguments: ' + args.join(' '));
        proc.on('exit', function (code) {
          var msg = 'instruments exited with code \'' + code + '\'';
          if (code) {
            _logger2['default'].warn(msg);
          } else {
            _logger2['default'].debug(msg);
          }
        });
        proc.on('output', function (stdout, stderr) {
          (stdout || stderr).split('\n').filter(function (x) {
            return x.length;
          }).map(function (x) {
            return _logger2['default'].debug('[instruments] ' + x);
          });
        });

        context$1$0.next = 42;
        return _regeneratorRuntime.awrap(proc.start(0));

      case 42:
        context$1$0.prev = 42;
        context$1$0.next = 45;
        return _regeneratorRuntime.awrap((0, _asyncbox.waitForCondition)(function callee$1$0() {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(localPath));

              case 2:
                return context$2$0.abrupt('return', context$2$0.sent);

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        }, {
          waitMs: START_TIMEOUT_MS,
          intervalMs: 500
        }));

      case 45:
        context$1$0.next = 57;
        break;

      case 47:
        context$1$0.prev = 47;
        context$1$0.t0 = context$1$0['catch'](42);
        context$1$0.prev = 49;
        context$1$0.next = 52;
        return _regeneratorRuntime.awrap(proc.stop('SIGKILL'));

      case 52:
        context$1$0.next = 56;
        break;

      case 54:
        context$1$0.prev = 54;
        context$1$0.t1 = context$1$0['catch'](49);

      case 56:
        _logger2['default'].errorAndThrow('Cannot start performance monitoring for \'' + profileName + '\' profile in ' + START_TIMEOUT_MS + 'ms. ' + 'Make sure you can execute it manually.');

      case 57:
        RECORDERS_CACHE[profileName] = _Object$assign2({}, RECORDERS_CACHE[profileName] || {}, _defineProperty({}, this.opts.device.udid, { proc: proc, localPath: localPath }));

      case 58:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[42, 47], [49, 54]]);
};

/**
 * @typedef {Object} StopRecordingOptions
 *
 * @property {?string} remotePath - The path to the remote location, where the resulting zipped .trace file should be uploaded.
 *                                  The following protocols are supported: http/https, ftp.
 *                                  Null or empty string value (the default setting) means the content of resulting
 *                                  file should be zipped, encoded as Base64 and passed as the endpount response value.
 *                                  An exception will be thrown if the generated file is too big to
 *                                  fit into the available process memory.
 * @property {?string} user - The name of the user for the remote authentication. Only works if `remotePath` is provided.
 * @property {?string} pass - The password for the remote authentication. Only works if `remotePath` is provided.
 * @property {?string} method [PUT] - The http multipart upload method name. Only works if `remotePath` is provided.
 * @property {?string} profileName [Activity Monitor] - The name of an existing performance profile for which the recording has been made.
 */

/**
 * Stops performance profiling for the device under test.
 * The resulting file in .trace format can be either returned
 * directly as base64-encoded zip archive or uploaded to a remote location
 * (such files can be pretty large). Afterwards it is possible to unarchive and
 * open such file with Xcode Dev Tools.
 *
 * @param {?StopRecordingOptions} opts - The set of possible stop record options
 * @return {string} Either an empty string if the upload wqaas successful or base-64 encoded
 * content of zipped .trace file.
 * @throws {Error} If no performance recording with given profile name/device udid combination
 * has been started before or the resulting .trace file has not been generated properly.
 */
commands.mobileStopPerfRecord = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var remotePath, user, pass, method, _opts$profileName2, profileName, runningRecorders, _runningRecorders$opts$device$udid2, proc, localPath, zipPath, zipArgs;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!this.relaxedSecurityEnabled && !this.isRealDevice()) {
          _logger2['default'].errorAndThrow('Appium server must have relaxed security flag set in order ' + 'for Simulator performance measurement to work');
        }

        remotePath = opts.remotePath;
        user = opts.user;
        pass = opts.pass;
        method = opts.method;
        _opts$profileName2 = opts.profileName;
        profileName = _opts$profileName2 === undefined ? DEFAULT_PROFILE_NAME : _opts$profileName2;
        runningRecorders = RECORDERS_CACHE[profileName];

        if (!_lodash2['default'].isPlainObject(runningRecorders) || !runningRecorders[this.opts.device.udid]) {
          _logger2['default'].errorAndThrow('There are no records for performance profile \'' + profileName + '\' ' + ('and device ' + this.opts.device.udid + '. ') + 'Have you started the profiling before?');
        }

        _runningRecorders$opts$device$udid2 = runningRecorders[this.opts.device.udid];
        proc = _runningRecorders$opts$device$udid2.proc;
        localPath = _runningRecorders$opts$device$udid2.localPath;
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(finishPerfRecord(proc, true));

      case 14:
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(localPath));

      case 16:
        if (context$1$0.sent) {
          context$1$0.next = 18;
          break;
        }

        _logger2['default'].errorAndThrow('There is no .trace file found for performance profile \'' + profileName + '\' ' + ('and device ' + this.opts.device.udid + '. ') + 'Make sure the profile is supported on this device. ' + 'You can use \'instruments -s\' command to see the list of all available profiles.');

      case 18:
        zipPath = localPath + '.zip';
        zipArgs = ['-9', '-r', zipPath, _path2['default'].basename(localPath)];

        _logger2['default'].info('Found perf trace record \'' + localPath + '\'. Compressing it with \'zip ' + zipArgs.join(' ') + '\'');
        context$1$0.prev = 21;
        context$1$0.next = 24;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('zip', zipArgs, {
          cwd: _path2['default'].dirname(localPath)
        }));

      case 24:
        context$1$0.next = 26;
        return _regeneratorRuntime.awrap(uploadTrace(zipPath, remotePath, { user: user, pass: pass, method: method }));

      case 26:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 27:
        context$1$0.prev = 27;

        delete runningRecorders[this.opts.device.udid];
        context$1$0.next = 31;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(localPath));

      case 31:
        if (!context$1$0.sent) {
          context$1$0.next = 34;
          break;
        }

        context$1$0.next = 34;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(localPath));

      case 34:
        return context$1$0.finish(27);

      case 35:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[21,, 27, 35]]);
};

exports.commands = commands;
exports['default'] = commands;

// Cleanup the process if it is already running
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9wZXJmb3JtYW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFBYyxRQUFROzs7O29CQUNMLE1BQU07Ozs7NkJBQ0ssZ0JBQWdCOzs0QkFDWCxjQUFjOztzQkFDL0IsV0FBVzs7OztxQkFDVSxVQUFVOzt3QkFDZCxVQUFVOztBQUczQyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRWxCLElBQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMzQixJQUFNLGtCQUFrQixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3pDLElBQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3RDLElBQU0sZ0JBQWdCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNuQyxJQUFNLG9CQUFvQixHQUFFLGtCQUFrQixDQUFDO0FBQy9DLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQzs7QUFHN0IsU0FBZSxnQkFBZ0IsQ0FBRSxJQUFJO01BQUUsY0FBYyx5REFBRyxJQUFJOzs7O1lBQ3JELElBQUksQ0FBQyxTQUFTOzs7Ozs7OzthQUdmLGNBQWM7Ozs7O0FBQ2hCLDRCQUFJLEtBQUsscURBQXFELENBQUM7O3lDQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUM7Ozs7OztBQUVuRCw0QkFBSSxLQUFLLHNEQUFzRCxDQUFDOzt5Q0FDMUQsSUFBSSxDQUFDLElBQUksRUFBRTs7Ozs7OztDQUNsQjs7QUFFRCxTQUFlLFdBQVcsQ0FBRSxTQUFTO01BQUUsVUFBVSx5REFBRyxJQUFJO01BQUUsYUFBYSx5REFBRyxFQUFFOzs7Ozs7eUNBRTNELGlDQUFxQixTQUFTLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQzs7Ozs7Ozs7eUNBRWpFLGtCQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7Ozs7Ozs7Ozs7Q0FFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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LEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFDbkIsa0JBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUN6Qjs7QUFDRCw0QkFBSSxJQUFJLGdDQUE2QixTQUFTLHNDQUErQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFJLENBQUM7Ozt5Q0FFM0Ysd0JBQUssS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUN6QixhQUFHLEVBQUUsa0JBQUssT0FBTyxDQUFDLFNBQVMsQ0FBQztTQUM3QixDQUFDOzs7O3lDQUNXLFdBQVcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQzs7Ozs7Ozs7QUFFbkUsZUFBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7eUNBQ3JDLGtCQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7Ozs7Ozs7Ozt5Q0FDdEIsa0JBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7Ozs7Ozs7OztDQUcvQixDQUFDOztRQUdPLFFBQVEsR0FBUixRQUFRO3FCQUNGLFFBQVEiLCJmaWxlIjoibGliL2NvbW1hbmRzL3BlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZnMsIHRlbXBEaXIgfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5pbXBvcnQgeyBTdWJQcm9jZXNzLCBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCBsb2cgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGVuY29kZUJhc2U2NE9yVXBsb2FkIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgd2FpdEZvckNvbmRpdGlvbiB9IGZyb20gJ2FzeW5jYm94JztcblxuXG5sZXQgY29tbWFuZHMgPSB7fTtcblxuY29uc3QgUkVDT1JERVJTX0NBQ0hFID0ge307XG5jb25zdCBERUZBVUxUX1RJTUVPVVRfTVMgPSA1ICogNjAgKiAxMDAwO1xuY29uc3QgU1RPUF9USU1FT1VUX01TID0gMyAqIDYwICogMTAwMDtcbmNvbnN0IFNUQVJUX1RJTUVPVVRfTVMgPSAxNSAqIDEwMDA7XG5jb25zdCBERUZBVUxUX1BST0ZJTEVfTkFNRT0gJ0FjdGl2aXR5IE1vbml0b3InO1xuY29uc3QgREVGQVVMVF9FWFQgPSAnLnRyYWNlJztcblxuXG5hc3luYyBmdW5jdGlvbiBmaW5pc2hQZXJmUmVjb3JkIChwcm9jLCBzdG9wR3JhY2VmdWxseSA9IHRydWUpIHtcbiAgaWYgKCFwcm9jLmlzUnVubmluZykge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoc3RvcEdyYWNlZnVsbHkpIHtcbiAgICBsb2cuZGVidWcoYFNlbmRpbmcgU0lHSU5UIHRvIHRoZSBydW5uaW5nIGluc3RydW1lbnRzIHByb2Nlc3NgKTtcbiAgICByZXR1cm4gYXdhaXQgcHJvYy5zdG9wKCdTSUdJTlQnLCBTVE9QX1RJTUVPVVRfTVMpO1xuICB9XG4gIGxvZy5kZWJ1ZyhgU2VuZGluZyBTSUdURVJNIHRvIHRoZSBydW5uaW5nIGluc3RydW1lbnRzIHByb2Nlc3NgKTtcbiAgYXdhaXQgcHJvYy5zdG9wKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVwbG9hZFRyYWNlIChsb2NhbEZpbGUsIHJlbW90ZVBhdGggPSBudWxsLCB1cGxvYWRPcHRpb25zID0ge30pIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgZW5jb2RlQmFzZTY0T3JVcGxvYWQobG9jYWxGaWxlLCByZW1vdGVQYXRoLCB1cGxvYWRPcHRpb25zKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBhd2FpdCBmcy5yaW1yYWYobG9jYWxGaWxlKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gU3RhcnRQZXJmUmVjb3JkT3B0aW9uc1xuICpcbiAqIEBwcm9wZXJ0eSB7P251bWJlcnxzdHJpbmd9IHRpbWVvdXQgWzMwMDAwMF0gLSBUaGUgbWF4aW11bSBjb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gcmVjb3JkIHRoZSBwcm9maWxpbmcgaW5mb3JtYXRpb24uXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHByb2ZpbGVOYW1lIFtBY3Rpdml0eSBNb25pdG9yXSAtIFRoZSBuYW1lIG9mIGV4aXN0aW5nIHBlcmZvcm1hbmNlIHByb2ZpbGUgdG8gYXBwbHkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4ZWN1dGUgYGluc3RydW1lbnRzIC1zYCB0byBzaG93IHRoZSBsaXN0IG9mIGF2YWlsYWJsZSBwcm9maWxlcy5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZSwgdGhhdCBub3QgYWxsIHByb2ZpbGVzIGFyZSBzdXBwb3J0ZWQgb24gbW9iaWxlIGRldmljZXMuXG4gKiBAcHJvcGVydHkgez9zdHJpbmd8bnVtYmVyfSBwaWQgLSBUaGUgSUQgb2YgdGhlIHByb2Nlc3MgdG8gbWVhc3N1cmUgdGhlIHBlcmZvcm1hbmNlIGZvci5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNldCBpdCB0byBgY3VycmVudGAgaW4gb3JkZXIgdG8gbWVhc3N1cmUgdGhlIHBlcmZvcm1hbmNlIG9mXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgcHJvY2Vzcywgd2hpY2ggYmVsb25ncyB0byB0aGUgY3VycmVudGx5IGFjdGl2ZSBhcHBsaWNhdGlvbi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFsbCBwcm9jZXNzZXMgcnVubmluZyBvbiB0aGUgZGV2aWNlIGFyZSBtZWFzc3VyZWQgaWZcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpZCBpcyB1bnNldCAodGhlIGRlZmF1bHQgc2V0dGluZykuXG4gKi9cblxuLyoqXG4gKiBTdGFydHMgcGVyZm9ybWFuY2UgcHJvZmlsaW5nIGZvciB0aGUgZGV2aWNlIHVuZGVyIHRlc3QuXG4gKiBUaGUgYGluc3RydW1lbnRzYCBkZXZlbG9wZXIgdXRpbGl0eSBpcyB1c2VkIGZvciB0aGlzIHB1cnBvc2UgdW5kZXIgdGhlIGhvb2QuXG4gKiBJdCBpcyBwb3NzaWJsZSB0byByZWNvcmQgbXVsdGlwbGUgcHJvZmlsZXMgYXQgdGhlIHNhbWUgdGltZS5cbiAqIFJlYWQgaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2xpYnJhcnkvY29udGVudC9kb2N1bWVudGF0aW9uL0RldmVsb3BlclRvb2xzL0NvbmNlcHR1YWwvSW5zdHJ1bWVudHNVc2VyR3VpZGUvUmVjb3JkaW5nLFBhdXNpbmcsYW5kU3RvcHBpbmdUcmFjZXMuaHRtbFxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAcGFyYW0gez9TdGFydFBlcmZSZWNvcmRPcHRpb25zfSBvcHRzIC0gVGhlIHNldCBvZiBwb3NzaWJsZSBzdGFydCByZWNvcmQgb3B0aW9uc1xuICovXG5jb21tYW5kcy5tb2JpbGVTdGFydFBlcmZSZWNvcmQgPSBhc3luYyBmdW5jdGlvbiAob3B0cyA9IHt9KSB7XG4gIGlmICghdGhpcy5yZWxheGVkU2VjdXJpdHlFbmFibGVkICYmICF0aGlzLmlzUmVhbERldmljZSgpKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYEFwcGl1bSBzZXJ2ZXIgbXVzdCBoYXZlIHJlbGF4ZWQgc2VjdXJpdHkgZmxhZyBzZXQgaW4gb3JkZXIgYCArXG4gICAgICAgICAgICAgICAgICAgICAgYGZvciBTaW11bGF0b3IgcGVyZm9ybWFuY2UgbWVhc3VyZW1lbnQgdG8gd29ya2ApO1xuICB9XG5cbiAgY29uc3Qge3RpbWVvdXQ9REVGQVVMVF9USU1FT1VUX01TLCBwcm9maWxlTmFtZT1ERUZBVUxUX1BST0ZJTEVfTkFNRSwgcGlkfSA9IG9wdHM7XG5cbiAgLy8gQ2xlYW51cCB0aGUgcHJvY2VzcyBpZiBpdCBpcyBhbHJlYWR5IHJ1bm5pbmdcbiAgY29uc3QgcnVubmluZ1JlY29yZGVycyA9IFJFQ09SREVSU19DQUNIRVtwcm9maWxlTmFtZV07XG4gIGlmIChfLmlzUGxhaW5PYmplY3QocnVubmluZ1JlY29yZGVycykgJiYgcnVubmluZ1JlY29yZGVyc1t0aGlzLm9wdHMuZGV2aWNlLnVkaWRdKSB7XG4gICAgY29uc3Qge3Byb2MsIGxvY2FsUGF0aH0gPSBydW5uaW5nUmVjb3JkZXJzW3RoaXMub3B0cy5kZXZpY2UudWRpZF07XG4gICAgYXdhaXQgZmluaXNoUGVyZlJlY29yZChwcm9jLCBmYWxzZSk7XG4gICAgaWYgKGF3YWl0IGZzLmV4aXN0cyhsb2NhbFBhdGgpKSB7XG4gICAgICBhd2FpdCBmcy5yaW1yYWYobG9jYWxQYXRoKTtcbiAgICB9XG4gICAgZGVsZXRlIHJ1bm5pbmdSZWNvcmRlcnNbdGhpcy5vcHRzLmRldmljZS51ZGlkXTtcbiAgfVxuXG4gIGlmICghYXdhaXQgZnMud2hpY2goJ2luc3RydW1lbnRzJykpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQ2Fubm90IHN0YXJ0IHBlcmZvcm1hbmNlIHJlY29yZGluZywgYmVjYXVzZSAnaW5zdHJ1bWVudHMnIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGB0b29sIGNhbm5vdCBiZSBmb3VuZCBpbiBQQVRILiBBcmUgWGNvZGUgZGV2ZWxvcG1lbnQgdG9vbHMgaW5zdGFsbGVkP2ApO1xuICB9XG5cbiAgY29uc3QgbG9jYWxQYXRoID0gYXdhaXQgdGVtcERpci5wYXRoKHtcbiAgICBwcmVmaXg6IGBhcHBpdW1fcGVyZl8ke3Byb2ZpbGVOYW1lfV8ke0RhdGUubm93KCl9YC5yZXBsYWNlKC9cXFcvZywgJ18nKSxcbiAgICBzdWZmaXg6IERFRkFVTFRfRVhULFxuICB9KTtcbiAgY29uc3QgYXJncyA9IFtcbiAgICAnLXcnLCB0aGlzLm9wdHMuZGV2aWNlLnVkaWQsXG4gICAgJy10JywgcHJvZmlsZU5hbWUsXG4gICAgJy1EJywgbG9jYWxQYXRoLFxuICAgICctbCcsIHRpbWVvdXQsXG4gIF07XG4gIGlmIChwaWQpIHtcbiAgICBpZiAoYCR7cGlkfWAudG9Mb3dlckNhc2UoKSA9PT0gJ2N1cnJlbnQnKSB7XG4gICAgICBjb25zdCBhcHBJbmZvID0gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoJy93ZGEvYWN0aXZlQXBwSW5mbycsICdHRVQnKTtcbiAgICAgIGFyZ3MucHVzaCgnLXAnLCBhcHBJbmZvLnBpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3MucHVzaCgnLXAnLCBwaWQpO1xuICAgIH1cbiAgfVxuICBjb25zdCBwcm9jID0gbmV3IFN1YlByb2Nlc3MoJ2luc3RydW1lbnRzJywgYXJncyk7XG4gIGxvZy5pbmZvKGBTdGFydGluZyAnaW5zdHJ1bWVudHMnIHdpdGggYXJndW1lbnRzOiAke2FyZ3Muam9pbignICcpfWApO1xuICBwcm9jLm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICBjb25zdCBtc2cgPSBgaW5zdHJ1bWVudHMgZXhpdGVkIHdpdGggY29kZSAnJHtjb2RlfSdgO1xuICAgIGlmIChjb2RlKSB7XG4gICAgICBsb2cud2Fybihtc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2cuZGVidWcobXNnKTtcbiAgICB9XG4gIH0pO1xuICBwcm9jLm9uKCdvdXRwdXQnLCAoc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAoc3Rkb3V0IHx8IHN0ZGVycikuc3BsaXQoJ1xcbicpXG4gICAgICAuZmlsdGVyKHggPT4geC5sZW5ndGgpXG4gICAgICAubWFwKHggPT4gbG9nLmRlYnVnKGBbaW5zdHJ1bWVudHNdICR7eH1gKSk7XG4gIH0pO1xuXG4gIGF3YWl0IHByb2Muc3RhcnQoMCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgd2FpdEZvckNvbmRpdGlvbihhc3luYyAoKSA9PiBhd2FpdCBmcy5leGlzdHMobG9jYWxQYXRoKSwge1xuICAgICAgd2FpdE1zOiBTVEFSVF9USU1FT1VUX01TLFxuICAgICAgaW50ZXJ2YWxNczogNTAwLFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcHJvYy5zdG9wKCdTSUdLSUxMJyk7XG4gICAgfSBjYXRjaCAoaWduKSB7fVxuICAgIGxvZy5lcnJvckFuZFRocm93KGBDYW5ub3Qgc3RhcnQgcGVyZm9ybWFuY2UgbW9uaXRvcmluZyBmb3IgJyR7cHJvZmlsZU5hbWV9JyBwcm9maWxlIGluICR7U1RBUlRfVElNRU9VVF9NU31tcy4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgYE1ha2Ugc3VyZSB5b3UgY2FuIGV4ZWN1dGUgaXQgbWFudWFsbHkuYCk7XG4gIH1cbiAgUkVDT1JERVJTX0NBQ0hFW3Byb2ZpbGVOYW1lXSA9IE9iamVjdC5hc3NpZ24oe30sIChSRUNPUkRFUlNfQ0FDSEVbcHJvZmlsZU5hbWVdIHx8IHt9KSwge1xuICAgIFt0aGlzLm9wdHMuZGV2aWNlLnVkaWRdOiB7cHJvYywgbG9jYWxQYXRofSxcbiAgfSk7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFN0b3BSZWNvcmRpbmdPcHRpb25zXG4gKlxuICogQHByb3BlcnR5IHs/c3RyaW5nfSByZW1vdGVQYXRoIC0gVGhlIHBhdGggdG8gdGhlIHJlbW90ZSBsb2NhdGlvbiwgd2hlcmUgdGhlIHJlc3VsdGluZyB6aXBwZWQgLnRyYWNlIGZpbGUgc2hvdWxkIGJlIHVwbG9hZGVkLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGZvbGxvd2luZyBwcm90b2NvbHMgYXJlIHN1cHBvcnRlZDogaHR0cC9odHRwcywgZnRwLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTnVsbCBvciBlbXB0eSBzdHJpbmcgdmFsdWUgKHRoZSBkZWZhdWx0IHNldHRpbmcpIG1lYW5zIHRoZSBjb250ZW50IG9mIHJlc3VsdGluZ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSBzaG91bGQgYmUgemlwcGVkLCBlbmNvZGVkIGFzIEJhc2U2NCBhbmQgcGFzc2VkIGFzIHRoZSBlbmRwb3VudCByZXNwb25zZSB2YWx1ZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFuIGV4Y2VwdGlvbiB3aWxsIGJlIHRocm93biBpZiB0aGUgZ2VuZXJhdGVkIGZpbGUgaXMgdG9vIGJpZyB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZml0IGludG8gdGhlIGF2YWlsYWJsZSBwcm9jZXNzIG1lbW9yeS5cbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gdXNlciAtIFRoZSBuYW1lIG9mIHRoZSB1c2VyIGZvciB0aGUgcmVtb3RlIGF1dGhlbnRpY2F0aW9uLiBPbmx5IHdvcmtzIGlmIGByZW1vdGVQYXRoYCBpcyBwcm92aWRlZC5cbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gcGFzcyAtIFRoZSBwYXNzd29yZCBmb3IgdGhlIHJlbW90ZSBhdXRoZW50aWNhdGlvbi4gT25seSB3b3JrcyBpZiBgcmVtb3RlUGF0aGAgaXMgcHJvdmlkZWQuXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IG1ldGhvZCBbUFVUXSAtIFRoZSBodHRwIG11bHRpcGFydCB1cGxvYWQgbWV0aG9kIG5hbWUuIE9ubHkgd29ya3MgaWYgYHJlbW90ZVBhdGhgIGlzIHByb3ZpZGVkLlxuICogQHByb3BlcnR5IHs/c3RyaW5nfSBwcm9maWxlTmFtZSBbQWN0aXZpdHkgTW9uaXRvcl0gLSBUaGUgbmFtZSBvZiBhbiBleGlzdGluZyBwZXJmb3JtYW5jZSBwcm9maWxlIGZvciB3aGljaCB0aGUgcmVjb3JkaW5nIGhhcyBiZWVuIG1hZGUuXG4gKi9cblxuLyoqXG4gKiBTdG9wcyBwZXJmb3JtYW5jZSBwcm9maWxpbmcgZm9yIHRoZSBkZXZpY2UgdW5kZXIgdGVzdC5cbiAqIFRoZSByZXN1bHRpbmcgZmlsZSBpbiAudHJhY2UgZm9ybWF0IGNhbiBiZSBlaXRoZXIgcmV0dXJuZWRcbiAqIGRpcmVjdGx5IGFzIGJhc2U2NC1lbmNvZGVkIHppcCBhcmNoaXZlIG9yIHVwbG9hZGVkIHRvIGEgcmVtb3RlIGxvY2F0aW9uXG4gKiAoc3VjaCBmaWxlcyBjYW4gYmUgcHJldHR5IGxhcmdlKS4gQWZ0ZXJ3YXJkcyBpdCBpcyBwb3NzaWJsZSB0byB1bmFyY2hpdmUgYW5kXG4gKiBvcGVuIHN1Y2ggZmlsZSB3aXRoIFhjb2RlIERldiBUb29scy5cbiAqXG4gKiBAcGFyYW0gez9TdG9wUmVjb3JkaW5nT3B0aW9uc30gb3B0cyAtIFRoZSBzZXQgb2YgcG9zc2libGUgc3RvcCByZWNvcmQgb3B0aW9uc1xuICogQHJldHVybiB7c3RyaW5nfSBFaXRoZXIgYW4gZW1wdHkgc3RyaW5nIGlmIHRoZSB1cGxvYWQgd3FhYXMgc3VjY2Vzc2Z1bCBvciBiYXNlLTY0IGVuY29kZWRcbiAqIGNvbnRlbnQgb2YgemlwcGVkIC50cmFjZSBmaWxlLlxuICogQHRocm93cyB7RXJyb3J9IElmIG5vIHBlcmZvcm1hbmNlIHJlY29yZGluZyB3aXRoIGdpdmVuIHByb2ZpbGUgbmFtZS9kZXZpY2UgdWRpZCBjb21iaW5hdGlvblxuICogaGFzIGJlZW4gc3RhcnRlZCBiZWZvcmUgb3IgdGhlIHJlc3VsdGluZyAudHJhY2UgZmlsZSBoYXMgbm90IGJlZW4gZ2VuZXJhdGVkIHByb3Blcmx5LlxuICovXG5jb21tYW5kcy5tb2JpbGVTdG9wUGVyZlJlY29yZCA9IGFzeW5jIGZ1bmN0aW9uIChvcHRzID0ge30pIHtcbiAgaWYgKCF0aGlzLnJlbGF4ZWRTZWN1cml0eUVuYWJsZWQgJiYgIXRoaXMuaXNSZWFsRGV2aWNlKCkpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQXBwaXVtIHNlcnZlciBtdXN0IGhhdmUgcmVsYXhlZCBzZWN1cml0eSBmbGFnIHNldCBpbiBvcmRlciBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgZm9yIFNpbXVsYXRvciBwZXJmb3JtYW5jZSBtZWFzdXJlbWVudCB0byB3b3JrYCk7XG4gIH1cblxuICBjb25zdCB7cmVtb3RlUGF0aCwgdXNlciwgcGFzcywgbWV0aG9kLCBwcm9maWxlTmFtZT1ERUZBVUxUX1BST0ZJTEVfTkFNRX0gPSBvcHRzO1xuICBjb25zdCBydW5uaW5nUmVjb3JkZXJzID0gUkVDT1JERVJTX0NBQ0hFW3Byb2ZpbGVOYW1lXTtcbiAgaWYgKCFfLmlzUGxhaW5PYmplY3QocnVubmluZ1JlY29yZGVycykgfHwgIXJ1bm5pbmdSZWNvcmRlcnNbdGhpcy5vcHRzLmRldmljZS51ZGlkXSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBUaGVyZSBhcmUgbm8gcmVjb3JkcyBmb3IgcGVyZm9ybWFuY2UgcHJvZmlsZSAnJHtwcm9maWxlTmFtZX0nIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGBhbmQgZGV2aWNlICR7dGhpcy5vcHRzLmRldmljZS51ZGlkfS4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgYEhhdmUgeW91IHN0YXJ0ZWQgdGhlIHByb2ZpbGluZyBiZWZvcmU/YCk7XG4gIH1cblxuICBjb25zdCB7cHJvYywgbG9jYWxQYXRofSA9IHJ1bm5pbmdSZWNvcmRlcnNbdGhpcy5vcHRzLmRldmljZS51ZGlkXTtcbiAgYXdhaXQgZmluaXNoUGVyZlJlY29yZChwcm9jLCB0cnVlKTtcbiAgaWYgKCFhd2FpdCBmcy5leGlzdHMobG9jYWxQYXRoKSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBUaGVyZSBpcyBubyAudHJhY2UgZmlsZSBmb3VuZCBmb3IgcGVyZm9ybWFuY2UgcHJvZmlsZSAnJHtwcm9maWxlTmFtZX0nIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGBhbmQgZGV2aWNlICR7dGhpcy5vcHRzLmRldmljZS51ZGlkfS4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgYE1ha2Ugc3VyZSB0aGUgcHJvZmlsZSBpcyBzdXBwb3J0ZWQgb24gdGhpcyBkZXZpY2UuIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGBZb3UgY2FuIHVzZSAnaW5zdHJ1bWVudHMgLXMnIGNvbW1hbmQgdG8gc2VlIHRoZSBsaXN0IG9mIGFsbCBhdmFpbGFibGUgcHJvZmlsZXMuYCk7XG4gIH1cblxuICBjb25zdCB6aXBQYXRoID0gYCR7bG9jYWxQYXRofS56aXBgO1xuICBjb25zdCB6aXBBcmdzID0gW1xuICAgICctOScsICctcicsIHppcFBhdGgsXG4gICAgcGF0aC5iYXNlbmFtZShsb2NhbFBhdGgpLFxuICBdO1xuICBsb2cuaW5mbyhgRm91bmQgcGVyZiB0cmFjZSByZWNvcmQgJyR7bG9jYWxQYXRofScuIENvbXByZXNzaW5nIGl0IHdpdGggJ3ppcCAke3ppcEFyZ3Muam9pbignICcpfSdgKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBleGVjKCd6aXAnLCB6aXBBcmdzLCB7XG4gICAgICBjd2Q6IHBhdGguZGlybmFtZShsb2NhbFBhdGgpLFxuICAgIH0pO1xuICAgIHJldHVybiBhd2FpdCB1cGxvYWRUcmFjZSh6aXBQYXRoLCByZW1vdGVQYXRoLCB7dXNlciwgcGFzcywgbWV0aG9kfSk7XG4gIH0gZmluYWxseSB7XG4gICAgZGVsZXRlIHJ1bm5pbmdSZWNvcmRlcnNbdGhpcy5vcHRzLmRldmljZS51ZGlkXTtcbiAgICBpZiAoYXdhaXQgZnMuZXhpc3RzKGxvY2FsUGF0aCkpIHtcbiAgICAgIGF3YWl0IGZzLnJpbXJhZihsb2NhbFBhdGgpO1xuICAgIH1cbiAgfVxufTtcblxuXG5leHBvcnQgeyBjb21tYW5kcyB9O1xuZXhwb3J0IGRlZmF1bHQgY29tbWFuZHM7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
