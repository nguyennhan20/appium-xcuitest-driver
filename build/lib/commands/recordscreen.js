'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _appiumSupport = require('appium-support');

var _teen_process = require('teen_process');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _utils = require('../utils');

var _wdaIproxy = require('../wda/iproxy');

var _wdaIproxy2 = _interopRequireDefault(_wdaIproxy);

var commands = {};

var MAX_RECORDING_TIME_SEC = 60 * 30;
var DEFAULT_RECORDING_TIME_SEC = 60 * 3;
var DEFAULT_MJPEG_SERVER_PORT = 9100;
var MP4_EXT = '.mp4';
var DEFAULT_FPS = 10;
var FFMPEG_BINARY = 'ffmpeg';
var ffmpegLogger = _appiumSupport.logger.getLogger(FFMPEG_BINARY);

var ScreenRecorder = (function () {
  function ScreenRecorder(udid, videoPath) {
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, ScreenRecorder);

    this.videoPath = videoPath;
    this.opts = opts;
    this.udid = udid;
    this.mainProcess = null;
    this.iproxy = null;
    this.timeoutHandler = null;
  }

  /**
   * @typedef {Object} StartRecordingOptions
   *
   * @property {?string} remotePath - The path to the remote location, where the resulting video should be uploaded.
   *                                  The following protocols are supported: http/https, ftp.
   *                                  Null or empty string value (the default setting) means the content of resulting
   *                                  file should be encoded as Base64 and passed as the endpount response value.
   *                                  An exception will be thrown if the generated media file is too big to
   *                                  fit into the available process memory.
   *                                  This option only has an effect if there is screen recording process in progreess
   *                                  and `forceRestart` parameter is not set to `true`.
   * @property {?string} user - The name of the user for the remote authentication. Only works if `remotePath` is provided.
   * @property {?string} pass - The password for the remote authentication. Only works if `remotePath` is provided.
   * @property {?string} method - The http multipart upload method name. The 'PUT' one is used by default.
   *                              Only works if `remotePath` is provided.
   * @property {?string} videoType - The format of the screen capture to be recorded.
   *                                 Available formats: "h264", "mp4" or "fmp4". Default is "mp4".
   * @property {?string} videoQuality - The video encoding quality (low, medium, high, photo - defaults to medium).
   * @property {?string} videoFps - The Frames Per Second rate of the recorded video. Change this value if the resulting video
   *                                is too slow or too fast. Defaults to 10.
   * @property {?boolean} forceRestart - Whether to try to catch and upload/return the currently running screen recording
   *                                     (`false`, the default setting) or ignore the result of it and start a new recording
   *                                     immediately.
   * @property {?string|number} timeLimit - The maximum recording time, in seconds.
   *                                        The default value is 180, the maximum value is 600 (10 minutes).
   */

  /**
   * Record the display of devices running iOS Simulator since Xcode 8.3 or real devices since iOS 8
   * (ios-minicap utility is required: https://github.com/openstf/ios-minicap).
   * It records screen activity to a MPEG-4 file. Audio is not recorded with the video file.
   * If screen recording has been already started then the command will stop it forcefully and start a new one.
   * The previously recorded video file will be deleted.
   *
   * @param {?StartRecordingOptions} options - The available options.
   * @returns {string} Base64-encoded content of the recorded media file if
   *                   any screen recording is currently running or an empty string.
   * @throws {Error} If screen recording has failed to start.
   */

  _createClass(ScreenRecorder, [{
    key: 'start',
    value: function start(timeoutMs) {
      var localPort, args;
      return _regeneratorRuntime.async(function start$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(_appiumSupport.fs.which(FFMPEG_BINARY));

          case 3:
            context$2$0.next = 8;
            break;

          case 5:
            context$2$0.prev = 5;
            context$2$0.t0 = context$2$0['catch'](0);
            throw new Error('\'' + FFMPEG_BINARY + '\' binary is not found in PATH. Install it using \'brew install ffmpeg\'. ' + 'Check https://www.ffmpeg.org/download.html for more details.');

          case 8:
            localPort = this.opts.remotePort;

            if (!this.opts.usePortForwarding) {
              context$2$0.next = 12;
              break;
            }

            context$2$0.next = 12;
            return _regeneratorRuntime.awrap(this.startIproxy(localPort));

          case 12:
            args = ['-f', 'mjpeg', '-r', this.opts.videoFps, '-i', 'http://localhost:' + localPort, '-vcodec', 'mjpeg', '-y', this.videoPath];

            this.mainProcess = new _teen_process.SubProcess(FFMPEG_BINARY, args);
            this.mainProcess.on('output', function (stdout, stderr) {
              if (stderr && !stderr.includes('frame=')) {
                ffmpegLogger.info('' + stderr);
              }
            });
            // Give ffmpeg some time for init
            context$2$0.next = 17;
            return _regeneratorRuntime.awrap(this.mainProcess.start(5000));

          case 17:
            _logger2['default'].info('Starting screen capture on the device \'' + this.udid + '\' with command: \'' + FFMPEG_BINARY + ' ' + args.join(' ') + '\'. ' + ('Will timeout in ' + timeoutMs + 'ms'));

            this.timeoutHandler = setTimeout(function callee$2$0() {
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap(this.interrupt());

                  case 2:
                    if (context$3$0.sent) {
                      context$3$0.next = 4;
                      break;
                    }

                    _logger2['default'].warn('Cannot finish the active screen recording on the device \'' + this.udid + '\' after ' + timeoutMs + 'ms timeout');

                  case 4:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this);
            }, timeoutMs);

          case 19:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[0, 5]]);
    }
  }, {
    key: 'startIproxy',
    value: function startIproxy(localPort) {
      return _regeneratorRuntime.async(function startIproxy$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.iproxy = new _wdaIproxy2['default'](this.udid, localPort, this.opts.remotePort);
            context$2$0.prev = 1;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.iproxy.start());

          case 4:
            context$2$0.next = 10;
            break;

          case 6:
            context$2$0.prev = 6;
            context$2$0.t0 = context$2$0['catch'](1);

            _logger2['default'].warn('Cannot start iproxy. Assuming it is already forwarding the remote port ' + this.opts.remotePort + ' to ' + localPort + ' ' + ('for the device ' + this.udid + '. Set the custom value to \'mjpegServerPort\' capability if this is an undesired behavior. ') + ('Original error: ' + context$2$0.t0.message));
            this.iproxy = null;

          case 10:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 6]]);
    }
  }, {
    key: 'stopIproxy',
    value: function stopIproxy() {
      var quitPromise;
      return _regeneratorRuntime.async(function stopIproxy$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (this.iproxy) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return');

          case 2:
            quitPromise = this.iproxy.quit();

            this.iproxy = null;
            context$2$0.prev = 4;
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(quitPromise);

          case 7:
            context$2$0.next = 12;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](4);

            _logger2['default'].warn('Cannot stop iproxy. Original error: ' + context$2$0.t0.message);

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[4, 9]]);
    }
  }, {
    key: 'interrupt',
    value: function interrupt() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
      var result, interruptPromise;
      return _regeneratorRuntime.async(function interrupt$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            result = true;

            if (this.timeoutHandler) {
              clearTimeout(this.timeoutHandler);
              this.timeoutHandler = null;
            }

            if (!(this.mainProcess && this.mainProcess.isRunning)) {
              context$2$0.next = 14;
              break;
            }

            interruptPromise = this.mainProcess.stop(force ? 'SIGTERM' : 'SIGINT');

            this.mainProcess = null;
            context$2$0.prev = 5;
            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(interruptPromise);

          case 8:
            context$2$0.next = 14;
            break;

          case 10:
            context$2$0.prev = 10;
            context$2$0.t0 = context$2$0['catch'](5);

            _logger2['default'].warn('Cannot ' + (force ? 'terminate' : 'interrupt') + ' ' + FFMPEG_BINARY + '. ' + ('Original error: ' + context$2$0.t0.message));
            result = false;

          case 14:
            if (!this.opts.usePortForwarding) {
              context$2$0.next = 17;
              break;
            }

            context$2$0.next = 17;
            return _regeneratorRuntime.awrap(this.stopIproxy());

          case 17:
            return context$2$0.abrupt('return', result);

          case 18:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[5, 10]]);
    }
  }, {
    key: 'finish',
    value: function finish() {
      return _regeneratorRuntime.async(function finish$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.interrupt());

          case 2:
            return context$2$0.abrupt('return', this.videoPath);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'cleanup',
    value: function cleanup() {
      return _regeneratorRuntime.async(function cleanup$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(this.videoPath));

          case 2:
            if (!context$2$0.sent) {
              context$2$0.next = 5;
              break;
            }

            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(this.videoPath));

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return ScreenRecorder;
})();

