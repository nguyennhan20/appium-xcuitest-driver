'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _asyncbox = require('asyncbox');

var _teen_process = require('teen_process');

var _appiumSupport = require('appium-support');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _utils = require('./utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var DEFAULT_SIGNING_ID = "iPhone Developer";
var BUILD_TEST_DELAY = 1000;
var RUNNER_SCHEME = 'WebDriverAgentRunner';
var LIB_SCHEME = 'WebDriverAgentLib';

var xcodeLog = _appiumSupport.logger.getLogger('Xcode');

var XcodeBuild = (function () {
  function XcodeBuild(xcodeVersion, device) {
    var args = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, XcodeBuild);

    this.xcodeVersion = xcodeVersion;

    this.device = device;

    this.realDevice = args.realDevice;

    this.agentPath = args.agentPath;
    this.bootstrapPath = args.bootstrapPath;

    this.platformVersion = args.platformVersion;

    this.showXcodeLog = !!args.showXcodeLog;

    this.xcodeConfigFile = args.xcodeConfigFile;
    this.xcodeOrgId = args.xcodeOrgId;
    this.xcodeSigningId = args.xcodeSigningId || DEFAULT_SIGNING_ID;
    this.keychainPath = args.keychainPath;
    this.keychainPassword = args.keychainPassword;

    this.prebuildWDA = args.prebuildWDA;
    this.usePrebuiltWDA = args.usePrebuiltWDA;
    this.useSimpleBuildTest = args.useSimpleBuildTest;

    this.useXctestrunFile = args.useXctestrunFile;

    this.launchTimeout = args.launchTimeout;

    this.wdaRemotePort = args.wdaRemotePort;

    this.updatedWDABundleId = args.updatedWDABundleId;
    this.derivedDataPath = args.derivedDataPath;

    this.mjpegServerPort = args.mjpegServerPort;
  }

  _createClass(XcodeBuild, [{
    key: 'init',
    value: function init(noSessionProxy) {
      return _regeneratorRuntime.async(function init$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.noSessionProxy = noSessionProxy;

            if (!this.useXctestrunFile) {
              context$2$0.next = 7;
              break;
            }

            if (this.xcodeVersion.major <= 7) {
              _logger2['default'].errorAndThrow('useXctestrunFile can only be used with xcode version 8 onwards');
            }
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap((0, _utils.setXctestrunFile)(this.realDevice, this.device.udid, this.platformVersion, this.bootstrapPath, this.wdaRemotePort));

          case 5:
            this.xctestrunFilePath = context$2$0.sent;
            return context$2$0.abrupt('return');

          case 7:
            if (!(this.xcodeVersion.major === 7 || this.xcodeVersion.major === 8 && this.xcodeVersion.minor === 0)) {
              context$2$0.next = 11;
              break;
            }

            _logger2['default'].debug('Using Xcode ' + this.xcodeVersion.versionString + ', so fixing WDA codebase');
            context$2$0.next = 11;
            return _regeneratorRuntime.awrap((0, _utils.fixForXcode7)(this.bootstrapPath, true));

          case 11:
            if (!(this.xcodeVersion.major === 9)) {
              context$2$0.next = 15;
              break;
            }

            _logger2['default'].debug('Using Xcode ' + this.xcodeVersion.versionString + ', so fixing WDA codebase');
            context$2$0.next = 15;
            return _regeneratorRuntime.awrap((0, _utils.fixForXcode9)(this.bootstrapPath, true));

          case 15:
            if (!this.realDevice) {
              context$2$0.next = 21;
              break;
            }

            context$2$0.next = 18;
            return _regeneratorRuntime.awrap((0, _utils.resetProjectFile)(this.agentPath));

          case 18:
            if (!this.updatedWDABundleId) {
              context$2$0.next = 21;
              break;
            }

            context$2$0.next = 21;
            return _regeneratorRuntime.awrap((0, _utils.updateProjectFile)(this.agentPath, this.updatedWDABundleId));

          case 21:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'retrieveDerivedDataPath',
    value: function retrieveDerivedDataPath() {
      var stdout, _ref, pattern, match;

      return _regeneratorRuntime.async(function retrieveDerivedDataPath$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!this.derivedDataPath) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return', this.derivedDataPath);

          case 2:
            stdout = undefined;
            context$2$0.prev = 3;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap((0, _teen_process.exec)('xcodebuild', ['-project', this.agentPath, '-showBuildSettings']));

          case 6:
            _ref = context$2$0.sent;
            stdout = _ref.stdout;
            context$2$0.next = 14;
            break;

          case 10:
            context$2$0.prev = 10;
            context$2$0.t0 = context$2$0['catch'](3);

            _logger2['default'].warn('Cannot retrieve WDA build settings. Original error: ' + context$2$0.t0.message);
            return context$2$0.abrupt('return');

          case 14:
            pattern = /^\s*BUILD_DIR\s+=\s+(\/.*)/m;
            match = pattern.exec(stdout);

            if (match) {
              context$2$0.next = 19;
              break;
            }

            _logger2['default'].warn('Cannot parse WDA build dir from ' + _lodash2['default'].truncate(stdout, { length: 300 }));
            return context$2$0.abrupt('return');

          case 19:
            _logger2['default'].debug('Parsed BUILD_DIR configuration value: \'' + match[1] + '\'');
            // Derived data root is two levels higher over the build dir
            this.derivedDataPath = _path2['default'].dirname(_path2['default'].dirname(_path2['default'].normalize(match[1])));
            _logger2['default'].debug('Got derived data root: \'' + this.derivedDataPath + '\'');
            return context$2$0.abrupt('return', this.derivedDataPath);

          case 23:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[3, 10]]);
    }
  }, {
    key: 'reset',
    value: function reset() {
      return _regeneratorRuntime.async(function reset$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(this.realDevice && this.updatedWDABundleId)) {
              context$2$0.next = 3;
              break;
            }

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap((0, _utils.resetProjectFile)(this.agentPath));

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'prebuild',
    value: function prebuild() {
      return _regeneratorRuntime.async(function prebuild$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(this.xcodeVersion.major === 7)) {
              context$2$0.next = 3;
              break;
            }

            _logger2['default'].debug('Capability \'prebuildWDA\' set, but on xcode version ' + this.xcodeVersion.versionString + ' so skipping');
            return context$2$0.abrupt('return');

          case 3:

            // first do a build phase
            _logger2['default'].debug('Pre-building WDA before launching test');
            this.usePrebuiltWDA = true;
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(this.createSubProcess(true));

          case 7:
            this.xcodebuild = context$2$0.sent;
            context$2$0.next = 10;
            return _regeneratorRuntime.awrap(this.start(true));

          case 10:

            this.xcodebuild = null;

            // pause a moment
            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(_bluebird2['default'].delay(BUILD_TEST_DELAY));

          case 13:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'cleanProject',
    value: function cleanProject() {
      var _arr, _i, scheme;

      return _regeneratorRuntime.async(function cleanProject$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _arr = [LIB_SCHEME, RUNNER_SCHEME];
            _i = 0;

          case 2:
            if (!(_i < _arr.length)) {
              context$2$0.next = 10;
              break;
            }

            scheme = _arr[_i];

            _logger2['default'].debug('Cleaning the project scheme \'' + scheme + '\' to make sure there are no leftovers from previous installs');
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap((0, _teen_process.exec)('xcodebuild', ['clean', '-project', this.agentPath, '-scheme', scheme]));

          case 7:
            _i++;
            context$2$0.next = 2;
            break;

          case 10:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getCommand',
    value: function getCommand() {
      var buildOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var cmd = 'xcodebuild';
      var args = undefined;

      // figure out the targets for xcodebuild
      if (this.xcodeVersion.major < 8) {
        args = ['build', 'test'];
      } else {
        var _ref2 = this.useSimpleBuildTest ? ['build', 'test'] : ['build-for-testing', 'test-without-building'];

        var _ref22 = _slicedToArray(_ref2, 2);

        var buildCmd = _ref22[0];
        var testCmd = _ref22[1];

        if (buildOnly) {
          args = [buildCmd];
        } else if (this.usePrebuiltWDA || this.useXctestrunFile) {
          args = [testCmd];
        } else {
          args = [buildCmd, testCmd];
        }
      }

      if (this.useXctestrunFile) {
        args.push('-xctestrun', this.xctestrunFilePath);
      } else {
        args.push('-project', this.agentPath, '-scheme', RUNNER_SCHEME);
        if (this.derivedDataPath) {
          args.push('-derivedDataPath', this.derivedDataPath);
        }
      }
      args.push('-destination', 'id=' + this.device.udid);

      var versionMatch = new RegExp(/^(\d+)\.(\d+)/).exec(this.platformVersion);
      if (versionMatch) {
        args.push('IPHONEOS_DEPLOYMENT_TARGET=' + versionMatch[1] + '.' + versionMatch[2]);
      } else {
        _logger2['default'].warn('Cannot parse major and minor version numbers from platformVersion "' + this.platformVersion + '". ' + 'Will build for the default platform instead');
      }

      if (this.realDevice && this.xcodeConfigFile) {
        _logger2['default'].debug('Using Xcode configuration file: \'' + this.xcodeConfigFile + '\'');
        args.push('-xcconfig', this.xcodeConfigFile);
      }

      return { cmd: cmd, args: args };
    }
  }, {
    key: 'createSubProcess',
    value: function createSubProcess() {
      var buildOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var _getCommand, cmd, args, env, upgradeTimestamp, xcodebuild, logXcodeOutput;

      return _regeneratorRuntime.async(function createSubProcess$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (this.useXctestrunFile) {
              context$2$0.next = 9;
              break;
            }

            if (!this.realDevice) {
              context$2$0.next = 9;
              break;
            }

            if (!(this.keychainPath && this.keychainPassword)) {
              context$2$0.next = 5;
              break;
            }

            context$2$0.next = 5;
            return _regeneratorRuntime.awrap((0, _utils.setRealDeviceSecurity)(this.keychainPath, this.keychainPassword));

          case 5:
            if (!(this.xcodeOrgId && this.xcodeSigningId && !this.xcodeConfigFile)) {
              context$2$0.next = 9;
              break;
            }

            context$2$0.next = 8;
            return _regeneratorRuntime.awrap((0, _utils.generateXcodeConfigFile)(this.xcodeOrgId, this.xcodeSigningId));

          case 8:
            this.xcodeConfigFile = context$2$0.sent;

          case 9:
            _getCommand = this.getCommand(buildOnly);
            cmd = _getCommand.cmd;
            args = _getCommand.args;

            _logger2['default'].debug('Beginning ' + (buildOnly ? 'build' : 'test') + ' with command \'' + cmd + ' ' + args.join(' ') + '\' ' + ('in directory \'' + this.bootstrapPath + '\''));
            env = _Object$assign({}, process.env, {
              USE_PORT: this.wdaRemotePort,
              WDA_PRODUCT_BUNDLE_IDENTIFIER: this.updatedWDABundleId || _utils.WDA_RUNNER_BUNDLE_ID
            });

            if (this.mjpegServerPort) {
              // https://github.com/appium/WebDriverAgent/pull/105
              env.MJPEG_SERVER_PORT = this.mjpegServerPort;
            }
            context$2$0.next = 17;
            return _regeneratorRuntime.awrap((0, _utils.getWDAUpgradeTimestamp)(this.bootstrapPath));

          case 17:
            upgradeTimestamp = context$2$0.sent;

            if (upgradeTimestamp) {
              env.UPGRADE_TIMESTAMP = upgradeTimestamp;
            }
            xcodebuild = new _teen_process.SubProcess(cmd, args, {
              cwd: this.bootstrapPath,
              env: env,
              detached: true,
              stdio: ['ignore', 'pipe', 'pipe']
            });
            logXcodeOutput = this.showXcodeLog;

            _logger2['default'].debug('Output from xcodebuild ' + (logXcodeOutput ? 'will' : 'will not') + ' be logged. To change this, use \'showXcodeLog\' desired capability');
            xcodebuild.on('output', function (stdout, stderr) {
              var out = stdout || stderr;
              // we want to pull out the log file that is created, and highlight it
              // for diagnostic purposes
              if (out.indexOf('Writing diagnostic log for test session to') !== -1) {
                // pull out the first line that begins with the path separator
                // which *should* be the line indicating the log file generated
                xcodebuild.logLocation = _lodash2['default'].first(_lodash2['default'].remove(out.trim().split('\n'), function (v) {
                  return v.indexOf(_path2['default'].sep) === 0;
                }));
                _logger2['default'].debug('Log file for xcodebuild test: ' + xcodebuild.logLocation);
              }

              // if we have an error we want to output the logs
              // otherwise the failure is inscrutible
              // but do not log permission errors from trying to write to attachments folder
              if (out.indexOf('Error Domain=') !== -1 && out.indexOf('Error writing attachment data to file') === -1 && out.indexOf('Failed to remove screenshot at path') === -1) {
                logXcodeOutput = true;

                // terrible hack to handle case where xcode return 0 but is failing
                xcodebuild._wda_error_occurred = true;
              }

              if (logXcodeOutput) {
                // do not log permission errors from trying to write to attachments folder
                if (out.indexOf('Error writing attachment data to file') === -1) {
                  var _iteratorNormalCompletion = true;
                  var _didIteratorError = false;
                  var _iteratorError = undefined;

                  try {
                    for (var _iterator = _getIterator(out.split('\n')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var line = _step.value;

                      xcodeLog.info(line);
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
                }
              }
            });

            return context$2$0.abrupt('return', xcodebuild);

          case 24:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'start',
    value: function start() {
      var buildOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
      return _regeneratorRuntime.async(function start$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.createSubProcess(buildOnly));

          case 2:
            this.xcodebuild = context$2$0.sent;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(new _bluebird2['default'](function (resolve, reject) {
              _this.xcodebuild.on('exit', function callee$3$0(code, signal) {
                var data, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, line;

                return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                  while (1) switch (context$4$0.prev = context$4$0.next) {
                    case 0:
                      _logger2['default'].info('xcodebuild exited with code \'' + code + '\' and signal \'' + signal + '\'');
                      // print out the xcodebuild file if users have asked for it

                      if (!(this.showXcodeLog && this.xcodebuild.logLocation)) {
                        context$4$0.next = 31;
                        break;
                      }

                      xcodeLog.info('Contents of xcodebuild log file \'' + this.xcodebuild.logLocation + '\':');
                      context$4$0.prev = 3;
                      context$4$0.next = 6;
                      return _regeneratorRuntime.awrap(_appiumSupport.fs.readFile(this.xcodebuild.logLocation, 'utf8'));

                    case 6:
                      data = context$4$0.sent;
                      _iteratorNormalCompletion2 = true;
                      _didIteratorError2 = false;
                      _iteratorError2 = undefined;
                      context$4$0.prev = 10;

                      for (_iterator2 = _getIterator(data.split('\n')); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        line = _step2.value;

                        xcodeLog.info(line);
                      }
                      context$4$0.next = 18;
                      break;

                    case 14:
                      context$4$0.prev = 14;
                      context$4$0.t0 = context$4$0['catch'](10);
                      _didIteratorError2 = true;
                      _iteratorError2 = context$4$0.t0;

                    case 18:
                      context$4$0.prev = 18;
                      context$4$0.prev = 19;

                      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                      }

                    case 21:
                      context$4$0.prev = 21;

                      if (!_didIteratorError2) {
                        context$4$0.next = 24;
                        break;
                      }

                      throw _iteratorError2;

                    case 24:
                      return context$4$0.finish(21);

                    case 25:
                      return context$4$0.finish(18);

                    case 26:
                      context$4$0.next = 31;
                      break;

                    case 28:
                      context$4$0.prev = 28;
                      context$4$0.t1 = context$4$0['catch'](3);

                      _logger2['default'].debug('Unable to access xcodebuild log file: \'' + context$4$0.t1.message + '\'');

                    case 31:
                      this.xcodebuild.processExited = true;

                      if (!(this.xcodebuild._wda_error_occurred || !signal && code !== 0)) {
                        context$4$0.next = 34;
                        break;
                      }

                      return context$4$0.abrupt('return', reject(new Error('xcodebuild failed with code ' + code)));

                    case 34:
                      if (!buildOnly) {
                        context$4$0.next = 36;
                        break;
                      }

                      return context$4$0.abrupt('return', resolve());

                    case 36:
                    case 'end':
                      return context$4$0.stop();
                  }
                }, null, _this, [[3, 28], [10, 14, 18, 26], [19,, 21, 25]]);
              });

              return (function callee$3$0() {
                var startTime, _status, msg;

                return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                  while (1) switch (context$4$0.prev = context$4$0.next) {
                    case 0:
                      context$4$0.prev = 0;
                      startTime = process.hrtime();
                      context$4$0.next = 4;
                      return _regeneratorRuntime.awrap(this.xcodebuild.start());

                    case 4:
                      this.xcodebuild.proc.unref();

                      if (buildOnly) {
                        context$4$0.next = 10;
                        break;
                      }

                      context$4$0.next = 8;
                      return _regeneratorRuntime.awrap(this.waitForStart(startTime));

                    case 8:
                      _status = context$4$0.sent;

                      resolve(_status);

                    case 10:
                      context$4$0.next = 17;
                      break;

                    case 12:
                      context$4$0.prev = 12;
                      context$4$0.t0 = context$4$0['catch'](0);
                      msg = 'Unable to start WebDriverAgent: ' + context$4$0.t0;

                      _logger2['default'].error(msg);
                      reject(new Error(msg));

                    case 17:
                    case 'end':
                      return context$4$0.stop();
                  }
                }, null, _this, [[0, 12]]);
              })();
            }));

          case 5:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'waitForStart',
    value: function waitForStart(startTime) {
      var currentStatus, retries, endTime, startupTime;
      return _regeneratorRuntime.async(function waitForStart$(context$2$0) {
        var _this2 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            // try to connect once every 0.5 seconds, until `launchTimeout` is up
            _logger2['default'].debug('Waiting up to ' + this.launchTimeout + 'ms for WebDriverAgent to start');
            currentStatus = null;
            context$2$0.prev = 2;
            retries = parseInt(this.launchTimeout / 500, 10);
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(retries, 1000, function callee$2$0() {
              var proxyTimeout;
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    if (!this.xcodebuild.processExited) {
                      context$3$0.next = 2;
                      break;
                    }

                    return context$3$0.abrupt('return');

                  case 2:
                    proxyTimeout = this.noSessionProxy.timeout;

                    this.noSessionProxy.timeout = 1000;
                    context$3$0.prev = 4;
                    context$3$0.next = 7;
                    return _regeneratorRuntime.awrap(this.noSessionProxy.command('/status', 'GET'));

                  case 7:
                    currentStatus = context$3$0.sent;

                    if (currentStatus && currentStatus.ios && currentStatus.ios.ip) {
                      this.agentUrl = currentStatus.ios.ip;
                    }
                    _logger2['default'].debug('WebDriverAgent information:');
                    _logger2['default'].debug(JSON.stringify(currentStatus, null, 2));
                    context$3$0.next = 16;
                    break;

                  case 13:
                    context$3$0.prev = 13;
                    context$3$0.t0 = context$3$0['catch'](4);
                    throw new Error('Unable to connect to running WebDriverAgent: ' + context$3$0.t0.message);

                  case 16:
                    context$3$0.prev = 16;

                    this.noSessionProxy.timeout = proxyTimeout;
                    return context$3$0.finish(16);

                  case 19:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this2, [[4, 13, 16, 19]]);
            }));

          case 6:
            if (!this.xcodebuild.processExited) {
              context$2$0.next = 8;
              break;
            }

            return context$2$0.abrupt('return', currentStatus);

          case 8:
            endTime = process.hrtime(startTime);
            startupTime = parseInt((endTime[0] * 1e9 + endTime[1]) / 1e6, 10);

            _logger2['default'].debug('WebDriverAgent successfully started after ' + startupTime + 'ms');
            context$2$0.next = 17;
            break;

          case 13:
            context$2$0.prev = 13;
            context$2$0.t0 = context$2$0['catch'](2);

            // at this point, if we have not had any errors from xcode itself (reported
            // elsewhere), we can let this go through and try to create the session
            _logger2['default'].debug(context$2$0.t0.message);
            _logger2['default'].warn('Getting status of WebDriverAgent on device timed out. Continuing');

          case 17:
            return context$2$0.abrupt('return', currentStatus);

          case 18:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[2, 13]]);
    }
  }, {
    key: 'quit',
    value: function quit() {
      return _regeneratorRuntime.async(function quit$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap((0, _utils.killProcess)('xcodebuild', this.xcodebuild));

          case 2:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return XcodeBuild;
})();

exports.XcodeBuild = XcodeBuild;
exports['default'] = XcodeBuild;

// if necessary, update the bundleId to user's specification

// In case the project still has the user specific bundle ID, reset the project file first.
// - We do this reset even if updatedWDABundleId is not specified,
//   since the previous updatedWDABundleId test has generated the user specific bundle ID project file.
// - We don't call resetProjectFile for simulator,
//   since simulator test run will work with any user specific bundle ID.

// if necessary, reset the bundleId to original value

// wrap the start procedure in a promise so that we can catch, and report,
// any startup errors that are thrown as events

// in the case of just building, the process will exit and that is our finish

// there has been an error elsewhere and we need to short-circuit

// there has been an error elsewhere and we need to short-circuit

// must get [s, ns] array into ms
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi93ZGEveGNvZGVidWlsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFBOEIsVUFBVTs7NEJBQ1AsY0FBYzs7NkJBQ3BCLGdCQUFnQjs7c0JBQzNCLFdBQVc7Ozs7d0JBQ2IsVUFBVTs7OztxQkFHcUMsU0FBUzs7c0JBQ3hELFFBQVE7Ozs7b0JBQ0wsTUFBTTs7OztBQUd2QixJQUFNLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzlCLElBQU0sYUFBYSxHQUFHLHNCQUFzQixDQUFDO0FBQzdDLElBQU0sVUFBVSxHQUFHLG1CQUFtQixDQUFDOztBQUV2QyxJQUFNLFFBQVEsR0FBRyxzQkFBTyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7O0lBR3JDLFVBQVU7QUFDRixXQURSLFVBQVUsQ0FDRCxZQUFZLEVBQUUsTUFBTSxFQUFhO1FBQVgsSUFBSSx5REFBRyxFQUFFOzswQkFEeEMsVUFBVTs7QUFFWixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzs7QUFFakMsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRXJCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7QUFFbEMsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQzs7QUFFeEMsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDOztBQUU1QyxRQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDOztBQUV4QyxRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7QUFDNUMsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQ2xDLFFBQUksQ0FB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QUV4RSxhQUFhOzs7Ozs7O0tBQ3JCOzs7V0FFVTs7Ozs7NkNBQ0gsd0JBQVksWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUM7Ozs7Ozs7S0FDakQ7OztTQTVWRyxVQUFVOzs7UUErVlAsVUFBVSxHQUFWLFVBQVU7cUJBQ0osVUFBVSIsImZpbGUiOiJsaWIvd2RhL3hjb2RlYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZXRyeUludGVydmFsIH0gZnJvbSAnYXN5bmNib3gnO1xuaW1wb3J0IHsgU3ViUHJvY2VzcywgZXhlYyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5pbXBvcnQgeyBmcywgbG9nZ2VyIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IEIgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHsgZml4Rm9yWGNvZGU3LCBmaXhGb3JYY29kZTksIHNldFJlYWxEZXZpY2VTZWN1cml0eSwgZ2VuZXJhdGVYY29kZUNvbmZpZ0ZpbGUsXG4gICAgICAgICBzZXRYY3Rlc3RydW5GaWxlLCB1cGRhdGVQcm9qZWN0RmlsZSwgcmVzZXRQcm9qZWN0RmlsZSwga2lsbFByb2Nlc3MsXG4gICAgICAgICBXREFfUlVOTkVSX0JVTkRMRV9JRCwgZ2V0V0RBVXBncmFkZVRpbWVzdGFtcCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbmNvbnN0IERFRkFVTFRfU0lHTklOR19JRCA9IFwiaVBob25lIERldmVsb3BlclwiO1xuY29uc3QgQlVJTERfVEVTVF9ERUxBWSA9IDEwMDA7XG5jb25zdCBSVU5ORVJfU0NIRU1FID0gJ1dlYkRyaXZlckFnZW50UnVubmVyJztcbmNvbnN0IExJQl9TQ0hFTUUgPSAnV2ViRHJpdmVyQWdlbnRMaWInO1xuXG5jb25zdCB4Y29kZUxvZyA9IGxvZ2dlci5nZXRMb2dnZXIoJ1hjb2RlJyk7XG5cblxuY2xhc3MgWGNvZGVCdWlsZCB7XG4gIGNvbnN0cnVjdG9yICh4Y29kZVZlcnNpb24sIGRldmljZSwgYXJncyA9IHt9KSB7XG4gICAgdGhpcy54Y29kZVZlcnNpb24gPSB4Y29kZVZlcnNpb247XG5cbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcblxuICAgIHRoaXMucmVhbERldmljZSA9IGFyZ3MucmVhbERldmljZTtcblxuICAgIHRoaXMuYWdlbnRQYXRoID0gYXJncy5hZ2VudFBhdGg7XG4gICAgdGhpcy5ib290c3RyYXBQYXRoID0gYXJncy5ib290c3RyYXBQYXRoO1xuXG4gICAgdGhpcy5wbGF0Zm9ybVZlcnNpb24gPSBhcmdzLnBsYXRmb3JtVmVyc2lvbjtcblxuICAgIHRoaXMuc2hvd1hjb2RlTG9nID0gISFhcmdzLnNob3dYY29kZUxvZztcblxuICAgIHRoaXMueGNvZGVDb25maWdGaWxlID0gYXJncy54Y29kZUNvbmZpZ0ZpbGU7XG4gICAgdGhpcy54Y29kZU9yZ0lkID0gYXJncy54Y29kZU9yZ0lkO1xuICAgIHRoaXMueGNvZGVTaWduaW5nSWQgPSBhcmdzLnhjb2RlU2lnbmluZ0lkIHx8IERFRkFVTFRfU0lHTklOR19JRDtcbiAgICB0aGlzLmtleWNoYWluUGF0aCA9IGFyZ3Mua2V5Y2hhaW5QYXRoO1xuICAgIHRoaXMua2V5Y2hhaW5QYXNzd29yZCA9IGFyZ3Mua2V5Y2hhaW5QYXNzd29yZDtcblxuICAgIHRoaXMucHJlYnVpbGRXREEgPSBhcmdzLnByZWJ1aWxkV0RBO1xuICAgIHRoaXMudXNlUHJlYnVpbHRXREEgPSBhcmdzLnVzZVByZWJ1aWx0V0RBO1xuICAgIHRoaXMudXNlU2ltcGxlQnVpbGRUZXN0ID0gYXJncy51c2VTaW1wbGVCdWlsZFRlc3Q7XG5cbiAgICB0aGlzLnVzZVhjdGVzdHJ1bkZpbGUgPSBhcmdzLnVzZVhjdGVzdHJ1bkZpbGU7XG5cbiAgICB0aGlzLmxhdW5jaFRpbWVvdXQgPSBhcmdzLmxhdW5jaFRpbWVvdXQ7XG5cbiAgICB0aGlzLndkYVJlbW90ZVBvcnQgPSBhcmdzLndkYVJlbW90ZVBvcnQ7XG5cbiAgICB0aGlzLnVwZGF0ZWRXREFCdW5kbGVJZCA9IGFyZ3MudXBkYXRlZFdEQUJ1bmRsZUlkO1xuICAgIHRoaXMuZGVyaXZlZERhdGFQYXRoID0gYXJncy5kZXJpdmVkRGF0YVBhdGg7XG5cbiAgICB0aGlzLm1qcGVnU2VydmVyUG9ydCA9IGFyZ3MubWpwZWdTZXJ2ZXJQb3J0O1xuICB9XG5cbiAgYXN5bmMgaW5pdCAobm9TZXNzaW9uUHJveHkpIHtcbiAgICB0aGlzLm5vU2Vzc2lvblByb3h5ID0gbm9TZXNzaW9uUHJveHk7XG5cbiAgICBpZiAodGhpcy51c2VYY3Rlc3RydW5GaWxlKSB7XG4gICAgICBpZiAodGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPD0gNykge1xuICAgICAgICBsb2cuZXJyb3JBbmRUaHJvdygndXNlWGN0ZXN0cnVuRmlsZSBjYW4gb25seSBiZSB1c2VkIHdpdGggeGNvZGUgdmVyc2lvbiA4IG9ud2FyZHMnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMueGN0ZXN0cnVuRmlsZVBhdGggPSBhd2FpdCBzZXRYY3Rlc3RydW5GaWxlKHRoaXMucmVhbERldmljZSwgdGhpcy5kZXZpY2UudWRpZCwgdGhpcy5wbGF0Zm9ybVZlcnNpb24sIHRoaXMuYm9vdHN0cmFwUGF0aCwgdGhpcy53ZGFSZW1vdGVQb3J0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPT09IDcgfHwgKHRoaXMueGNvZGVWZXJzaW9uLm1ham9yID09PSA4ICYmIHRoaXMueGNvZGVWZXJzaW9uLm1pbm9yID09PSAwKSkge1xuICAgICAgbG9nLmRlYnVnKGBVc2luZyBYY29kZSAke3RoaXMueGNvZGVWZXJzaW9uLnZlcnNpb25TdHJpbmd9LCBzbyBmaXhpbmcgV0RBIGNvZGViYXNlYCk7XG4gICAgICBhd2FpdCBmaXhGb3JYY29kZTcodGhpcy5ib290c3RyYXBQYXRoLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPT09IDkpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgVXNpbmcgWGNvZGUgJHt0aGlzLnhjb2RlVmVyc2lvbi52ZXJzaW9uU3RyaW5nfSwgc28gZml4aW5nIFdEQSBjb2RlYmFzZWApO1xuICAgICAgYXdhaXQgZml4Rm9yWGNvZGU5KHRoaXMuYm9vdHN0cmFwUGF0aCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gaWYgbmVjZXNzYXJ5LCB1cGRhdGUgdGhlIGJ1bmRsZUlkIHRvIHVzZXIncyBzcGVjaWZpY2F0aW9uXG4gICAgaWYgKHRoaXMucmVhbERldmljZSkge1xuICAgICAgLy8gSW4gY2FzZSB0aGUgcHJvamVjdCBzdGlsbCBoYXMgdGhlIHVzZXIgc3BlY2lmaWMgYnVuZGxlIElELCByZXNldCB0aGUgcHJvamVjdCBmaWxlIGZpcnN0LlxuICAgICAgLy8gLSBXZSBkbyB0aGlzIHJlc2V0IGV2ZW4gaWYgdXBkYXRlZFdEQUJ1bmRsZUlkIGlzIG5vdCBzcGVjaWZpZWQsXG4gICAgICAvLyAgIHNpbmNlIHRoZSBwcmV2aW91cyB1cGRhdGVkV0RBQnVuZGxlSWQgdGVzdCBoYXMgZ2VuZXJhdGVkIHRoZSB1c2VyIHNwZWNpZmljIGJ1bmRsZSBJRCBwcm9qZWN0IGZpbGUuXG4gICAgICAvLyAtIFdlIGRvbid0IGNhbGwgcmVzZXRQcm9qZWN0RmlsZSBmb3Igc2ltdWxhdG9yLFxuICAgICAgLy8gICBzaW5jZSBzaW11bGF0b3IgdGVzdCBydW4gd2lsbCB3b3JrIHdpdGggYW55IHVzZXIgc3BlY2lmaWMgYnVuZGxlIElELlxuICAgICAgYXdhaXQgcmVzZXRQcm9qZWN0RmlsZSh0aGlzLmFnZW50UGF0aCk7XG4gICAgICBpZiAodGhpcy51cGRhdGVkV0RBQnVuZGxlSWQpIHtcbiAgICAgICAgYXdhaXQgdXBkYXRlUHJvamVjdEZpbGUodGhpcy5hZ2VudFBhdGgsIHRoaXMudXBkYXRlZFdEQUJ1bmRsZUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyByZXRyaWV2ZURlcml2ZWREYXRhUGF0aCAoKSB7XG4gICAgaWYgKHRoaXMuZGVyaXZlZERhdGFQYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXJpdmVkRGF0YVBhdGg7XG4gICAgfVxuXG4gICAgbGV0IHN0ZG91dDtcbiAgICB0cnkge1xuICAgICAgKHtzdGRvdXR9ID0gYXdhaXQgZXhlYygneGNvZGVidWlsZCcsIFsnLXByb2plY3QnLCB0aGlzLmFnZW50UGF0aCwgJy1zaG93QnVpbGRTZXR0aW5ncyddKSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2cud2FybihgQ2Fubm90IHJldHJpZXZlIFdEQSBidWlsZCBzZXR0aW5ncy4gT3JpZ2luYWwgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGF0dGVybiA9IC9eXFxzKkJVSUxEX0RJUlxccys9XFxzKyhcXC8uKikvbTtcbiAgICBjb25zdCBtYXRjaCA9IHBhdHRlcm4uZXhlYyhzdGRvdXQpO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIGxvZy53YXJuKGBDYW5ub3QgcGFyc2UgV0RBIGJ1aWxkIGRpciBmcm9tICR7Xy50cnVuY2F0ZShzdGRvdXQsIHtsZW5ndGg6IDMwMH0pfWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2cuZGVidWcoYFBhcnNlZCBCVUlMRF9ESVIgY29uZmlndXJhdGlvbiB2YWx1ZTogJyR7bWF0Y2hbMV19J2ApO1xuICAgIC8vIERlcml2ZWQgZGF0YSByb290IGlzIHR3byBsZXZlbHMgaGlnaGVyIG92ZXIgdGhlIGJ1aWxkIGRpclxuICAgIHRoaXMuZGVyaXZlZERhdGFQYXRoID0gcGF0aC5kaXJuYW1lKHBhdGguZGlybmFtZShwYXRoLm5vcm1hbGl6ZShtYXRjaFsxXSkpKTtcbiAgICBsb2cuZGVidWcoYEdvdCBkZXJpdmVkIGRhdGEgcm9vdDogJyR7dGhpcy5kZXJpdmVkRGF0YVBhdGh9J2ApO1xuICAgIHJldHVybiB0aGlzLmRlcml2ZWREYXRhUGF0aDtcbiAgfVxuXG4gIGFzeW5jIHJlc2V0ICgpIHtcbiAgICAvLyBpZiBuZWNlc3NhcnksIHJlc2V0IHRoZSBidW5kbGVJZCB0byBvcmlnaW5hbCB2YWx1ZVxuICAgIGlmICh0aGlzLnJlYWxEZXZpY2UgJiYgdGhpcy51cGRhdGVkV0RBQnVuZGxlSWQpIHtcbiAgICAgIGF3YWl0IHJlc2V0UHJvamVjdEZpbGUodGhpcy5hZ2VudFBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHByZWJ1aWxkICgpIHtcbiAgICBpZiAodGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPT09IDcpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgQ2FwYWJpbGl0eSAncHJlYnVpbGRXREEnIHNldCwgYnV0IG9uIHhjb2RlIHZlcnNpb24gJHt0aGlzLnhjb2RlVmVyc2lvbi52ZXJzaW9uU3RyaW5nfSBzbyBza2lwcGluZ2ApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZpcnN0IGRvIGEgYnVpbGQgcGhhc2VcbiAgICBsb2cuZGVidWcoJ1ByZS1idWlsZGluZyBXREEgYmVmb3JlIGxhdW5jaGluZyB0ZXN0Jyk7XG4gICAgdGhpcy51c2VQcmVidWlsdFdEQSA9IHRydWU7XG4gICAgdGhpcy54Y29kZWJ1aWxkID0gYXdhaXQgdGhpcy5jcmVhdGVTdWJQcm9jZXNzKHRydWUpO1xuICAgIGF3YWl0IHRoaXMuc3RhcnQodHJ1ZSk7XG5cbiAgICB0aGlzLnhjb2RlYnVpbGQgPSBudWxsO1xuXG4gICAgLy8gcGF1c2UgYSBtb21lbnRcbiAgICBhd2FpdCBCLmRlbGF5KEJVSUxEX1RFU1RfREVMQVkpO1xuICB9XG5cbiAgYXN5bmMgY2xlYW5Qcm9qZWN0ICgpIHtcbiAgICBmb3IgKGNvbnN0IHNjaGVtZSBvZiBbTElCX1NDSEVNRSwgUlVOTkVSX1NDSEVNRV0pIHtcbiAgICAgIGxvZy5kZWJ1ZyhgQ2xlYW5pbmcgdGhlIHByb2plY3Qgc2NoZW1lICcke3NjaGVtZX0nIHRvIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbGVmdG92ZXJzIGZyb20gcHJldmlvdXMgaW5zdGFsbHNgKTtcbiAgICAgIGF3YWl0IGV4ZWMoJ3hjb2RlYnVpbGQnLCBbXG4gICAgICAgICdjbGVhbicsXG4gICAgICAgICctcHJvamVjdCcsIHRoaXMuYWdlbnRQYXRoLFxuICAgICAgICAnLXNjaGVtZScsIHNjaGVtZSxcbiAgICAgIF0pO1xuICAgIH1cbiAgfVxuXG4gIGdldENvbW1hbmQgKGJ1aWxkT25seSA9IGZhbHNlKSB7XG4gICAgbGV0IGNtZCA9ICd4Y29kZWJ1aWxkJztcbiAgICBsZXQgYXJncztcblxuICAgIC8vIGZpZ3VyZSBvdXQgdGhlIHRhcmdldHMgZm9yIHhjb2RlYnVpbGRcbiAgICBpZiAodGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPCA4KSB7XG4gICAgICBhcmdzID1bXG4gICAgICAgICdidWlsZCcsXG4gICAgICAgICd0ZXN0JyxcbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBbYnVpbGRDbWQsIHRlc3RDbWRdID0gdGhpcy51c2VTaW1wbGVCdWlsZFRlc3QgPyBbJ2J1aWxkJywgJ3Rlc3QnXSA6IFsnYnVpbGQtZm9yLXRlc3RpbmcnLCAndGVzdC13aXRob3V0LWJ1aWxkaW5nJ107XG4gICAgICBpZiAoYnVpbGRPbmx5KSB7XG4gICAgICAgIGFyZ3MgPSBbYnVpbGRDbWRdO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnVzZVByZWJ1aWx0V0RBIHx8IHRoaXMudXNlWGN0ZXN0cnVuRmlsZSkge1xuICAgICAgICBhcmdzID0gW3Rlc3RDbWRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IFtidWlsZENtZCwgdGVzdENtZF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXNlWGN0ZXN0cnVuRmlsZSkge1xuICAgICAgYXJncy5wdXNoKCcteGN0ZXN0cnVuJywgdGhpcy54Y3Rlc3RydW5GaWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3MucHVzaCgnLXByb2plY3QnLCB0aGlzLmFnZW50UGF0aCwgJy1zY2hlbWUnLCBSVU5ORVJfU0NIRU1FKTtcbiAgICAgIGlmICh0aGlzLmRlcml2ZWREYXRhUGF0aCkge1xuICAgICAgICBhcmdzLnB1c2goJy1kZXJpdmVkRGF0YVBhdGgnLCB0aGlzLmRlcml2ZWREYXRhUGF0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIGFyZ3MucHVzaCgnLWRlc3RpbmF0aW9uJywgYGlkPSR7dGhpcy5kZXZpY2UudWRpZH1gKTtcblxuICAgIGNvbnN0IHZlcnNpb25NYXRjaCA9IG5ldyBSZWdFeHAoL14oXFxkKylcXC4oXFxkKykvKS5leGVjKHRoaXMucGxhdGZvcm1WZXJzaW9uKTtcbiAgICBpZiAodmVyc2lvbk1hdGNoKSB7XG4gICAgICBhcmdzLnB1c2goYElQSE9ORU9TX0RFUExPWU1FTlRfVEFSR0VUPSR7dmVyc2lvbk1hdGNoWzFdfS4ke3ZlcnNpb25NYXRjaFsyXX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nLndhcm4oYENhbm5vdCBwYXJzZSBtYWpvciBhbmQgbWlub3IgdmVyc2lvbiBudW1iZXJzIGZyb20gcGxhdGZvcm1WZXJzaW9uIFwiJHt0aGlzLnBsYXRmb3JtVmVyc2lvbn1cIi4gYCArXG4gICAgICAgICAgICAgICAnV2lsbCBidWlsZCBmb3IgdGhlIGRlZmF1bHQgcGxhdGZvcm0gaW5zdGVhZCcpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlYWxEZXZpY2UgJiYgdGhpcy54Y29kZUNvbmZpZ0ZpbGUpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgVXNpbmcgWGNvZGUgY29uZmlndXJhdGlvbiBmaWxlOiAnJHt0aGlzLnhjb2RlQ29uZmlnRmlsZX0nYCk7XG4gICAgICBhcmdzLnB1c2goJy14Y2NvbmZpZycsIHRoaXMueGNvZGVDb25maWdGaWxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2NtZCwgYXJnc307XG4gIH1cblxuICBhc3luYyBjcmVhdGVTdWJQcm9jZXNzIChidWlsZE9ubHkgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy51c2VYY3Rlc3RydW5GaWxlKSB7XG4gICAgICBpZiAodGhpcy5yZWFsRGV2aWNlKSB7XG4gICAgICAgIGlmICh0aGlzLmtleWNoYWluUGF0aCAmJiB0aGlzLmtleWNoYWluUGFzc3dvcmQpIHtcbiAgICAgICAgICBhd2FpdCBzZXRSZWFsRGV2aWNlU2VjdXJpdHkodGhpcy5rZXljaGFpblBhdGgsIHRoaXMua2V5Y2hhaW5QYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMueGNvZGVPcmdJZCAmJiB0aGlzLnhjb2RlU2lnbmluZ0lkICYmICF0aGlzLnhjb2RlQ29uZmlnRmlsZSkge1xuICAgICAgICAgIHRoaXMueGNvZGVDb25maWdGaWxlID0gYXdhaXQgZ2VuZXJhdGVYY29kZUNvbmZpZ0ZpbGUodGhpcy54Y29kZU9yZ0lkLCB0aGlzLnhjb2RlU2lnbmluZ0lkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB7Y21kLCBhcmdzfSA9IHRoaXMuZ2V0Q29tbWFuZChidWlsZE9ubHkpO1xuICAgIGxvZy5kZWJ1ZyhgQmVnaW5uaW5nICR7YnVpbGRPbmx5ID8gJ2J1aWxkJyA6ICd0ZXN0J30gd2l0aCBjb21tYW5kICcke2NtZH0gJHthcmdzLmpvaW4oJyAnKX0nIGAgK1xuICAgICAgICAgICAgICBgaW4gZGlyZWN0b3J5ICcke3RoaXMuYm9vdHN0cmFwUGF0aH0nYCk7XG4gICAgY29uc3QgZW52ID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYsIHtcbiAgICAgIFVTRV9QT1JUOiB0aGlzLndkYVJlbW90ZVBvcnQsXG4gICAgICBXREFfUFJPRFVDVF9CVU5ETEVfSURFTlRJRklFUjogdGhpcy51cGRhdGVkV0RBQnVuZGxlSWQgfHwgV0RBX1JVTk5FUl9CVU5ETEVfSUQsXG4gICAgfSk7XG4gICAgaWYgKHRoaXMubWpwZWdTZXJ2ZXJQb3J0KSB7XG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXBwaXVtL1dlYkRyaXZlckFnZW50L3B1bGwvMTA1XG4gICAgICBlbnYuTUpQRUdfU0VSVkVSX1BPUlQgPSB0aGlzLm1qcGVnU2VydmVyUG9ydDtcbiAgICB9XG4gICAgY29uc3QgdXBncmFkZVRpbWVzdGFtcCA9IGF3YWl0IGdldFdEQVVwZ3JhZGVUaW1lc3RhbXAodGhpcy5ib290c3RyYXBQYXRoKTtcbiAgICBpZiAodXBncmFkZVRpbWVzdGFtcCkge1xuICAgICAgZW52LlVQR1JBREVfVElNRVNUQU1QID0gdXBncmFkZVRpbWVzdGFtcDtcbiAgICB9XG4gICAgbGV0IHhjb2RlYnVpbGQgPSBuZXcgU3ViUHJvY2VzcyhjbWQsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5ib290c3RyYXBQYXRoLFxuICAgICAgZW52LFxuICAgICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgfSk7XG5cbiAgICBsZXQgbG9nWGNvZGVPdXRwdXQgPSB0aGlzLnNob3dYY29kZUxvZztcbiAgICBsb2cuZGVidWcoYE91dHB1dCBmcm9tIHhjb2RlYnVpbGQgJHtsb2dYY29kZU91dHB1dCA/ICd3aWxsJyA6ICd3aWxsIG5vdCd9IGJlIGxvZ2dlZC4gVG8gY2hhbmdlIHRoaXMsIHVzZSAnc2hvd1hjb2RlTG9nJyBkZXNpcmVkIGNhcGFiaWxpdHlgKTtcbiAgICB4Y29kZWJ1aWxkLm9uKCdvdXRwdXQnLCAoc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgIGxldCBvdXQgPSBzdGRvdXQgfHwgc3RkZXJyO1xuICAgICAgLy8gd2Ugd2FudCB0byBwdWxsIG91dCB0aGUgbG9nIGZpbGUgdGhhdCBpcyBjcmVhdGVkLCBhbmQgaGlnaGxpZ2h0IGl0XG4gICAgICAvLyBmb3IgZGlhZ25vc3RpYyBwdXJwb3Nlc1xuICAgICAgaWYgKG91dC5pbmRleE9mKCdXcml0aW5nIGRpYWdub3N0aWMgbG9nIGZvciB0ZXN0IHNlc3Npb24gdG8nKSAhPT0gLTEpIHtcbiAgICAgICAgLy8gcHVsbCBvdXQgdGhlIGZpcnN0IGxpbmUgdGhhdCBiZWdpbnMgd2l0aCB0aGUgcGF0aCBzZXBhcmF0b3JcbiAgICAgICAgLy8gd2hpY2ggKnNob3VsZCogYmUgdGhlIGxpbmUgaW5kaWNhdGluZyB0aGUgbG9nIGZpbGUgZ2VuZXJhdGVkXG4gICAgICAgIHhjb2RlYnVpbGQubG9nTG9jYXRpb24gPSBfLmZpcnN0KF8ucmVtb3ZlKG91dC50cmltKCkuc3BsaXQoJ1xcbicpLCAodikgPT4gdi5pbmRleE9mKHBhdGguc2VwKSA9PT0gMCkpO1xuICAgICAgICBsb2cuZGVidWcoYExvZyBmaWxlIGZvciB4Y29kZWJ1aWxkIHRlc3Q6ICR7eGNvZGVidWlsZC5sb2dMb2NhdGlvbn1gKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgd2UgaGF2ZSBhbiBlcnJvciB3ZSB3YW50IHRvIG91dHB1dCB0aGUgbG9nc1xuICAgICAgLy8gb3RoZXJ3aXNlIHRoZSBmYWlsdXJlIGlzIGluc2NydXRpYmxlXG4gICAgICAvLyBidXQgZG8gbm90IGxvZyBwZXJtaXNzaW9uIGVycm9ycyBmcm9tIHRyeWluZyB0byB3cml0ZSB0byBhdHRhY2htZW50cyBmb2xkZXJcbiAgICAgIGlmIChvdXQuaW5kZXhPZignRXJyb3IgRG9tYWluPScpICE9PSAtMSAmJlxuICAgICAgICAgIG91dC5pbmRleE9mKCdFcnJvciB3cml0aW5nIGF0dGFjaG1lbnQgZGF0YSB0byBmaWxlJykgPT09IC0xICYmXG4gICAgICAgICAgb3V0LmluZGV4T2YoJ0ZhaWxlZCB0byByZW1vdmUgc2NyZWVuc2hvdCBhdCBwYXRoJykgPT09IC0xKSB7XG4gICAgICAgIGxvZ1hjb2RlT3V0cHV0ID0gdHJ1ZTtcblxuICAgICAgICAvLyB0ZXJyaWJsZSBoYWNrIHRvIGhhbmRsZSBjYXNlIHdoZXJlIHhjb2RlIHJldHVybiAwIGJ1dCBpcyBmYWlsaW5nXG4gICAgICAgIHhjb2RlYnVpbGQuX3dkYV9lcnJvcl9vY2N1cnJlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChsb2dYY29kZU91dHB1dCkge1xuICAgICAgICAvLyBkbyBub3QgbG9nIHBlcm1pc3Npb24gZXJyb3JzIGZyb20gdHJ5aW5nIHRvIHdyaXRlIHRvIGF0dGFjaG1lbnRzIGZvbGRlclxuICAgICAgICBpZiAob3V0LmluZGV4T2YoJ0Vycm9yIHdyaXRpbmcgYXR0YWNobWVudCBkYXRhIHRvIGZpbGUnKSA9PT0gLTEpIHtcbiAgICAgICAgICBmb3IgKGxldCBsaW5lIG9mIG91dC5zcGxpdCgnXFxuJykpIHtcbiAgICAgICAgICAgIHhjb2RlTG9nLmluZm8obGluZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4geGNvZGVidWlsZDtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0IChidWlsZE9ubHkgPSBmYWxzZSkge1xuICAgIHRoaXMueGNvZGVidWlsZCA9IGF3YWl0IHRoaXMuY3JlYXRlU3ViUHJvY2VzcyhidWlsZE9ubHkpO1xuXG4gICAgLy8gd3JhcCB0aGUgc3RhcnQgcHJvY2VkdXJlIGluIGEgcHJvbWlzZSBzbyB0aGF0IHdlIGNhbiBjYXRjaCwgYW5kIHJlcG9ydCxcbiAgICAvLyBhbnkgc3RhcnR1cCBlcnJvcnMgdGhhdCBhcmUgdGhyb3duIGFzIGV2ZW50c1xuICAgIHJldHVybiBhd2FpdCBuZXcgQigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnhjb2RlYnVpbGQub24oJ2V4aXQnLCBhc3luYyAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgIGxvZy5pbmZvKGB4Y29kZWJ1aWxkIGV4aXRlZCB3aXRoIGNvZGUgJyR7Y29kZX0nIGFuZCBzaWduYWwgJyR7c2lnbmFsfSdgKTtcbiAgICAgICAgLy8gcHJpbnQgb3V0IHRoZSB4Y29kZWJ1aWxkIGZpbGUgaWYgdXNlcnMgaGF2ZSBhc2tlZCBmb3IgaXRcbiAgICAgICAgaWYgKHRoaXMuc2hvd1hjb2RlTG9nICYmIHRoaXMueGNvZGVidWlsZC5sb2dMb2NhdGlvbikge1xuICAgICAgICAgIHhjb2RlTG9nLmluZm8oYENvbnRlbnRzIG9mIHhjb2RlYnVpbGQgbG9nIGZpbGUgJyR7dGhpcy54Y29kZWJ1aWxkLmxvZ0xvY2F0aW9ufSc6YCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gYXdhaXQgZnMucmVhZEZpbGUodGhpcy54Y29kZWJ1aWxkLmxvZ0xvY2F0aW9uLCAndXRmOCcpO1xuICAgICAgICAgICAgZm9yIChsZXQgbGluZSBvZiBkYXRhLnNwbGl0KCdcXG4nKSkge1xuICAgICAgICAgICAgICB4Y29kZUxvZy5pbmZvKGxpbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nLmRlYnVnKGBVbmFibGUgdG8gYWNjZXNzIHhjb2RlYnVpbGQgbG9nIGZpbGU6ICcke2Vyci5tZXNzYWdlfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54Y29kZWJ1aWxkLnByb2Nlc3NFeGl0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy54Y29kZWJ1aWxkLl93ZGFfZXJyb3Jfb2NjdXJyZWQgfHwgKCFzaWduYWwgJiYgY29kZSAhPT0gMCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgeGNvZGVidWlsZCBmYWlsZWQgd2l0aCBjb2RlICR7Y29kZX1gKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW4gdGhlIGNhc2Ugb2YganVzdCBidWlsZGluZywgdGhlIHByb2Nlc3Mgd2lsbCBleGl0IGFuZCB0aGF0IGlzIG91ciBmaW5pc2hcbiAgICAgICAgaWYgKGJ1aWxkT25seSkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgc3RhcnRUaW1lID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnhjb2RlYnVpbGQuc3RhcnQoKTtcbiAgICAgICAgICB0aGlzLnhjb2RlYnVpbGQucHJvYy51bnJlZigpO1xuICAgICAgICAgIGlmICghYnVpbGRPbmx5KSB7XG4gICAgICAgICAgICBsZXQgc3RhdHVzID0gYXdhaXQgdGhpcy53YWl0Rm9yU3RhcnQoc3RhcnRUaW1lKTtcbiAgICAgICAgICAgIHJlc29sdmUoc3RhdHVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGxldCBtc2cgPSBgVW5hYmxlIHRvIHN0YXJ0IFdlYkRyaXZlckFnZW50OiAke2Vycn1gO1xuICAgICAgICAgIGxvZy5lcnJvcihtc2cpO1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH1cbiAgICAgIH0pKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyB3YWl0Rm9yU3RhcnQgKHN0YXJ0VGltZSkge1xuICAgIC8vIHRyeSB0byBjb25uZWN0IG9uY2UgZXZlcnkgMC41IHNlY29uZHMsIHVudGlsIGBsYXVuY2hUaW1lb3V0YCBpcyB1cFxuICAgIGxvZy5kZWJ1ZyhgV2FpdGluZyB1cCB0byAke3RoaXMubGF1bmNoVGltZW91dH1tcyBmb3IgV2ViRHJpdmVyQWdlbnQgdG8gc3RhcnRgKTtcbiAgICBsZXQgY3VycmVudFN0YXR1cyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGxldCByZXRyaWVzID0gcGFyc2VJbnQodGhpcy5sYXVuY2hUaW1lb3V0IC8gNTAwLCAxMCk7XG4gICAgICBhd2FpdCByZXRyeUludGVydmFsKHJldHJpZXMsIDEwMDAsIGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMueGNvZGVidWlsZC5wcm9jZXNzRXhpdGVkKSB7XG4gICAgICAgICAgLy8gdGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IgZWxzZXdoZXJlIGFuZCB3ZSBuZWVkIHRvIHNob3J0LWNpcmN1aXRcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJveHlUaW1lb3V0ID0gdGhpcy5ub1Nlc3Npb25Qcm94eS50aW1lb3V0O1xuICAgICAgICB0aGlzLm5vU2Vzc2lvblByb3h5LnRpbWVvdXQgPSAxMDAwO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGN1cnJlbnRTdGF0dXMgPSBhd2FpdCB0aGlzLm5vU2Vzc2lvblByb3h5LmNvbW1hbmQoJy9zdGF0dXMnLCAnR0VUJyk7XG4gICAgICAgICAgaWYgKGN1cnJlbnRTdGF0dXMgJiYgY3VycmVudFN0YXR1cy5pb3MgJiYgY3VycmVudFN0YXR1cy5pb3MuaXApIHtcbiAgICAgICAgICAgIHRoaXMuYWdlbnRVcmwgPSBjdXJyZW50U3RhdHVzLmlvcy5pcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbG9nLmRlYnVnKGBXZWJEcml2ZXJBZ2VudCBpbmZvcm1hdGlvbjpgKTtcbiAgICAgICAgICBsb2cuZGVidWcoSlNPTi5zdHJpbmdpZnkoY3VycmVudFN0YXR1cywgbnVsbCwgMikpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjb25uZWN0IHRvIHJ1bm5pbmcgV2ViRHJpdmVyQWdlbnQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdGhpcy5ub1Nlc3Npb25Qcm94eS50aW1lb3V0ID0gcHJveHlUaW1lb3V0O1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHRoaXMueGNvZGVidWlsZC5wcm9jZXNzRXhpdGVkKSB7XG4gICAgICAgIC8vIHRoZXJlIGhhcyBiZWVuIGFuIGVycm9yIGVsc2V3aGVyZSBhbmQgd2UgbmVlZCB0byBzaG9ydC1jaXJjdWl0XG4gICAgICAgIHJldHVybiBjdXJyZW50U3RhdHVzO1xuICAgICAgfVxuXG4gICAgICBsZXQgZW5kVGltZSA9IHByb2Nlc3MuaHJ0aW1lKHN0YXJ0VGltZSk7XG4gICAgICAvLyBtdXN0IGdldCBbcywgbnNdIGFycmF5IGludG8gbXNcbiAgICAgIGxldCBzdGFydHVwVGltZSA9IHBhcnNlSW50KChlbmRUaW1lWzBdICogMWU5ICsgZW5kVGltZVsxXSkgLyAxZTYsIDEwKTtcbiAgICAgIGxvZy5kZWJ1ZyhgV2ViRHJpdmVyQWdlbnQgc3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgYWZ0ZXIgJHtzdGFydHVwVGltZX1tc2ApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gYXQgdGhpcyBwb2ludCwgaWYgd2UgaGF2ZSBub3QgaGFkIGFueSBlcnJvcnMgZnJvbSB4Y29kZSBpdHNlbGYgKHJlcG9ydGVkXG4gICAgICAvLyBlbHNld2hlcmUpLCB3ZSBjYW4gbGV0IHRoaXMgZ28gdGhyb3VnaCBhbmQgdHJ5IHRvIGNyZWF0ZSB0aGUgc2Vzc2lvblxuICAgICAgbG9nLmRlYnVnKGVyci5tZXNzYWdlKTtcbiAgICAgIGxvZy53YXJuKGBHZXR0aW5nIHN0YXR1cyBvZiBXZWJEcml2ZXJBZ2VudCBvbiBkZXZpY2UgdGltZWQgb3V0LiBDb250aW51aW5nYCk7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50U3RhdHVzO1xuICB9XG5cbiAgYXN5bmMgcXVpdCAoKSB7XG4gICAgYXdhaXQga2lsbFByb2Nlc3MoJ3hjb2RlYnVpbGQnLCB0aGlzLnhjb2RlYnVpbGQpO1xuICB9XG59XG5cbmV4cG9ydCB7IFhjb2RlQnVpbGQgfTtcbmV4cG9ydCBkZWZhdWx0IFhjb2RlQnVpbGQ7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
