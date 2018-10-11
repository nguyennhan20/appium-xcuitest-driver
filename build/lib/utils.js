'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _appiumSupport = require('appium-support');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _appiumIosDriver = require('appium-ios-driver');

var _teen_process = require('teen_process');

var _appiumXcode = require('appium-xcode');

var _appiumXcode2 = _interopRequireDefault(_appiumXcode);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _v8 = require('v8');

var _v82 = _interopRequireDefault(_v8);

var DEFAULT_TIMEOUT_KEY = 'default';

function detectUdid() {
  var cmd, args, udid, _ref, stdout, udids;

  return _regeneratorRuntime.async(function detectUdid$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Auto-detecting real device udid...');
        cmd = undefined, args = [];
        context$1$0.prev = 2;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.which('idevice_id'));

      case 5:
        cmd = context$1$0.sent;

        args.push('-l');
        _logger2['default'].debug('Using idevice_id');
        context$1$0.next = 14;
        break;

      case 10:
        context$1$0.prev = 10;
        context$1$0.t0 = context$1$0['catch'](2);

        _logger2['default'].debug('Using udidetect');
        cmd = require.resolve('udidetect');

      case 14:
        udid = undefined;
        context$1$0.prev = 15;
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)(cmd, args, { timeout: 3000 }));

      case 18:
        _ref = context$1$0.sent;
        stdout = _ref.stdout;
        udids = _lodash2['default'].uniq(_lodash2['default'].filter(stdout.split('\n'), Boolean));

        udid = _lodash2['default'].last(udids);
        if (udids.length > 1) {
          _logger2['default'].warn('Multiple devices found: ' + udids.join(', '));
          _logger2['default'].warn('Choosing \'' + udid + '\'. If this is wrong, manually set with \'udid\' desired capability');
        }
        context$1$0.next = 28;
        break;

      case 25:
        context$1$0.prev = 25;
        context$1$0.t1 = context$1$0['catch'](15);

        _logger2['default'].errorAndThrow('Error detecting udid: ' + context$1$0.t1.message);

      case 28:
        if (!(!udid || udid.length <= 2)) {
          context$1$0.next = 30;
          break;
        }

        throw new Error('Could not detect udid.');

      case 30:
        _logger2['default'].debug('Detected real device udid: \'' + udid + '\'');
        return context$1$0.abrupt('return', udid);

      case 32:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[2, 10], [15, 25]]);
}

function getAndCheckXcodeVersion() {
  var version;
  return _regeneratorRuntime.async(function getAndCheckXcodeVersion$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        version = undefined;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumXcode2['default'].getVersion(true));

      case 4:
        version = context$1$0.sent;
        context$1$0.next = 11;
        break;

      case 7:
        context$1$0.prev = 7;
        context$1$0.t0 = context$1$0['catch'](1);

        _logger2['default'].debug(context$1$0.t0);
        _logger2['default'].errorAndThrow('Could not determine Xcode version: ' + context$1$0.t0.message);

      case 11:
        if (version.toolsVersion) {
          context$1$0.next = 20;
          break;
        }

        context$1$0.prev = 12;
        context$1$0.next = 15;
        return _regeneratorRuntime.awrap(_appiumXcode2['default'].getCommandLineToolsVersion());

      case 15:
        version.toolsVersion = context$1$0.sent;
        context$1$0.next = 20;
        break;

      case 18:
        context$1$0.prev = 18;
        context$1$0.t1 = context$1$0['catch'](12);

      case 20:

        // we do not support Xcodes < 7.3,
        if (version.versionFloat < 7.3) {
          _logger2['default'].errorAndThrow('Xcode version \'' + version.versionString + '\'. Support for ' + ('Xcode ' + version.versionString + ' is not supported. ') + 'Please upgrade to version 7.3 or higher');
        }
        return context$1$0.abrupt('return', version);

      case 22:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 7], [12, 18]]);
}

function getAndCheckIosSdkVersion() {
  var versionNumber;
  return _regeneratorRuntime.async(function getAndCheckIosSdkVersion$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        versionNumber = undefined;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumXcode2['default'].getMaxIOSSDK());

      case 4:
        versionNumber = context$1$0.sent;
        context$1$0.next = 10;
        break;

      case 7:
        context$1$0.prev = 7;
        context$1$0.t0 = context$1$0['catch'](1);

        _logger2['default'].errorAndThrow('Could not determine iOS SDK version: ' + context$1$0.t0.message);

      case 10:
        return context$1$0.abrupt('return', versionNumber);

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 7]]);
}