commands.startRecordingScreen = function callee$0$0() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var videoType, _options$timeLimit, timeLimit, _options$videoQuality, videoQuality, _options$videoFps, videoFps, forceRestart, result, videoPath, screenRecorder, timeoutSeconds;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        videoType = options.videoType;
        _options$timeLimit = options.timeLimit;
        timeLimit = _options$timeLimit === undefined ? DEFAULT_RECORDING_TIME_SEC : _options$timeLimit;
        _options$videoQuality = options.videoQuality;
        videoQuality = _options$videoQuality === undefined ? 'medium' : _options$videoQuality;
        _options$videoFps = options.videoFps;
        videoFps = _options$videoFps === undefined ? DEFAULT_FPS : _options$videoFps;
        forceRestart = options.forceRestart;
        result = '';

        if (forceRestart) {
          context$1$0.next = 14;
          break;
        }

        _logger2['default'].info('Checking if there is/was a previous screen recording. ' + 'Set \'forceRestart\' option to \'true\' if you\'d like to skip this step.');
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(this.stopRecordingScreen(options));

      case 13:
        result = context$1$0.sent;

      case 14:
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.path({
          prefix: 'appium_' + Math.random().toString(16).substring(2, 8),
          suffix: MP4_EXT
        }));

      case 16:
        videoPath = context$1$0.sent;
        screenRecorder = new ScreenRecorder(this.opts.device.udid, videoPath, {
          // TODO: Apply type and quality options
          videoType: videoType,
          videoQuality: videoQuality,
          videoFps: videoFps || DEFAULT_FPS,
          remotePort: this.opts.mjpegServerPort || DEFAULT_MJPEG_SERVER_PORT,
          usePortForwarding: this.isRealDevice()
        });
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap(screenRecorder.interrupt(true));

      case 20:
        if (context$1$0.sent) {
          context$1$0.next = 22;
          break;
        }

        _logger2['default'].errorAndThrow('Unable to stop screen recording process');

      case 22:
        if (!this._recentScreenRecorder) {
          context$1$0.next = 26;
          break;
        }

        context$1$0.next = 25;
        return _regeneratorRuntime.awrap(this._recentScreenRecorder.cleanup());

      case 25:
        this._recentScreenRecorder = null;

      case 26:
        timeoutSeconds = parseFloat(timeLimit);

        if (isNaN(timeoutSeconds) || timeoutSeconds > MAX_RECORDING_TIME_SEC || timeoutSeconds <= 0) {
          _logger2['default'].errorAndThrow('The timeLimit value must be in range [1, ' + MAX_RECORDING_TIME_SEC + '] seconds. ' + ('The value of \'' + timeLimit + '\' has been passed instead.'));
        }

        context$1$0.prev = 28;
        context$1$0.next = 31;
        return _regeneratorRuntime.awrap(screenRecorder.start(timeoutSeconds * 1000));

      case 31:
        context$1$0.next = 40;
        break;

      case 33:
        context$1$0.prev = 33;
        context$1$0.t0 = context$1$0['catch'](28);
        context$1$0.next = 37;
        return _regeneratorRuntime.awrap(screenRecorder.interrupt(true));

      case 37:
        context$1$0.next = 39;
        return _regeneratorRuntime.awrap(screenRecorder.cleanup());

      case 39:
        throw context$1$0.t0;

      case 40:
        this._recentScreenRecorder = screenRecorder;

        return context$1$0.abrupt('return', result);

      case 42:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[28, 33]]);
};

