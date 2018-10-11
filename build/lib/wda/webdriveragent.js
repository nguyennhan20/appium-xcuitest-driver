'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url2 = require('url');

var _url3 = _interopRequireDefault(_url2);

var _appiumBaseDriver = require('appium-base-driver');

var _appiumSupport = require('appium-support');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _noSessionProxy = require("./no-session-proxy");

var _utils = require('./utils');

var _utils2 = require('../utils');

var _xcodebuild = require('./xcodebuild');

var _xcodebuild2 = _interopRequireDefault(_xcodebuild);

var _iproxy = require('./iproxy');

var _iproxy2 = _interopRequireDefault(_iproxy);

var _teen_process = require('teen_process');

var BOOTSTRAP_PATH = _path2['default'].resolve(__dirname, '..', '..', '..', 'WebDriverAgent');
var WDA_BUNDLE_ID = 'com.apple.test.WebDriverAgentRunner-Runner';
var WDA_LAUNCH_TIMEOUT = 60 * 1000;
var WDA_AGENT_PORT = 8100;
var WDA_BASE_URL = 'http://localhost';

var WebDriverAgent = (function () {
  function WebDriverAgent(xcodeVersion) {
    var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, WebDriverAgent);

    this.xcodeVersion = xcodeVersion;

    this.args = _lodash2['default'].clone(args);

    this.device = args.device;
    this.platformVersion = args.platformVersion;
    this.host = args.host;
    this.realDevice = !!args.realDevice;

    this.setWDAPaths(args.bootstrapPath, args.agentPath);

    this.wdaLocalPort = args.wdaLocalPort;

    this.prebuildWDA = args.prebuildWDA;

    this.webDriverAgentUrl = args.webDriverAgentUrl;

    this.started = false;

    this.wdaConnectionTimeout = args.wdaConnectionTimeout;

    this.useCarthageSsl = _lodash2['default'].isBoolean(args.useCarthageSsl) && args.useCarthageSsl;

    this.useXctestrunFile = args.useXctestrunFile;

    this.xcodebuild = new _xcodebuild2['default'](this.xcodeVersion, this.device, {
      platformVersion: this.platformVersion,
      agentPath: this.agentPath,
      bootstrapPath: this.bootstrapPath,
      realDevice: this.realDevice,
      showXcodeLog: !!args.showXcodeLog,
      xcodeConfigFile: args.xcodeConfigFile,
      xcodeOrgId: args.xcodeOrgId,
      xcodeSigningId: args.xcodeSigningId,
      keychainPath: args.keychainPath,
      keychainPassword: args.keychainPassword,
      useSimpleBuildTest: args.useSimpleBuildTest,
      usePrebuiltWDA: args.usePrebuiltWDA,
      updatedWDABundleId: args.updatedWDABundleId,
      launchTimeout: args.wdaLaunchTimeout || WDA_LAUNCH_TIMEOUT,
      wdaRemotePort: this.realDevice ? WDA_AGENT_PORT : this.wdaLocalPort || WDA_AGENT_PORT,
      useXctestrunFile: this.useXctestrunFile,
      derivedDataPath: args.derivedDataPath,
      mjpegServerPort: args.mjpegServerPort
    });
  }

  _createClass(WebDriverAgent, [{
    key: 'setWDAPaths',
    value: function setWDAPaths(bootstrapPath, agentPath) {
      // allow the user to specify a place for WDA. This is undocumented and
      // only here for the purposes of testing development of WDA
      this.bootstrapPath = bootstrapPath || BOOTSTRAP_PATH;
      _logger2['default'].info('Using WDA path: \'' + this.bootstrapPath + '\'');

      // for backward compatibility we need to be able to specify agentPath too
      this.agentPath = agentPath || _path2['default'].resolve(this.bootstrapPath, 'WebDriverAgent.xcodeproj');
      _logger2['default'].info('Using WDA agent: \'' + this.agentPath + '\'');
    }
  }, {
    key: 'cleanupObsoleteProcesses',
    value: function cleanupObsoleteProcesses() {
      var pids;
      return _regeneratorRuntime.async(function cleanupObsoleteProcesses$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap((0, _utils2.getPIDsListeningOnPort)(this.url.port, function (cmdLine) {
              return (cmdLine.includes('/WebDriverAgentRunner') || cmdLine.includes('/iproxy')) && !cmdLine.toLowerCase().includes(_this.device.udid.toLowerCase());
            }));

          case 2:
            pids = context$2$0.sent;

            if (pids.length) {
              context$2$0.next = 6;
              break;
            }

            _logger2['default'].debug('No obsolete cached processes from previous WDA sessions ' + ('listening on port ' + this.url.port + ' have been found'));
            return context$2$0.abrupt('return');

          case 6:

            _logger2['default'].info('Detected ' + pids.length + ' obsolete cached process' + (pids.length === 1 ? '' : 'es') + ' ' + 'from previous WDA sessions. Cleaning up...');
            context$2$0.prev = 7;
            context$2$0.next = 10;
            return _regeneratorRuntime.awrap((0, _teen_process.exec)('kill', pids));

          case 10:
            context$2$0.next = 15;
            break;

          case 12:
            context$2$0.prev = 12;
            context$2$0.t0 = context$2$0['catch'](7);

            _logger2['default'].warn('Failed to kill obsolete cached process' + (pids.length === 1 ? '' : 'es') + ' \'' + pids + '\'. ' + ('Original error: ' + context$2$0.t0.message));

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[7, 12]]);
    }

    /**
     * Return boolean if WDA is running or not
     * @return {boolean} True if WDA is running
     * @throws {Error} If there was invalid response code or body
     */
  }, {
    key: 'isRunning',
    value: function isRunning() {
      return _regeneratorRuntime.async(function isRunning$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.getStatus());

          case 2:
            return context$2$0.abrupt('return', !!context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Return current running WDA's status like below
     * {
     *   "state": "success",
     *   "os": {
     *     "name": "iOS",
     *     "version": "11.4",
     *     "sdkVersion": "11.3"
     *   },
     *   "ios": {
     *     "simulatorVersion": "11.4",
     *     "ip": "172.254.99.34"
     *   },
     *   "build": {
     *     "time": "Jun 24 2018 17:08:21",
     *     "productBundleIdentifier": "com.facebook.WebDriverAgentRunner"
     *   }
     * }
     *
     * @return {?object} State Object
     * @throws {Error} If there was invalid response code or body
     */
  }, {
    key: 'getStatus',
    value: function getStatus() {
      var noSessionProxy;
      return _regeneratorRuntime.async(function getStatus$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            noSessionProxy = new _noSessionProxy.NoSessionProxy({
              server: this.url.hostname,
              port: this.url.port,
              base: '',
              timeout: 3000
            });
            context$2$0.prev = 1;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(noSessionProxy.command('/status', 'GET'));

          case 4:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 7:
            context$2$0.prev = 7;
            context$2$0.t0 = context$2$0['catch'](1);

            _logger2['default'].debug('WDA is not listening at \'' + this.url.href + '\'');
            return context$2$0.abrupt('return', null);

          case 11:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 7]]);
    }
  }, {
    key: 'uninstall',
    value: function uninstall() {
      return _regeneratorRuntime.async(function uninstall$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _logger2['default'].debug('Removing WDA application from device');
            context$2$0.prev = 1;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.device.removeApp(WDA_BUNDLE_ID));

          case 4:
            context$2$0.next = 9;
            break;

          case 6:
            context$2$0.prev = 6;
            context$2$0.t0 = context$2$0['catch'](1);

            _logger2['default'].warn('WebDriverAgent uninstall failed. Perhaps, it is already uninstalled? Original error: ' + JSON.stringify(context$2$0.t0));

          case 9:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 6]]);
    }
  }, {
    key: 'launch',
    value: function launch(sessionId) {
      var didPerformUpgrade;
      return _regeneratorRuntime.async(function launch$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!this.webDriverAgentUrl) {
              context$2$0.next = 5;
              break;
            }

            _logger2['default'].info('Using provided WebdriverAgent at \'' + this.webDriverAgentUrl + '\'');
            this.url = this.webDriverAgentUrl;
            this.setupProxies(sessionId);
            return context$2$0.abrupt('return');

          case 5:

            _logger2['default'].info('Launching WebDriverAgent on the device');

            this.setupProxies(sessionId);

            context$2$0.t0 = !this.useXctestrunFile;

            if (!context$2$0.t0) {
              context$2$0.next = 12;
              break;
            }

            context$2$0.next = 11;
            return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(this.agentPath));

          case 11:
            context$2$0.t0 = !context$2$0.sent;

          case 12:
            if (!context$2$0.t0) {
              context$2$0.next = 14;
              break;
            }

            throw new Error('Trying to use WebDriverAgent project at \'' + this.agentPath + '\' but the ' + 'file does not exist');

          case 14:
            if (this.useXctestrunFile) {
              context$2$0.next = 21;
              break;
            }

            context$2$0.next = 17;
            return _regeneratorRuntime.awrap((0, _utils.checkForDependencies)(this.bootstrapPath, this.useCarthageSsl));

          case 17:
            didPerformUpgrade = context$2$0.sent;

            if (!didPerformUpgrade) {
              context$2$0.next = 21;
              break;
            }

            context$2$0.next = 21;
            return _regeneratorRuntime.awrap(this.xcodebuild.cleanProject());

          case 21:
            context$2$0.next = 23;
            return _regeneratorRuntime.awrap((0, _utils2.resetXCTestProcesses)(this.device.udid, !this.realDevice, { wdaLocalPort: this.url.port }));

          case 23:
            if (!this.realDevice) {
              context$2$0.next = 27;
              break;
            }

            this.iproxy = new _iproxy2['default'](this.device.udid, this.url.port, WDA_AGENT_PORT);
            context$2$0.next = 27;
            return _regeneratorRuntime.awrap(this.iproxy.start());

          case 27:
            context$2$0.next = 29;
            return _regeneratorRuntime.awrap(this.xcodebuild.init(this.noSessionProxy));

          case 29:
            if (!this.prebuildWDA) {
              context$2$0.next = 32;
              break;
            }

            context$2$0.next = 32;
            return _regeneratorRuntime.awrap(this.xcodebuild.prebuild());

          case 32:
            context$2$0.next = 34;
            return _regeneratorRuntime.awrap(this.xcodebuild.start());

          case 34:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 35:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'setupProxies',
    value: function setupProxies(sessionId) {
      var proxyOpts = {
        server: this.url.hostname,
        port: this.url.port,
        base: '',
        timeout: this.wdaConnectionTimeout
      };

      this.jwproxy = new _appiumBaseDriver.JWProxy(proxyOpts);
      this.jwproxy.sessionId = sessionId;
      this.proxyReqRes = this.jwproxy.proxyReqRes.bind(this.jwproxy);

      this.noSessionProxy = new _noSessionProxy.NoSessionProxy(proxyOpts);
      this.noSessionProxyReqRes = this.noSessionProxy.proxyReqRes.bind(this.noSessionProxy);
    }
  }, {
    key: 'quit',
    value: function quit() {
      return _regeneratorRuntime.async(function quit$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _logger2['default'].info('Shutting down sub-processes');

            if (!this.iproxy) {
              context$2$0.next = 4;
              break;
            }

            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.iproxy.quit());

          case 4:
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.xcodebuild.quit());

          case 6:
            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(this.xcodebuild.reset());

          case 8:

            if (this.jwproxy) {
              this.jwproxy.sessionId = null;
            }

            this.started = false;

            if (!this.args.webDriverAgentUrl) {
              // if we populated the url ourselves (during `setupCaching` call, for instance)
              // then clean that up. If the url was supplied, we want to keep it
              this.webDriverAgentUrl = null;
            }

          case 11:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'retrieveDerivedDataPath',
    value: function retrieveDerivedDataPath() {
      return _regeneratorRuntime.async(function retrieveDerivedDataPath$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.xcodebuild.retrieveDerivedDataPath());

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Reuse running WDA if it has the same bundle id with updatedWDABundleId.
     * Or reuse it if it has the default id without updatedWDABundleId.
     * Uninstall it if the method faces an exception for the above situation.
     *
     * @param {string} updatedWDABundleId BundleId you'd like to use
     */
  }, {
    key: 'setupCaching',
    value: function setupCaching(updatedWDABundleId) {
      var status, _status$build, productBundleIdentifier, upgradedAt, actualUpgradeTimestamp, message;

      return _regeneratorRuntime.async(function setupCaching$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.getStatus());

          case 2:
            status = context$2$0.sent;

            if (!(!status || !status.build)) {
              context$2$0.next = 6;
              break;
            }

            _logger2['default'].debug('WDA is currently not running. There is nothing to cache');
            return context$2$0.abrupt('return');

          case 6:
            _status$build = status.build;
            productBundleIdentifier = _status$build.productBundleIdentifier;
            upgradedAt = _status$build.upgradedAt;

            if (!(_appiumSupport.util.hasValue(productBundleIdentifier) && _appiumSupport.util.hasValue(updatedWDABundleId) && updatedWDABundleId !== productBundleIdentifier)) {
              context$2$0.next = 14;
              break;
            }

            _logger2['default'].info('Will uninstall running WDA since it has different bundle id. The actual value is \'' + productBundleIdentifier + '\'.');
            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(this.uninstall());

          case 13:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 14:
            if (!(_appiumSupport.util.hasValue(productBundleIdentifier) && !_appiumSupport.util.hasValue(updatedWDABundleId) && _utils.WDA_RUNNER_BUNDLE_ID !== productBundleIdentifier)) {
              context$2$0.next = 19;
              break;
            }

            _logger2['default'].info('Will uninstall running WDA since its bundle id is not equal to the default value ' + _utils.WDA_RUNNER_BUNDLE_ID);
            context$2$0.next = 18;
            return _regeneratorRuntime.awrap(this.uninstall());

          case 18:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 19:
            context$2$0.next = 21;
            return _regeneratorRuntime.awrap((0, _utils.getWDAUpgradeTimestamp)(this.bootstrapPath));

          case 21:
            actualUpgradeTimestamp = context$2$0.sent;

            _logger2['default'].debug('Upgrade timestamp of the currently bundled WDA: ' + actualUpgradeTimestamp);
            _logger2['default'].debug('Upgrade timestamp of the WDA on the device: ' + upgradedAt);

            if (!(actualUpgradeTimestamp && upgradedAt && _lodash2['default'].toLower('' + actualUpgradeTimestamp) !== _lodash2['default'].toLower('' + upgradedAt))) {
              context$2$0.next = 29;
              break;
            }

            _logger2['default'].info('Will uninstall running WDA since it has different version in comparison to the one ' + ('which is bundled with appium-xcuitest-driver module (' + actualUpgradeTimestamp + ' != ' + upgradedAt + ')'));
            context$2$0.next = 28;
            return _regeneratorRuntime.awrap(this.uninstall());

          case 28:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 29:
            message = _appiumSupport.util.hasValue(productBundleIdentifier) ? 'Will reuse previously cached WDA instance at \'' + this.url.href + '\' with \'' + productBundleIdentifier + '\'' : 'Will reuse previously cached WDA instance at \'' + this.url.href + '\'';

            _logger2['default'].info(message + '. Set the wdaLocalPort capability to a value different from ' + this.url.port + ' if this is an undesired behavior.');
            this.webDriverAgentUrl = this.url.href;

          case 32:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'quitAndUninstall',
    value: function quitAndUninstall() {
      return _regeneratorRuntime.async(function quitAndUninstall$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.quit());

          case 2:
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.uninstall());

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'url',
    get: function get() {
      if (!this._url) {
        var port = this.wdaLocalPort || WDA_AGENT_PORT;
        this._url = _url3['default'].parse(WDA_BASE_URL + ':' + port);
      }
      return this._url;
    },
    set: function set(_url) {
      this._url = _url3['default'].parse(_url);
    }
  }, {
    key: 'fullyStarted',
    get: function get() {
      return this.started;
    },
    set: function set() {
      var started = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      // before WDA is started we expect errors from iproxy, since it is not
      // communicating with anything yet
      this.started = started;
      if (this.iproxy) {
        this.iproxy.expectIProxyErrors = !started;
      }
    }
  }]);

  return WebDriverAgent;
})();