function translateDeviceName(xcodeVersion, platformVersion) {
  var devName = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
  var deviceName, namesMapping;
  return _regeneratorRuntime.async(function translateDeviceName$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        deviceName = devName;
        context$1$0.t0 = devName.toLowerCase().trim();
        context$1$0.next = context$1$0.t0 === 'iphone simulator' ? 4 : context$1$0.t0 === 'ipad simulator' ? 6 : context$1$0.t0 === 'iphone 8' ? 8 : context$1$0.t0 === 'iphone 8 plus' ? 8 : context$1$0.t0 === 'iphone x' ? 8 : 10;
        break;

      case 4:
        deviceName = 'iPhone 6';
        return context$1$0.abrupt('break', 10);

      case 6:
        // no need to worry about floating point comparison because of the
        //   nature of the numbers being compared
        // iPad Retina is no longer available for ios 10.3
        //   so we pick another iPad to use as default
        deviceName = parseFloat(platformVersion) < 10.3 ? 'iPad Retina' : 'iPad Air';
        return context$1$0.abrupt('break', 10);

      case 8:
        // Xcode 9.0(.0) mis-named the new devices
        if (xcodeVersion.major === 9 && xcodeVersion.minor === 0 && (!_appiumSupport.util.hasValue(xcodeVersion.patch) || xcodeVersion.patch === 0)) {
          namesMapping = {
            'iphone 8': 'iPhone2017-A',
            'iphone 8 plus': 'iPhone2017-B',
            'iphone x': 'iPhone2017-C'
          };

          deviceName = namesMapping[devName.toLowerCase().trim()];
        }
        return context$1$0.abrupt('break', 10);

      case 10:

        if (deviceName !== devName) {
          _logger2['default'].debug('Changing deviceName from \'' + devName + '\' to \'' + deviceName + '\'');
        }
        return context$1$0.abrupt('return', deviceName);

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

// This map contains derived data attachment folders as keys
// and values are stacks of permssion masks
// It is used to synchronize permissions change
// on shared folders
var derivedDataPermissionsStacks = new _Map();

function adjustWDAAttachmentsPermissions(wda, perms) {
  var attachmentsFolder, permsStack;
  return _regeneratorRuntime.async(function adjustWDAAttachmentsPermissions$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.t0 = !wda;

        if (context$1$0.t0) {
          context$1$0.next = 5;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(wda.retrieveDerivedDataPath());

      case 4:
        context$1$0.t0 = !context$1$0.sent;

      case 5:
        if (!context$1$0.t0) {
          context$1$0.next = 8;
          break;
        }

        _logger2['default'].warn('No WebDriverAgent derived data available, so unable to set permissions on WDA attachments folder');
        return context$1$0.abrupt('return');

      case 8:
        context$1$0.t1 = _path2['default'];
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(wda.retrieveDerivedDataPath());

      case 11:
        context$1$0.t2 = context$1$0.sent;
        attachmentsFolder = context$1$0.t1.join.call(context$1$0.t1, context$1$0.t2, 'Logs/Test/Attachments');
        permsStack = derivedDataPermissionsStacks.get(attachmentsFolder) || [];

        if (!permsStack.length) {
          context$1$0.next = 23;
          break;
        }

        if (!(_lodash2['default'].last(permsStack) === perms)) {
          context$1$0.next = 19;
          break;
        }

        permsStack.push(perms);
        _logger2['default'].info('Not changing permissions of \'' + attachmentsFolder + '\' to \'' + perms + '\', because they were already set by the other session');
        return context$1$0.abrupt('return');

      case 19:
        if (!(permsStack.length > 1)) {
          context$1$0.next = 23;
          break;
        }

        permsStack.pop();
        _logger2['default'].info('Not changing permissions of \'' + attachmentsFolder + '\' to \'' + perms + '\', because the other session does not expect them to be changed');
        return context$1$0.abrupt('return');

      case 23:
        derivedDataPermissionsStacks.set(attachmentsFolder, [perms]);

        context$1$0.next = 26;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(attachmentsFolder));

      case 26:
        if (!context$1$0.sent) {
          context$1$0.next = 31;
          break;
        }

        _logger2['default'].info('Setting \'' + perms + '\' permissions to \'' + attachmentsFolder + '\' folder');
        context$1$0.next = 30;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.chmod(attachmentsFolder, perms));

      case 30:
        return context$1$0.abrupt('return');

      case 31:
        _logger2['default'].info('There is no ' + attachmentsFolder + ' folder, so not changing permissions');

      case 32:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

// This map contains derived data logs folders as keys
// and values are the count of times the particular
// folder has been scheduled for removal
var derivedDataCleanupMarkers = new _Map();

function markSystemFilesForCleanup(wda) {
  var logsRoot, markersCount;
  return _regeneratorRuntime.async(function markSystemFilesForCleanup$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.t0 = !wda;

        if (context$1$0.t0) {
          context$1$0.next = 5;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(wda.retrieveDerivedDataPath());

      case 4:
        context$1$0.t0 = !context$1$0.sent;

      case 5:
        if (!context$1$0.t0) {
          context$1$0.next = 8;
          break;
        }

        _logger2['default'].warn('No WebDriverAgent derived data available, so unable to mark system files for cleanup');
        return context$1$0.abrupt('return');

      case 8:
        context$1$0.t1 = _path2['default'];
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(wda.retrieveDerivedDataPath());

      case 11:
        context$1$0.t2 = context$1$0.sent;
        logsRoot = context$1$0.t1.resolve.call(context$1$0.t1, context$1$0.t2, 'Logs');
        markersCount = 0;

        if (derivedDataCleanupMarkers.has(logsRoot)) {
          markersCount = derivedDataCleanupMarkers.get(logsRoot);
        }
        derivedDataCleanupMarkers.set(logsRoot, ++markersCount);

      case 16:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function clearSystemFiles(wda) {
  var logsRoot, markersCount, cleanupCmd, cleanupTask;
  return _regeneratorRuntime.async(function clearSystemFiles$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.t0 = !wda;

        if (context$1$0.t0) {
          context$1$0.next = 5;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(wda.retrieveDerivedDataPath());

      case 4:
        context$1$0.t0 = !context$1$0.sent;

      case 5:
        if (!context$1$0.t0) {
          context$1$0.next = 8;
          break;
        }

        _logger2['default'].warn('No WebDriverAgent derived data available, so unable to clear system files');
        return context$1$0.abrupt('return');

      case 8:
        context$1$0.t1 = _path2['default'];
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(wda.retrieveDerivedDataPath());

      case 11:
        context$1$0.t2 = context$1$0.sent;
        logsRoot = context$1$0.t1.resolve.call(context$1$0.t1, context$1$0.t2, 'Logs');

        if (!derivedDataCleanupMarkers.has(logsRoot)) {
          context$1$0.next = 19;
          break;
        }

        markersCount = derivedDataCleanupMarkers.get(logsRoot);

        derivedDataCleanupMarkers.set(logsRoot, --markersCount);

        if (!(markersCount > 0)) {
          context$1$0.next = 19;
          break;
        }

        _logger2['default'].info('Not cleaning \'' + logsRoot + '\' folder, because the other session does not expect it to be cleaned');
        return context$1$0.abrupt('return');

      case 19:
        derivedDataCleanupMarkers.set(logsRoot, 0);

        // Cleaning up big temporary files created by XCTest: https://github.com/appium/appium/issues/9410
        cleanupCmd = 'find -E /private/var/folders ' + '-regex \'.*/Session-WebDriverAgentRunner.*\\.log$|.*/StandardOutputAndStandardError\\.txt$\' ' + '-type f -exec sh -c \'echo "" > "{}"\' \\;';
        cleanupTask = new _teen_process.SubProcess('bash', ['-c', cleanupCmd], {
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        context$1$0.next = 24;
        return _regeneratorRuntime.awrap(cleanupTask.start(0));

      case 24:
        // Do not wait for the task to be completed, since it might take a lot of time
        // We keep it running after Appium process is killed
        cleanupTask.proc.unref();
        _logger2['default'].debug('Started background XCTest logs cleanup: ' + cleanupCmd);

        context$1$0.next = 28;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(logsRoot));

      case 28:
        if (!context$1$0.sent) {
          context$1$0.next = 33;
          break;
        }

        _logger2['default'].info('Cleaning test logs in \'' + logsRoot + '\' folder');
        context$1$0.next = 32;
        return _regeneratorRuntime.awrap(_appiumIosDriver.utils.clearLogs([logsRoot]));

      case 32:
        return context$1$0.abrupt('return');

      case 33:
        _logger2['default'].info('There is no ' + logsRoot + ' folder, so not cleaning files');

      case 34:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function checkAppPresent(app) {
  return _regeneratorRuntime.async(function checkAppPresent$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Checking whether app \'' + app + '\' is actually present on file system');
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(app));

      case 3:
        if (context$1$0.sent) {
          context$1$0.next = 5;
          break;
        }

        _logger2['default'].errorAndThrow('Could not find app at \'' + app + '\'');

      case 5:
        _logger2['default'].debug('App is present');

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function getDriverInfo() {
  var stat, built, pkg, version, info;
  return _regeneratorRuntime.async(function getDriverInfo$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.stat(_path2['default'].resolve(__dirname, '..')));

      case 2:
        stat = context$1$0.sent;
        built = stat.mtime.getTime();
        pkg = require(__filename.indexOf('build/lib/utils') !== -1 ? '../../package.json' : '../package.json');
        version = pkg.version;
        info = {
          built: built,
          version: version
        };
        return context$1$0.abrupt('return', info);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function normalizeCommandTimeouts(value) {
  // The value is normalized already
  if (typeof value !== 'string') {
    return value;
  }

  var result = {};
  // Use as default timeout for all commands if a single integer value is provided
  if (!isNaN(value)) {
    result[DEFAULT_TIMEOUT_KEY] = _lodash2['default'].toInteger(value);
    return result;
  }

  // JSON object has been provided. Let's parse it
  try {
    result = JSON.parse(value);
    if (!_lodash2['default'].isPlainObject(result)) {
      throw new Error();
    }
  } catch (err) {
    _logger2['default'].errorAndThrow('"commandTimeouts" capability should be a valid JSON object. "' + value + '" was given instead');
  }
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _getIterator(_lodash2['default'].toPairs(result)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2);

      var cmd = _step$value[0];
      var timeout = _step$value[1];

      if (!_lodash2['default'].isInteger(timeout) || timeout <= 0) {
        _logger2['default'].errorAndThrow('The timeout for "' + cmd + '" should be a valid natural number of milliseconds. "' + timeout + '" was given instead');
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return result;
}

/**
 * Get the process id of the most recent running application
 * having the particular command line pattern.
 *
 * @param {string} pgrepPattern - pgrep-compatible search pattern.
 * @return {string} Either a process id or null if no matches were found.
 */
function getPidUsingPattern(pgrepPattern) {
  var args, _ref2, stdout, pid;

  return _regeneratorRuntime.async(function getPidUsingPattern$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        args = ['-nif', pgrepPattern];
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('pgrep', args));

      case 4:
        _ref2 = context$1$0.sent;
        stdout = _ref2.stdout;
        pid = parseInt(stdout, 10);

        if (!isNaN(pid)) {
          context$1$0.next = 10;
          break;
        }

        _logger2['default'].debug('Cannot parse process id from \'pgrep ' + args.join(' ') + '\' output: ' + stdout);
        return context$1$0.abrupt('return', null);

      case 10:
        return context$1$0.abrupt('return', '' + pid);

      case 13:
        context$1$0.prev = 13;
        context$1$0.t0 = context$1$0['catch'](1);

        _logger2['default'].debug('\'pgrep ' + args.join(' ') + '\' didn\'t detect any matching processes. Return code: ' + context$1$0.t0.code);
        return context$1$0.abrupt('return', null);

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 13]]);
}

/**
 * Kill a process having the particular command line pattern.
 * This method tries to send SIGINT, SIGTERM and SIGKILL to the
 * matched processes in this order if the process is still running.
 *
 * @param {string} pgrepPattern - pgrep-compatible search pattern.
 */
function killAppUsingPattern(pgrepPattern) {
  var _arr, _i, signal, args;

  return _regeneratorRuntime.async(function killAppUsingPattern$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _arr = [2, 15, 9];
        _i = 0;

      case 2:
        if (!(_i < _arr.length)) {
          context$1$0.next = 22;
          break;
        }

        signal = _arr[_i];
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(getPidUsingPattern(pgrepPattern));

      case 6:
        if (context$1$0.sent) {
          context$1$0.next = 8;
          break;
        }

        return context$1$0.abrupt('return');

      case 8:
        args = ['-' + signal, '-if', pgrepPattern];
        context$1$0.prev = 9;
        context$1$0.next = 12;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('pkill', args));

      case 12:
        context$1$0.next = 17;
        break;

      case 14:
        context$1$0.prev = 14;
        context$1$0.t0 = context$1$0['catch'](9);

        _logger2['default'].debug('pkill ' + args.join(' ') + ' -> ' + context$1$0.t0.message);

      case 17:
        context$1$0.next = 19;
        return _regeneratorRuntime.awrap(_bluebird2['default'].delay(100));

      case 19:
        _i++;
        context$1$0.next = 2;
        break;

      case 22:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[9, 14]]);
}

/**
 * Kills running XCTest processes for the particular device.
 *
 * @param {string} udid - The device UDID.
 * @param {boolean} isSimulator - Equals to true if the current device is a Simulator
 * @param {object} opts - Additional options mapping. Possible keys are:
 *   - {string|number} wdaLocalPort: The number of local port WDA is listening on.
 */
function resetXCTestProcesses(udid, isSimulator) {
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var processPatterns, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, pgrepPattern;

  return _regeneratorRuntime.async(function resetXCTestProcesses$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        processPatterns = ['xcodebuild.*' + udid];

        if (opts.wdaLocalPort) {
          processPatterns.push('iproxy ' + opts.wdaLocalPort);
        } else if (!isSimulator) {
          processPatterns.push('iproxy.*' + udid);
        }
        if (isSimulator) {
          processPatterns.push(udid + '.*XCTRunner');
        }
        _logger2['default'].debug('Killing running processes \'' + processPatterns.join(', ') + '\' for the device ' + udid + '...');
        _iteratorNormalCompletion2 = true;
        _didIteratorError2 = false;
        _iteratorError2 = undefined;
        context$1$0.prev = 7;
        _iterator2 = _getIterator(processPatterns);

      case 9:
        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
          context$1$0.next = 16;
          break;
        }

        pgrepPattern = _step2.value;
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(killAppUsingPattern(pgrepPattern));

      case 13:
        _iteratorNormalCompletion2 = true;
        context$1$0.next = 9;
        break;

      case 16:
        context$1$0.next = 22;
        break;

      case 18:
        context$1$0.prev = 18;
        context$1$0.t0 = context$1$0['catch'](7);
        _didIteratorError2 = true;
        _iteratorError2 = context$1$0.t0;

      case 22:
        context$1$0.prev = 22;
        context$1$0.prev = 23;

        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }

      case 25:
        context$1$0.prev = 25;

        if (!_didIteratorError2) {
          context$1$0.next = 28;
          break;
        }

        throw _iteratorError2;

      case 28:
        return context$1$0.finish(25);

      case 29:
        return context$1$0.finish(22);

      case 30:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[7, 18, 22, 30], [23,, 25, 29]]);
}

function printUser() {
  var _ref3, stdout;

  return _regeneratorRuntime.async(function printUser$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('whoami'));

      case 3:
        _ref3 = context$1$0.sent;
        stdout = _ref3.stdout;

        _logger2['default'].debug('Current user: \'' + stdout.trim() + '\'');
        context$1$0.next = 11;
        break;

      case 8:
        context$1$0.prev = 8;
        context$1$0.t0 = context$1$0['catch'](0);

        _logger2['default'].debug('Unable to get username running server: ' + context$1$0.t0.message);

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 8]]);
}

function printLibimobiledeviceInfo() {
  var _ref4, stdout, match;

  return _regeneratorRuntime.async(function printLibimobiledeviceInfo$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('brew', ['info', 'libimobiledevice']));

      case 3:
        _ref4 = context$1$0.sent;
        stdout = _ref4.stdout;
        match = /libimobiledevice:(.+)/.exec(stdout);

        if (match && match[1]) {
          _logger2['default'].debug('Current version of libimobiledevice: ' + match[1].trim());
        }
        context$1$0.next = 12;
        break;

      case 9:
        context$1$0.prev = 9;
        context$1$0.t0 = context$1$0['catch'](0);

        _logger2['default'].debug('Unable to get version of libimobiledevice: ' + context$1$0.t0.message);

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 9]]);
}