/**
 * @typedef {Object} StopRecordingOptions
 *
 * @property {?string} remotePath - The path to the remote location, where the resulting video should be uploaded.
 *                                  The following protocols are supported: http/https, ftp.
 *                                  Null or empty string value (the default setting) means the content of resulting
 *                                  file should be encoded as Base64 and passed as the endpount response value.
 *                                  An exception will be thrown if the generated media file is too big to
 *                                  fit into the available process memory.
 * @property {?string} user - The name of the user for the remote authentication. Only works if `remotePath` is provided.
 * @property {?string} pass - The password for the remote authentication. Only works if `remotePath` is provided.
 * @property {?string} method - The http multipart upload method name. The 'PUT' one is used by default.
 *                              Only works if `remotePath` is provided.
 */

/**
 * Stop recording the screen. If no screen recording process is running then
 * the endpoint will try to get the recently recorded file.
 * If no previously recorded file is found and no active screen recording
 * processes are running then the method returns an empty string.
 *
 * @param {?StopRecordingOptions} options - The available options.
 * @returns {string} Base64-encoded content of the recorded media file if 'remotePath'
 *                   parameter is empty or null or an empty string.
 * @throws {Error} If there was an error while getting the name of a media file
 *                 or the file content cannot be uploaded to the remote location.
 */
commands.stopRecordingScreen = function callee$0$0() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var remotePath, user, pass, method, videoPath;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        remotePath = options.remotePath;
        user = options.user;
        pass = options.pass;
        method = options.method;

        if (this._recentScreenRecorder) {
          context$1$0.next = 7;
          break;
        }

        _logger2['default'].info('Screen recording is not running. There is nothing to stop.');
        return context$1$0.abrupt('return', '');

      case 7:
        context$1$0.prev = 7;
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(this._recentScreenRecorder.finish());

      case 10:
        videoPath = context$1$0.sent;
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(videoPath));

      case 13:
        if (context$1$0.sent) {
          context$1$0.next = 15;
          break;
        }

        _logger2['default'].errorAndThrow('The screen recorder utility has failed ' + ('to store the actual screen recording at \'' + videoPath + '\''));

      case 15:
        context$1$0.next = 17;
        return _regeneratorRuntime.awrap((0, _utils.encodeBase64OrUpload)(videoPath, remotePath, {
          user: user,
          pass: pass,
          method: method
        }));

      case 17:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 18:
        context$1$0.prev = 18;
        context$1$0.next = 21;
        return _regeneratorRuntime.awrap(this._recentScreenRecorder.interrupt(true));

      case 21:
        context$1$0.next = 23;
        return _regeneratorRuntime.awrap(this._recentScreenRecorder.cleanup());

      case 23:
        this._recentScreenRecorder = null;
        return context$1$0.finish(18);

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[7,, 18, 25]]);
};