exports['default'] = WebDriverAgent;
exports.WebDriverAgent = WebDriverAgent;
exports.WDA_BUNDLE_ID = WDA_BUNDLE_ID;
exports.BOOTSTRAP_PATH = BOOTSTRAP_PATH;

// make sure that the WDA dependencies have been built

// Only perform the cleanup after WDA upgrade

// We need to provide WDA local port, because it might be occupied with
// iproxy instance initiated by some preceeding run with a real device
// (iproxy instances are not killed on session termination by default)

// Start the xcodebuild process
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi93ZGEvd2ViZHJpdmVyYWdlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBQWMsUUFBUTs7OztvQkFDTCxNQUFNOzs7O29CQUNQLEtBQUs7Ozs7Z0NBQ0csb0JBQW9COzs2QkFDbkIsZ0JBQWdCOztzQkFDekIsV0FBVzs7Ozs4QkFDSSxvQkFBb0I7O3FCQUNnQyxTQUFTOztzQkFDL0IsVUFBVTs7MEJBQ2hELGNBQWM7Ozs7c0JBQ2xCLFVBQVU7Ozs7NEJBQ1IsY0FBYzs7QUFHbkMsSUFBTSxjQUFjLEdBQUcsa0JBQUssT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ25GLElBQU0sYUFBYSxHQUFHLDRDQUE0QyxDQUFDO0FBQ25FLElBQU0sa0JBQWtCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNyQyxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDNUIsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUM7O0lBR2xDLGNBQWM7QUFDTixXQURSLGNBQWMsQ0FDTCxZQUFZLEVBQWE7UUFBWCxJQUFJLHlEQUFHLEVBQUU7OzBCQURoQyxjQUFjOztBQUVoQixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzs7QUFFakMsUUFBSSxDQUFDLElBQUksR0FBRyxvQkFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTFCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUMxQixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7QUFDNUMsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7O0FBRXBDLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEs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QUFJLENBQUMsSUFBSSxHQUFHLGlCQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM3Qjs7O1NBRWdCLGVBQUc7QUFDbEIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3JCO1NBRWdCLGVBQWtCO1VBQWpCLE9BQU8seURBQUcsS0FBSzs7OztBQUcvQixVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixZQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLENBQUMsT0FBTyxDQUFDO09BQzNDO0tBQ0Y7OztTQWpQRyxjQUFjOzs7cUJBd1NMLGNBQWM7UUFDcEIsY0FBYyxHQUFkLGNBQWM7UUFBRSxhQUFhLEdBQWIsYUFBYTtRQUFFLGNBQWMsR0FBZCxjQUFjIiwiZmlsZSI6ImxpYi93ZGEvd2ViZHJpdmVyYWdlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgeyBKV1Byb3h5IH0gZnJvbSAnYXBwaXVtLWJhc2UtZHJpdmVyJztcbmltcG9ydCB7IGZzLCB1dGlsIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgTm9TZXNzaW9uUHJveHkgfSBmcm9tIFwiLi9uby1zZXNzaW9uLXByb3h5XCI7XG5pbXBvcnQgeyBjaGVja0ZvckRlcGVuZGVuY2llcywgV0RBX1JVTk5FUl9CVU5ETEVfSUQsIGdldFdEQVVwZ3JhZGVUaW1lc3RhbXAgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHJlc2V0WENUZXN0UHJvY2Vzc2VzLCBnZXRQSURzTGlzdGVuaW5nT25Qb3J0IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IFhjb2RlQnVpbGQgZnJvbSAnLi94Y29kZWJ1aWxkJztcbmltcG9ydCBpUHJveHkgZnJvbSAnLi9pcHJveHknO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5cblxuY29uc3QgQk9PVFNUUkFQX1BBVEggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnLi4nLCAnV2ViRHJpdmVyQWdlbnQnKTtcbmNvbnN0IFdEQV9CVU5ETEVfSUQgPSAnY29tLmFwcGxlLnRlc3QuV2ViRHJpdmVyQWdlbnRSdW5uZXItUnVubmVyJztcbmNvbnN0IFdEQV9MQVVOQ0hfVElNRU9VVCA9IDYwICogMTAwMDtcbmNvbnN0IFdEQV9BR0VOVF9QT1JUID0gODEwMDtcbmNvbnN0IFdEQV9CQVNFX1VSTCA9ICdodHRwOi8vbG9jYWxob3N0JztcblxuXG5jbGFzcyBXZWJEcml2ZXJBZ2VudCB7XG4gIGNvbnN0cnVjdG9yICh4Y29kZVZlcnNpb24sIGFyZ3MgPSB7fSkge1xuICAgIHRoaXMueGNvZGVWZXJzaW9uID0geGNvZGVWZXJzaW9uO1xuXG4gICAgdGhpcy5hcmdzID0gXy5jbG9uZShhcmdzKTtcblxuICAgIHRoaXMuZGV2aWNlID0gYXJncy5kZXZpY2U7XG4gICAgdGhpcy5wbGF0Zm9ybVZlcnNpb24gPSBhcmdzLnBsYXRmb3JtVmVyc2lvbjtcbiAgICB0aGlzLmhvc3QgPSBhcmdzLmhvc3Q7XG4gICAgdGhpcy5yZWFsRGV2aWNlID0gISFhcmdzLnJlYWxEZXZpY2U7XG5cbiAgICB0aGlzLnNldFdEQVBhdGhzKGFyZ3MuYm9vdHN0cmFwUGF0aCwgYXJncy5hZ2VudFBhdGgpO1xuXG4gICAgdGhpcy53ZGFMb2NhbFBvcnQgPSBhcmdzLndkYUxvY2FsUG9ydDtcblxuICAgIHRoaXMucHJlYnVpbGRXREEgPSBhcmdzLnByZWJ1aWxkV0RBO1xuXG4gICAgdGhpcy53ZWJEcml2ZXJBZ2VudFVybCA9IGFyZ3Mud2ViRHJpdmVyQWdlbnRVcmw7XG5cbiAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMud2RhQ29ubmVjdGlvblRpbWVvdXQgPSBhcmdzLndkYUNvbm5lY3Rpb25UaW1lb3V0O1xuXG4gICAgdGhpcy51c2VDYXJ0aGFnZVNzbCA9IF8uaXNCb29sZWFuKGFyZ3MudXNlQ2FydGhhZ2VTc2wpICYmIGFyZ3MudXNlQ2FydGhhZ2VTc2w7XG5cbiAgICB0aGlzLnVzZVhjdGVzdHJ1bkZpbGUgPSBhcmdzLnVzZVhjdGVzdHJ1bkZpbGU7XG5cbiAgICB0aGlzLnhjb2RlYnVpbGQgPSBuZXcgWGNvZGVCdWlsZCh0aGlzLnhjb2RlVmVyc2lvbiwgdGhpcy5kZXZpY2UsIHtcbiAgICAgIHBsYXRmb3JtVmVyc2lvbjogdGhpcy5wbGF0Zm9ybVZlcnNpb24sXG4gICAgICBhZ2VudFBhdGg6IHRoaXMuYWdlbnRQYXRoLFxuICAgICAgYm9vdHN0cmFwUGF0aDogdGhpcy5ib290c3RyYXBQYXRoLFxuICAgICAgcmVhbERldmljZTogdGhpcy5yZWFsRGV2aWNlLFxuICAgICAgc2hvd1hjb2RlTG9nOiAhIWFyZ3Muc2hvd1hjb2RlTG9nLFxuICAgICAgeGNvZGVDb25maWdGaWxlOiBhcmdzLnhjb2RlQ29uZmlnRmlsZSxcbiAgICAgIHhjb2RlT3JnSWQ6IGFyZ3MueGNvZGVPcmdJZCxcbiAgICAgIHhjb2RlU2lnbmluZ0lkOiBhcmdzLnhjb2RlU2lnbmluZ0lkLFxuICAgICAga2V5Y2hhaW5QYXRoOiBhcmdzLmtleWNoYWluUGF0aCxcbiAgICAgIGtleWNoYWluUGFzc3dvcmQ6IGFyZ3Mua2V5Y2hhaW5QYXNzd29yZCxcbiAgICAgIHVzZVNpbXBsZUJ1aWxkVGVzdDogYXJncy51c2VTaW1wbGVCdWlsZFRlc3QsXG4gICAgICB1c2VQcmVidWlsdFdEQTogYXJncy51c2VQcmVidWlsdFdEQSxcbiAgICAgIHVwZGF0ZWRXREFCdW5kbGVJZDogYXJncy51cGRhdGVkV0RBQnVuZGxlSWQsXG4gICAgICBsYXVuY2hUaW1lb3V0OiBhcmdzLndkYUxhdW5jaFRpbWVvdXQgfHwgV0RBX0xBVU5DSF9USU1FT1VULFxuICAgICAgd2RhUmVtb3RlUG9ydDogdGhpcy5yZWFsRGV2aWNlID8gV0RBX0FHRU5UX1BPUlQgOiAodGhpcy53ZGFMb2NhbFBvcnQgfHwgV0RBX0FHRU5UX1BPUlQpLFxuICAgICAgdXNlWGN0ZXN0cnVuRmlsZTogdGhpcy51c2VYY3Rlc3RydW5GaWxlLFxuICAgICAgZGVyaXZlZERhdGFQYXRoOiBhcmdzLmRlcml2ZWREYXRhUGF0aCxcbiAgICAgIG1qcGVnU2VydmVyUG9ydDogYXJncy5tanBlZ1NlcnZlclBvcnQsXG4gICAgfSk7XG4gIH1cblxuICBzZXRXREFQYXRocyAoYm9vdHN0cmFwUGF0aCwgYWdlbnRQYXRoKSB7XG4gICAgLy8gYWxsb3cgdGhlIHVzZXIgdG8gc3BlY2lmeSBhIHBsYWNlIGZvciBXREEuIFRoaXMgaXMgdW5kb2N1bWVudGVkIGFuZFxuICAgIC8vIG9ubHkgaGVyZSBmb3IgdGhlIHB1cnBvc2VzIG9mIHRlc3RpbmcgZGV2ZWxvcG1lbnQgb2YgV0RBXG4gICAgdGhpcy5ib290c3RyYXBQYXRoID0gYm9vdHN0cmFwUGF0aCB8fCBCT09UU1RSQVBfUEFUSDtcbiAgICBsb2cuaW5mbyhgVXNpbmcgV0RBIHBhdGg6ICcke3RoaXMuYm9vdHN0cmFwUGF0aH0nYCk7XG5cbiAgICAvLyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gc3BlY2lmeSBhZ2VudFBhdGggdG9vXG4gICAgdGhpcy5hZ2VudFBhdGggPSBhZ2VudFBhdGggfHwgcGF0aC5yZXNvbHZlKHRoaXMuYm9vdHN0cmFwUGF0aCwgJ1dlYkRyaXZlckFnZW50Lnhjb2RlcHJvaicpO1xuICAgIGxvZy5pbmZvKGBVc2luZyBXREEgYWdlbnQ6ICcke3RoaXMuYWdlbnRQYXRofSdgKTtcbiAgfVxuXG4gIGFzeW5jIGNsZWFudXBPYnNvbGV0ZVByb2Nlc3NlcyAoKSB7XG4gICAgY29uc3QgcGlkcyA9IGF3YWl0IGdldFBJRHNMaXN0ZW5pbmdPblBvcnQodGhpcy51cmwucG9ydCxcbiAgICAgIChjbWRMaW5lKSA9PiAoY21kTGluZS5pbmNsdWRlcygnL1dlYkRyaXZlckFnZW50UnVubmVyJykgfHwgY21kTGluZS5pbmNsdWRlcygnL2lwcm94eScpKSAmJlxuICAgICAgICAhY21kTGluZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHRoaXMuZGV2aWNlLnVkaWQudG9Mb3dlckNhc2UoKSkpO1xuICAgIGlmICghcGlkcy5sZW5ndGgpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgTm8gb2Jzb2xldGUgY2FjaGVkIHByb2Nlc3NlcyBmcm9tIHByZXZpb3VzIFdEQSBzZXNzaW9ucyBgICtcbiAgICAgICAgICAgICAgICBgbGlzdGVuaW5nIG9uIHBvcnQgJHt0aGlzLnVybC5wb3J0fSBoYXZlIGJlZW4gZm91bmRgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2cuaW5mbyhgRGV0ZWN0ZWQgJHtwaWRzLmxlbmd0aH0gb2Jzb2xldGUgY2FjaGVkIHByb2Nlc3Mke3BpZHMubGVuZ3RoID09PSAxID8gJycgOiAnZXMnfSBgICtcbiAgICAgICAgICAgICBgZnJvbSBwcmV2aW91cyBXREEgc2Vzc2lvbnMuIENsZWFuaW5nIHVwLi4uYCk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGV4ZWMoJ2tpbGwnLCBwaWRzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2cud2FybihgRmFpbGVkIHRvIGtpbGwgb2Jzb2xldGUgY2FjaGVkIHByb2Nlc3Mke3BpZHMubGVuZ3RoID09PSAxID8gJycgOiAnZXMnfSAnJHtwaWRzfScuIGAgK1xuICAgICAgICAgICAgICAgYE9yaWdpbmFsIGVycm9yOiAke2UubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGJvb2xlYW4gaWYgV0RBIGlzIHJ1bm5pbmcgb3Igbm90XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgV0RBIGlzIHJ1bm5pbmdcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZXJlIHdhcyBpbnZhbGlkIHJlc3BvbnNlIGNvZGUgb3IgYm9keVxuICAgKi9cbiAgYXN5bmMgaXNSdW5uaW5nICgpIHtcbiAgICByZXR1cm4gISEoYXdhaXQgdGhpcy5nZXRTdGF0dXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGN1cnJlbnQgcnVubmluZyBXREEncyBzdGF0dXMgbGlrZSBiZWxvd1xuICAgKiB7XG4gICAqICAgXCJzdGF0ZVwiOiBcInN1Y2Nlc3NcIixcbiAgICogICBcIm9zXCI6IHtcbiAgICogICAgIFwibmFtZVwiOiBcImlPU1wiLFxuICAgKiAgICAgXCJ2ZXJzaW9uXCI6IFwiMTEuNFwiLFxuICAgKiAgICAgXCJzZGtWZXJzaW9uXCI6IFwiMTEuM1wiXG4gICAqICAgfSxcbiAgICogICBcImlvc1wiOiB7XG4gICAqICAgICBcInNpbXVsYXRvclZlcnNpb25cIjogXCIxMS40XCIsXG4gICAqICAgICBcImlwXCI6IFwiMTcyLjI1NC45OS4zNFwiXG4gICAqICAgfSxcbiAgICogICBcImJ1aWxkXCI6IHtcbiAgICogICAgIFwidGltZVwiOiBcIkp1biAyNCAyMDE4IDE3OjA4OjIxXCIsXG4gICAqICAgICBcInByb2R1Y3RCdW5kbGVJZGVudGlmaWVyXCI6IFwiY29tLmZhY2Vib29rLldlYkRyaXZlckFnZW50UnVubmVyXCJcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQHJldHVybiB7P29iamVjdH0gU3RhdGUgT2JqZWN0XG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGVyZSB3YXMgaW52YWxpZCByZXNwb25zZSBjb2RlIG9yIGJvZHlcbiAgICovXG4gIGFzeW5jIGdldFN0YXR1cyAoKSB7XG4gICAgY29uc3Qgbm9TZXNzaW9uUHJveHkgPSBuZXcgTm9TZXNzaW9uUHJveHkoe1xuICAgICAgc2VydmVyOiB0aGlzLnVybC5ob3N0bmFtZSxcbiAgICAgIHBvcnQ6IHRoaXMudXJsLnBvcnQsXG4gICAgICBiYXNlOiAnJyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBub1Nlc3Npb25Qcm94eS5jb21tYW5kKCcvc3RhdHVzJywgJ0dFVCcpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLmRlYnVnKGBXREEgaXMgbm90IGxpc3RlbmluZyBhdCAnJHt0aGlzLnVybC5ocmVmfSdgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVuaW5zdGFsbCAoKSB7XG4gICAgbG9nLmRlYnVnKGBSZW1vdmluZyBXREEgYXBwbGljYXRpb24gZnJvbSBkZXZpY2VgKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5kZXZpY2UucmVtb3ZlQXBwKFdEQV9CVU5ETEVfSUQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZy53YXJuKGBXZWJEcml2ZXJBZ2VudCB1bmluc3RhbGwgZmFpbGVkLiBQZXJoYXBzLCBpdCBpcyBhbHJlYWR5IHVuaW5zdGFsbGVkPyBPcmlnaW5hbCBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsYXVuY2ggKHNlc3Npb25JZCkge1xuICAgIGlmICh0aGlzLndlYkRyaXZlckFnZW50VXJsKSB7XG4gICAgICBsb2cuaW5mbyhgVXNpbmcgcHJvdmlkZWQgV2ViZHJpdmVyQWdlbnQgYXQgJyR7dGhpcy53ZWJEcml2ZXJBZ2VudFVybH0nYCk7XG4gICAgICB0aGlzLnVybCA9IHRoaXMud2ViRHJpdmVyQWdlbnRVcmw7XG4gICAgICB0aGlzLnNldHVwUHJveGllcyhzZXNzaW9uSWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxvZy5pbmZvKCdMYXVuY2hpbmcgV2ViRHJpdmVyQWdlbnQgb24gdGhlIGRldmljZScpO1xuXG4gICAgdGhpcy5zZXR1cFByb3hpZXMoc2Vzc2lvbklkKTtcblxuICAgIGlmICghdGhpcy51c2VYY3Rlc3RydW5GaWxlICYmICFhd2FpdCBmcy5leGlzdHModGhpcy5hZ2VudFBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRyeWluZyB0byB1c2UgV2ViRHJpdmVyQWdlbnQgcHJvamVjdCBhdCAnJHt0aGlzLmFnZW50UGF0aH0nIGJ1dCB0aGUgYCArXG4gICAgICAgICAgICAgICAgICAgICAgJ2ZpbGUgZG9lcyBub3QgZXhpc3QnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudXNlWGN0ZXN0cnVuRmlsZSkge1xuICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIFdEQSBkZXBlbmRlbmNpZXMgaGF2ZSBiZWVuIGJ1aWx0XG4gICAgICBjb25zdCBkaWRQZXJmb3JtVXBncmFkZSA9IGF3YWl0IGNoZWNrRm9yRGVwZW5kZW5jaWVzKHRoaXMuYm9vdHN0cmFwUGF0aCwgdGhpcy51c2VDYXJ0aGFnZVNzbCk7XG4gICAgICBpZiAoZGlkUGVyZm9ybVVwZ3JhZGUpIHtcbiAgICAgICAgLy8gT25seSBwZXJmb3JtIHRoZSBjbGVhbnVwIGFmdGVyIFdEQSB1cGdyYWRlXG4gICAgICAgIGF3YWl0IHRoaXMueGNvZGVidWlsZC5jbGVhblByb2plY3QoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgbmVlZCB0byBwcm92aWRlIFdEQSBsb2NhbCBwb3J0LCBiZWNhdXNlIGl0IG1pZ2h0IGJlIG9jY3VwaWVkIHdpdGhcbiAgICAvLyBpcHJveHkgaW5zdGFuY2UgaW5pdGlhdGVkIGJ5IHNvbWUgcHJlY2VlZGluZyBydW4gd2l0aCBhIHJlYWwgZGV2aWNlXG4gICAgLy8gKGlwcm94eSBpbnN0YW5jZXMgYXJlIG5vdCBraWxsZWQgb24gc2Vzc2lvbiB0ZXJtaW5hdGlvbiBieSBkZWZhdWx0KVxuICAgIGF3YWl0IHJlc2V0WENUZXN0UHJvY2Vzc2VzKHRoaXMuZGV2aWNlLnVkaWQsICF0aGlzLnJlYWxEZXZpY2UsIHt3ZGFMb2NhbFBvcnQ6IHRoaXMudXJsLnBvcnR9KTtcblxuICAgIGlmICh0aGlzLnJlYWxEZXZpY2UpIHtcbiAgICAgIHRoaXMuaXByb3h5ID0gbmV3IGlQcm94eSh0aGlzLmRldmljZS51ZGlkLCB0aGlzLnVybC5wb3J0LCBXREFfQUdFTlRfUE9SVCk7XG4gICAgICBhd2FpdCB0aGlzLmlwcm94eS5zdGFydCgpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMueGNvZGVidWlsZC5pbml0KHRoaXMubm9TZXNzaW9uUHJveHkpO1xuXG4gICAgLy8gU3RhcnQgdGhlIHhjb2RlYnVpbGQgcHJvY2Vzc1xuICAgIGlmICh0aGlzLnByZWJ1aWxkV0RBKSB7XG4gICAgICBhd2FpdCB0aGlzLnhjb2RlYnVpbGQucHJlYnVpbGQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMueGNvZGVidWlsZC5zdGFydCgpO1xuICB9XG5cbiAgc2V0dXBQcm94aWVzIChzZXNzaW9uSWQpIHtcbiAgICBjb25zdCBwcm94eU9wdHMgPSB7XG4gICAgICBzZXJ2ZXI6IHRoaXMudXJsLmhvc3RuYW1lLFxuICAgICAgcG9ydDogdGhpcy51cmwucG9ydCxcbiAgICAgIGJhc2U6ICcnLFxuICAgICAgdGltZW91dDogdGhpcy53ZGFDb25uZWN0aW9uVGltZW91dCxcbiAgICB9O1xuXG4gICAgdGhpcy5qd3Byb3h5ID0gbmV3IEpXUHJveHkocHJveHlPcHRzKTtcbiAgICB0aGlzLmp3cHJveHkuc2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICAgIHRoaXMucHJveHlSZXFSZXMgPSB0aGlzLmp3cHJveHkucHJveHlSZXFSZXMuYmluZCh0aGlzLmp3cHJveHkpO1xuXG4gICAgdGhpcy5ub1Nlc3Npb25Qcm94eSA9IG5ldyBOb1Nlc3Npb25Qcm94eShwcm94eU9wdHMpO1xuICAgIHRoaXMubm9TZXNzaW9uUHJveHlSZXFSZXMgPSB0aGlzLm5vU2Vzc2lvblByb3h5LnByb3h5UmVxUmVzLmJpbmQodGhpcy5ub1Nlc3Npb25Qcm94eSk7XG4gIH1cblxuICBhc3luYyBxdWl0ICgpIHtcbiAgICBsb2cuaW5mbygnU2h1dHRpbmcgZG93biBzdWItcHJvY2Vzc2VzJyk7XG5cbiAgICBpZiAodGhpcy5pcHJveHkpIHtcbiAgICAgIGF3YWl0IHRoaXMuaXByb3h5LnF1aXQoKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnhjb2RlYnVpbGQucXVpdCgpO1xuICAgIGF3YWl0IHRoaXMueGNvZGVidWlsZC5yZXNldCgpO1xuXG4gICAgaWYgKHRoaXMuandwcm94eSkge1xuICAgICAgdGhpcy5qd3Byb3h5LnNlc3Npb25JZCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMuYXJncy53ZWJEcml2ZXJBZ2VudFVybCkge1xuICAgICAgLy8gaWYgd2UgcG9wdWxhdGVkIHRoZSB1cmwgb3Vyc2VsdmVzIChkdXJpbmcgYHNldHVwQ2FjaGluZ2AgY2FsbCwgZm9yIGluc3RhbmNlKVxuICAgICAgLy8gdGhlbiBjbGVhbiB0aGF0IHVwLiBJZiB0aGUgdXJsIHdhcyBzdXBwbGllZCwgd2Ugd2FudCB0byBrZWVwIGl0XG4gICAgICB0aGlzLndlYkRyaXZlckFnZW50VXJsID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgdXJsICgpIHtcbiAgICBpZiAoIXRoaXMuX3VybCkge1xuICAgICAgbGV0IHBvcnQgPSB0aGlzLndkYUxvY2FsUG9ydCB8fCBXREFfQUdFTlRfUE9SVDtcbiAgICAgIHRoaXMuX3VybCA9IHVybC5wYXJzZShgJHtXREFfQkFTRV9VUkx9OiR7cG9ydH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3VybDtcbiAgfVxuXG4gIHNldCB1cmwgKF91cmwpIHtcbiAgICB0aGlzLl91cmwgPSB1cmwucGFyc2UoX3VybCk7XG4gIH1cblxuICBnZXQgZnVsbHlTdGFydGVkICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydGVkO1xuICB9XG5cbiAgc2V0IGZ1bGx5U3RhcnRlZCAoc3RhcnRlZCA9IGZhbHNlKSB7XG4gICAgLy8gYmVmb3JlIFdEQSBpcyBzdGFydGVkIHdlIGV4cGVjdCBlcnJvcnMgZnJvbSBpcHJveHksIHNpbmNlIGl0IGlzIG5vdFxuICAgIC8vIGNvbW11bmljYXRpbmcgd2l0aCBhbnl0aGluZyB5ZXRcbiAgICB0aGlzLnN0YXJ0ZWQgPSBzdGFydGVkO1xuICAgIGlmICh0aGlzLmlwcm94eSkge1xuICAgICAgdGhpcy5pcHJveHkuZXhwZWN0SVByb3h5RXJyb3JzID0gIXN0YXJ0ZWQ7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmV0cmlldmVEZXJpdmVkRGF0YVBhdGggKCkge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnhjb2RlYnVpbGQucmV0cmlldmVEZXJpdmVkRGF0YVBhdGgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXVzZSBydW5uaW5nIFdEQSBpZiBpdCBoYXMgdGhlIHNhbWUgYnVuZGxlIGlkIHdpdGggdXBkYXRlZFdEQUJ1bmRsZUlkLlxuICAgKiBPciByZXVzZSBpdCBpZiBpdCBoYXMgdGhlIGRlZmF1bHQgaWQgd2l0aG91dCB1cGRhdGVkV0RBQnVuZGxlSWQuXG4gICAqIFVuaW5zdGFsbCBpdCBpZiB0aGUgbWV0aG9kIGZhY2VzIGFuIGV4Y2VwdGlvbiBmb3IgdGhlIGFib3ZlIHNpdHVhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwZGF0ZWRXREFCdW5kbGVJZCBCdW5kbGVJZCB5b3UnZCBsaWtlIHRvIHVzZVxuICAgKi9cbiAgYXN5bmMgc2V0dXBDYWNoaW5nICh1cGRhdGVkV0RBQnVuZGxlSWQpIHtcbiAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCB0aGlzLmdldFN0YXR1cygpO1xuICAgIGlmICghc3RhdHVzIHx8ICFzdGF0dXMuYnVpbGQpIHtcbiAgICAgIGxvZy5kZWJ1ZygnV0RBIGlzIGN1cnJlbnRseSBub3QgcnVubmluZy4gVGhlcmUgaXMgbm90aGluZyB0byBjYWNoZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIHByb2R1Y3RCdW5kbGVJZGVudGlmaWVyLFxuICAgICAgdXBncmFkZWRBdCxcbiAgICB9ID0gc3RhdHVzLmJ1aWxkO1xuICAgIGlmICh1dGlsLmhhc1ZhbHVlKHByb2R1Y3RCdW5kbGVJZGVudGlmaWVyKSAmJiB1dGlsLmhhc1ZhbHVlKHVwZGF0ZWRXREFCdW5kbGVJZCkgJiYgdXBkYXRlZFdEQUJ1bmRsZUlkICE9PSBwcm9kdWN0QnVuZGxlSWRlbnRpZmllcikge1xuICAgICAgbG9nLmluZm8oYFdpbGwgdW5pbnN0YWxsIHJ1bm5pbmcgV0RBIHNpbmNlIGl0IGhhcyBkaWZmZXJlbnQgYnVuZGxlIGlkLiBUaGUgYWN0dWFsIHZhbHVlIGlzICcke3Byb2R1Y3RCdW5kbGVJZGVudGlmaWVyfScuYCk7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy51bmluc3RhbGwoKTtcbiAgICB9XG4gICAgaWYgKHV0aWwuaGFzVmFsdWUocHJvZHVjdEJ1bmRsZUlkZW50aWZpZXIpICYmICF1dGlsLmhhc1ZhbHVlKHVwZGF0ZWRXREFCdW5kbGVJZCkgJiYgV0RBX1JVTk5FUl9CVU5ETEVfSUQgIT09IHByb2R1Y3RCdW5kbGVJZGVudGlmaWVyKSB7XG4gICAgICBsb2cuaW5mbyhgV2lsbCB1bmluc3RhbGwgcnVubmluZyBXREEgc2luY2UgaXRzIGJ1bmRsZSBpZCBpcyBub3QgZXF1YWwgdG8gdGhlIGRlZmF1bHQgdmFsdWUgJHtXREFfUlVOTkVSX0JVTkRMRV9JRH1gKTtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVuaW5zdGFsbCgpO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdHVhbFVwZ3JhZGVUaW1lc3RhbXAgPSBhd2FpdCBnZXRXREFVcGdyYWRlVGltZXN0YW1wKHRoaXMuYm9vdHN0cmFwUGF0aCk7XG4gICAgbG9nLmRlYnVnKGBVcGdyYWRlIHRpbWVzdGFtcCBvZiB0aGUgY3VycmVudGx5IGJ1bmRsZWQgV0RBOiAke2FjdHVhbFVwZ3JhZGVUaW1lc3RhbXB9YCk7XG4gICAgbG9nLmRlYnVnKGBVcGdyYWRlIHRpbWVzdGFtcCBvZiB0aGUgV0RBIG9uIHRoZSBkZXZpY2U6ICR7dXBncmFkZWRBdH1gKTtcbiAgICBpZiAoYWN0dWFsVXBncmFkZVRpbWVzdGFtcCAmJiB1cGdyYWRlZEF0ICYmIF8udG9Mb3dlcihgJHthY3R1YWxVcGdyYWRlVGltZXN0YW1wfWApICE9PSBfLnRvTG93ZXIoYCR7dXBncmFkZWRBdH1gKSkge1xuICAgICAgbG9nLmluZm8oJ1dpbGwgdW5pbnN0YWxsIHJ1bm5pbmcgV0RBIHNpbmNlIGl0IGhhcyBkaWZmZXJlbnQgdmVyc2lvbiBpbiBjb21wYXJpc29uIHRvIHRoZSBvbmUgJyArXG4gICAgICAgIGB3aGljaCBpcyBidW5kbGVkIHdpdGggYXBwaXVtLXhjdWl0ZXN0LWRyaXZlciBtb2R1bGUgKCR7YWN0dWFsVXBncmFkZVRpbWVzdGFtcH0gIT0gJHt1cGdyYWRlZEF0fSlgKTtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVuaW5zdGFsbCgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB1dGlsLmhhc1ZhbHVlKHByb2R1Y3RCdW5kbGVJZGVudGlmaWVyKVxuICAgICAgICA/IGBXaWxsIHJldXNlIHByZXZpb3VzbHkgY2FjaGVkIFdEQSBpbnN0YW5jZSBhdCAnJHt0aGlzLnVybC5ocmVmfScgd2l0aCAnJHtwcm9kdWN0QnVuZGxlSWRlbnRpZmllcn0nYFxuICAgICAgICA6IGBXaWxsIHJldXNlIHByZXZpb3VzbHkgY2FjaGVkIFdEQSBpbnN0YW5jZSBhdCAnJHt0aGlzLnVybC5ocmVmfSdgO1xuICAgIGxvZy5pbmZvKGAke21lc3NhZ2V9LiBTZXQgdGhlIHdkYUxvY2FsUG9ydCBjYXBhYmlsaXR5IHRvIGEgdmFsdWUgZGlmZmVyZW50IGZyb20gJHt0aGlzLnVybC5wb3J0fSBpZiB0aGlzIGlzIGFuIHVuZGVzaXJlZCBiZWhhdmlvci5gKTtcbiAgICB0aGlzLndlYkRyaXZlckFnZW50VXJsID0gdGhpcy51cmwuaHJlZjtcbiAgfVxuXG4gIGFzeW5jIHF1aXRBbmRVbmluc3RhbGwgKCkge1xuICAgIGF3YWl0IHRoaXMucXVpdCgpO1xuICAgIGF3YWl0IHRoaXMudW5pbnN0YWxsKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2ViRHJpdmVyQWdlbnQ7XG5leHBvcnQgeyBXZWJEcml2ZXJBZ2VudCwgV0RBX0JVTkRMRV9JRCwgQk9PVFNUUkFQX1BBVEggfTtcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