/**
 * Get the IDs of processes listening on the particular system port.
 * It is also possible to apply additional filtering based on the
 * process command line.
 *
 * @param {string|number} port - The port number.
 * @param {?Function} filteringFunc - Optional lambda function, which
 *                                    receives command line string of the particular process
 *                                    listening on given port, and is expected to return
 *                                    either true or false to include/exclude the corresponding PID
 *                                    from the resulting array.
 * @returns {Array<string>} - the list of matched process ids.
 */
function getPIDsListeningOnPort(port) {
  var filteringFunc = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var result, _ref5,
  // This only works since Mac OS X El Capitan
  stdout;

  return _regeneratorRuntime.async(function getPIDsListeningOnPort$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        result = [];
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('lsof', ['-ti', 'tcp:' + port]));

      case 4:
        _ref5 = context$1$0.sent;
        stdout = _ref5.stdout;

        result.push.apply(result, _toConsumableArray(stdout.trim().split(/\n+/)));
        context$1$0.next = 12;
        break;

      case 9:
        context$1$0.prev = 9;
        context$1$0.t0 = context$1$0['catch'](1);
        return context$1$0.abrupt('return', result);

      case 12:
        if (_lodash2['default'].isFunction(filteringFunc)) {
          context$1$0.next = 14;
          break;
        }

        return context$1$0.abrupt('return', result);

      case 14:
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap(_bluebird2['default'].filter(result, function callee$1$0(x) {
          var _ref6, stdout;

          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap((0, _teen_process.exec)('ps', ['-p', x, '-o', 'command']));

              case 2:
                _ref6 = context$2$0.sent;
                stdout = _ref6.stdout;
                context$2$0.next = 6;
                return _regeneratorRuntime.awrap(filteringFunc(stdout));

              case 6:
                return context$2$0.abrupt('return', context$2$0.sent);

              case 7:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        }));

      case 16:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 9]]);
}

/**
 * @typedef {Object} UploadOptions
 *
 * @property {?string} user - The name of the user for the remote authentication. Only works if `remotePath` is provided.
 * @property {?string} pass - The password for the remote authentication. Only works if `remotePath` is provided.
 * @property {?string} method - The http multipart upload method name. The 'PUT' one is used by default.
 *                              Only works if `remotePath` is provided.
 */

/**
 * Encodes the given local file to base64 and returns the resulting string
 * or uploads it to a remote server using http/https or ftp protocols
 * if `remotePath` is set
 *
 * @param {string} localFile - The path to an existing local file
 * @param {?string} remotePath - The path to the remote location, where
 *                               this file should be uploaded
 * @param {?UploadOptions} uploadOptions - Set of upload options
 * @returns {string} Either an empty string if the upload was successful or
 * base64-encoded file representation if `remotePath` is falsy
 */
function encodeBase64OrUpload(localFile) {
  var remotePath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
  var uploadOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var _ref7, size, maxMemoryLimit, content, remoteUrl, options, user, pass, method;

  return _regeneratorRuntime.async(function encodeBase64OrUpload$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(localFile));

      case 2:
        if (context$1$0.sent) {
          context$1$0.next = 4;
          break;
        }

        _logger2['default'].errorAndThrow('The file at \'' + localFile + '\' does not exist or is not accessible');

      case 4:
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.stat(localFile));

      case 6:
        _ref7 = context$1$0.sent;
        size = _ref7.size;

        _logger2['default'].debug('The size of the file is ' + _appiumSupport.util.toReadableSizeString(size));

        if (!_lodash2['default'].isEmpty(remotePath)) {
          context$1$0.next = 16;
          break;
        }

        maxMemoryLimit = _v82['default'].getHeapStatistics().total_available_size / 2;

        if (size >= maxMemoryLimit) {
          _logger2['default'].info('The file might be too large to fit into the process memory ' + ('(' + _appiumSupport.util.toReadableSizeString(size) + ' >= ' + _appiumSupport.util.toReadableSizeString(maxMemoryLimit) + '). ') + 'Provide a link to a remote writable location for video upload ' + '(http(s) and ftp protocols are supported) if you experience Out Of Memory errors');
        }
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.readFile(localFile));

      case 14:
        content = context$1$0.sent;
        return context$1$0.abrupt('return', content.toString('base64'));

      case 16:
        remoteUrl = _url2['default'].parse(remotePath);
        options = {};
        user = uploadOptions.user;
        pass = uploadOptions.pass;
        method = uploadOptions.method;

        if (remoteUrl.protocol.startsWith('http')) {
          options = {
            url: remoteUrl.href,
            method: method || 'PUT',
            multipart: [{ body: _fs3['default'].createReadStream(localFile) }]
          };
          if (user && pass) {
            options.auth = { user: user, pass: pass };
          }
        } else if (remoteUrl.protocol === 'ftp:') {
          options = {
            host: remoteUrl.hostname,
            port: remoteUrl.port || 21
          };
          if (user && pass) {
            options.user = user;
            options.pass = pass;
          }
        }
        context$1$0.next = 24;
        return _regeneratorRuntime.awrap(_appiumSupport.net.uploadFile(localFile, remotePath, options));

      case 24:
        return context$1$0.abrupt('return', '');

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

/**
 * Stops and removes all web socket handlers that are listening
 * in scope of the currect session.
 *
 * @param {Object} server - The instance of NodeJs HTTP server,
 * which hosts Appium
 * @param {string} sessionId - The id of the current session
 */
function removeAllSessionWebSocketHandlers(server, sessionId) {
  var activeHandlers, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, pathname;

  return _regeneratorRuntime.async(function removeAllSessionWebSocketHandlers$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!(!server || !_lodash2['default'].isFunction(server.getWebSocketHandlers))) {
          context$1$0.next = 2;
          break;
        }

        return context$1$0.abrupt('return');

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(server.getWebSocketHandlers(sessionId));

      case 4:
        activeHandlers = context$1$0.sent;
        _iteratorNormalCompletion3 = true;
        _didIteratorError3 = false;
        _iteratorError3 = undefined;
        context$1$0.prev = 8;
        _iterator3 = _getIterator(_lodash2['default'].keys(activeHandlers));

      case 10:
        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
          context$1$0.next = 17;
          break;
        }

        pathname = _step3.value;
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(server.removeWebSocketHandler(pathname));

      case 14:
        _iteratorNormalCompletion3 = true;
        context$1$0.next = 10;
        break;

      case 17:
        context$1$0.next = 23;
        break;

      case 19:
        context$1$0.prev = 19;
        context$1$0.t0 = context$1$0['catch'](8);
        _didIteratorError3 = true;
        _iteratorError3 = context$1$0.t0;

      case 23:
        context$1$0.prev = 23;
        context$1$0.prev = 24;

        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
          _iterator3['return']();
        }

      case 26:
        context$1$0.prev = 26;

        if (!_didIteratorError3) {
          context$1$0.next = 29;
          break;
        }

        throw _iteratorError3;

      case 29:
        return context$1$0.finish(26);

      case 30:
        return context$1$0.finish(23);

      case 31:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[8, 19, 23, 31], [24,, 26, 30]]);
}

/**
 * Verify whether the given application is compatible to the
 * platform where it is going to be installed and tested.
 *
 * @param {string} app - The actual path to the application bundle
 * @param {boolean} isSimulator - Should be set to `true` if the test will be executed on Simulator
 * @returns {?boolean} The function returns `null` if the application does not exist or there is no
 * `CFBundleSupportedPlatforms` key in its Info.plist manifest.
 * `true` is returned if the bundle architecture matches the device architecture.
 * @throws {Error} If bundle architecture does not match the device architecture.
 */