exports.commands = commands;
exports['default'] = commands;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9yZWNvcmRzY3JlZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NkJBQW9DLGdCQUFnQjs7NEJBQ3pCLGNBQWM7O3NCQUN6QixXQUFXOzs7O3FCQUNVLFVBQVU7O3lCQUM1QixlQUFlOzs7O0FBRWxDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsSUFBTSxzQkFBc0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3ZDLElBQU0sMEJBQTBCLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxQyxJQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQztBQUN2QyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdkIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQztBQUMvQixJQUFNLFlBQVksR0FBRyxzQkFBTyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7O0lBRS9DLGNBQWM7QUFDTixXQURSLGNBQWMsQ0FDTCxJQUFJLEVBQUUsU0FBUyxFQUFhO1FBQVgsSUFBSSx5REFBRyxFQUFFOzswQkFEbkMsY0FBYzs7QUFFaEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7R0FDNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQVJHLGNBQWM7O1dBVU4sZUFBQyxTQUFTO1VBUWQsU0FBUyxFQUtULElBQUk7Ozs7Ozs7OzZDQVhGLGtCQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7Ozs7Ozs7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QUksQ0FBQzs7Ozs7Ozs7Q0FFckMsQ0FBQzs7UUFHTyxRQUFRLEdBQVIsUUFBUTtxQkFDRixRQUFRIiwiZmlsZSI6ImxpYi9jb21tYW5kcy9yZWNvcmRzY3JlZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcywgdGVtcERpciwgbG9nZ2VyIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHsgU3ViUHJvY2VzcyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBlbmNvZGVCYXNlNjRPclVwbG9hZCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBpUHJveHkgZnJvbSAnLi4vd2RhL2lwcm94eSc7XG5cbmxldCBjb21tYW5kcyA9IHt9O1xuXG5jb25zdCBNQVhfUkVDT1JESU5HX1RJTUVfU0VDID0gNjAgKiAzMDtcbmNvbnN0IERFRkFVTFRfUkVDT1JESU5HX1RJTUVfU0VDID0gNjAgKiAzO1xuY29uc3QgREVGQVVMVF9NSlBFR19TRVJWRVJfUE9SVCA9IDkxMDA7XG5jb25zdCBNUDRfRVhUID0gJy5tcDQnO1xuY29uc3QgREVGQVVMVF9GUFMgPSAxMDtcbmNvbnN0IEZGTVBFR19CSU5BUlkgPSAnZmZtcGVnJztcbmNvbnN0IGZmbXBlZ0xvZ2dlciA9IGxvZ2dlci5nZXRMb2dnZXIoRkZNUEVHX0JJTkFSWSk7XG5cbmNsYXNzIFNjcmVlblJlY29yZGVyIHtcbiAgY29uc3RydWN0b3IgKHVkaWQsIHZpZGVvUGF0aCwgb3B0cyA9IHt9KSB7XG4gICAgdGhpcy52aWRlb1BhdGggPSB2aWRlb1BhdGg7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnVkaWQgPSB1ZGlkO1xuICAgIHRoaXMubWFpblByb2Nlc3MgPSBudWxsO1xuICAgIHRoaXMuaXByb3h5ID0gbnVsbDtcbiAgICB0aGlzLnRpbWVvdXRIYW5kbGVyID0gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0ICh0aW1lb3V0TXMpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZnMud2hpY2goRkZNUEVHX0JJTkFSWSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke0ZGTVBFR19CSU5BUll9JyBiaW5hcnkgaXMgbm90IGZvdW5kIGluIFBBVEguIEluc3RhbGwgaXQgdXNpbmcgJ2JyZXcgaW5zdGFsbCBmZm1wZWcnLiBgICtcbiAgICAgICAgYENoZWNrIGh0dHBzOi8vd3d3LmZmbXBlZy5vcmcvZG93bmxvYWQuaHRtbCBmb3IgbW9yZSBkZXRhaWxzLmApO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsUG9ydCA9IHRoaXMub3B0cy5yZW1vdGVQb3J0O1xuICAgIGlmICh0aGlzLm9wdHMudXNlUG9ydEZvcndhcmRpbmcpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRJcHJveHkobG9jYWxQb3J0KTtcbiAgICB9XG5cbiAgICBjb25zdCBhcmdzID0gW1xuICAgICAgJy1mJywgJ21qcGVnJyxcbiAgICAgICctcicsIHRoaXMub3B0cy52aWRlb0ZwcyxcbiAgICAgICctaScsIGBodHRwOi8vbG9jYWxob3N0OiR7bG9jYWxQb3J0fWAsXG4gICAgICAnLXZjb2RlYycsICdtanBlZycsXG4gICAgICAnLXknLCB0aGlzLnZpZGVvUGF0aCxcbiAgICBdO1xuICAgIHRoaXMubWFpblByb2Nlc3MgPSBuZXcgU3ViUHJvY2VzcyhGRk1QRUdfQklOQVJZLCBhcmdzKTtcbiAgICB0aGlzLm1haW5Qcm9jZXNzLm9uKCdvdXRwdXQnLCAoc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgIGlmIChzdGRlcnIgJiYgIXN0ZGVyci5pbmNsdWRlcygnZnJhbWU9JykpIHtcbiAgICAgICAgZmZtcGVnTG9nZ2VyLmluZm8oYCR7c3RkZXJyfWApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIEdpdmUgZmZtcGVnIHNvbWUgdGltZSBmb3IgaW5pdFxuICAgIGF3YWl0IHRoaXMubWFpblByb2Nlc3Muc3RhcnQoNTAwMCk7XG4gICAgbG9nLmluZm8oYFN0YXJ0aW5nIHNjcmVlbiBjYXB0dXJlIG9uIHRoZSBkZXZpY2UgJyR7dGhpcy51ZGlkfScgd2l0aCBjb21tYW5kOiAnJHtGRk1QRUdfQklOQVJZfSAke2FyZ3Muam9pbignICcpfScuIGAgK1xuICAgICAgYFdpbGwgdGltZW91dCBpbiAke3RpbWVvdXRNc31tc2ApO1xuXG4gICAgdGhpcy50aW1lb3V0SGFuZGxlciA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKCFhd2FpdCB0aGlzLmludGVycnVwdCgpKSB7XG4gICAgICAgIGxvZy53YXJuKGBDYW5ub3QgZmluaXNoIHRoZSBhY3RpdmUgc2NyZWVuIHJlY29yZGluZyBvbiB0aGUgZGV2aWNlICcke3RoaXMudWRpZH0nIGFmdGVyICR7dGltZW91dE1zfW1zIHRpbWVvdXRgKTtcbiAgICAgIH1cbiAgICB9LCB0aW1lb3V0TXMpO1xuICB9XG5cbiAgYXN5bmMgc3RhcnRJcHJveHkgKGxvY2FsUG9ydCkge1xuICAgIHRoaXMuaXByb3h5ID0gbmV3IGlQcm94eSh0aGlzLnVkaWQsIGxvY2FsUG9ydCwgdGhpcy5vcHRzLnJlbW90ZVBvcnQpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmlwcm94eS5zdGFydCgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLndhcm4oYENhbm5vdCBzdGFydCBpcHJveHkuIEFzc3VtaW5nIGl0IGlzIGFscmVhZHkgZm9yd2FyZGluZyB0aGUgcmVtb3RlIHBvcnQgJHt0aGlzLm9wdHMucmVtb3RlUG9ydH0gdG8gJHtsb2NhbFBvcnR9IGAgK1xuICAgICAgICBgZm9yIHRoZSBkZXZpY2UgJHt0aGlzLnVkaWR9LiBTZXQgdGhlIGN1c3RvbSB2YWx1ZSB0byAnbWpwZWdTZXJ2ZXJQb3J0JyBjYXBhYmlsaXR5IGlmIHRoaXMgaXMgYW4gdW5kZXNpcmVkIGJlaGF2aW9yLiBgICtcbiAgICAgICAgYE9yaWdpbmFsIGVycm9yOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgdGhpcy5pcHJveHkgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0b3BJcHJveHkgKCkge1xuICAgIGlmICghdGhpcy5pcHJveHkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBxdWl0UHJvbWlzZSA9IHRoaXMuaXByb3h5LnF1aXQoKTtcbiAgICB0aGlzLmlwcm94eSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHF1aXRQcm9taXNlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLndhcm4oYENhbm5vdCBzdG9wIGlwcm94eS4gT3JpZ2luYWwgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaW50ZXJydXB0IChmb3JjZSA9IGZhbHNlKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG5cbiAgICBpZiAodGhpcy50aW1lb3V0SGFuZGxlcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dEhhbmRsZXIpO1xuICAgICAgdGhpcy50aW1lb3V0SGFuZGxlciA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWFpblByb2Nlc3MgJiYgdGhpcy5tYWluUHJvY2Vzcy5pc1J1bm5pbmcpIHtcbiAgICAgIGNvbnN0IGludGVycnVwdFByb21pc2UgPSB0aGlzLm1haW5Qcm9jZXNzLnN0b3AoZm9yY2UgPyAnU0lHVEVSTScgOiAnU0lHSU5UJyk7XG4gICAgICB0aGlzLm1haW5Qcm9jZXNzID0gbnVsbDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGludGVycnVwdFByb21pc2U7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZy53YXJuKGBDYW5ub3QgJHtmb3JjZSA/ICd0ZXJtaW5hdGUnIDogJ2ludGVycnVwdCd9ICR7RkZNUEVHX0JJTkFSWX0uIGAgK1xuICAgICAgICAgIGBPcmlnaW5hbCBlcnJvcjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdHMudXNlUG9ydEZvcndhcmRpbmcpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RvcElwcm94eSgpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBhc3luYyBmaW5pc2ggKCkge1xuICAgIGF3YWl0IHRoaXMuaW50ZXJydXB0KCk7XG4gICAgcmV0dXJuIHRoaXMudmlkZW9QYXRoO1xuICB9XG5cbiAgYXN5bmMgY2xlYW51cCAoKSB7XG4gICAgaWYgKGF3YWl0IGZzLmV4aXN0cyh0aGlzLnZpZGVvUGF0aCkpIHtcbiAgICAgIGF3YWl0IGZzLnJpbXJhZih0aGlzLnZpZGVvUGF0aCk7XG4gICAgfVxuICB9XG59XG5cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBTdGFydFJlY29yZGluZ09wdGlvbnNcbiAqXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHJlbW90ZVBhdGggLSBUaGUgcGF0aCB0byB0aGUgcmVtb3RlIGxvY2F0aW9uLCB3aGVyZSB0aGUgcmVzdWx0aW5nIHZpZGVvIHNob3VsZCBiZSB1cGxvYWRlZC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBmb2xsb3dpbmcgcHJvdG9jb2xzIGFyZSBzdXBwb3J0ZWQ6IGh0dHAvaHR0cHMsIGZ0cC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE51bGwgb3IgZW1wdHkgc3RyaW5nIHZhbHVlICh0aGUgZGVmYXVsdCBzZXR0aW5nKSBtZWFucyB0aGUgY29udGVudCBvZiByZXN1bHRpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUgc2hvdWxkIGJlIGVuY29kZWQgYXMgQmFzZTY0IGFuZCBwYXNzZWQgYXMgdGhlIGVuZHBvdW50IHJlc3BvbnNlIHZhbHVlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duIGlmIHRoZSBnZW5lcmF0ZWQgbWVkaWEgZmlsZSBpcyB0b28gYmlnIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXQgaW50byB0aGUgYXZhaWxhYmxlIHByb2Nlc3MgbWVtb3J5LlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGhpcyBvcHRpb24gb25seSBoYXMgYW4gZWZmZWN0IGlmIHRoZXJlIGlzIHNjcmVlbiByZWNvcmRpbmcgcHJvY2VzcyBpbiBwcm9ncmVlc3NcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBgZm9yY2VSZXN0YXJ0YCBwYXJhbWV0ZXIgaXMgbm90IHNldCB0byBgdHJ1ZWAuXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHVzZXIgLSBUaGUgbmFtZSBvZiB0aGUgdXNlciBmb3IgdGhlIHJlbW90ZSBhdXRoZW50aWNhdGlvbi4gT25seSB3b3JrcyBpZiBgcmVtb3RlUGF0aGAgaXMgcHJvdmlkZWQuXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHBhc3MgLSBUaGUgcGFzc3dvcmQgZm9yIHRoZSByZW1vdGUgYXV0aGVudGljYXRpb24uIE9ubHkgd29ya3MgaWYgYHJlbW90ZVBhdGhgIGlzIHByb3ZpZGVkLlxuICogQHByb3BlcnR5IHs/c3RyaW5nfSBtZXRob2QgLSBUaGUgaHR0cCBtdWx0aXBhcnQgdXBsb2FkIG1ldGhvZCBuYW1lLiBUaGUgJ1BVVCcgb25lIGlzIHVzZWQgYnkgZGVmYXVsdC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT25seSB3b3JrcyBpZiBgcmVtb3RlUGF0aGAgaXMgcHJvdmlkZWQuXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHZpZGVvVHlwZSAtIFRoZSBmb3JtYXQgb2YgdGhlIHNjcmVlbiBjYXB0dXJlIHRvIGJlIHJlY29yZGVkLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdmFpbGFibGUgZm9ybWF0czogXCJoMjY0XCIsIFwibXA0XCIgb3IgXCJmbXA0XCIuIERlZmF1bHQgaXMgXCJtcDRcIi5cbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gdmlkZW9RdWFsaXR5IC0gVGhlIHZpZGVvIGVuY29kaW5nIHF1YWxpdHkgKGxvdywgbWVkaXVtLCBoaWdoLCBwaG90byAtIGRlZmF1bHRzIHRvIG1lZGl1bSkuXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHZpZGVvRnBzIC0gVGhlIEZyYW1lcyBQZXIgU2Vjb25kIHJhdGUgb2YgdGhlIHJlY29yZGVkIHZpZGVvLiBDaGFuZ2UgdGhpcyB2YWx1ZSBpZiB0aGUgcmVzdWx0aW5nIHZpZGVvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgdG9vIHNsb3cgb3IgdG9vIGZhc3QuIERlZmF1bHRzIHRvIDEwLlxuICogQHByb3BlcnR5IHs/Ym9vbGVhbn0gZm9yY2VSZXN0YXJ0IC0gV2hldGhlciB0byB0cnkgdG8gY2F0Y2ggYW5kIHVwbG9hZC9yZXR1cm4gdGhlIGN1cnJlbnRseSBydW5uaW5nIHNjcmVlbiByZWNvcmRpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChgZmFsc2VgLCB0aGUgZGVmYXVsdCBzZXR0aW5nKSBvciBpZ25vcmUgdGhlIHJlc3VsdCBvZiBpdCBhbmQgc3RhcnQgYSBuZXcgcmVjb3JkaW5nXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbW1lZGlhdGVseS5cbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ3xudW1iZXJ9IHRpbWVMaW1pdCAtIFRoZSBtYXhpbXVtIHJlY29yZGluZyB0aW1lLCBpbiBzZWNvbmRzLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGRlZmF1bHQgdmFsdWUgaXMgMTgwLCB0aGUgbWF4aW11bSB2YWx1ZSBpcyA2MDAgKDEwIG1pbnV0ZXMpLlxuICovXG5cbi8qKlxuICogUmVjb3JkIHRoZSBkaXNwbGF5IG9mIGRldmljZXMgcnVubmluZyBpT1MgU2ltdWxhdG9yIHNpbmNlIFhjb2RlIDguMyBvciByZWFsIGRldmljZXMgc2luY2UgaU9TIDhcbiAqIChpb3MtbWluaWNhcCB1dGlsaXR5IGlzIHJlcXVpcmVkOiBodHRwczovL2dpdGh1Yi5jb20vb3BlbnN0Zi9pb3MtbWluaWNhcCkuXG4gKiBJdCByZWNvcmRzIHNjcmVlbiBhY3Rpdml0eSB0byBhIE1QRUctNCBmaWxlLiBBdWRpbyBpcyBub3QgcmVjb3JkZWQgd2l0aCB0aGUgdmlkZW8gZmlsZS5cbiAqIElmIHNjcmVlbiByZWNvcmRpbmcgaGFzIGJlZW4gYWxyZWFkeSBzdGFydGVkIHRoZW4gdGhlIGNvbW1hbmQgd2lsbCBzdG9wIGl0IGZvcmNlZnVsbHkgYW5kIHN0YXJ0IGEgbmV3IG9uZS5cbiAqIFRoZSBwcmV2aW91c2x5IHJlY29yZGVkIHZpZGVvIGZpbGUgd2lsbCBiZSBkZWxldGVkLlxuICpcbiAqIEBwYXJhbSB7P1N0YXJ0UmVjb3JkaW5nT3B0aW9uc30gb3B0aW9ucyAtIFRoZSBhdmFpbGFibGUgb3B0aW9ucy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IEJhc2U2NC1lbmNvZGVkIGNvbnRlbnQgb2YgdGhlIHJlY29yZGVkIG1lZGlhIGZpbGUgaWZcbiAqICAgICAgICAgICAgICAgICAgIGFueSBzY3JlZW4gcmVjb3JkaW5nIGlzIGN1cnJlbnRseSBydW5uaW5nIG9yIGFuIGVtcHR5IHN0cmluZy5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBzY3JlZW4gcmVjb3JkaW5nIGhhcyBmYWlsZWQgdG8gc3RhcnQuXG4gKi9cbmNvbW1hbmRzLnN0YXJ0UmVjb3JkaW5nU2NyZWVuID0gYXN5bmMgZnVuY3Rpb24gKG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7XG4gICAgdmlkZW9UeXBlLFxuICAgIHRpbWVMaW1pdCA9IERFRkFVTFRfUkVDT1JESU5HX1RJTUVfU0VDLFxuICAgIHZpZGVvUXVhbGl0eSA9ICdtZWRpdW0nLFxuICAgIHZpZGVvRnBzID0gREVGQVVMVF9GUFMsXG4gICAgZm9yY2VSZXN0YXJ0LFxuICB9ID0gb3B0aW9ucztcblxuICBsZXQgcmVzdWx0ID0gJyc7XG4gIGlmICghZm9yY2VSZXN0YXJ0KSB7XG4gICAgbG9nLmluZm8oYENoZWNraW5nIGlmIHRoZXJlIGlzL3dhcyBhIHByZXZpb3VzIHNjcmVlbiByZWNvcmRpbmcuIGAgK1xuICAgICAgYFNldCAnZm9yY2VSZXN0YXJ0JyBvcHRpb24gdG8gJ3RydWUnIGlmIHlvdSdkIGxpa2UgdG8gc2tpcCB0aGlzIHN0ZXAuYCk7XG4gICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5zdG9wUmVjb3JkaW5nU2NyZWVuKG9wdGlvbnMpO1xuICB9XG5cbiAgY29uc3QgdmlkZW9QYXRoID0gYXdhaXQgdGVtcERpci5wYXRoKHtcbiAgICBwcmVmaXg6IGBhcHBpdW1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMiwgOCl9YCxcbiAgICBzdWZmaXg6IE1QNF9FWFQsXG4gIH0pO1xuXG4gIGNvbnN0IHNjcmVlblJlY29yZGVyID0gbmV3IFNjcmVlblJlY29yZGVyKHRoaXMub3B0cy5kZXZpY2UudWRpZCwgdmlkZW9QYXRoLCB7XG4gICAgLy8gVE9ETzogQXBwbHkgdHlwZSBhbmQgcXVhbGl0eSBvcHRpb25zXG4gICAgdmlkZW9UeXBlLFxuICAgIHZpZGVvUXVhbGl0eSxcbiAgICB2aWRlb0ZwczogdmlkZW9GcHMgfHwgREVGQVVMVF9GUFMsXG4gICAgcmVtb3RlUG9ydDogdGhpcy5vcHRzLm1qcGVnU2VydmVyUG9ydCB8fCBERUZBVUxUX01KUEVHX1NFUlZFUl9QT1JULFxuICAgIHVzZVBvcnRGb3J3YXJkaW5nOiB0aGlzLmlzUmVhbERldmljZSgpLFxuICB9KTtcbiAgaWYgKCFhd2FpdCBzY3JlZW5SZWNvcmRlci5pbnRlcnJ1cHQodHJ1ZSkpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdygnVW5hYmxlIHRvIHN0b3Agc2NyZWVuIHJlY29yZGluZyBwcm9jZXNzJyk7XG4gIH1cbiAgaWYgKHRoaXMuX3JlY2VudFNjcmVlblJlY29yZGVyKSB7XG4gICAgYXdhaXQgdGhpcy5fcmVjZW50U2NyZWVuUmVjb3JkZXIuY2xlYW51cCgpO1xuICAgIHRoaXMuX3JlY2VudFNjcmVlblJlY29yZGVyID0gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHRpbWVvdXRTZWNvbmRzID0gcGFyc2VGbG9hdCh0aW1lTGltaXQpO1xuICBpZiAoaXNOYU4odGltZW91dFNlY29uZHMpIHx8IHRpbWVvdXRTZWNvbmRzID4gTUFYX1JFQ09SRElOR19USU1FX1NFQyB8fCB0aW1lb3V0U2Vjb25kcyA8PSAwKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYFRoZSB0aW1lTGltaXQgdmFsdWUgbXVzdCBiZSBpbiByYW5nZSBbMSwgJHtNQVhfUkVDT1JESU5HX1RJTUVfU0VDfV0gc2Vjb25kcy4gYCArXG4gICAgICBgVGhlIHZhbHVlIG9mICcke3RpbWVMaW1pdH0nIGhhcyBiZWVuIHBhc3NlZCBpbnN0ZWFkLmApO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBzY3JlZW5SZWNvcmRlci5zdGFydCh0aW1lb3V0U2Vjb25kcyAqIDEwMDApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYXdhaXQgc2NyZWVuUmVjb3JkZXIuaW50ZXJydXB0KHRydWUpO1xuICAgIGF3YWl0IHNjcmVlblJlY29yZGVyLmNsZWFudXAoKTtcbiAgICB0aHJvdyBlO1xuICB9XG4gIHRoaXMuX3JlY2VudFNjcmVlblJlY29yZGVyID0gc2NyZWVuUmVjb3JkZXI7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gU3RvcFJlY29yZGluZ09wdGlvbnNcbiAqXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHJlbW90ZVBhdGggLSBUaGUgcGF0aCB0byB0aGUgcmVtb3RlIGxvY2F0aW9uLCB3aGVyZSB0aGUgcmVzdWx0aW5nIHZpZGVvIHNob3VsZCBiZSB1cGxvYWRlZC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBmb2xsb3dpbmcgcHJvdG9jb2xzIGFyZSBzdXBwb3J0ZWQ6IGh0dHAvaHR0cHMsIGZ0cC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE51bGwgb3IgZW1wdHkgc3RyaW5nIHZhbHVlICh0aGUgZGVmYXVsdCBzZXR0aW5nKSBtZWFucyB0aGUgY29udGVudCBvZiByZXN1bHRpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUgc2hvdWxkIGJlIGVuY29kZWQgYXMgQmFzZTY0IGFuZCBwYXNzZWQgYXMgdGhlIGVuZHBvdW50IHJlc3BvbnNlIHZhbHVlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duIGlmIHRoZSBnZW5lcmF0ZWQgbWVkaWEgZmlsZSBpcyB0b28gYmlnIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXQgaW50byB0aGUgYXZhaWxhYmxlIHByb2Nlc3MgbWVtb3J5LlxuICogQHByb3BlcnR5IHs/c3RyaW5nfSB1c2VyIC0gVGhlIG5hbWUgb2YgdGhlIHVzZXIgZm9yIHRoZSByZW1vdGUgYXV0aGVudGljYXRpb24uIE9ubHkgd29ya3MgaWYgYHJlbW90ZVBhdGhgIGlzIHByb3ZpZGVkLlxuICogQHByb3BlcnR5IHs/c3RyaW5nfSBwYXNzIC0gVGhlIHBhc3N3b3JkIGZvciB0aGUgcmVtb3RlIGF1dGhlbnRpY2F0aW9uLiBPbmx5IHdvcmtzIGlmIGByZW1vdGVQYXRoYCBpcyBwcm92aWRlZC5cbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gbWV0aG9kIC0gVGhlIGh0dHAgbXVsdGlwYXJ0IHVwbG9hZCBtZXRob2QgbmFtZS4gVGhlICdQVVQnIG9uZSBpcyB1c2VkIGJ5IGRlZmF1bHQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9ubHkgd29ya3MgaWYgYHJlbW90ZVBhdGhgIGlzIHByb3ZpZGVkLlxuICovXG5cbi8qKlxuICogU3RvcCByZWNvcmRpbmcgdGhlIHNjcmVlbi4gSWYgbm8gc2NyZWVuIHJlY29yZGluZyBwcm9jZXNzIGlzIHJ1bm5pbmcgdGhlblxuICogdGhlIGVuZHBvaW50IHdpbGwgdHJ5IHRvIGdldCB0aGUgcmVjZW50bHkgcmVjb3JkZWQgZmlsZS5cbiAqIElmIG5vIHByZXZpb3VzbHkgcmVjb3JkZWQgZmlsZSBpcyBmb3VuZCBhbmQgbm8gYWN0aXZlIHNjcmVlbiByZWNvcmRpbmdcbiAqIHByb2Nlc3NlcyBhcmUgcnVubmluZyB0aGVuIHRoZSBtZXRob2QgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHs/U3RvcFJlY29yZGluZ09wdGlvbnN9IG9wdGlvbnMgLSBUaGUgYXZhaWxhYmxlIG9wdGlvbnMuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBCYXNlNjQtZW5jb2RlZCBjb250ZW50IG9mIHRoZSByZWNvcmRlZCBtZWRpYSBmaWxlIGlmICdyZW1vdGVQYXRoJ1xuICogICAgICAgICAgICAgICAgICAgcGFyYW1ldGVyIGlzIGVtcHR5IG9yIG51bGwgb3IgYW4gZW1wdHkgc3RyaW5nLlxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBnZXR0aW5nIHRoZSBuYW1lIG9mIGEgbWVkaWEgZmlsZVxuICogICAgICAgICAgICAgICAgIG9yIHRoZSBmaWxlIGNvbnRlbnQgY2Fubm90IGJlIHVwbG9hZGVkIHRvIHRoZSByZW1vdGUgbG9jYXRpb24uXG4gKi9cbmNvbW1hbmRzLnN0b3BSZWNvcmRpbmdTY3JlZW4gPSBhc3luYyBmdW5jdGlvbiAob3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHtcbiAgICByZW1vdGVQYXRoLFxuICAgIHVzZXIsXG4gICAgcGFzcyxcbiAgICBtZXRob2QsXG4gIH0gPSBvcHRpb25zO1xuXG4gIGlmICghdGhpcy5fcmVjZW50U2NyZWVuUmVjb3JkZXIpIHtcbiAgICBsb2cuaW5mbygnU2NyZWVuIHJlY29yZGluZyBpcyBub3QgcnVubmluZy4gVGhlcmUgaXMgbm90aGluZyB0byBzdG9wLicpO1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgdmlkZW9QYXRoID0gYXdhaXQgdGhpcy5fcmVjZW50U2NyZWVuUmVjb3JkZXIuZmluaXNoKCk7XG4gICAgaWYgKCFhd2FpdCBmcy5leGlzdHModmlkZW9QYXRoKSkge1xuICAgICAgbG9nLmVycm9yQW5kVGhyb3coYFRoZSBzY3JlZW4gcmVjb3JkZXIgdXRpbGl0eSBoYXMgZmFpbGVkIGAgK1xuICAgICAgICBgdG8gc3RvcmUgdGhlIGFjdHVhbCBzY3JlZW4gcmVjb3JkaW5nIGF0ICcke3ZpZGVvUGF0aH0nYCk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBlbmNvZGVCYXNlNjRPclVwbG9hZCh2aWRlb1BhdGgsIHJlbW90ZVBhdGgsIHtcbiAgICAgIHVzZXIsXG4gICAgICBwYXNzLFxuICAgICAgbWV0aG9kXG4gICAgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgYXdhaXQgdGhpcy5fcmVjZW50U2NyZWVuUmVjb3JkZXIuaW50ZXJydXB0KHRydWUpO1xuICAgIGF3YWl0IHRoaXMuX3JlY2VudFNjcmVlblJlY29yZGVyLmNsZWFudXAoKTtcbiAgICB0aGlzLl9yZWNlbnRTY3JlZW5SZWNvcmRlciA9IG51bGw7XG4gIH1cbn07XG5cblxuZXhwb3J0IHsgY29tbWFuZHMgfTtcbmV4cG9ydCBkZWZhdWx0IGNvbW1hbmRzO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