function verifyApplicationPlatform(app, isSimulator) {
  var infoPlist, _ref8, CFBundleSupportedPlatforms, isAppSupported;

  return _regeneratorRuntime.async(function verifyApplicationPlatform$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Verifying application platform');

        infoPlist = _path2['default'].resolve(app, 'Info.plist');
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(infoPlist));

      case 4:
        if (context$1$0.sent) {
          context$1$0.next = 7;
          break;
        }

        _logger2['default'].debug('\'' + infoPlist + '\' does not exist');
        return context$1$0.abrupt('return', null);

      case 7:
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(_appiumSupport.plist.parsePlistFile(infoPlist));

      case 9:
        _ref8 = context$1$0.sent;
        CFBundleSupportedPlatforms = _ref8.CFBundleSupportedPlatforms;

        _logger2['default'].debug('CFBundleSupportedPlatforms: ' + JSON.stringify(CFBundleSupportedPlatforms));

        if (_lodash2['default'].isArray(CFBundleSupportedPlatforms)) {
          context$1$0.next = 15;
          break;
        }

        _logger2['default'].debug('CFBundleSupportedPlatforms key does not exist in \'' + infoPlist + '\'');
        return context$1$0.abrupt('return', null);

      case 15:
        isAppSupported = isSimulator && CFBundleSupportedPlatforms.includes('iPhoneSimulator') || !isSimulator && CFBundleSupportedPlatforms.includes('iPhoneOS');

        if (!isAppSupported) {
          context$1$0.next = 18;
          break;
        }

        return context$1$0.abrupt('return', true);

      case 18:
        throw new Error((isSimulator ? 'Simulator' : 'Real device') + ' architecture is unsupported by the \'' + app + '\' application. ' + 'Make sure the correct deployment target has been selected for its compilation in Xcode.');

      case 19:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

exports.detectUdid = detectUdid;
exports.getAndCheckXcodeVersion = getAndCheckXcodeVersion;
exports.getAndCheckIosSdkVersion = getAndCheckIosSdkVersion;
exports.adjustWDAAttachmentsPermissions = adjustWDAAttachmentsPermissions;
exports.checkAppPresent = checkAppPresent;
exports.getDriverInfo = getDriverInfo;
exports.clearSystemFiles = clearSystemFiles;
exports.translateDeviceName = translateDeviceName;
exports.normalizeCommandTimeouts = normalizeCommandTimeouts;
exports.DEFAULT_TIMEOUT_KEY = DEFAULT_TIMEOUT_KEY;
exports.resetXCTestProcesses = resetXCTestProcesses;
exports.getPidUsingPattern = getPidUsingPattern;
exports.markSystemFilesForCleanup = markSystemFilesForCleanup;
exports.printUser = printUser;
exports.printLibimobiledeviceInfo = printLibimobiledeviceInfo;
exports.getPIDsListeningOnPort = getPIDsListeningOnPort;
exports.encodeBase64OrUpload = encodeBase64OrUpload;
exports.removeAllSessionWebSocketHandlers = removeAllSessionWebSocketHandlers;
exports.verifyApplicationPlatform = verifyApplicationPlatform;

// only want to clear the system files for the particular WDA xcode run

// get the package.json and the version from it
//# sourceMappingURL=data:application/json;charset=utf8;base64,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LGtCQUFrQjtRQUM3RCx5QkFBeUIsR0FBekIseUJBQXlCO1FBQUUsU0FBUyxHQUFULFNBQVM7UUFBRSx5QkFBeUIsR0FBekIseUJBQXlCO1FBQy9ELHNCQUFzQixHQUF0QixzQkFBc0I7UUFBRSxvQkFBb0IsR0FBcEIsb0JBQW9CO1FBQUUsaUNBQWlDLEdBQWpDLGlDQUFpQztRQUMvRSx5QkFBeUIsR0FBekIseUJBQXlCIiwiZmlsZSI6ImxpYi91dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGZzLCB1dGlsLCBuZXQsIHBsaXN0IH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyB1dGlscyBhcyBpb3NVdGlscyB9IGZyb20gJ2FwcGl1bS1pb3MtZHJpdmVyJztcbmltcG9ydCB7IFN1YlByb2Nlc3MsIGV4ZWMgfSBmcm9tICd0ZWVuX3Byb2Nlc3MnO1xuaW1wb3J0IHhjb2RlIGZyb20gJ2FwcGl1bS14Y29kZSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGxvZyBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgX2ZzIGZyb20gJ2ZzJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB2OCBmcm9tICd2OCc7XG5cbmNvbnN0IERFRkFVTFRfVElNRU9VVF9LRVkgPSAnZGVmYXVsdCc7XG5cblxuYXN5bmMgZnVuY3Rpb24gZGV0ZWN0VWRpZCAoKSB7XG4gIGxvZy5kZWJ1ZygnQXV0by1kZXRlY3RpbmcgcmVhbCBkZXZpY2UgdWRpZC4uLicpO1xuICBsZXQgIGNtZCwgYXJncyA9IFtdO1xuICB0cnkge1xuICAgIGNtZCA9IGF3YWl0IGZzLndoaWNoKCdpZGV2aWNlX2lkJyk7XG4gICAgYXJncy5wdXNoKCctbCcpO1xuICAgIGxvZy5kZWJ1ZygnVXNpbmcgaWRldmljZV9pZCcpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZGVidWcoJ1VzaW5nIHVkaWRldGVjdCcpO1xuICAgIGNtZCA9IHJlcXVpcmUucmVzb2x2ZSgndWRpZGV0ZWN0Jyk7XG4gIH1cbiAgbGV0IHVkaWQ7XG4gIHRyeSB7XG4gICAgbGV0IHtzdGRvdXR9ID0gYXdhaXQgZXhlYyhjbWQsIGFyZ3MsIHt0aW1lb3V0OiAzMDAwfSk7XG4gICAgbGV0IHVkaWRzID0gXy51bmlxKF8uZmlsdGVyKHN0ZG91dC5zcGxpdCgnXFxuJyksIEJvb2xlYW4pKTtcbiAgICB1ZGlkID0gXy5sYXN0KHVkaWRzKTtcbiAgICBpZiAodWRpZHMubGVuZ3RoID4gMSkge1xuICAgICAgbG9nLndhcm4oYE11bHRpcGxlIGRldmljZXMgZm91bmQ6ICR7dWRpZHMuam9pbignLCAnKX1gKTtcbiAgICAgIGxvZy53YXJuKGBDaG9vc2luZyAnJHt1ZGlkfScuIElmIHRoaXMgaXMgd3JvbmcsIG1hbnVhbGx5IHNldCB3aXRoICd1ZGlkJyBkZXNpcmVkIGNhcGFiaWxpdHlgKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBFcnJvciBkZXRlY3RpbmcgdWRpZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgfVxuICBpZiAoIXVkaWQgfHwgdWRpZC5sZW5ndGggPD0gMikge1xuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVjdCB1ZGlkLicpO1xuICB9XG4gIGxvZy5kZWJ1ZyhgRGV0ZWN0ZWQgcmVhbCBkZXZpY2UgdWRpZDogJyR7dWRpZH0nYCk7XG4gIHJldHVybiB1ZGlkO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRBbmRDaGVja1hjb2RlVmVyc2lvbiAoKSB7XG4gIGxldCB2ZXJzaW9uO1xuICB0cnkge1xuICAgIHZlcnNpb24gPSBhd2FpdCB4Y29kZS5nZXRWZXJzaW9uKHRydWUpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZGVidWcoZXJyKTtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQ291bGQgbm90IGRldGVybWluZSBYY29kZSB2ZXJzaW9uOiAke2Vyci5tZXNzYWdlfWApO1xuICB9XG5cbiAgaWYgKCF2ZXJzaW9uLnRvb2xzVmVyc2lvbikge1xuICAgIHRyeSB7XG4gICAgICB2ZXJzaW9uLnRvb2xzVmVyc2lvbiA9IGF3YWl0IHhjb2RlLmdldENvbW1hbmRMaW5lVG9vbHNWZXJzaW9uKCk7XG4gICAgfSBjYXRjaCAoaWduKSB7fVxuICB9XG5cbiAgLy8gd2UgZG8gbm90IHN1cHBvcnQgWGNvZGVzIDwgNy4zLFxuICBpZiAodmVyc2lvbi52ZXJzaW9uRmxvYXQgPCA3LjMpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgWGNvZGUgdmVyc2lvbiAnJHt2ZXJzaW9uLnZlcnNpb25TdHJpbmd9Jy4gU3VwcG9ydCBmb3IgYCArXG4gICAgICAgICAgICAgICAgICAgICAgYFhjb2RlICR7dmVyc2lvbi52ZXJzaW9uU3RyaW5nfSBpcyBub3Qgc3VwcG9ydGVkLiBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgUGxlYXNlIHVwZ3JhZGUgdG8gdmVyc2lvbiA3LjMgb3IgaGlnaGVyYCk7XG4gIH1cbiAgcmV0dXJuIHZlcnNpb247XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFuZENoZWNrSW9zU2RrVmVyc2lvbiAoKSB7XG4gIGxldCB2ZXJzaW9uTnVtYmVyO1xuICB0cnkge1xuICAgIHZlcnNpb25OdW1iZXIgPSBhd2FpdCB4Y29kZS5nZXRNYXhJT1NTREsoKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYENvdWxkIG5vdCBkZXRlcm1pbmUgaU9TIFNESyB2ZXJzaW9uOiAke2Vyci5tZXNzYWdlfWApO1xuICB9XG4gIHJldHVybiB2ZXJzaW9uTnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0cmFuc2xhdGVEZXZpY2VOYW1lICh4Y29kZVZlcnNpb24sIHBsYXRmb3JtVmVyc2lvbiwgZGV2TmFtZSA9ICcnKSB7XG4gIGxldCBkZXZpY2VOYW1lID0gZGV2TmFtZTtcbiAgc3dpdGNoIChkZXZOYW1lLnRvTG93ZXJDYXNlKCkudHJpbSgpKSB7XG4gICAgY2FzZSAnaXBob25lIHNpbXVsYXRvcic6XG4gICAgICBkZXZpY2VOYW1lID0gJ2lQaG9uZSA2JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2lwYWQgc2ltdWxhdG9yJzpcbiAgICAgIC8vIG5vIG5lZWQgdG8gd29ycnkgYWJvdXQgZmxvYXRpbmcgcG9pbnQgY29tcGFyaXNvbiBiZWNhdXNlIG9mIHRoZVxuICAgICAgLy8gICBuYXR1cmUgb2YgdGhlIG51bWJlcnMgYmVpbmcgY29tcGFyZWRcbiAgICAgIC8vIGlQYWQgUmV0aW5hIGlzIG5vIGxvbmdlciBhdmFpbGFibGUgZm9yIGlvcyAxMC4zXG4gICAgICAvLyAgIHNvIHdlIHBpY2sgYW5vdGhlciBpUGFkIHRvIHVzZSBhcyBkZWZhdWx0XG4gICAgICBkZXZpY2VOYW1lID0gKHBhcnNlRmxvYXQocGxhdGZvcm1WZXJzaW9uKSA8IDEwLjMpID8gJ2lQYWQgUmV0aW5hJyA6ICdpUGFkIEFpcic7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpcGhvbmUgOCc6XG4gICAgY2FzZSAnaXBob25lIDggcGx1cyc6XG4gICAgY2FzZSAnaXBob25lIHgnOlxuICAgICAgLy8gWGNvZGUgOS4wKC4wKSBtaXMtbmFtZWQgdGhlIG5ldyBkZXZpY2VzXG4gICAgICBpZiAoeGNvZGVWZXJzaW9uLm1ham9yID09PSA5ICYmXG4gICAgICAgICAgeGNvZGVWZXJzaW9uLm1pbm9yID09PSAwICYmXG4gICAgICAgICAgKCF1dGlsLmhhc1ZhbHVlKHhjb2RlVmVyc2lvbi5wYXRjaCkgfHwgeGNvZGVWZXJzaW9uLnBhdGNoID09PSAwKSkge1xuICAgICAgICBjb25zdCBuYW1lc01hcHBpbmcgPSB7XG4gICAgICAgICAgJ2lwaG9uZSA4JzogJ2lQaG9uZTIwMTctQScsXG4gICAgICAgICAgJ2lwaG9uZSA4IHBsdXMnOiAnaVBob25lMjAxNy1CJyxcbiAgICAgICAgICAnaXBob25lIHgnOiAnaVBob25lMjAxNy1DJ1xuICAgICAgICB9O1xuICAgICAgICBkZXZpY2VOYW1lID0gbmFtZXNNYXBwaW5nW2Rldk5hbWUudG9Mb3dlckNhc2UoKS50cmltKCldO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cblxuICBpZiAoZGV2aWNlTmFtZSAhPT0gZGV2TmFtZSkge1xuICAgIGxvZy5kZWJ1ZyhgQ2hhbmdpbmcgZGV2aWNlTmFtZSBmcm9tICcke2Rldk5hbWV9JyB0byAnJHtkZXZpY2VOYW1lfSdgKTtcbiAgfVxuICByZXR1cm4gZGV2aWNlTmFtZTtcbn1cblxuLy8gVGhpcyBtYXAgY29udGFpbnMgZGVyaXZlZCBkYXRhIGF0dGFjaG1lbnQgZm9sZGVycyBhcyBrZXlzXG4vLyBhbmQgdmFsdWVzIGFyZSBzdGFja3Mgb2YgcGVybXNzaW9uIG1hc2tzXG4vLyBJdCBpcyB1c2VkIHRvIHN5bmNocm9uaXplIHBlcm1pc3Npb25zIGNoYW5nZVxuLy8gb24gc2hhcmVkIGZvbGRlcnNcbmNvbnN0IGRlcml2ZWREYXRhUGVybWlzc2lvbnNTdGFja3MgPSBuZXcgTWFwKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIGFkanVzdFdEQUF0dGFjaG1lbnRzUGVybWlzc2lvbnMgKHdkYSwgcGVybXMpIHtcbiAgaWYgKCF3ZGEgfHwgIWF3YWl0IHdkYS5yZXRyaWV2ZURlcml2ZWREYXRhUGF0aCgpKSB7XG4gICAgbG9nLndhcm4oJ05vIFdlYkRyaXZlckFnZW50IGRlcml2ZWQgZGF0YSBhdmFpbGFibGUsIHNvIHVuYWJsZSB0byBzZXQgcGVybWlzc2lvbnMgb24gV0RBIGF0dGFjaG1lbnRzIGZvbGRlcicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGF0dGFjaG1lbnRzRm9sZGVyID0gcGF0aC5qb2luKGF3YWl0IHdkYS5yZXRyaWV2ZURlcml2ZWREYXRhUGF0aCgpLCAnTG9ncy9UZXN0L0F0dGFjaG1lbnRzJyk7XG4gIGNvbnN0IHBlcm1zU3RhY2sgPSBkZXJpdmVkRGF0YVBlcm1pc3Npb25zU3RhY2tzLmdldChhdHRhY2htZW50c0ZvbGRlcikgfHwgW107XG4gIGlmIChwZXJtc1N0YWNrLmxlbmd0aCkge1xuICAgIGlmIChfLmxhc3QocGVybXNTdGFjaykgPT09IHBlcm1zKSB7XG4gICAgICBwZXJtc1N0YWNrLnB1c2gocGVybXMpO1xuICAgICAgbG9nLmluZm8oYE5vdCBjaGFuZ2luZyBwZXJtaXNzaW9ucyBvZiAnJHthdHRhY2htZW50c0ZvbGRlcn0nIHRvICcke3Blcm1zfScsIGJlY2F1c2UgdGhleSB3ZXJlIGFscmVhZHkgc2V0IGJ5IHRoZSBvdGhlciBzZXNzaW9uYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChwZXJtc1N0YWNrLmxlbmd0aCA+IDEpIHtcbiAgICAgIHBlcm1zU3RhY2sucG9wKCk7XG4gICAgICBsb2cuaW5mbyhgTm90IGNoYW5naW5nIHBlcm1pc3Npb25zIG9mICcke2F0dGFjaG1lbnRzRm9sZGVyfScgdG8gJyR7cGVybXN9JywgYmVjYXVzZSB0aGUgb3RoZXIgc2Vzc2lvbiBkb2VzIG5vdCBleHBlY3QgdGhlbSB0byBiZSBjaGFuZ2VkYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGRlcml2ZWREYXRhUGVybWlzc2lvbnNTdGFja3Muc2V0KGF0dGFjaG1lbnRzRm9sZGVyLCBbcGVybXNdKTtcblxuICBpZiAoYXdhaXQgZnMuZXhpc3RzKGF0dGFjaG1lbnRzRm9sZGVyKSkge1xuICAgIGxvZy5pbmZvKGBTZXR0aW5nICcke3Blcm1zfScgcGVybWlzc2lvbnMgdG8gJyR7YXR0YWNobWVudHNGb2xkZXJ9JyBmb2xkZXJgKTtcbiAgICBhd2FpdCBmcy5jaG1vZChhdHRhY2htZW50c0ZvbGRlciwgcGVybXMpO1xuICAgIHJldHVybjtcbiAgfVxuICBsb2cuaW5mbyhgVGhlcmUgaXMgbm8gJHthdHRhY2htZW50c0ZvbGRlcn0gZm9sZGVyLCBzbyBub3QgY2hhbmdpbmcgcGVybWlzc2lvbnNgKTtcbn1cblxuLy8gVGhpcyBtYXAgY29udGFpbnMgZGVyaXZlZCBkYXRhIGxvZ3MgZm9sZGVycyBhcyBrZXlzXG4vLyBhbmQgdmFsdWVzIGFyZSB0aGUgY291bnQgb2YgdGltZXMgdGhlIHBhcnRpY3VsYXJcbi8vIGZvbGRlciBoYXMgYmVlbiBzY2hlZHVsZWQgZm9yIHJlbW92YWxcbmNvbnN0IGRlcml2ZWREYXRhQ2xlYW51cE1hcmtlcnMgPSBuZXcgTWFwKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIG1hcmtTeXN0ZW1GaWxlc0ZvckNsZWFudXAgKHdkYSkge1xuICBpZiAoIXdkYSB8fCAhYXdhaXQgd2RhLnJldHJpZXZlRGVyaXZlZERhdGFQYXRoKCkpIHtcbiAgICBsb2cud2FybignTm8gV2ViRHJpdmVyQWdlbnQgZGVyaXZlZCBkYXRhIGF2YWlsYWJsZSwgc28gdW5hYmxlIHRvIG1hcmsgc3lzdGVtIGZpbGVzIGZvciBjbGVhbnVwJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgbG9nc1Jvb3QgPSBwYXRoLnJlc29sdmUoYXdhaXQgd2RhLnJldHJpZXZlRGVyaXZlZERhdGFQYXRoKCksICdMb2dzJyk7XG4gIGxldCBtYXJrZXJzQ291bnQgPSAwO1xuICBpZiAoZGVyaXZlZERhdGFDbGVhbnVwTWFya2Vycy5oYXMobG9nc1Jvb3QpKSB7XG4gICAgbWFya2Vyc0NvdW50ID0gZGVyaXZlZERhdGFDbGVhbnVwTWFya2Vycy5nZXQobG9nc1Jvb3QpO1xuICB9XG4gIGRlcml2ZWREYXRhQ2xlYW51cE1hcmtlcnMuc2V0KGxvZ3NSb290LCArK21hcmtlcnNDb3VudCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNsZWFyU3lzdGVtRmlsZXMgKHdkYSkge1xuICAvLyBvbmx5IHdhbnQgdG8gY2xlYXIgdGhlIHN5c3RlbSBmaWxlcyBmb3IgdGhlIHBhcnRpY3VsYXIgV0RBIHhjb2RlIHJ1blxuICBpZiAoIXdkYSB8fCAhYXdhaXQgd2RhLnJldHJpZXZlRGVyaXZlZERhdGFQYXRoKCkpIHtcbiAgICBsb2cud2FybignTm8gV2ViRHJpdmVyQWdlbnQgZGVyaXZlZCBkYXRhIGF2YWlsYWJsZSwgc28gdW5hYmxlIHRvIGNsZWFyIHN5c3RlbSBmaWxlcycpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGxvZ3NSb290ID0gcGF0aC5yZXNvbHZlKGF3YWl0IHdkYS5yZXRyaWV2ZURlcml2ZWREYXRhUGF0aCgpLCAnTG9ncycpO1xuICBpZiAoZGVyaXZlZERhdGFDbGVhbnVwTWFya2Vycy5oYXMobG9nc1Jvb3QpKSB7XG4gICAgbGV0IG1hcmtlcnNDb3VudCA9IGRlcml2ZWREYXRhQ2xlYW51cE1hcmtlcnMuZ2V0KGxvZ3NSb290KTtcbiAgICBkZXJpdmVkRGF0YUNsZWFudXBNYXJrZXJzLnNldChsb2dzUm9vdCwgLS1tYXJrZXJzQ291bnQpO1xuICAgIGlmIChtYXJrZXJzQ291bnQgPiAwKSB7XG4gICAgICBsb2cuaW5mbyhgTm90IGNsZWFuaW5nICcke2xvZ3NSb290fScgZm9sZGVyLCBiZWNhdXNlIHRoZSBvdGhlciBzZXNzaW9uIGRvZXMgbm90IGV4cGVjdCBpdCB0byBiZSBjbGVhbmVkYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGRlcml2ZWREYXRhQ2xlYW51cE1hcmtlcnMuc2V0KGxvZ3NSb290LCAwKTtcblxuICAvLyBDbGVhbmluZyB1cCBiaWcgdGVtcG9yYXJ5IGZpbGVzIGNyZWF0ZWQgYnkgWENUZXN0OiBodHRwczovL2dpdGh1Yi5jb20vYXBwaXVtL2FwcGl1bS9pc3N1ZXMvOTQxMFxuICBjb25zdCBjbGVhbnVwQ21kID0gYGZpbmQgLUUgL3ByaXZhdGUvdmFyL2ZvbGRlcnMgYCArXG4gICAgYC1yZWdleCAnLiovU2Vzc2lvbi1XZWJEcml2ZXJBZ2VudFJ1bm5lci4qXFxcXC5sb2ckfC4qL1N0YW5kYXJkT3V0cHV0QW5kU3RhbmRhcmRFcnJvclxcXFwudHh0JCcgYCArXG4gICAgYC10eXBlIGYgLWV4ZWMgc2ggLWMgJ2VjaG8gXCJcIiA+IFwie31cIicgXFxcXDtgO1xuICBjb25zdCBjbGVhbnVwVGFzayA9IG5ldyBTdWJQcm9jZXNzKCdiYXNoJywgWyctYycsIGNsZWFudXBDbWRdLCB7XG4gICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgc3RkaW86IFsnaWdub3JlJywgJ3BpcGUnLCAncGlwZSddLFxuICB9KTtcbiAgYXdhaXQgY2xlYW51cFRhc2suc3RhcnQoMCk7XG4gIC8vIERvIG5vdCB3YWl0IGZvciB0aGUgdGFzayB0byBiZSBjb21wbGV0ZWQsIHNpbmNlIGl0IG1pZ2h0IHRha2UgYSBsb3Qgb2YgdGltZVxuICAvLyBXZSBrZWVwIGl0IHJ1bm5pbmcgYWZ0ZXIgQXBwaXVtIHByb2Nlc3MgaXMga2lsbGVkXG4gIGNsZWFudXBUYXNrLnByb2MudW5yZWYoKTtcbiAgbG9nLmRlYnVnKGBTdGFydGVkIGJhY2tncm91bmQgWENUZXN0IGxvZ3MgY2xlYW51cDogJHtjbGVhbnVwQ21kfWApO1xuXG4gIGlmIChhd2FpdCBmcy5leGlzdHMobG9nc1Jvb3QpKSB7XG4gICAgbG9nLmluZm8oYENsZWFuaW5nIHRlc3QgbG9ncyBpbiAnJHtsb2dzUm9vdH0nIGZvbGRlcmApO1xuICAgIGF3YWl0IGlvc1V0aWxzLmNsZWFyTG9ncyhbbG9nc1Jvb3RdKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbG9nLmluZm8oYFRoZXJlIGlzIG5vICR7bG9nc1Jvb3R9IGZvbGRlciwgc28gbm90IGNsZWFuaW5nIGZpbGVzYCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrQXBwUHJlc2VudCAoYXBwKSB7XG4gIGxvZy5kZWJ1ZyhgQ2hlY2tpbmcgd2hldGhlciBhcHAgJyR7YXBwfScgaXMgYWN0dWFsbHkgcHJlc2VudCBvbiBmaWxlIHN5c3RlbWApO1xuICBpZiAoIShhd2FpdCBmcy5leGlzdHMoYXBwKSkpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQ291bGQgbm90IGZpbmQgYXBwIGF0ICcke2FwcH0nYCk7XG4gIH1cbiAgbG9nLmRlYnVnKCdBcHAgaXMgcHJlc2VudCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXREcml2ZXJJbmZvICgpIHtcbiAgbGV0IHN0YXQgPSBhd2FpdCBmcy5zdGF0KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicpKTtcbiAgbGV0IGJ1aWx0ID0gc3RhdC5tdGltZS5nZXRUaW1lKCk7XG5cbiAgLy8gZ2V0IHRoZSBwYWNrYWdlLmpzb24gYW5kIHRoZSB2ZXJzaW9uIGZyb20gaXRcbiAgbGV0IHBrZyA9IHJlcXVpcmUoX19maWxlbmFtZS5pbmRleE9mKCdidWlsZC9saWIvdXRpbHMnKSAhPT0gLTEgPyAnLi4vLi4vcGFja2FnZS5qc29uJyA6ICcuLi9wYWNrYWdlLmpzb24nKTtcbiAgbGV0IHZlcnNpb24gPSBwa2cudmVyc2lvbjtcblxuICBsZXQgaW5mbyA9IHtcbiAgICBidWlsdCxcbiAgICB2ZXJzaW9uLFxuICB9O1xuICByZXR1cm4gaW5mbztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQ29tbWFuZFRpbWVvdXRzICh2YWx1ZSkge1xuICAvLyBUaGUgdmFsdWUgaXMgbm9ybWFsaXplZCBhbHJlYWR5XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgbGV0IHJlc3VsdCA9IHt9O1xuICAvLyBVc2UgYXMgZGVmYXVsdCB0aW1lb3V0IGZvciBhbGwgY29tbWFuZHMgaWYgYSBzaW5nbGUgaW50ZWdlciB2YWx1ZSBpcyBwcm92aWRlZFxuICBpZiAoIWlzTmFOKHZhbHVlKSkge1xuICAgIHJlc3VsdFtERUZBVUxUX1RJTUVPVVRfS0VZXSA9IF8udG9JbnRlZ2VyKHZhbHVlKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gSlNPTiBvYmplY3QgaGFzIGJlZW4gcHJvdmlkZWQuIExldCdzIHBhcnNlIGl0XG4gIHRyeSB7XG4gICAgcmVzdWx0ID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgaWYgKCFfLmlzUGxhaW5PYmplY3QocmVzdWx0KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgXCJjb21tYW5kVGltZW91dHNcIiBjYXBhYmlsaXR5IHNob3VsZCBiZSBhIHZhbGlkIEpTT04gb2JqZWN0LiBcIiR7dmFsdWV9XCIgd2FzIGdpdmVuIGluc3RlYWRgKTtcbiAgfVxuICBmb3IgKGxldCBbY21kLCB0aW1lb3V0XSBvZiBfLnRvUGFpcnMocmVzdWx0KSkge1xuICAgIGlmICghXy5pc0ludGVnZXIodGltZW91dCkgfHwgdGltZW91dCA8PSAwKSB7XG4gICAgICBsb2cuZXJyb3JBbmRUaHJvdyhgVGhlIHRpbWVvdXQgZm9yIFwiJHtjbWR9XCIgc2hvdWxkIGJlIGEgdmFsaWQgbmF0dXJhbCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLiBcIiR7dGltZW91dH1cIiB3YXMgZ2l2ZW4gaW5zdGVhZGApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgcHJvY2VzcyBpZCBvZiB0aGUgbW9zdCByZWNlbnQgcnVubmluZyBhcHBsaWNhdGlvblxuICogaGF2aW5nIHRoZSBwYXJ0aWN1bGFyIGNvbW1hbmQgbGluZSBwYXR0ZXJuLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwZ3JlcFBhdHRlcm4gLSBwZ3JlcC1jb21wYXRpYmxlIHNlYXJjaCBwYXR0ZXJuLlxuICogQHJldHVybiB7c3RyaW5nfSBFaXRoZXIgYSBwcm9jZXNzIGlkIG9yIG51bGwgaWYgbm8gbWF0Y2hlcyB3ZXJlIGZvdW5kLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRQaWRVc2luZ1BhdHRlcm4gKHBncmVwUGF0dGVybikge1xuICBjb25zdCBhcmdzID0gWyctbmlmJywgcGdyZXBQYXR0ZXJuXTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IGV4ZWMoJ3BncmVwJywgYXJncyk7XG4gICAgY29uc3QgcGlkID0gcGFyc2VJbnQoc3Rkb3V0LCAxMCk7XG4gICAgaWYgKGlzTmFOKHBpZCkpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgQ2Fubm90IHBhcnNlIHByb2Nlc3MgaWQgZnJvbSAncGdyZXAgJHthcmdzLmpvaW4oJyAnKX0nIG91dHB1dDogJHtzdGRvdXR9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGAke3BpZH1gO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZGVidWcoYCdwZ3JlcCAke2FyZ3Muam9pbignICcpfScgZGlkbid0IGRldGVjdCBhbnkgbWF0Y2hpbmcgcHJvY2Vzc2VzLiBSZXR1cm4gY29kZTogJHtlcnIuY29kZX1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEtpbGwgYSBwcm9jZXNzIGhhdmluZyB0aGUgcGFydGljdWxhciBjb21tYW5kIGxpbmUgcGF0dGVybi5cbiAqIFRoaXMgbWV0aG9kIHRyaWVzIHRvIHNlbmQgU0lHSU5ULCBTSUdURVJNIGFuZCBTSUdLSUxMIHRvIHRoZVxuICogbWF0Y2hlZCBwcm9jZXNzZXMgaW4gdGhpcyBvcmRlciBpZiB0aGUgcHJvY2VzcyBpcyBzdGlsbCBydW5uaW5nLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwZ3JlcFBhdHRlcm4gLSBwZ3JlcC1jb21wYXRpYmxlIHNlYXJjaCBwYXR0ZXJuLlxuICovXG5hc3luYyBmdW5jdGlvbiBraWxsQXBwVXNpbmdQYXR0ZXJuIChwZ3JlcFBhdHRlcm4pIHtcbiAgZm9yIChjb25zdCBzaWduYWwgb2YgWzIsIDE1LCA5XSkge1xuICAgIGlmICghYXdhaXQgZ2V0UGlkVXNpbmdQYXR0ZXJuKHBncmVwUGF0dGVybikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYXJncyA9IFtgLSR7c2lnbmFsfWAsICctaWYnLCBwZ3JlcFBhdHRlcm5dO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBleGVjKCdwa2lsbCcsIGFyZ3MpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLmRlYnVnKGBwa2lsbCAke2FyZ3Muam9pbignICcpfSAtPiAke2Vyci5tZXNzYWdlfWApO1xuICAgIH1cbiAgICBhd2FpdCBCLmRlbGF5KDEwMCk7XG4gIH1cbn1cblxuLyoqXG4gKiBLaWxscyBydW5uaW5nIFhDVGVzdCBwcm9jZXNzZXMgZm9yIHRoZSBwYXJ0aWN1bGFyIGRldmljZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdWRpZCAtIFRoZSBkZXZpY2UgVURJRC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNTaW11bGF0b3IgLSBFcXVhbHMgdG8gdHJ1ZSBpZiB0aGUgY3VycmVudCBkZXZpY2UgaXMgYSBTaW11bGF0b3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzIC0gQWRkaXRpb25hbCBvcHRpb25zIG1hcHBpbmcuIFBvc3NpYmxlIGtleXMgYXJlOlxuICogICAtIHtzdHJpbmd8bnVtYmVyfSB3ZGFMb2NhbFBvcnQ6IFRoZSBudW1iZXIgb2YgbG9jYWwgcG9ydCBXREEgaXMgbGlzdGVuaW5nIG9uLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNldFhDVGVzdFByb2Nlc3NlcyAodWRpZCwgaXNTaW11bGF0b3IsIG9wdHMgPSB7fSkge1xuICBjb25zdCBwcm9jZXNzUGF0dGVybnMgPSBbYHhjb2RlYnVpbGQuKiR7dWRpZH1gXTtcbiAgaWYgKG9wdHMud2RhTG9jYWxQb3J0KSB7XG4gICAgcHJvY2Vzc1BhdHRlcm5zLnB1c2goYGlwcm94eSAke29wdHMud2RhTG9jYWxQb3J0fWApO1xuICB9IGVsc2UgaWYgKCFpc1NpbXVsYXRvcikge1xuICAgIHByb2Nlc3NQYXR0ZXJucy5wdXNoKGBpcHJveHkuKiR7dWRpZH1gKTtcbiAgfVxuICBpZiAoaXNTaW11bGF0b3IpIHtcbiAgICBwcm9jZXNzUGF0dGVybnMucHVzaChgJHt1ZGlkfS4qWENUUnVubmVyYCk7XG4gIH1cbiAgbG9nLmRlYnVnKGBLaWxsaW5nIHJ1bm5pbmcgcHJvY2Vzc2VzICcke3Byb2Nlc3NQYXR0ZXJucy5qb2luKCcsICcpfScgZm9yIHRoZSBkZXZpY2UgJHt1ZGlkfS4uLmApO1xuICBmb3IgKGNvbnN0IHBncmVwUGF0dGVybiBvZiBwcm9jZXNzUGF0dGVybnMpIHtcbiAgICBhd2FpdCBraWxsQXBwVXNpbmdQYXR0ZXJuKHBncmVwUGF0dGVybik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJpbnRVc2VyICgpIHtcbiAgdHJ5IHtcbiAgICBsZXQge3N0ZG91dH0gPSBhd2FpdCBleGVjKCd3aG9hbWknKTtcbiAgICBsb2cuZGVidWcoYEN1cnJlbnQgdXNlcjogJyR7c3Rkb3V0LnRyaW0oKX0nYCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy5kZWJ1ZyhgVW5hYmxlIHRvIGdldCB1c2VybmFtZSBydW5uaW5nIHNlcnZlcjogJHtlcnIubWVzc2FnZX1gKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBwcmludExpYmltb2JpbGVkZXZpY2VJbmZvICgpIHtcbiAgdHJ5IHtcbiAgICBsZXQge3N0ZG91dH0gPSBhd2FpdCBleGVjKCdicmV3JywgWydpbmZvJywgJ2xpYmltb2JpbGVkZXZpY2UnXSk7XG4gICAgbGV0IG1hdGNoID0gL2xpYmltb2JpbGVkZXZpY2U6KC4rKS8uZXhlYyhzdGRvdXQpO1xuICAgIGlmIChtYXRjaCAmJiBtYXRjaFsxXSkge1xuICAgICAgbG9nLmRlYnVnKGBDdXJyZW50IHZlcnNpb24gb2YgbGliaW1vYmlsZWRldmljZTogJHttYXRjaFsxXS50cmltKCl9YCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZGVidWcoYFVuYWJsZSB0byBnZXQgdmVyc2lvbiBvZiBsaWJpbW9iaWxlZGV2aWNlOiAke2Vyci5tZXNzYWdlfWApO1xuICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSBJRHMgb2YgcHJvY2Vzc2VzIGxpc3RlbmluZyBvbiB0aGUgcGFydGljdWxhciBzeXN0ZW0gcG9ydC5cbiAqIEl0IGlzIGFsc28gcG9zc2libGUgdG8gYXBwbHkgYWRkaXRpb25hbCBmaWx0ZXJpbmcgYmFzZWQgb24gdGhlXG4gKiBwcm9jZXNzIGNvbW1hbmQgbGluZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IHBvcnQgLSBUaGUgcG9ydCBudW1iZXIuXG4gKiBAcGFyYW0gez9GdW5jdGlvbn0gZmlsdGVyaW5nRnVuYyAtIE9wdGlvbmFsIGxhbWJkYSBmdW5jdGlvbiwgd2hpY2hcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXMgY29tbWFuZCBsaW5lIHN0cmluZyBvZiB0aGUgcGFydGljdWxhciBwcm9jZXNzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmluZyBvbiBnaXZlbiBwb3J0LCBhbmQgaXMgZXhwZWN0ZWQgdG8gcmV0dXJuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVpdGhlciB0cnVlIG9yIGZhbHNlIHRvIGluY2x1ZGUvZXhjbHVkZSB0aGUgY29ycmVzcG9uZGluZyBQSURcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSB0aGUgcmVzdWx0aW5nIGFycmF5LlxuICogQHJldHVybnMge0FycmF5PHN0cmluZz59IC0gdGhlIGxpc3Qgb2YgbWF0Y2hlZCBwcm9jZXNzIGlkcy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0UElEc0xpc3RlbmluZ09uUG9ydCAocG9ydCwgZmlsdGVyaW5nRnVuYyA9IG51bGwpIHtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIHRyeSB7XG4gICAgLy8gVGhpcyBvbmx5IHdvcmtzIHNpbmNlIE1hYyBPUyBYIEVsIENhcGl0YW5cbiAgICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IGV4ZWMoJ2xzb2YnLCBbJy10aScsIGB0Y3A6JHtwb3J0fWBdKTtcbiAgICByZXN1bHQucHVzaCguLi4oc3Rkb3V0LnRyaW0oKS5zcGxpdCgvXFxuKy8pKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKCFfLmlzRnVuY3Rpb24oZmlsdGVyaW5nRnVuYykpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHJldHVybiBhd2FpdCBCLmZpbHRlcihyZXN1bHQsIGFzeW5jICh4KSA9PiB7XG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBleGVjKCdwcycsIFsnLXAnLCB4LCAnLW8nLCAnY29tbWFuZCddKTtcbiAgICByZXR1cm4gYXdhaXQgZmlsdGVyaW5nRnVuYyhzdGRvdXQpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBVcGxvYWRPcHRpb25zXG4gKlxuICogQHByb3BlcnR5IHs/c3RyaW5nfSB1c2VyIC0gVGhlIG5hbWUgb2YgdGhlIHVzZXIgZm9yIHRoZSByZW1vdGUgYXV0aGVudGljYXRpb24uIE9ubHkgd29ya3MgaWYgYHJlbW90ZVBhdGhgIGlzIHByb3ZpZGVkLlxuICogQHByb3BlcnR5IHs/c3RyaW5nfSBwYXNzIC0gVGhlIHBhc3N3b3JkIGZvciB0aGUgcmVtb3RlIGF1dGhlbnRpY2F0aW9uLiBPbmx5IHdvcmtzIGlmIGByZW1vdGVQYXRoYCBpcyBwcm92aWRlZC5cbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gbWV0aG9kIC0gVGhlIGh0dHAgbXVsdGlwYXJ0IHVwbG9hZCBtZXRob2QgbmFtZS4gVGhlICdQVVQnIG9uZSBpcyB1c2VkIGJ5IGRlZmF1bHQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9ubHkgd29ya3MgaWYgYHJlbW90ZVBhdGhgIGlzIHByb3ZpZGVkLlxuICovXG5cblxuLyoqXG4gKiBFbmNvZGVzIHRoZSBnaXZlbiBsb2NhbCBmaWxlIHRvIGJhc2U2NCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0aW5nIHN0cmluZ1xuICogb3IgdXBsb2FkcyBpdCB0byBhIHJlbW90ZSBzZXJ2ZXIgdXNpbmcgaHR0cC9odHRwcyBvciBmdHAgcHJvdG9jb2xzXG4gKiBpZiBgcmVtb3RlUGF0aGAgaXMgc2V0XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsRmlsZSAtIFRoZSBwYXRoIHRvIGFuIGV4aXN0aW5nIGxvY2FsIGZpbGVcbiAqIEBwYXJhbSB7P3N0cmluZ30gcmVtb3RlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSByZW1vdGUgbG9jYXRpb24sIHdoZXJlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGZpbGUgc2hvdWxkIGJlIHVwbG9hZGVkXG4gKiBAcGFyYW0gez9VcGxvYWRPcHRpb25zfSB1cGxvYWRPcHRpb25zIC0gU2V0IG9mIHVwbG9hZCBvcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBFaXRoZXIgYW4gZW1wdHkgc3RyaW5nIGlmIHRoZSB1cGxvYWQgd2FzIHN1Y2Nlc3NmdWwgb3JcbiAqIGJhc2U2NC1lbmNvZGVkIGZpbGUgcmVwcmVzZW50YXRpb24gaWYgYHJlbW90ZVBhdGhgIGlzIGZhbHN5XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGVuY29kZUJhc2U2NE9yVXBsb2FkIChsb2NhbEZpbGUsIHJlbW90ZVBhdGggPSBudWxsLCB1cGxvYWRPcHRpb25zID0ge30pIHtcbiAgaWYgKCFhd2FpdCBmcy5leGlzdHMobG9jYWxGaWxlKSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBUaGUgZmlsZSBhdCAnJHtsb2NhbEZpbGV9JyBkb2VzIG5vdCBleGlzdCBvciBpcyBub3QgYWNjZXNzaWJsZWApO1xuICB9XG5cbiAgY29uc3Qge3NpemV9ID0gYXdhaXQgZnMuc3RhdChsb2NhbEZpbGUpO1xuICBsb2cuZGVidWcoYFRoZSBzaXplIG9mIHRoZSBmaWxlIGlzICR7dXRpbC50b1JlYWRhYmxlU2l6ZVN0cmluZyhzaXplKX1gKTtcbiAgaWYgKF8uaXNFbXB0eShyZW1vdGVQYXRoKSkge1xuICAgIGNvbnN0IG1heE1lbW9yeUxpbWl0ID0gdjguZ2V0SGVhcFN0YXRpc3RpY3MoKS50b3RhbF9hdmFpbGFibGVfc2l6ZSAvIDI7XG4gICAgaWYgKHNpemUgPj0gbWF4TWVtb3J5TGltaXQpIHtcbiAgICAgIGxvZy5pbmZvKGBUaGUgZmlsZSBtaWdodCBiZSB0b28gbGFyZ2UgdG8gZml0IGludG8gdGhlIHByb2Nlc3MgbWVtb3J5IGAgK1xuICAgICAgICBgKCR7dXRpbC50b1JlYWRhYmxlU2l6ZVN0cmluZyhzaXplKX0gPj0gJHt1dGlsLnRvUmVhZGFibGVTaXplU3RyaW5nKG1heE1lbW9yeUxpbWl0KX0pLiBgICtcbiAgICAgICAgYFByb3ZpZGUgYSBsaW5rIHRvIGEgcmVtb3RlIHdyaXRhYmxlIGxvY2F0aW9uIGZvciB2aWRlbyB1cGxvYWQgYCArXG4gICAgICAgIGAoaHR0cChzKSBhbmQgZnRwIHByb3RvY29scyBhcmUgc3VwcG9ydGVkKSBpZiB5b3UgZXhwZXJpZW5jZSBPdXQgT2YgTWVtb3J5IGVycm9yc2ApO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnMucmVhZEZpbGUobG9jYWxGaWxlKTtcbiAgICByZXR1cm4gY29udGVudC50b1N0cmluZygnYmFzZTY0Jyk7XG4gIH1cblxuICBjb25zdCByZW1vdGVVcmwgPSB1cmwucGFyc2UocmVtb3RlUGF0aCk7XG4gIGxldCBvcHRpb25zID0ge307XG4gIGNvbnN0IHt1c2VyLCBwYXNzLCBtZXRob2R9ID0gdXBsb2FkT3B0aW9ucztcbiAgaWYgKHJlbW90ZVVybC5wcm90b2NvbC5zdGFydHNXaXRoKCdodHRwJykpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgdXJsOiByZW1vdGVVcmwuaHJlZixcbiAgICAgIG1ldGhvZDogbWV0aG9kIHx8ICdQVVQnLFxuICAgICAgbXVsdGlwYXJ0OiBbeyBib2R5OiBfZnMuY3JlYXRlUmVhZFN0cmVhbShsb2NhbEZpbGUpIH1dLFxuICAgIH07XG4gICAgaWYgKHVzZXIgJiYgcGFzcykge1xuICAgICAgb3B0aW9ucy5hdXRoID0ge3VzZXIsIHBhc3N9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChyZW1vdGVVcmwucHJvdG9jb2wgPT09ICdmdHA6Jykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICBob3N0OiByZW1vdGVVcmwuaG9zdG5hbWUsXG4gICAgICBwb3J0OiByZW1vdGVVcmwucG9ydCB8fCAyMSxcbiAgICB9O1xuICAgIGlmICh1c2VyICYmIHBhc3MpIHtcbiAgICAgIG9wdGlvbnMudXNlciA9IHVzZXI7XG4gICAgICBvcHRpb25zLnBhc3MgPSBwYXNzO1xuICAgIH1cbiAgfVxuICBhd2FpdCBuZXQudXBsb2FkRmlsZShsb2NhbEZpbGUsIHJlbW90ZVBhdGgsIG9wdGlvbnMpO1xuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogU3RvcHMgYW5kIHJlbW92ZXMgYWxsIHdlYiBzb2NrZXQgaGFuZGxlcnMgdGhhdCBhcmUgbGlzdGVuaW5nXG4gKiBpbiBzY29wZSBvZiB0aGUgY3VycmVjdCBzZXNzaW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXJ2ZXIgLSBUaGUgaW5zdGFuY2Ugb2YgTm9kZUpzIEhUVFAgc2VydmVyLFxuICogd2hpY2ggaG9zdHMgQXBwaXVtXG4gKiBAcGFyYW0ge3N0cmluZ30gc2Vzc2lvbklkIC0gVGhlIGlkIG9mIHRoZSBjdXJyZW50IHNlc3Npb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQWxsU2Vzc2lvbldlYlNvY2tldEhhbmRsZXJzIChzZXJ2ZXIsIHNlc3Npb25JZCkge1xuICBpZiAoIXNlcnZlciB8fCAhXy5pc0Z1bmN0aW9uKHNlcnZlci5nZXRXZWJTb2NrZXRIYW5kbGVycykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBhY3RpdmVIYW5kbGVycyA9IGF3YWl0IHNlcnZlci5nZXRXZWJTb2NrZXRIYW5kbGVycyhzZXNzaW9uSWQpO1xuICBmb3IgKGNvbnN0IHBhdGhuYW1lIG9mIF8ua2V5cyhhY3RpdmVIYW5kbGVycykpIHtcbiAgICBhd2FpdCBzZXJ2ZXIucmVtb3ZlV2ViU29ja2V0SGFuZGxlcihwYXRobmFtZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZnkgd2hldGhlciB0aGUgZ2l2ZW4gYXBwbGljYXRpb24gaXMgY29tcGF0aWJsZSB0byB0aGVcbiAqIHBsYXRmb3JtIHdoZXJlIGl0IGlzIGdvaW5nIHRvIGJlIGluc3RhbGxlZCBhbmQgdGVzdGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhcHAgLSBUaGUgYWN0dWFsIHBhdGggdG8gdGhlIGFwcGxpY2F0aW9uIGJ1bmRsZVxuICogQHBhcmFtIHtib29sZWFufSBpc1NpbXVsYXRvciAtIFNob3VsZCBiZSBzZXQgdG8gYHRydWVgIGlmIHRoZSB0ZXN0IHdpbGwgYmUgZXhlY3V0ZWQgb24gU2ltdWxhdG9yXG4gKiBAcmV0dXJucyB7P2Jvb2xlYW59IFRoZSBmdW5jdGlvbiByZXR1cm5zIGBudWxsYCBpZiB0aGUgYXBwbGljYXRpb24gZG9lcyBub3QgZXhpc3Qgb3IgdGhlcmUgaXMgbm9cbiAqIGBDRkJ1bmRsZVN1cHBvcnRlZFBsYXRmb3Jtc2Aga2V5IGluIGl0cyBJbmZvLnBsaXN0IG1hbmlmZXN0LlxuICogYHRydWVgIGlzIHJldHVybmVkIGlmIHRoZSBidW5kbGUgYXJjaGl0ZWN0dXJlIG1hdGNoZXMgdGhlIGRldmljZSBhcmNoaXRlY3R1cmUuXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgYnVuZGxlIGFyY2hpdGVjdHVyZSBkb2VzIG5vdCBtYXRjaCB0aGUgZGV2aWNlIGFyY2hpdGVjdHVyZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdmVyaWZ5QXBwbGljYXRpb25QbGF0Zm9ybSAoYXBwLCBpc1NpbXVsYXRvcikge1xuICBsb2cuZGVidWcoJ1ZlcmlmeWluZyBhcHBsaWNhdGlvbiBwbGF0Zm9ybScpO1xuXG4gIGNvbnN0IGluZm9QbGlzdCA9IHBhdGgucmVzb2x2ZShhcHAsICdJbmZvLnBsaXN0Jyk7XG4gIGlmICghYXdhaXQgZnMuZXhpc3RzKGluZm9QbGlzdCkpIHtcbiAgICBsb2cuZGVidWcoYCcke2luZm9QbGlzdH0nIGRvZXMgbm90IGV4aXN0YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB7Q0ZCdW5kbGVTdXBwb3J0ZWRQbGF0Zm9ybXN9ID0gYXdhaXQgcGxpc3QucGFyc2VQbGlzdEZpbGUoaW5mb1BsaXN0KTtcbiAgbG9nLmRlYnVnKGBDRkJ1bmRsZVN1cHBvcnRlZFBsYXRmb3JtczogJHtKU09OLnN0cmluZ2lmeShDRkJ1bmRsZVN1cHBvcnRlZFBsYXRmb3Jtcyl9YCk7XG4gIGlmICghXy5pc0FycmF5KENGQnVuZGxlU3VwcG9ydGVkUGxhdGZvcm1zKSkge1xuICAgIGxvZy5kZWJ1ZyhgQ0ZCdW5kbGVTdXBwb3J0ZWRQbGF0Zm9ybXMga2V5IGRvZXMgbm90IGV4aXN0IGluICcke2luZm9QbGlzdH0nYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBpc0FwcFN1cHBvcnRlZCA9IChpc1NpbXVsYXRvciAmJiBDRkJ1bmRsZVN1cHBvcnRlZFBsYXRmb3Jtcy5pbmNsdWRlcygnaVBob25lU2ltdWxhdG9yJykpXG4gICAgfHwgKCFpc1NpbXVsYXRvciAmJiBDRkJ1bmRsZVN1cHBvcnRlZFBsYXRmb3Jtcy5pbmNsdWRlcygnaVBob25lT1MnKSk7XG4gIGlmIChpc0FwcFN1cHBvcnRlZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgJHtpc1NpbXVsYXRvciA/ICdTaW11bGF0b3InIDogJ1JlYWwgZGV2aWNlJ30gYXJjaGl0ZWN0dXJlIGlzIHVuc3VwcG9ydGVkIGJ5IHRoZSAnJHthcHB9JyBhcHBsaWNhdGlvbi4gYCArXG4gICAgICAgICAgICAgICAgICBgTWFrZSBzdXJlIHRoZSBjb3JyZWN0IGRlcGxveW1lbnQgdGFyZ2V0IGhhcyBiZWVuIHNlbGVjdGVkIGZvciBpdHMgY29tcGlsYXRpb24gaW4gWGNvZGUuYCk7XG59XG5cbmV4cG9ydCB7IGRldGVjdFVkaWQsIGdldEFuZENoZWNrWGNvZGVWZXJzaW9uLCBnZXRBbmRDaGVja0lvc1Nka1ZlcnNpb24sXG4gICAgICAgICBhZGp1c3RXREFBdHRhY2htZW50c1Blcm1pc3Npb25zLCBjaGVja0FwcFByZXNlbnQsIGdldERyaXZlckluZm8sXG4gICAgICAgICBjbGVhclN5c3RlbUZpbGVzLCB0cmFuc2xhdGVEZXZpY2VOYW1lLCBub3JtYWxpemVDb21tYW5kVGltZW91dHMsXG4gICAgICAgICBERUZBVUxUX1RJTUVPVVRfS0VZLCByZXNldFhDVGVzdFByb2Nlc3NlcywgZ2V0UGlkVXNpbmdQYXR0ZXJuLFxuICAgICAgICAgbWFya1N5c3RlbUZpbGVzRm9yQ2xlYW51cCwgcHJpbnRVc2VyLCBwcmludExpYmltb2JpbGVkZXZpY2VJbmZvLFxuICAgICAgICAgZ2V0UElEc0xpc3RlbmluZ09uUG9ydCwgZW5jb2RlQmFzZTY0T3JVcGxvYWQsIHJlbW92ZUFsbFNlc3Npb25XZWJTb2NrZXRIYW5kbGVycyxcbiAgICAgICAgIHZlcmlmeUFwcGxpY2F0aW9uUGxhdGZvcm0gfTtcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4ifQ==
