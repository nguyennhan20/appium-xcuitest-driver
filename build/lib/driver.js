'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _appiumBaseDriver = require('appium-base-driver');

var _appiumSupport = require('appium-support');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _nodeSimctl = require('node-simctl');

var _wdaWebdriveragent = require('./wda/webdriveragent');

var _wdaWebdriveragent2 = _interopRequireDefault(_wdaWebdriveragent);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _simulatorManagement = require('./simulator-management');

var _appiumIosSimulator = require('appium-ios-simulator');

var _asyncbox = require('asyncbox');

var _appiumIosDriver = require('appium-ios-driver');

var _desiredCaps = require('./desired-caps');

var _desiredCaps2 = _interopRequireDefault(_desiredCaps);

var _commandsIndex = require('./commands/index');

var _commandsIndex2 = _interopRequireDefault(_commandsIndex);

var _utils = require('./utils');

var _realDeviceManagement = require('./real-device-management');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _asyncLock = require('async-lock');

var _asyncLock2 = _interopRequireDefault(_asyncLock);

var SAFARI_BUNDLE_ID = 'com.apple.mobilesafari';
var WDA_SIM_STARTUP_RETRIES = 2;
var WDA_REAL_DEV_STARTUP_RETRIES = 1;
var WDA_REAL_DEV_TUTORIAL_URL = 'https://github.com/appium/appium-xcuitest-driver/blob/master/docs/real-device-config.md';
var WDA_STARTUP_RETRY_INTERVAL = 10000;
var DEFAULT_SETTINGS = {
  nativeWebTap: false,
  useJSONSource: false,
  shouldUseCompactResponses: true,
  elementResponseAttributes: "type,label"
};
// This lock assures, that each driver session does not
// affect shared resources of the other parallel sessions
var SHARED_RESOURCES_GUARD = new _asyncLock2['default']();

var NO_PROXY_NATIVE_LIST = [['DELETE', /window/], ['GET', /^\/session\/[^\/]+$/], ['GET', /alert_text/], ['GET', /alert\/[^\/]+/], ['GET', /appium/], ['GET', /attribute/], ['GET', /context/], ['GET', /location/], ['GET', /log/], ['GET', /screenshot/], ['GET', /size/], ['GET', /source/], ['GET', /url/], ['GET', /window/], ['POST', /accept_alert/], ['POST', /actions$/], ['POST', /alert_text/], ['POST', /alert\/[^\/]+/], ['POST', /appium/], ['POST', /appium\/device\/is_locked/], ['POST', /appium\/device\/lock/], ['POST', /appium\/device\/unlock/], ['POST', /back/], ['POST', /clear/], ['POST', /context/], ['POST', /dismiss_alert/], ['POST', /element$/], ['POST', /elements$/], ['POST', /execute/], ['POST', /keys/], ['POST', /log/], ['POST', /moveto/], ['POST', /receive_async_response/], // always, in case context switches while waiting
['POST', /session\/[^\/]+\/location/], // geo location, but not element location
['POST', /shake/], ['POST', /timeouts/], ['POST', /touch/], ['POST', /url/], ['POST', /value/], ['POST', /window/]];
var NO_PROXY_WEB_LIST = [['DELETE', /cookie/], ['GET', /attribute/], ['GET', /cookie/], ['GET', /element/], ['GET', /text/], ['GET', /title/], ['POST', /clear/], ['POST', /click/], ['POST', /cookie/], ['POST', /element/], ['POST', /forward/], ['POST', /frame/], ['POST', /keys/], ['POST', /refresh/]].concat(NO_PROXY_NATIVE_LIST);

var MEMOIZED_FUNCTIONS = ['getWindowSizeNative', 'getWindowSizeWeb', 'getStatusBarHeight', 'getDevicePixelRatio', 'getScreenInfo', 'getSafariIsIphone', 'getSafariIsIphoneX'];

var XCUITestDriver = (function (_BaseDriver) {
  _inherits(XCUITestDriver, _BaseDriver);

  function XCUITestDriver() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var shouldValidateCaps = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    _classCallCheck(this, XCUITestDriver);

    _get(Object.getPrototypeOf(XCUITestDriver.prototype), 'constructor', this).call(this, opts, shouldValidateCaps);

    this.desiredCapConstraints = _desiredCaps2['default'];

    this.locatorStrategies = ['xpath', 'id', 'name', 'class name', '-ios predicate string', '-ios class chain', 'accessibility id'];
    this.webLocatorStrategies = ['link text', 'css selector', 'tag name', 'link text', 'partial link text'];
    this.resetIos();
    this.settings = new _appiumBaseDriver.DeviceSettings(DEFAULT_SETTINGS, this.onSettingsUpdate.bind(this));

    // memoize functions here, so that they are done on a per-instance basis
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _getIterator(MEMOIZED_FUNCTIONS), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var fn = _step.value;

        this[fn] = _lodash2['default'].memoize(this[fn]);
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

  _createClass(XCUITestDriver, [{
    key: 'onSettingsUpdate',
    value: function onSettingsUpdate(key, value) {
      var proxySettings;
      return _regeneratorRuntime.async(function onSettingsUpdate$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            proxySettings = ['shouldUseCompactResponses', 'elementResponseAttributes'];

            if (!(key === 'nativeWebTap')) {
              context$2$0.next = 5;
              break;
            }

            this.opts.nativeWebTap = !!value;
            context$2$0.next = 8;
            break;

          case 5:
            if (!_lodash2['default'].includes(proxySettings, key)) {
              context$2$0.next = 8;
              break;
            }

            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(this.proxyCommand('/appium/settings', 'POST', { settings: _defineProperty({}, key, value) }));

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'resetIos',
    value: function resetIos() {
      this.opts = this.opts || {};
      this.wda = null;
      this.opts.device = null;
      this.jwpProxyActive = false;
      this.proxyReqRes = null;
      this.jwpProxyAvoid = [];
      this.safari = false;
      this.cachedWdaStatus = null;

      // some things that commands imported from appium-ios-driver need
      this.curWebFrames = [];
      this.webElementIds = [];
      this._currentUrl = null;
      this.curContext = null;
      this.xcodeVersion = {};
      this.iosSdkVersion = null;
      this.contexts = [];
      this.implicitWaitMs = 0;
      this.asynclibWaitMs = 0;
      this.pageLoadMs = 6000;
      this.landscapeWebCoordsOffset = 0;
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      var status;
      return _regeneratorRuntime.async(function getStatus$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(typeof this.driverInfo === 'undefined')) {
              context$2$0.next = 4;
              break;
            }

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap((0, _utils.getDriverInfo)());

          case 3:
            this.driverInfo = context$2$0.sent;

          case 4:
            status = { build: { version: this.driverInfo.version } };

            if (this.cachedWdaStatus) {
              status.wda = this.cachedWdaStatus;
            }
            return context$2$0.abrupt('return', status);

          case 7:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'createSession',
    value: function createSession() {
      var _len,
          args,
          _key,
          _ref,
          _ref2,
          sessionId,
          caps,
          wdaSettings,
          args$2$0 = arguments;

      return _regeneratorRuntime.async(function createSession$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.lifecycleData = {}; // this is used for keeping track of the state we start so when we delete the session we can put things back
            context$2$0.prev = 1;

            for (_len = args$2$0.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = args$2$0[_key];
            }

            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(XCUITestDriver.prototype), 'createSession', this).apply(this, args));

          case 5:
            _ref = context$2$0.sent;
            _ref2 = _slicedToArray(_ref, 2);
            sessionId = _ref2[0];
            caps = _ref2[1];

            this.opts.sessionId = sessionId;

            context$2$0.next = 12;
            return _regeneratorRuntime.awrap(this.start());

          case 12:

            // merge server capabilities + desired capabilities
            caps = _Object$assign({}, _appiumIosDriver.defaultServerCaps, caps);
            // update the udid with what is actually used
            caps.udid = this.opts.udid;
            // ensure we track nativeWebTap capability as a setting as well

            if (!_lodash2['default'].has(this.opts, 'nativeWebTap')) {
              context$2$0.next = 17;
              break;
            }

            context$2$0.next = 17;
            return _regeneratorRuntime.awrap(this.updateSettings({ nativeWebTap: this.opts.nativeWebTap }));

          case 17:
            if (!_lodash2['default'].has(this.opts, 'useJSONSource')) {
              context$2$0.next = 20;
              break;
            }

            context$2$0.next = 20;
            return _regeneratorRuntime.awrap(this.updateSettings({ useJSONSource: this.opts.useJSONSource }));

          case 20:
            wdaSettings = {
              elementResponseAttributes: DEFAULT_SETTINGS.elementResponseAttributes,
              shouldUseCompactResponses: DEFAULT_SETTINGS.shouldUseCompactResponses
            };

            if (_lodash2['default'].has(this.opts, 'elementResponseAttributes')) {
              wdaSettings.elementResponseAttributes = this.opts.elementResponseAttributes;
            }
            if (_lodash2['default'].has(this.opts, 'shouldUseCompactResponses')) {
              wdaSettings.shouldUseCompactResponses = this.opts.shouldUseCompactResponses;
            }
            // ensure WDA gets our defaults instead of whatever its own might be
            context$2$0.next = 25;
            return _regeneratorRuntime.awrap(this.updateSettings(wdaSettings));

          case 25:
            return context$2$0.abrupt('return', [sessionId, caps]);

          case 28:
            context$2$0.prev = 28;
            context$2$0.t0 = context$2$0['catch'](1);

            _logger2['default'].error(context$2$0.t0);
            context$2$0.next = 33;
            return _regeneratorRuntime.awrap(this.deleteSession());

          case 33:
            throw context$2$0.t0;

          case 34:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 28]]);
    }
  }, {
    key: 'start',
    value: function start() {
      var tools, _ref3, device, udid, realDevice, msg, startLogCapture, isLogCaptureStarted;

      return _regeneratorRuntime.async(function start$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.opts.noReset = !!this.opts.noReset;
            this.opts.fullReset = !!this.opts.fullReset;

            context$2$0.next = 4;
            return _regeneratorRuntime.awrap((0, _utils.printUser)());

          case 4:
            if (!(this.opts.platformVersion && parseFloat(this.opts.platformVersion) < 9.3)) {
              context$2$0.next = 6;
              break;
            }

            throw Error('Platform version must be 9.3 or above. \'' + this.opts.platformVersion + '\' is not supported.');

          case 6:
            if (!(_lodash2['default'].isEmpty(this.xcodeVersion) && (!this.opts.webDriverAgentUrl || !this.opts.realDevice))) {
              context$2$0.next = 16;
              break;
            }

            context$2$0.next = 9;
            return _regeneratorRuntime.awrap((0, _utils.getAndCheckXcodeVersion)());

          case 9:
            this.xcodeVersion = context$2$0.sent;
            tools = !this.xcodeVersion.toolsVersion ? '' : '(tools v' + this.xcodeVersion.toolsVersion + ')';

            _logger2['default'].debug('Xcode version set to \'' + this.xcodeVersion.versionString + '\' ' + tools);

            context$2$0.next = 14;
            return _regeneratorRuntime.awrap((0, _utils.getAndCheckIosSdkVersion)());

          case 14:
            this.iosSdkVersion = context$2$0.sent;

            _logger2['default'].debug('iOS SDK Version set to \'' + this.iosSdkVersion + '\'');

          case 16:

            this.logEvent('xcodeDetailsRetrieved');

            context$2$0.next = 19;
            return _regeneratorRuntime.awrap(this.determineDevice());

          case 19:
            _ref3 = context$2$0.sent;
            device = _ref3.device;
            udid = _ref3.udid;
            realDevice = _ref3.realDevice;

            _logger2['default'].info('Determining device to run tests on: udid: \'' + udid + '\', real device: ' + realDevice);
            this.opts.device = device;
            this.opts.udid = udid;
            this.opts.realDevice = realDevice;

            if (!(this.opts.enableAsyncExecuteFromHttps && !this.isRealDevice())) {
              context$2$0.next = 32;
              break;
            }

            context$2$0.next = 30;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.shutdownSimulator)(this.opts.device));

          case 30:
            context$2$0.next = 32;
            return _regeneratorRuntime.awrap(this.startHttpsAsyncServer());

          case 32:
            if (this.opts.platformVersion) {
              context$2$0.next = 40;
              break;
            }

            if (!(this.opts.device && _lodash2['default'].isFunction(this.opts.device.getPlatformVersion))) {
              context$2$0.next = 40;
              break;
            }

            context$2$0.next = 36;
            return _regeneratorRuntime.awrap(this.opts.device.getPlatformVersion());

          case 36:
            this.opts.platformVersion = context$2$0.sent;

            _logger2['default'].info('No platformVersion specified. Using device version: \'' + this.opts.platformVersion + '\'');
            context$2$0.next = 40;
            break;

          case 40:
            // TODO: this is when it is a real device. when we have a real object wire it in

            if (!this.opts.webDriverAgentUrl && this.iosSdkVersion) {
              // make sure that the xcode we are using can handle the platform
              if (parseFloat(this.opts.platformVersion) > parseFloat(this.iosSdkVersion)) {
                msg = 'Xcode ' + this.xcodeVersion.versionString + ' has a maximum SDK version of ' + this.iosSdkVersion + '. ' + ('It does not support iOS version ' + this.opts.platformVersion);

                _logger2['default'].errorAndThrow(msg);
              }
            } else {
              _logger2['default'].debug('Xcode version will not be validated against iOS SDK version.');
            }

            if (!((this.opts.browserName || '').toLowerCase() === 'safari')) {
              context$2$0.next = 51;
              break;
            }

            _logger2['default'].info('Safari test requested');
            this.safari = true;
            this.opts.app = undefined;
            this.opts.processArguments = this.opts.processArguments || {};
            this.opts.bundleId = SAFARI_BUNDLE_ID;
            this._currentUrl = this.opts.safariInitialUrl || (this.isRealDevice() ? 'http://appium.io' : 'http://' + this.opts.address + ':' + this.opts.port + '/welcome');
            this.opts.processArguments.args = ['-u', this._currentUrl];
            context$2$0.next = 53;
            break;

          case 51:
            context$2$0.next = 53;
            return _regeneratorRuntime.awrap(this.configureApp());

          case 53:
            this.logEvent('appConfigured');

            // fail very early if the app doesn't actually exist
            // or if bundle id doesn't point to an installed app

            if (!this.opts.app) {
              context$2$0.next = 57;
              break;
            }

            context$2$0.next = 57;
            return _regeneratorRuntime.awrap((0, _utils.checkAppPresent)(this.opts.app));

          case 57:
            if (this.opts.bundleId) {
              context$2$0.next = 61;
              break;
            }

            context$2$0.next = 60;
            return _regeneratorRuntime.awrap(_appiumIosDriver.appUtils.extractBundleId(this.opts.app));

          case 60:
            this.opts.bundleId = context$2$0.sent;

          case 61:
            context$2$0.next = 63;
            return _regeneratorRuntime.awrap(this.runReset());

          case 63:
            startLogCapture = function startLogCapture() {
              var result;
              return _regeneratorRuntime.async(function startLogCapture$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap(this.startLogCapture());

                  case 2:
                    result = context$3$0.sent;

                    if (result) {
                      this.logEvent('logCaptureStarted');
                    }
                    return context$3$0.abrupt('return', result);

                  case 5:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this);
            };

            context$2$0.next = 66;
            return _regeneratorRuntime.awrap(startLogCapture());

          case 66:
            isLogCaptureStarted = context$2$0.sent;

            _logger2['default'].info('Setting up ' + (this.isRealDevice() ? 'real device' : 'simulator'));

            if (!this.isSimulator()) {
              context$2$0.next = 100;
              break;
            }

            if (!this.opts.shutdownOtherSimulators) {
              context$2$0.next = 73;
              break;
            }

            if (!this.relaxedSecurityEnabled) {
              _logger2['default'].errorAndThrow('Appium server must have relaxed security flag set in order ' + 'for \'shutdownOtherSimulators\' capability to work');
            }
            context$2$0.next = 73;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.shutdownOtherSimulators)(this.opts.device));

          case 73:
            context$2$0.next = 75;
            return _regeneratorRuntime.awrap(_appiumIosDriver.settings.setLocaleAndPreferences(this.opts.device, this.opts, this.isSafari(), function callee$2$0(sim) {
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap((0, _simulatorManagement.shutdownSimulator)(sim));

                  case 2:
                    context$3$0.next = 4;
                    return _regeneratorRuntime.awrap(_appiumIosDriver.settings.setLocaleAndPreferences(sim, this.opts, this.isSafari()));

                  case 4:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this);
            }));

          case 75:
            this.localConfig = context$2$0.sent;
            context$2$0.next = 78;
            return _regeneratorRuntime.awrap(this.opts.device.clearCaches('com.apple.mobile.installd.staging'));

          case 78:
            context$2$0.next = 80;
            return _regeneratorRuntime.awrap(this.startSim());

          case 80:
            if (!this.opts.customSSLCert) {
              context$2$0.next = 96;
              break;
            }

            context$2$0.next = 83;
            return _regeneratorRuntime.awrap((0, _appiumIosSimulator.hasSSLCert)(this.opts.customSSLCert, this.opts.udid));

          case 83:
            if (!context$2$0.sent) {
              context$2$0.next = 87;
              break;
            }

            _logger2['default'].info('SSL cert \'' + _lodash2['default'].truncate(this.opts.customSSLCert, { length: 20 }) + '\' already installed');
            context$2$0.next = 96;
            break;

          case 87:
            _logger2['default'].info('Installing ssl cert \'' + _lodash2['default'].truncate(this.opts.customSSLCert, { length: 20 }) + '\'');
            context$2$0.next = 90;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.shutdownSimulator)(this.opts.device));

          case 90:
            context$2$0.next = 92;
            return _regeneratorRuntime.awrap((0, _appiumIosSimulator.installSSLCert)(this.opts.customSSLCert, this.opts.udid));

          case 92:
            _logger2['default'].info('Restarting Simulator so that SSL certificate installation takes effect');
            context$2$0.next = 95;
            return _regeneratorRuntime.awrap(this.startSim());

          case 95:
            this.logEvent('customCertInstalled');

          case 96:

            this.logEvent('simStarted');

            if (isLogCaptureStarted) {
              context$2$0.next = 100;
              break;
            }

            context$2$0.next = 100;
            return _regeneratorRuntime.awrap(startLogCapture());

          case 100:
            if (!this.opts.app) {
              context$2$0.next = 104;
              break;
            }

            context$2$0.next = 103;
            return _regeneratorRuntime.awrap(this.installAUT());

          case 103:
            this.logEvent('appInstalled');

          case 104:
            if (!(!this.opts.app && this.opts.bundleId && !this.safari)) {
              context$2$0.next = 109;
              break;
            }

            context$2$0.next = 107;
            return _regeneratorRuntime.awrap(this.opts.device.isAppInstalled(this.opts.bundleId));

          case 107:
            if (context$2$0.sent) {
              context$2$0.next = 109;
              break;
            }

            _logger2['default'].errorAndThrow('App with bundle identifier \'' + this.opts.bundleId + '\' unknown');

          case 109:
            context$2$0.next = 111;
            return _regeneratorRuntime.awrap(SHARED_RESOURCES_GUARD.acquire(XCUITestDriver.name, function callee$2$0() {
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap(this.startWda(this.opts.sessionId, realDevice));

                  case 2:
                    return context$3$0.abrupt('return', context$3$0.sent);

                  case 3:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this);
            }));

          case 111:
            context$2$0.next = 113;
            return _regeneratorRuntime.awrap(this.setInitialOrientation(this.opts.orientation));

          case 113:
            this.logEvent('orientationSet');

            if (!(this.isRealDevice() && this.opts.startIWDP)) {
              context$2$0.next = 124;
              break;
            }

            context$2$0.prev = 115;
            context$2$0.next = 118;
            return _regeneratorRuntime.awrap(this.startIWDP());

          case 118:
            _logger2['default'].debug('Started ios_webkit_debug proxy server at: ' + this.iwdpServer.endpoint);
            context$2$0.next = 124;
            break;

          case 121:
            context$2$0.prev = 121;
            context$2$0.t0 = context$2$0['catch'](115);

            _logger2['default'].errorAndThrow('Could not start ios_webkit_debug_proxy server: ' + context$2$0.t0.message);

          case 124:
            if (!(this.isSafari() || this.opts.autoWebview)) {
              context$2$0.next = 129;
              break;
            }

            _logger2['default'].debug('Waiting for initial webview');
            context$2$0.next = 128;
            return _regeneratorRuntime.awrap(this.navToInitialWebview());

          case 128:
            this.logEvent('initialWebviewNavigated');

          case 129:
            if (this.isRealDevice()) {
              context$2$0.next = 138;
              break;
            }

            if (!this.opts.calendarAccessAuthorized) {
              context$2$0.next = 135;
              break;
            }

            context$2$0.next = 133;
            return _regeneratorRuntime.awrap(this.opts.device.enableCalendarAccess(this.opts.bundleId));

          case 133:
            context$2$0.next = 138;
            break;

          case 135:
            if (!(this.opts.calendarAccessAuthorized === false)) {
              context$2$0.next = 138;
              break;
            }

            context$2$0.next = 138;
            return _regeneratorRuntime.awrap(this.opts.device.disableCalendarAccess(this.opts.bundleId));

          case 138:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[115, 121]]);
    }

    /**
     * Start WebDriverAgentRunner
     * @param {string} sessionId - The id of the target session to launch WDA with.
     * @param {boolean} realDevice - Equals to true if the test target device is a real device.
     */
  }, {
    key: 'startWda',
    value: function startWda(sessionId, realDevice) {
      var quitAndUninstall, startupRetries, startupRetryInterval;
      return _regeneratorRuntime.async(function startWda$(context$2$0) {
        var _this2 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.wda = new _wdaWebdriveragent2['default'](this.xcodeVersion, this.opts);

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.wda.cleanupObsoleteProcesses());

          case 3:
            if (!this.opts.useNewWDA) {
              context$2$0.next = 10;
              break;
            }

            _logger2['default'].debug('Capability \'useNewWDA\' set to true, so uninstalling WDA before proceeding');
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(this.wda.quitAndUninstall());

          case 7:
            this.logEvent('wdaUninstalled');
            context$2$0.next = 13;
            break;

          case 10:
            if (_appiumSupport.util.hasValue(this.wda.webDriverAgentUrl)) {
              context$2$0.next = 13;
              break;
            }

            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(this.wda.setupCaching(this.opts.updatedWDABundleId));

          case 13:
            quitAndUninstall = function quitAndUninstall(msg) {
              return _regeneratorRuntime.async(function quitAndUninstall$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    _logger2['default'].debug(msg);

                    if (!this.opts.webDriverAgentUrl) {
                      context$3$0.next = 4;
                      break;
                    }

                    _logger2['default'].debug('Not quitting and unsinstalling WebDriverAgent as webDriverAgentUrl is provided');
                    throw new Error(msg);

                  case 4:
                    _logger2['default'].warn('Quitting and uninstalling WebDriverAgent, then retrying');
                    context$3$0.next = 7;
                    return _regeneratorRuntime.awrap(this.wda.quitAndUninstall());

                  case 7:
                    throw new Error(msg);

                  case 8:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this2);
            };

            startupRetries = this.opts.wdaStartupRetries || (this.isRealDevice() ? WDA_REAL_DEV_STARTUP_RETRIES : WDA_SIM_STARTUP_RETRIES);
            startupRetryInterval = this.opts.wdaStartupRetryInterval || WDA_STARTUP_RETRY_INTERVAL;

            _logger2['default'].debug('Trying to start WebDriverAgent ' + startupRetries + ' times with ' + startupRetryInterval + 'ms interval');
            context$2$0.next = 19;
            return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(startupRetries, startupRetryInterval, function callee$2$0() {
              var retries, errorMsg;
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                var _this3 = this;

                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    this.logEvent('wdaStartAttempted');
                    context$3$0.prev = 1;
                    retries = this.xcodeVersion.major >= 10 ? 2 : 1;
                    context$3$0.next = 5;
                    return _regeneratorRuntime.awrap((0, _asyncbox.retry)(retries, this.wda.launch.bind(this.wda), sessionId, realDevice));

                  case 5:
                    this.cachedWdaStatus = context$3$0.sent;
                    context$3$0.next = 15;
                    break;

                  case 8:
                    context$3$0.prev = 8;
                    context$3$0.t0 = context$3$0['catch'](1);

                    this.logEvent('wdaStartFailed');
                    errorMsg = 'Unable to launch WebDriverAgent because of xcodebuild failure: "' + context$3$0.t0.message + '".';

                    if (this.isRealDevice()) {
                      errorMsg += ' Make sure you follow the tutorial at ' + WDA_REAL_DEV_TUTORIAL_URL + '. ' + 'Try to remove the WebDriverAgentRunner application from the device if it is installed ' + 'and reboot the device.';
                    }
                    context$3$0.next = 15;
                    return _regeneratorRuntime.awrap(quitAndUninstall(errorMsg));

                  case 15:

                    this.proxyReqRes = this.wda.proxyReqRes.bind(this.wda);
                    this.jwpProxyActive = true;

                    context$3$0.prev = 17;
                    context$3$0.next = 20;
                    return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(15, 1000, function callee$3$0() {
                      return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                        while (1) switch (context$4$0.prev = context$4$0.next) {
                          case 0:
                            this.logEvent('wdaSessionAttempted');
                            _logger2['default'].debug('Sending createSession command to WDA');
                            context$4$0.prev = 2;
                            context$4$0.t0 = this.cachedWdaStatus;

                            if (context$4$0.t0) {
                              context$4$0.next = 8;
                              break;
                            }

                            context$4$0.next = 7;
                            return _regeneratorRuntime.awrap(this.proxyCommand('/status', 'GET'));

                          case 7:
                            context$4$0.t0 = context$4$0.sent;

                          case 8:
                            this.cachedWdaStatus = context$4$0.t0;
                            context$4$0.next = 11;
                            return _regeneratorRuntime.awrap(this.startWdaSession(this.opts.bundleId, this.opts.processArguments));

                          case 11:
                            context$4$0.next = 17;
                            break;

                          case 13:
                            context$4$0.prev = 13;
                            context$4$0.t1 = context$4$0['catch'](2);

                            _logger2['default'].debug('Failed to create WDA session (' + context$4$0.t1.message + '). Retrying...');
                            throw context$4$0.t1;

                          case 17:
                          case 'end':
                            return context$4$0.stop();
                        }
                      }, null, _this3, [[2, 13]]);
                    }));

                  case 20:
                    this.logEvent('wdaSessionStarted');
                    context$3$0.next = 29;
                    break;

                  case 23:
                    context$3$0.prev = 23;
                    context$3$0.t1 = context$3$0['catch'](17);
                    errorMsg = 'Unable to start WebDriverAgent session because of xcodebuild failure: ' + context$3$0.t1.message;

                    if (this.isRealDevice()) {
                      errorMsg += ' Make sure you follow the tutorial at ' + WDA_REAL_DEV_TUTORIAL_URL + '. ' + 'Try to remove the WebDriverAgentRunner application from the device if it is installed ' + 'and reboot the device.';
                    }
                    context$3$0.next = 29;
                    return _regeneratorRuntime.awrap(quitAndUninstall(errorMsg));

                  case 29:

                    if (!_appiumSupport.util.hasValue(this.opts.preventWDAAttachments)) {
                      // XCTest prior to Xcode 9 SDK has no native way to disable attachments
                      this.opts.preventWDAAttachments = this.xcodeVersion.major < 9;
                      if (this.opts.preventWDAAttachments) {
                        _logger2['default'].info('Enabled WDA attachments prevention by default to save the disk space. ' + 'Set \'preventWDAAttachments\' capability to false if this is an undesired behavior.');
                      }
                    }

                    if (!this.opts.preventWDAAttachments) {
                      context$3$0.next = 34;
                      break;
                    }

                    context$3$0.next = 33;
                    return _regeneratorRuntime.awrap((0, _utils.adjustWDAAttachmentsPermissions)(this.wda, this.opts.preventWDAAttachments ? '555' : '755'));

                  case 33:
                    this.logEvent('wdaPermsAdjusted');

                  case 34:
                    if (!this.opts.clearSystemFiles) {
                      context$3$0.next = 37;
                      break;
                    }

                    context$3$0.next = 37;
                    return _regeneratorRuntime.awrap((0, _utils.markSystemFilesForCleanup)(this.wda));

                  case 37:

                    // we expect certain socket errors until this point, but now
                    // mark things as fully working
                    this.wda.fullyStarted = true;
                    this.logEvent('wdaStarted');

                  case 39:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this2, [[1, 8], [17, 23]]);
            }));

          case 19:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'runReset',
    value: function runReset() {
      var opts = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      return _regeneratorRuntime.async(function runReset$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.logEvent('resetStarted');

            if (!this.isRealDevice()) {
              context$2$0.next = 6;
              break;
            }

            context$2$0.next = 4;
            return _regeneratorRuntime.awrap((0, _realDeviceManagement.runRealDeviceReset)(this.opts.device, opts || this.opts));

          case 4:
            context$2$0.next = 8;
            break;

          case 6:
            context$2$0.next = 8;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.runSimulatorReset)(this.opts.device, opts || this.opts));

          case 8:
            this.logEvent('resetComplete');

          case 9:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'deleteSession',
    value: function deleteSession() {
      return _regeneratorRuntime.async(function deleteSession$(context$2$0) {
        var _this4 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap((0, _utils.removeAllSessionWebSocketHandlers)(this.server, this.sessionId));

          case 2:
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(SHARED_RESOURCES_GUARD.acquire(XCUITestDriver.name, function callee$2$0() {
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap(this.stop());

                  case 2:
                    if (!this.opts.preventWDAAttachments) {
                      context$3$0.next = 5;
                      break;
                    }

                    context$3$0.next = 5;
                    return _regeneratorRuntime.awrap((0, _utils.adjustWDAAttachmentsPermissions)(this.wda, '755'));

                  case 5:
                    if (!this.opts.clearSystemFiles) {
                      context$3$0.next = 13;
                      break;
                    }

                    if (!this.isAppTemporary) {
                      context$3$0.next = 9;
                      break;
                    }

                    context$3$0.next = 9;
                    return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(this.opts.app));

                  case 9:
                    context$3$0.next = 11;
                    return _regeneratorRuntime.awrap((0, _utils.clearSystemFiles)(this.wda, !!this.opts.showXcodeLog));

                  case 11:
                    context$3$0.next = 14;
                    break;

                  case 13:
                    _logger2['default'].debug('Not clearing log files. Use `clearSystemFiles` capability to turn on.');

                  case 14:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this4);
            }));

          case 4:
            if (!this.isWebContext()) {
              context$2$0.next = 8;
              break;
            }

            _logger2['default'].debug('In a web session. Removing remote debugger');
            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(this.stopRemote());

          case 8:
            if (!(this.opts.resetOnSessionStartOnly === false)) {
              context$2$0.next = 11;
              break;
            }

            context$2$0.next = 11;
            return _regeneratorRuntime.awrap(this.runReset());

          case 11:
            if (!(this.isSimulator() && !this.opts.noReset && !!this.opts.device)) {
              context$2$0.next = 18;
              break;
            }

            if (!this.lifecycleData.createSim) {
              context$2$0.next = 18;
              break;
            }

            _logger2['default'].debug('Deleting simulator created for this run (udid: \'' + this.opts.udid + '\')');
            context$2$0.next = 16;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.shutdownSimulator)(this.opts.device));

          case 16:
            context$2$0.next = 18;
            return _regeneratorRuntime.awrap(this.opts.device['delete']());

          case 18:
            if (_lodash2['default'].isEmpty(this.logs)) {
              context$2$0.next = 22;
              break;
            }

            context$2$0.next = 21;
            return _regeneratorRuntime.awrap(this.logs.syslog.stopCapture());

          case 21:
            this.logs = {};

          case 22:
            if (!this.iwdpServer) {
              context$2$0.next = 25;
              break;
            }

            context$2$0.next = 25;
            return _regeneratorRuntime.awrap(this.stopIWDP());

          case 25:
            if (!(this.opts.enableAsyncExecuteFromHttps && !this.isRealDevice())) {
              context$2$0.next = 28;
              break;
            }

            context$2$0.next = 28;
            return _regeneratorRuntime.awrap(this.stopHttpsAsyncServer());

          case 28:

            this.resetIos();

            context$2$0.next = 31;
            return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(XCUITestDriver.prototype), 'deleteSession', this).call(this));

          case 31:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'stop',
    value: function stop() {
      return _regeneratorRuntime.async(function stop$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.jwpProxyActive = false;
            this.proxyReqRes = null;

            if (!(this.wda && this.wda.fullyStarted)) {
              context$2$0.next = 15;
              break;
            }

            if (!this.wda.jwproxy) {
              context$2$0.next = 12;
              break;
            }

            context$2$0.prev = 4;
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(this.proxyCommand('/session/' + this.sessionId, 'DELETE'));

          case 7:
            context$2$0.next = 12;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](4);

            // an error here should not short-circuit the rest of clean up
            _logger2['default'].debug('Unable to DELETE session on WDA: \'' + context$2$0.t0.message + '\'. Continuing shutdown.');

          case 12:
            if (!(this.wda && !this.wda.webDriverAgentUrl && this.opts.useNewWDA)) {
              context$2$0.next = 15;
              break;
            }

            context$2$0.next = 15;
            return _regeneratorRuntime.awrap(this.wda.quit());

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[4, 9]]);
    }
  }, {
    key: 'executeCommand',
    value: function executeCommand(cmd) {
      var _get2;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      return _regeneratorRuntime.async(function executeCommand$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _logger2['default'].debug('Executing command \'' + cmd + '\'');

            if (!(cmd === 'receiveAsyncResponse')) {
              context$2$0.next = 5;
              break;
            }

            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.receiveAsyncResponse.apply(this, args));

          case 4:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 5:
            if (!(cmd === 'getStatus')) {
              context$2$0.next = 9;
              break;
            }

            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(this.getStatus());

          case 8:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 9:
            context$2$0.next = 11;
            return _regeneratorRuntime.awrap((_get2 = _get(Object.getPrototypeOf(XCUITestDriver.prototype), 'executeCommand', this)).call.apply(_get2, [this, cmd].concat(args)));

          case 11:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'configureApp',
    value: function configureApp() {
      var appIsPackageOrBundle, originalAppPath;
      return _regeneratorRuntime.async(function configureApp$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            appIsPackageOrBundle = function appIsPackageOrBundle(app) {
              return (/^([a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+)+$/.test(app)
              );
            };

            // the app name is a bundleId assign it to the bundleId property
            if (!this.opts.bundleId && appIsPackageOrBundle(this.opts.app)) {
              this.opts.bundleId = this.opts.app;
              this.opts.app = '';
            }
            // we have a bundle ID, but no app, or app is also a bundle

            if (!(this.opts.bundleId && appIsPackageOrBundle(this.opts.bundleId) && (this.opts.app === '' || appIsPackageOrBundle(this.opts.app)))) {
              context$2$0.next = 5;
              break;
            }

            _logger2['default'].debug('App is an iOS bundle, will attempt to run as pre-existing');
            return context$2$0.abrupt('return');

          case 5:
            if (!(this.opts.app && this.opts.app.toLowerCase() === 'settings')) {
              context$2$0.next = 11;
              break;
            }

            this.opts.bundleId = 'com.apple.Preferences';
            this.opts.app = null;
            return context$2$0.abrupt('return');

          case 11:
            if (!(this.opts.app && this.opts.app.toLowerCase() === 'calendar')) {
              context$2$0.next = 15;
              break;
            }

            this.opts.bundleId = 'com.apple.mobilecal';
            this.opts.app = null;
            return context$2$0.abrupt('return');

          case 15:
            originalAppPath = this.opts.app;
            context$2$0.prev = 16;
            context$2$0.next = 19;
            return _regeneratorRuntime.awrap(this.helpers.configureApp(this.opts.app, '.app', this.opts.mountRoot, this.opts.windowsShareUserName, this.opts.windowsSharePassword));

          case 19:
            this.opts.app = context$2$0.sent;
            context$2$0.next = 26;
            break;

          case 22:
            context$2$0.prev = 22;
            context$2$0.t0 = context$2$0['catch'](16);

            _logger2['default'].error(context$2$0.t0);
            throw new Error('Bad app: ' + this.opts.app + '. App paths need to be absolute, or relative to the appium ' + 'server install dir, or a URL to compressed file, or a special app name.');

          case 26:
            this.isAppTemporary = this.opts.app && originalAppPath !== this.opts.app;

          case 27:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[16, 22]]);
    }
  }, {
    key: 'determineDevice',
    value: function determineDevice() {
      var _device, _device3, devices, _device2, device, _device4;

      return _regeneratorRuntime.async(function determineDevice$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            // in the one case where we create a sim, we will set this state
            this.lifecycleData.createSim = false;

            // if we get generic names, translate them
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap((0, _utils.translateDeviceName)(this.xcodeVersion, this.opts.platformVersion, this.opts.deviceName));

          case 3:
            this.opts.deviceName = context$2$0.sent;
            context$2$0.t0 = this.opts.udid;

            if (!context$2$0.t0) {
              context$2$0.next = 9;
              break;
            }

            context$2$0.next = 8;
            return _regeneratorRuntime.awrap((0, _appiumIosSimulator.simExists)(this.opts.udid));

          case 8:
            context$2$0.t0 = context$2$0.sent;

          case 9:
            if (!context$2$0.t0) {
              context$2$0.next = 14;
              break;
            }

            context$2$0.next = 12;
            return _regeneratorRuntime.awrap((0, _appiumIosSimulator.getSimulator)(this.opts.udid));

          case 12:
            _device = context$2$0.sent;
            return context$2$0.abrupt('return', { device: _device, realDevice: false, udid: this.opts.udid });

          case 14:
            if (!this.opts.udid) {
              context$2$0.next = 43;
              break;
            }

            if (!(this.opts.udid.toLowerCase() === 'auto')) {
              context$2$0.next = 33;
              break;
            }

            context$2$0.prev = 16;
            context$2$0.next = 19;
            return _regeneratorRuntime.awrap((0, _utils.detectUdid)());

          case 19:
            this.opts.udid = context$2$0.sent;
            context$2$0.next = 31;
            break;

          case 22:
            context$2$0.prev = 22;
            context$2$0.t1 = context$2$0['catch'](16);

            // Trying to find matching UDID for Simulator
            _logger2['default'].warn('Cannot detect any connected real devices. Falling back to Simulator. Original error: ' + context$2$0.t1.message);
            context$2$0.next = 27;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.getExistingSim)(this.opts));

          case 27:
            _device3 = context$2$0.sent;

            if (!_device3) {
              // No matching Simulator is found. Throw an error
              _logger2['default'].errorAndThrow('Cannot detect udid for ' + this.opts.deviceName + ' Simulator running iOS ' + this.opts.platformVersion);
            }
            // Matching Simulator exists and is found. Use it
            this.opts.udid = _device3.udid;
            return context$2$0.abrupt('return', { device: _device3, realDevice: false, udid: _device3.udid });

          case 31:
            context$2$0.next = 39;
            break;

          case 33:
            context$2$0.next = 35;
            return _regeneratorRuntime.awrap((0, _realDeviceManagement.getConnectedDevices)());

          case 35:
            devices = context$2$0.sent;

            _logger2['default'].debug('Available devices: ' + devices.join(', '));

            if (!(devices.indexOf(this.opts.udid) === -1)) {
              context$2$0.next = 39;
              break;
            }

            throw new Error('Unknown device or simulator UDID: \'' + this.opts.udid + '\'');

          case 39:
            context$2$0.next = 41;
            return _regeneratorRuntime.awrap((0, _realDeviceManagement.getRealDeviceObj)(this.opts.udid));

          case 41:
            _device2 = context$2$0.sent;
            return context$2$0.abrupt('return', { device: _device2, realDevice: true, udid: this.opts.udid });

          case 43:
            context$2$0.next = 45;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.getExistingSim)(this.opts));

          case 45:
            device = context$2$0.sent;

            if (!device) {
              context$2$0.next = 48;
              break;
            }

            return context$2$0.abrupt('return', { device: device, realDevice: false, udid: device.udid });

          case 48:

            // no device of this type exists, so create one
            _logger2['default'].info('Simulator udid not provided, using desired caps to create a new simulator');
            if (!this.opts.platformVersion && this.iosSdkVersion) {
              _logger2['default'].info('No platformVersion specified. Using latest version Xcode supports: \'' + this.iosSdkVersion + '\' ' + 'This may cause problems if a simulator does not exist for this platform version.');
              this.opts.platformVersion = this.iosSdkVersion;
            }

            if (!this.opts.noReset) {
              context$2$0.next = 56;
              break;
            }

            context$2$0.next = 53;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.getExistingSim)(this.opts));

          case 53:
            _device4 = context$2$0.sent;

            if (!_device4) {
              context$2$0.next = 56;
              break;
            }

            return context$2$0.abrupt('return', { device: _device4, realDevice: false, udid: _device4.udid });

          case 56:
            context$2$0.next = 58;
            return _regeneratorRuntime.awrap(this.createSim());

          case 58:
            device = context$2$0.sent;
            return context$2$0.abrupt('return', { device: device, realDevice: false, udid: device.udid });

          case 60:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[16, 22]]);
    }
  }, {
    key: 'startSim',
    value: function startSim() {
      var runOpts, orientation;
      return _regeneratorRuntime.async(function startSim$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            runOpts = {
              scaleFactor: this.opts.scaleFactor,
              connectHardwareKeyboard: !!this.opts.connectHardwareKeyboard,
              isHeadless: !!this.opts.isHeadless,
              devicePreferences: {}
            };

            // add the window center, if it is specified
            if (this.opts.SimulatorWindowCenter) {
              runOpts.devicePreferences.SimulatorWindowCenter = this.opts.SimulatorWindowCenter;
            }

            // This is to workaround XCTest bug about changing Simulator
            // orientation is not synchronized to the actual window orientation
            orientation = _lodash2['default'].isString(this.opts.orientation) && this.opts.orientation.toUpperCase();
            context$2$0.t0 = orientation;
            context$2$0.next = context$2$0.t0 === 'LANDSCAPE' ? 6 : context$2$0.t0 === 'PORTRAIT' ? 9 : 12;
            break;

          case 6:
            runOpts.devicePreferences.SimulatorWindowOrientation = 'LandscapeLeft';
            runOpts.devicePreferences.SimulatorWindowRotationAngle = 90;
            return context$2$0.abrupt('break', 12);

          case 9:
            runOpts.devicePreferences.SimulatorWindowOrientation = 'Portrait';
            runOpts.devicePreferences.SimulatorWindowRotationAngle = 0;
            return context$2$0.abrupt('break', 12);

          case 12:
            context$2$0.next = 14;
            return _regeneratorRuntime.awrap(this.opts.device.run(runOpts));

          case 14:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'createSim',
    value: function createSim() {
      var sim;
      return _regeneratorRuntime.async(function createSim$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.lifecycleData.createSim = true;

            // create sim for caps
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.createSim)(this.opts));

          case 3:
            sim = context$2$0.sent;

            _logger2['default'].info('Created simulator with udid \'' + sim.udid + '\'.');

            return context$2$0.abrupt('return', sim);

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'launchApp',
    value: function launchApp() {
      var APP_LAUNCH_TIMEOUT, checkStatus, retries;
      return _regeneratorRuntime.async(function launchApp$(context$2$0) {
        var _this5 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            APP_LAUNCH_TIMEOUT = 20 * 1000;

            this.logEvent('appLaunchAttempted');
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap((0, _nodeSimctl.launch)(this.opts.device.udid, this.opts.bundleId));

          case 4:
            checkStatus = function checkStatus() {
              var response, currentApp;
              return _regeneratorRuntime.async(function checkStatus$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap(this.proxyCommand('/status', 'GET'));

                  case 2:
                    response = context$3$0.sent;
                    currentApp = response.currentApp.bundleID;

                    if (!(currentApp !== this.opts.bundleId)) {
                      context$3$0.next = 6;
                      break;
                    }

                    throw new Error(this.opts.bundleId + ' not in foreground. ' + currentApp + ' is in foreground');

                  case 6:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this5);
            };

            _logger2['default'].info('Waiting for \'' + this.opts.bundleId + '\' to be in foreground');
            retries = parseInt(APP_LAUNCH_TIMEOUT / 200, 10);
            context$2$0.next = 9;
            return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(retries, 200, checkStatus));

          case 9:
            _logger2['default'].info(this.opts.bundleId + ' is in foreground');
            this.logEvent('appLaunched');

          case 11:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'startWdaSession',
    value: function startWdaSession(bundleId, processArguments) {
      var args, env, shouldWaitForQuiescence, maxTypingFrequency, shouldUseSingletonTestManager, shouldUseTestManagerForVisibilityDetection, desired;
      return _regeneratorRuntime.async(function startWdaSession$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            args = processArguments ? processArguments.args || [] : [];

            if (_lodash2['default'].isArray(args)) {
              context$2$0.next = 3;
              break;
            }

            throw new Error('processArguments.args capability is expected to be an array. ' + (JSON.stringify(args) + ' is given instead'));

          case 3:
            env = processArguments ? processArguments.env || {} : {};

            if (_lodash2['default'].isPlainObject(env)) {
              context$2$0.next = 6;
              break;
            }

            throw new Error('processArguments.env capability is expected to be a dictionary. ' + (JSON.stringify(env) + ' is given instead'));

          case 6:
            shouldWaitForQuiescence = _appiumSupport.util.hasValue(this.opts.waitForQuiescence) ? this.opts.waitForQuiescence : true;
            maxTypingFrequency = _appiumSupport.util.hasValue(this.opts.maxTypingFrequency) ? this.opts.maxTypingFrequency : 60;
            shouldUseSingletonTestManager = _appiumSupport.util.hasValue(this.opts.shouldUseSingletonTestManager) ? this.opts.shouldUseSingletonTestManager : true;
            shouldUseTestManagerForVisibilityDetection = false;

            if (_appiumSupport.util.hasValue(this.opts.simpleIsVisibleCheck)) {
              shouldUseTestManagerForVisibilityDetection = this.opts.simpleIsVisibleCheck;
            }
            if (!isNaN(parseFloat(this.opts.platformVersion)) && parseFloat(this.opts.platformVersion).toFixed(1) === '9.3') {
              _logger2['default'].info('Forcing shouldUseSingletonTestManager capability value to true, because of known XCTest issues under 9.3 platform version');
              shouldUseTestManagerForVisibilityDetection = true;
            }
            if (_appiumSupport.util.hasValue(this.opts.language)) {
              args.push('-AppleLanguages', '(' + this.opts.language + ')');
              args.push('-NSLanguages', '(' + this.opts.language + ')');
            }

            if (_appiumSupport.util.hasValue(this.opts.locale)) {
              args.push('-AppleLocale', this.opts.locale);
            }

            desired = {
              desiredCapabilities: {
                bundleId: bundleId,
                arguments: args,
                environment: env,
                shouldWaitForQuiescence: shouldWaitForQuiescence,
                shouldUseTestManagerForVisibilityDetection: shouldUseTestManagerForVisibilityDetection,
                maxTypingFrequency: maxTypingFrequency,
                shouldUseSingletonTestManager: shouldUseSingletonTestManager
              }
            };

            if (_appiumSupport.util.hasValue(this.opts.shouldUseCompactResponses)) {
              desired.desiredCapabilities.shouldUseCompactResponses = this.opts.shouldUseCompactResponses;
            }
            if (_appiumSupport.util.hasValue(this.opts.elementResponseFields)) {
              desired.desiredCapabilities.elementResponseFields = this.opts.elementResponseFields;
            }
            if (this.opts.autoAcceptAlerts) {
              desired.desiredCapabilities.defaultAlertAction = 'accept';
            } else if (this.opts.autoDismissAlerts) {
              desired.desiredCapabilities.defaultAlertAction = 'dismiss';
            }

            context$2$0.next = 20;
            return _regeneratorRuntime.awrap(this.proxyCommand('/session', 'POST', desired));

          case 20:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    // Override Proxy methods from BaseDriver
  }, {
    key: 'proxyActive',
    value: function proxyActive() {
      return this.jwpProxyActive;
    }
  }, {
    key: 'getProxyAvoidList',
    value: function getProxyAvoidList() {
      if (this.isWebview()) {
        return NO_PROXY_WEB_LIST;
      }
      return NO_PROXY_NATIVE_LIST;
    }
  }, {
    key: 'canProxy',
    value: function canProxy() {
      return true;
    }
  }, {
    key: 'isSafari',
    value: function isSafari() {
      return !!this.safari;
    }
  }, {
    key: 'isRealDevice',
    value: function isRealDevice() {
      return this.opts.realDevice;
    }
  }, {
    key: 'isSimulator',
    value: function isSimulator() {
      return !this.opts.realDevice;
    }
  }, {
    key: 'isWebview',
    value: function isWebview() {
      return this.isSafari() || this.isWebContext();
    }
  }, {
    key: 'validateLocatorStrategy',
    value: function validateLocatorStrategy(strategy) {
      _get(Object.getPrototypeOf(XCUITestDriver.prototype), 'validateLocatorStrategy', this).call(this, strategy, this.isWebContext());
    }
  }, {
    key: 'validateDesiredCaps',
    value: function validateDesiredCaps(caps) {
      if (!_get(Object.getPrototypeOf(XCUITestDriver.prototype), 'validateDesiredCaps', this).call(this, caps)) {
        return false;
      }

      // make sure that the capabilities have one of `app` or `bundleId`
      if ((caps.browserName || '').toLowerCase() !== 'safari' && !caps.app && !caps.bundleId) {
        var msg = 'The desired capabilities must include either an app or a bundleId for iOS';
        _logger2['default'].errorAndThrow(msg);
      }

      var verifyProcessArgument = function verifyProcessArgument(processArguments) {
        var args = processArguments.args;
        var env = processArguments.env;

        if (!_lodash2['default'].isNil(args) && !_lodash2['default'].isArray(args)) {
          _logger2['default'].errorAndThrow('processArguments.args must be an array of strings');
        }
        if (!_lodash2['default'].isNil(env) && !_lodash2['default'].isPlainObject(env)) {
          _logger2['default'].errorAndThrow('processArguments.env must be an object <key,value> pair {a:b, c:d}');
        }
      };

      // `processArguments` should be JSON string or an object with arguments and/ environment details
      if (caps.processArguments) {
        if (_lodash2['default'].isString(caps.processArguments)) {
          try {
            // try to parse the string as JSON
            caps.processArguments = JSON.parse(caps.processArguments);
            verifyProcessArgument(caps.processArguments);
          } catch (err) {
            _logger2['default'].errorAndThrow('processArguments must be a json format or an object with format {args : [], env : {a:b, c:d}}. ' + ('Both environment and argument can be null. Error: ' + err));
          }
        } else if (_lodash2['default'].isPlainObject(caps.processArguments)) {
          verifyProcessArgument(caps.processArguments);
        } else {
          _logger2['default'].errorAndThrow('\'processArguments must be an object, or a string JSON object with format {args : [], env : {a:b, c:d}}. ' + 'Both environment and argument can be null.');
        }
      }

      // there is no point in having `keychainPath` without `keychainPassword`
      if (caps.keychainPath && !caps.keychainPassword || !caps.keychainPath && caps.keychainPassword) {
        _logger2['default'].errorAndThrow('If \'keychainPath\' is set, \'keychainPassword\' must also be set (and vice versa).');
      }

      // `resetOnSessionStartOnly` should be set to true by default
      this.opts.resetOnSessionStartOnly = !_appiumSupport.util.hasValue(this.opts.resetOnSessionStartOnly) || this.opts.resetOnSessionStartOnly;
      this.opts.useNewWDA = _appiumSupport.util.hasValue(this.opts.useNewWDA) ? this.opts.useNewWDA : false;

      if (caps.commandTimeouts) {
        caps.commandTimeouts = (0, _utils.normalizeCommandTimeouts)(caps.commandTimeouts);
      }

      if (_lodash2['default'].isString(caps.webDriverAgentUrl)) {
        var _url$parse = _url2['default'].parse(caps.webDriverAgentUrl);

        var protocol = _url$parse.protocol;
        var host = _url$parse.host;

        if (_lodash2['default'].isEmpty(protocol) || _lodash2['default'].isEmpty(host)) {
          _logger2['default'].errorAndThrow('\'webDriverAgentUrl\' capability is expected to contain a valid WebDriverAgent server URL. ' + ('\'' + caps.webDriverAgentUrl + '\' is given instead'));
        }
      }

      if (caps.browserName) {
        if (caps.bundleId) {
          _logger2['default'].errorAndThrow('\'browserName\' cannot be set together with \'bundleId\' capability');
        }
        // warn if the capabilities have both `app` and `browser, although this
        // is common with selenium grid
        if (caps.app) {
          _logger2['default'].warn('The capabilities should generally not include both an \'app\' and a \'browserName\'');
        }
      }

      // finally, return true since the superclass check passed, as did this
      return true;
    }
  }, {
    key: 'installAUT',
    value: function installAUT() {
      var pause;
      return _regeneratorRuntime.async(function installAUT$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!this.isSafari()) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return');

          case 2:
            if (!(this.opts.autoLaunch === false)) {
              context$2$0.next = 4;
              break;
            }

            return context$2$0.abrupt('return');

          case 4:
            context$2$0.prev = 4;
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap((0, _utils.verifyApplicationPlatform)(this.opts.app, this.isSimulator()));

          case 7:
            context$2$0.next = 15;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](4);

            // TODO: Let it throw after we confirm the architecture verification algorithm is stable
            _logger2['default'].warn('*********************************');
            _logger2['default'].warn((this.isSimulator() ? 'Simulator' : 'Real device') + ' architecture appears to be unsupported ' + ('by the \'' + this.opts.app + '\' application. ') + 'Make sure the correct deployment target has been selected for its compilation in Xcode.');
            _logger2['default'].warn('Don\'t be surprised if the application fails to launch.');
            _logger2['default'].warn('*********************************');

          case 15:
            if (!this.isRealDevice()) {
              context$2$0.next = 20;
              break;
            }

            context$2$0.next = 18;
            return _regeneratorRuntime.awrap((0, _realDeviceManagement.installToRealDevice)(this.opts.device, this.opts.app, this.opts.bundleId, this.opts.noReset));

          case 18:
            context$2$0.next = 22;
            break;

          case 20:
            context$2$0.next = 22;
            return _regeneratorRuntime.awrap((0, _simulatorManagement.installToSimulator)(this.opts.device, this.opts.app, this.opts.bundleId, this.opts.noReset));

          case 22:
            if (!_appiumSupport.util.hasValue(this.opts.iosInstallPause)) {
              context$2$0.next = 27;
              break;
            }

            pause = parseInt(this.opts.iosInstallPause, 10);

            _logger2['default'].debug('iosInstallPause set. Pausing ' + pause + ' ms before continuing');
            context$2$0.next = 27;
            return _regeneratorRuntime.awrap(_bluebird2['default'].delay(pause));

          case 27:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[4, 9]]);
    }
  }, {
    key: 'setInitialOrientation',
    value: function setInitialOrientation(orientation) {
      return _regeneratorRuntime.async(function setInitialOrientation$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (_lodash2['default'].isString(orientation)) {
              context$2$0.next = 3;
              break;
            }

            _logger2['default'].info('Skipping setting of the initial display orientation. ' + 'Set the "orientation" capability to either "LANDSCAPE" or "PORTRAIT", if this is an undesired behavior.');
            return context$2$0.abrupt('return');

          case 3:
            orientation = orientation.toUpperCase();

            if (_lodash2['default'].includes(['LANDSCAPE', 'PORTRAIT'], orientation)) {
              context$2$0.next = 7;
              break;
            }

            _logger2['default'].debug('Unable to set initial orientation to \'' + orientation + '\'');
            return context$2$0.abrupt('return');

          case 7:
            _logger2['default'].debug('Setting initial orientation to \'' + orientation + '\'');
            context$2$0.prev = 8;
            context$2$0.next = 11;
            return _regeneratorRuntime.awrap(this.proxyCommand('/orientation', 'POST', { orientation: orientation }));

          case 11:
            this.opts.curOrientation = orientation;
            context$2$0.next = 17;
            break;

          case 14:
            context$2$0.prev = 14;
            context$2$0.t0 = context$2$0['catch'](8);

            _logger2['default'].warn('Setting initial orientation failed with: ' + context$2$0.t0.message);

          case 17:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[8, 14]]);
    }
  }, {
    key: '_getCommandTimeout',
    value: function _getCommandTimeout(cmdName) {
      if (this.opts.commandTimeouts) {
        if (cmdName && _lodash2['default'].has(this.opts.commandTimeouts, cmdName)) {
          return this.opts.commandTimeouts[cmdName];
        }
        return this.opts.commandTimeouts[_utils.DEFAULT_TIMEOUT_KEY];
      }
    }

    /**
     * Get session capabilities merged with what WDA reports
     * This is a library command but needs to call 'super' so can't be on
     * a helper object
     */
  }, {
    key: 'getSession',
    value: function getSession() {
      var driverSession, _ref4, statusBarSize, scale;

      return _regeneratorRuntime.async(function getSession$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(XCUITestDriver.prototype), 'getSession', this).call(this));

          case 2:
            driverSession = context$2$0.sent;

            if (this.wdaCaps) {
              context$2$0.next = 7;
              break;
            }

            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.proxyCommand('/', 'GET'));

          case 6:
            this.wdaCaps = context$2$0.sent;

          case 7:
            if (this.deviceCaps) {
              context$2$0.next = 19;
              break;
            }

            context$2$0.next = 10;
            return _regeneratorRuntime.awrap(this.getScreenInfo());

          case 10:
            _ref4 = context$2$0.sent;
            statusBarSize = _ref4.statusBarSize;
            scale = _ref4.scale;
            context$2$0.t0 = scale;
            context$2$0.t1 = statusBarSize.height;
            context$2$0.next = 17;
            return _regeneratorRuntime.awrap(this.getViewportRect());

          case 17:
            context$2$0.t2 = context$2$0.sent;
            this.deviceCaps = {
              pixelRatio: context$2$0.t0,
              statBarHeight: context$2$0.t1,
              viewportRect: context$2$0.t2
            };

          case 19:
            _logger2['default'].info("Merging WDA caps over Appium caps for session detail response");
            return context$2$0.abrupt('return', _Object$assign({ udid: this.opts.udid }, driverSession, this.wdaCaps.capabilities, this.deviceCaps));

          case 21:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'startIWDP',
    value: function startIWDP() {
      return _regeneratorRuntime.async(function startIWDP$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.logEvent('iwdpStarting');
            this.iwdpServer = new _appiumIosDriver.IWDP(this.opts.webkitDebugProxyPort, this.opts.udid);
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.iwdpServer.start());

          case 4:
            this.logEvent('iwdpStarted');

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'stopIWDP',
    value: function stopIWDP() {
      return _regeneratorRuntime.async(function stopIWDP$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!this.iwdpServer) {
              context$2$0.next = 4;
              break;
            }

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.iwdpServer.stop());

          case 3:
            delete this.iwdpServer;

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'reset',
    value: function reset() {
      var opts, shutdownHandler;
      return _regeneratorRuntime.async(function reset$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!this.opts.noReset) {
              context$2$0.next = 12;
              break;
            }

            opts = _lodash2['default'].cloneDeep(this.opts);

            opts.noReset = false;
            opts.fullReset = false;
            shutdownHandler = this.resetOnUnexpectedShutdown;

            this.resetOnUnexpectedShutdown = function () {};
            context$2$0.prev = 6;
            context$2$0.next = 9;
            return _regeneratorRuntime.awrap(this.runReset(opts));

          case 9:
            context$2$0.prev = 9;

            this.resetOnUnexpectedShutdown = shutdownHandler;
            return context$2$0.finish(9);

          case 12:
            context$2$0.next = 14;
            return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(XCUITestDriver.prototype), 'reset', this).call(this));

          case 14:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[6,, 9, 12]]);
    }
  }, {
    key: 'driverData',
    get: function get() {
      // TODO fill out resource info here
      return {};
    }
  }]);

  return XCUITestDriver;
})(_appiumBaseDriver.BaseDriver);

_Object$assign(XCUITestDriver.prototype, _commandsIndex2['default']);

exports['default'] = XCUITestDriver;
exports.XCUITestDriver = XCUITestDriver;

// TODO add validation on caps

// ensure we track useJSONSource capability as a setting as well

// no `webDriverAgentUrl`, or on a simulator, so we need an Xcode version

// shutdown the simulator so that the ssl cert is recognized

// at this point if there is no platformVersion, get it from the device

// we don't know if there needs to be changes a priori, so change first.
// sometimes the shutdown process changes the settings, so reset them,
// knowing that the sim is already shut

// Cleanup of installd cache helps to save disk space while running multiple tests
// without restarting the Simulator: https://github.com/appium/appium/issues/9410

// Retry log capture if Simulator was not running before

// if we only have bundle identifier and no app, fail if it is not already installed

// local helper for the two places we need to uninstall wda and re-start it

// on xcode 10 installd will often try to access the app from its staging
// directory before fully moving it there, and fail. Retrying once
// immediately helps

// this.cachedWdaStatus = await this.wda.launch(sessionId, realDevice);

// reset the permissions on the derived data folder, if necessary

// TODO: once this fix gets into base driver remove from here

// check for supported build-in apps

// download if necessary

// check for a particular simulator

// make sure it is a connected device. If not, the udid passed in is invalid

// figure out the correct simulator to use, given the desired capabilities

// check for an existing simulator

// Check for existing simulator just with correct capabilities

// if user has passed in desiredCaps.autoLaunch = false
// meaning they will manage app install / launching

// https://github.com/appium/appium/issues/6889

// call super to get event timings, etc...

// This is to make sure reset happens even if noReset is set to true
//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUssQ0FBQztBQUNyQixnQkFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDakIsMkJBQWUsR0FBRyxJQUFJLENBQUMseUJBQXlCOztBQUN0RCxnQkFBSSxDQUFDLHlCQUF5QixHQUFHLFlBQU0sRUFBRSxDQUFDOzs7NkNBRWxDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDOzs7OztBQUV6QixnQkFBSSxDQUFDLHlCQUF5QixHQUFHLGVBQWUsQ0FBQzs7Ozs7d0VBbjhCbkQsY0FBYzs7Ozs7OztLQXU4QmpCOzs7U0FwNEJjLGVBQUc7O0FBRWhCLGFBQU8sRUFBRSxDQUFDO0tBQ1g7OztTQXRFRyxjQUFjOzs7QUEwOEJwQixlQUFjLGNBQWMsQ0FBQyxTQUFTLDZCQUFXLENBQUM7O3FCQUVuQyxjQUFjO1FBQ3BCLGNBQWMsR0FBZCxjQUFjIiwiZmlsZSI6ImxpYi9kcml2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlRHJpdmVyLCBEZXZpY2VTZXR0aW5ncyB9IGZyb20gJ2FwcGl1bS1iYXNlLWRyaXZlcic7XG5pbXBvcnQgeyB1dGlsLCBmcyB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgeyBsYXVuY2ggfSBmcm9tICdub2RlLXNpbWN0bCc7XG5pbXBvcnQgV2ViRHJpdmVyQWdlbnQgZnJvbSAnLi93ZGEvd2ViZHJpdmVyYWdlbnQnO1xuaW1wb3J0IGxvZyBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyBjcmVhdGVTaW0sIGdldEV4aXN0aW5nU2ltLCBydW5TaW11bGF0b3JSZXNldCwgaW5zdGFsbFRvU2ltdWxhdG9yLFxuICAgICAgICAgc2h1dGRvd25PdGhlclNpbXVsYXRvcnMsIHNodXRkb3duU2ltdWxhdG9yIH0gZnJvbSAnLi9zaW11bGF0b3ItbWFuYWdlbWVudCc7XG5pbXBvcnQgeyBzaW1FeGlzdHMsIGdldFNpbXVsYXRvciwgaW5zdGFsbFNTTENlcnQsIGhhc1NTTENlcnQgfSBmcm9tICdhcHBpdW0taW9zLXNpbXVsYXRvcic7XG5pbXBvcnQgeyByZXRyeUludGVydmFsLCByZXRyeSB9IGZyb20gJ2FzeW5jYm94JztcbmltcG9ydCB7IHNldHRpbmdzIGFzIGlvc1NldHRpbmdzLCBkZWZhdWx0U2VydmVyQ2FwcywgYXBwVXRpbHMsIElXRFAgfSBmcm9tICdhcHBpdW0taW9zLWRyaXZlcic7XG5pbXBvcnQgZGVzaXJlZENhcENvbnN0cmFpbnRzIGZyb20gJy4vZGVzaXJlZC1jYXBzJztcbmltcG9ydCBjb21tYW5kcyBmcm9tICcuL2NvbW1hbmRzL2luZGV4JztcbmltcG9ydCB7IGRldGVjdFVkaWQsIGdldEFuZENoZWNrWGNvZGVWZXJzaW9uLCBnZXRBbmRDaGVja0lvc1Nka1ZlcnNpb24sXG4gICAgICAgICBhZGp1c3RXREFBdHRhY2htZW50c1Blcm1pc3Npb25zLCBjaGVja0FwcFByZXNlbnQsIGdldERyaXZlckluZm8sXG4gICAgICAgICBjbGVhclN5c3RlbUZpbGVzLCB0cmFuc2xhdGVEZXZpY2VOYW1lLCBub3JtYWxpemVDb21tYW5kVGltZW91dHMsXG4gICAgICAgICBERUZBVUxUX1RJTUVPVVRfS0VZLCBtYXJrU3lzdGVtRmlsZXNGb3JDbGVhbnVwLFxuICAgICAgICAgcHJpbnRVc2VyLCByZW1vdmVBbGxTZXNzaW9uV2ViU29ja2V0SGFuZGxlcnMsIHZlcmlmeUFwcGxpY2F0aW9uUGxhdGZvcm0gfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGdldENvbm5lY3RlZERldmljZXMsIHJ1blJlYWxEZXZpY2VSZXNldCwgaW5zdGFsbFRvUmVhbERldmljZSxcbiAgICAgICAgIGdldFJlYWxEZXZpY2VPYmogfSBmcm9tICcuL3JlYWwtZGV2aWNlLW1hbmFnZW1lbnQnO1xuaW1wb3J0IEIgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IEFzeW5jTG9jayBmcm9tICdhc3luYy1sb2NrJztcblxuXG5jb25zdCBTQUZBUklfQlVORExFX0lEID0gJ2NvbS5hcHBsZS5tb2JpbGVzYWZhcmknO1xuY29uc3QgV0RBX1NJTV9TVEFSVFVQX1JFVFJJRVMgPSAyO1xuY29uc3QgV0RBX1JFQUxfREVWX1NUQVJUVVBfUkVUUklFUyA9IDE7XG5jb25zdCBXREFfUkVBTF9ERVZfVFVUT1JJQUxfVVJMID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9hcHBpdW0vYXBwaXVtLXhjdWl0ZXN0LWRyaXZlci9ibG9iL21hc3Rlci9kb2NzL3JlYWwtZGV2aWNlLWNvbmZpZy5tZCc7XG5jb25zdCBXREFfU1RBUlRVUF9SRVRSWV9JTlRFUlZBTCA9IDEwMDAwO1xuY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcbiAgbmF0aXZlV2ViVGFwOiBmYWxzZSxcbiAgdXNlSlNPTlNvdXJjZTogZmFsc2UsXG4gIHNob3VsZFVzZUNvbXBhY3RSZXNwb25zZXM6IHRydWUsXG4gIGVsZW1lbnRSZXNwb25zZUF0dHJpYnV0ZXM6IFwidHlwZSxsYWJlbFwiLFxufTtcbi8vIFRoaXMgbG9jayBhc3N1cmVzLCB0aGF0IGVhY2ggZHJpdmVyIHNlc3Npb24gZG9lcyBub3Rcbi8vIGFmZmVjdCBzaGFyZWQgcmVzb3VyY2VzIG9mIHRoZSBvdGhlciBwYXJhbGxlbCBzZXNzaW9uc1xuY29uc3QgU0hBUkVEX1JFU09VUkNFU19HVUFSRCA9IG5ldyBBc3luY0xvY2soKTtcblxuXG5jb25zdCBOT19QUk9YWV9OQVRJVkVfTElTVCA9IFtcbiAgWydERUxFVEUnLCAvd2luZG93L10sXG4gIFsnR0VUJywgL15cXC9zZXNzaW9uXFwvW15cXC9dKyQvXSxcbiAgWydHRVQnLCAvYWxlcnRfdGV4dC9dLFxuICBbJ0dFVCcsIC9hbGVydFxcL1teXFwvXSsvXSxcbiAgWydHRVQnLCAvYXBwaXVtL10sXG4gIFsnR0VUJywgL2F0dHJpYnV0ZS9dLFxuICBbJ0dFVCcsIC9jb250ZXh0L10sXG4gIFsnR0VUJywgL2xvY2F0aW9uL10sXG4gIFsnR0VUJywgL2xvZy9dLFxuICBbJ0dFVCcsIC9zY3JlZW5zaG90L10sXG4gIFsnR0VUJywgL3NpemUvXSxcbiAgWydHRVQnLCAvc291cmNlL10sXG4gIFsnR0VUJywgL3VybC9dLFxuICBbJ0dFVCcsIC93aW5kb3cvXSxcbiAgWydQT1NUJywgL2FjY2VwdF9hbGVydC9dLFxuICBbJ1BPU1QnLCAvYWN0aW9ucyQvXSxcbiAgWydQT1NUJywgL2FsZXJ0X3RleHQvXSxcbiAgWydQT1NUJywgL2FsZXJ0XFwvW15cXC9dKy9dLFxuICBbJ1BPU1QnLCAvYXBwaXVtL10sXG4gIFsnUE9TVCcsIC9hcHBpdW1cXC9kZXZpY2VcXC9pc19sb2NrZWQvXSxcbiAgWydQT1NUJywgL2FwcGl1bVxcL2RldmljZVxcL2xvY2svXSxcbiAgWydQT1NUJywgL2FwcGl1bVxcL2RldmljZVxcL3VubG9jay9dLFxuICBbJ1BPU1QnLCAvYmFjay9dLFxuICBbJ1BPU1QnLCAvY2xlYXIvXSxcbiAgWydQT1NUJywgL2NvbnRleHQvXSxcbiAgWydQT1NUJywgL2Rpc21pc3NfYWxlcnQvXSxcbiAgWydQT1NUJywgL2VsZW1lbnQkL10sXG4gIFsnUE9TVCcsIC9lbGVtZW50cyQvXSxcbiAgWydQT1NUJywgL2V4ZWN1dGUvXSxcbiAgWydQT1NUJywgL2tleXMvXSxcbiAgWydQT1NUJywgL2xvZy9dLFxuICBbJ1BPU1QnLCAvbW92ZXRvL10sXG4gIFsnUE9TVCcsIC9yZWNlaXZlX2FzeW5jX3Jlc3BvbnNlL10sIC8vIGFsd2F5cywgaW4gY2FzZSBjb250ZXh0IHN3aXRjaGVzIHdoaWxlIHdhaXRpbmdcbiAgWydQT1NUJywgL3Nlc3Npb25cXC9bXlxcL10rXFwvbG9jYXRpb24vXSwgLy8gZ2VvIGxvY2F0aW9uLCBidXQgbm90IGVsZW1lbnQgbG9jYXRpb25cbiAgWydQT1NUJywgL3NoYWtlL10sXG4gIFsnUE9TVCcsIC90aW1lb3V0cy9dLFxuICBbJ1BPU1QnLCAvdG91Y2gvXSxcbiAgWydQT1NUJywgL3VybC9dLFxuICBbJ1BPU1QnLCAvdmFsdWUvXSxcbiAgWydQT1NUJywgL3dpbmRvdy9dLFxuXTtcbmNvbnN0IE5PX1BST1hZX1dFQl9MSVNUID0gW1xuICBbJ0RFTEVURScsIC9jb29raWUvXSxcbiAgWydHRVQnLCAvYXR0cmlidXRlL10sXG4gIFsnR0VUJywgL2Nvb2tpZS9dLFxuICBbJ0dFVCcsIC9lbGVtZW50L10sXG4gIFsnR0VUJywgL3RleHQvXSxcbiAgWydHRVQnLCAvdGl0bGUvXSxcbiAgWydQT1NUJywgL2NsZWFyL10sXG4gIFsnUE9TVCcsIC9jbGljay9dLFxuICBbJ1BPU1QnLCAvY29va2llL10sXG4gIFsnUE9TVCcsIC9lbGVtZW50L10sXG4gIFsnUE9TVCcsIC9mb3J3YXJkL10sXG4gIFsnUE9TVCcsIC9mcmFtZS9dLFxuICBbJ1BPU1QnLCAva2V5cy9dLFxuICBbJ1BPU1QnLCAvcmVmcmVzaC9dLFxuXS5jb25jYXQoTk9fUFJPWFlfTkFUSVZFX0xJU1QpO1xuXG5jb25zdCBNRU1PSVpFRF9GVU5DVElPTlMgPSBbXG4gICdnZXRXaW5kb3dTaXplTmF0aXZlJyxcbiAgJ2dldFdpbmRvd1NpemVXZWInLFxuICAnZ2V0U3RhdHVzQmFySGVpZ2h0JyxcbiAgJ2dldERldmljZVBpeGVsUmF0aW8nLFxuICAnZ2V0U2NyZWVuSW5mbycsXG4gICdnZXRTYWZhcmlJc0lwaG9uZScsXG4gICdnZXRTYWZhcmlJc0lwaG9uZVgnLFxuXTtcblxuY2xhc3MgWENVSVRlc3REcml2ZXIgZXh0ZW5kcyBCYXNlRHJpdmVyIHtcbiAgY29uc3RydWN0b3IgKG9wdHMgPSB7fSwgc2hvdWxkVmFsaWRhdGVDYXBzID0gdHJ1ZSkge1xuICAgIHN1cGVyKG9wdHMsIHNob3VsZFZhbGlkYXRlQ2Fwcyk7XG5cbiAgICB0aGlzLmRlc2lyZWRDYXBDb25zdHJhaW50cyA9IGRlc2lyZWRDYXBDb25zdHJhaW50cztcblxuICAgIHRoaXMubG9jYXRvclN0cmF0ZWdpZXMgPSBbXG4gICAgICAneHBhdGgnLFxuICAgICAgJ2lkJyxcbiAgICAgICduYW1lJyxcbiAgICAgICdjbGFzcyBuYW1lJyxcbiAgICAgICctaW9zIHByZWRpY2F0ZSBzdHJpbmcnLFxuICAgICAgJy1pb3MgY2xhc3MgY2hhaW4nLFxuICAgICAgJ2FjY2Vzc2liaWxpdHkgaWQnXG4gICAgXTtcbiAgICB0aGlzLndlYkxvY2F0b3JTdHJhdGVnaWVzID0gW1xuICAgICAgJ2xpbmsgdGV4dCcsXG4gICAgICAnY3NzIHNlbGVjdG9yJyxcbiAgICAgICd0YWcgbmFtZScsXG4gICAgICAnbGluayB0ZXh0JyxcbiAgICAgICdwYXJ0aWFsIGxpbmsgdGV4dCdcbiAgICBdO1xuICAgIHRoaXMucmVzZXRJb3MoKTtcbiAgICB0aGlzLnNldHRpbmdzID0gbmV3IERldmljZVNldHRpbmdzKERFRkFVTFRfU0VUVElOR1MsIHRoaXMub25TZXR0aW5nc1VwZGF0ZS5iaW5kKHRoaXMpKTtcblxuICAgIC8vIG1lbW9pemUgZnVuY3Rpb25zIGhlcmUsIHNvIHRoYXQgdGhleSBhcmUgZG9uZSBvbiBhIHBlci1pbnN0YW5jZSBiYXNpc1xuICAgIGZvciAoY29uc3QgZm4gb2YgTUVNT0laRURfRlVOQ1RJT05TKSB7XG4gICAgICB0aGlzW2ZuXSA9IF8ubWVtb2l6ZSh0aGlzW2ZuXSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgb25TZXR0aW5nc1VwZGF0ZSAoa2V5LCB2YWx1ZSkge1xuICAgIGNvbnN0IHByb3h5U2V0dGluZ3MgPSBbXG4gICAgICAnc2hvdWxkVXNlQ29tcGFjdFJlc3BvbnNlcycsXG4gICAgICAnZWxlbWVudFJlc3BvbnNlQXR0cmlidXRlcydcbiAgICBdO1xuICAgIGlmIChrZXkgPT09ICduYXRpdmVXZWJUYXAnKSB7XG4gICAgICB0aGlzLm9wdHMubmF0aXZlV2ViVGFwID0gISF2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKF8uaW5jbHVkZXMocHJveHlTZXR0aW5ncywga2V5KSkge1xuICAgICAgYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoJy9hcHBpdW0vc2V0dGluZ3MnLCAnUE9TVCcsIHtzZXR0aW5nczoge1trZXldOiB2YWx1ZX19KTtcbiAgICB9XG4gIH1cblxuICByZXNldElvcyAoKSB7XG4gICAgdGhpcy5vcHRzID0gdGhpcy5vcHRzIHx8IHt9O1xuICAgIHRoaXMud2RhID0gbnVsbDtcbiAgICB0aGlzLm9wdHMuZGV2aWNlID0gbnVsbDtcbiAgICB0aGlzLmp3cFByb3h5QWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5wcm94eVJlcVJlcyA9IG51bGw7XG4gICAgdGhpcy5qd3BQcm94eUF2b2lkID0gW107XG4gICAgdGhpcy5zYWZhcmkgPSBmYWxzZTtcbiAgICB0aGlzLmNhY2hlZFdkYVN0YXR1cyA9IG51bGw7XG5cbiAgICAvLyBzb21lIHRoaW5ncyB0aGF0IGNvbW1hbmRzIGltcG9ydGVkIGZyb20gYXBwaXVtLWlvcy1kcml2ZXIgbmVlZFxuICAgIHRoaXMuY3VyV2ViRnJhbWVzID0gW107XG4gICAgdGhpcy53ZWJFbGVtZW50SWRzID0gW107XG4gICAgdGhpcy5fY3VycmVudFVybCA9IG51bGw7XG4gICAgdGhpcy5jdXJDb250ZXh0ID0gbnVsbDtcbiAgICB0aGlzLnhjb2RlVmVyc2lvbiA9IHt9O1xuICAgIHRoaXMuaW9zU2RrVmVyc2lvbiA9IG51bGw7XG4gICAgdGhpcy5jb250ZXh0cyA9IFtdO1xuICAgIHRoaXMuaW1wbGljaXRXYWl0TXMgPSAwO1xuICAgIHRoaXMuYXN5bmNsaWJXYWl0TXMgPSAwO1xuICAgIHRoaXMucGFnZUxvYWRNcyA9IDYwMDA7XG4gICAgdGhpcy5sYW5kc2NhcGVXZWJDb29yZHNPZmZzZXQgPSAwO1xuICB9XG5cbiAgZ2V0IGRyaXZlckRhdGEgKCkge1xuICAgIC8vIFRPRE8gZmlsbCBvdXQgcmVzb3VyY2UgaW5mbyBoZXJlXG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgYXN5bmMgZ2V0U3RhdHVzICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuZHJpdmVySW5mbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuZHJpdmVySW5mbyA9IGF3YWl0IGdldERyaXZlckluZm8oKTtcbiAgICB9XG4gICAgbGV0IHN0YXR1cyA9IHtidWlsZDoge3ZlcnNpb246IHRoaXMuZHJpdmVySW5mby52ZXJzaW9ufX07XG4gICAgaWYgKHRoaXMuY2FjaGVkV2RhU3RhdHVzKSB7XG4gICAgICBzdGF0dXMud2RhID0gdGhpcy5jYWNoZWRXZGFTdGF0dXM7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXM7XG4gIH1cblxuICBhc3luYyBjcmVhdGVTZXNzaW9uICguLi5hcmdzKSB7XG4gICAgdGhpcy5saWZlY3ljbGVEYXRhID0ge307IC8vIHRoaXMgaXMgdXNlZCBmb3Iga2VlcGluZyB0cmFjayBvZiB0aGUgc3RhdGUgd2Ugc3RhcnQgc28gd2hlbiB3ZSBkZWxldGUgdGhlIHNlc3Npb24gd2UgY2FuIHB1dCB0aGluZ3MgYmFja1xuICAgIHRyeSB7XG4gICAgICAvLyBUT0RPIGFkZCB2YWxpZGF0aW9uIG9uIGNhcHNcbiAgICAgIGxldCBbc2Vzc2lvbklkLCBjYXBzXSA9IGF3YWl0IHN1cGVyLmNyZWF0ZVNlc3Npb24oLi4uYXJncyk7XG4gICAgICB0aGlzLm9wdHMuc2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuXG4gICAgICBhd2FpdCB0aGlzLnN0YXJ0KCk7XG5cbiAgICAgIC8vIG1lcmdlIHNlcnZlciBjYXBhYmlsaXRpZXMgKyBkZXNpcmVkIGNhcGFiaWxpdGllc1xuICAgICAgY2FwcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRTZXJ2ZXJDYXBzLCBjYXBzKTtcbiAgICAgIC8vIHVwZGF0ZSB0aGUgdWRpZCB3aXRoIHdoYXQgaXMgYWN0dWFsbHkgdXNlZFxuICAgICAgY2Fwcy51ZGlkID0gdGhpcy5vcHRzLnVkaWQ7XG4gICAgICAvLyBlbnN1cmUgd2UgdHJhY2sgbmF0aXZlV2ViVGFwIGNhcGFiaWxpdHkgYXMgYSBzZXR0aW5nIGFzIHdlbGxcbiAgICAgIGlmIChfLmhhcyh0aGlzLm9wdHMsICduYXRpdmVXZWJUYXAnKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVNldHRpbmdzKHtuYXRpdmVXZWJUYXA6IHRoaXMub3B0cy5uYXRpdmVXZWJUYXB9KTtcbiAgICAgIH1cbiAgICAgIC8vIGVuc3VyZSB3ZSB0cmFjayB1c2VKU09OU291cmNlIGNhcGFiaWxpdHkgYXMgYSBzZXR0aW5nIGFzIHdlbGxcbiAgICAgIGlmIChfLmhhcyh0aGlzLm9wdHMsICd1c2VKU09OU291cmNlJykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVTZXR0aW5ncyh7dXNlSlNPTlNvdXJjZTogdGhpcy5vcHRzLnVzZUpTT05Tb3VyY2V9KTtcbiAgICAgIH1cblxuICAgICAgbGV0IHdkYVNldHRpbmdzID0ge1xuICAgICAgICBlbGVtZW50UmVzcG9uc2VBdHRyaWJ1dGVzOiBERUZBVUxUX1NFVFRJTkdTLmVsZW1lbnRSZXNwb25zZUF0dHJpYnV0ZXMsXG4gICAgICAgIHNob3VsZFVzZUNvbXBhY3RSZXNwb25zZXM6IERFRkFVTFRfU0VUVElOR1Muc2hvdWxkVXNlQ29tcGFjdFJlc3BvbnNlcyxcbiAgICAgIH07XG4gICAgICBpZiAoXy5oYXModGhpcy5vcHRzLCAnZWxlbWVudFJlc3BvbnNlQXR0cmlidXRlcycpKSB7XG4gICAgICAgIHdkYVNldHRpbmdzLmVsZW1lbnRSZXNwb25zZUF0dHJpYnV0ZXMgPSB0aGlzLm9wdHMuZWxlbWVudFJlc3BvbnNlQXR0cmlidXRlcztcbiAgICAgIH1cbiAgICAgIGlmIChfLmhhcyh0aGlzLm9wdHMsICdzaG91bGRVc2VDb21wYWN0UmVzcG9uc2VzJykpIHtcbiAgICAgICAgd2RhU2V0dGluZ3Muc2hvdWxkVXNlQ29tcGFjdFJlc3BvbnNlcyA9IHRoaXMub3B0cy5zaG91bGRVc2VDb21wYWN0UmVzcG9uc2VzO1xuICAgICAgfVxuICAgICAgLy8gZW5zdXJlIFdEQSBnZXRzIG91ciBkZWZhdWx0cyBpbnN0ZWFkIG9mIHdoYXRldmVyIGl0cyBvd24gbWlnaHQgYmVcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlU2V0dGluZ3Mod2RhU2V0dGluZ3MpO1xuICAgICAgcmV0dXJuIFtzZXNzaW9uSWQsIGNhcHNdO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZy5lcnJvcihlKTtcbiAgICAgIGF3YWl0IHRoaXMuZGVsZXRlU2Vzc2lvbigpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdGFydCAoKSB7XG4gICAgdGhpcy5vcHRzLm5vUmVzZXQgPSAhIXRoaXMub3B0cy5ub1Jlc2V0O1xuICAgIHRoaXMub3B0cy5mdWxsUmVzZXQgPSAhIXRoaXMub3B0cy5mdWxsUmVzZXQ7XG5cbiAgICBhd2FpdCBwcmludFVzZXIoKTtcblxuICAgIGlmICh0aGlzLm9wdHMucGxhdGZvcm1WZXJzaW9uICYmIHBhcnNlRmxvYXQodGhpcy5vcHRzLnBsYXRmb3JtVmVyc2lvbikgPCA5LjMpIHtcbiAgICAgIHRocm93IEVycm9yKGBQbGF0Zm9ybSB2ZXJzaW9uIG11c3QgYmUgOS4zIG9yIGFib3ZlLiAnJHt0aGlzLm9wdHMucGxhdGZvcm1WZXJzaW9ufScgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBpZiAoXy5pc0VtcHR5KHRoaXMueGNvZGVWZXJzaW9uKSAmJiAoIXRoaXMub3B0cy53ZWJEcml2ZXJBZ2VudFVybCB8fCAhdGhpcy5vcHRzLnJlYWxEZXZpY2UpKSB7XG4gICAgICAvLyBubyBgd2ViRHJpdmVyQWdlbnRVcmxgLCBvciBvbiBhIHNpbXVsYXRvciwgc28gd2UgbmVlZCBhbiBYY29kZSB2ZXJzaW9uXG4gICAgICB0aGlzLnhjb2RlVmVyc2lvbiA9IGF3YWl0IGdldEFuZENoZWNrWGNvZGVWZXJzaW9uKCk7XG4gICAgICBsZXQgdG9vbHMgPSAhdGhpcy54Y29kZVZlcnNpb24udG9vbHNWZXJzaW9uID8gJycgOiBgKHRvb2xzIHYke3RoaXMueGNvZGVWZXJzaW9uLnRvb2xzVmVyc2lvbn0pYDtcbiAgICAgIGxvZy5kZWJ1ZyhgWGNvZGUgdmVyc2lvbiBzZXQgdG8gJyR7dGhpcy54Y29kZVZlcnNpb24udmVyc2lvblN0cmluZ30nICR7dG9vbHN9YCk7XG5cbiAgICAgIHRoaXMuaW9zU2RrVmVyc2lvbiA9IGF3YWl0IGdldEFuZENoZWNrSW9zU2RrVmVyc2lvbigpO1xuICAgICAgbG9nLmRlYnVnKGBpT1MgU0RLIFZlcnNpb24gc2V0IHRvICcke3RoaXMuaW9zU2RrVmVyc2lvbn0nYCk7XG4gICAgfVxuXG4gICAgdGhpcy5sb2dFdmVudCgneGNvZGVEZXRhaWxzUmV0cmlldmVkJyk7XG5cbiAgICBsZXQge2RldmljZSwgdWRpZCwgcmVhbERldmljZX0gPSBhd2FpdCB0aGlzLmRldGVybWluZURldmljZSgpO1xuICAgIGxvZy5pbmZvKGBEZXRlcm1pbmluZyBkZXZpY2UgdG8gcnVuIHRlc3RzIG9uOiB1ZGlkOiAnJHt1ZGlkfScsIHJlYWwgZGV2aWNlOiAke3JlYWxEZXZpY2V9YCk7XG4gICAgdGhpcy5vcHRzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLm9wdHMudWRpZCA9IHVkaWQ7XG4gICAgdGhpcy5vcHRzLnJlYWxEZXZpY2UgPSByZWFsRGV2aWNlO1xuXG4gICAgaWYgKHRoaXMub3B0cy5lbmFibGVBc3luY0V4ZWN1dGVGcm9tSHR0cHMgJiYgIXRoaXMuaXNSZWFsRGV2aWNlKCkpIHtcbiAgICAgIC8vIHNodXRkb3duIHRoZSBzaW11bGF0b3Igc28gdGhhdCB0aGUgc3NsIGNlcnQgaXMgcmVjb2duaXplZFxuICAgICAgYXdhaXQgc2h1dGRvd25TaW11bGF0b3IodGhpcy5vcHRzLmRldmljZSk7XG4gICAgICBhd2FpdCB0aGlzLnN0YXJ0SHR0cHNBc3luY1NlcnZlcigpO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQgaWYgdGhlcmUgaXMgbm8gcGxhdGZvcm1WZXJzaW9uLCBnZXQgaXQgZnJvbSB0aGUgZGV2aWNlXG4gICAgaWYgKCF0aGlzLm9wdHMucGxhdGZvcm1WZXJzaW9uKSB7XG4gICAgICBpZiAodGhpcy5vcHRzLmRldmljZSAmJiBfLmlzRnVuY3Rpb24odGhpcy5vcHRzLmRldmljZS5nZXRQbGF0Zm9ybVZlcnNpb24pKSB7XG4gICAgICAgIHRoaXMub3B0cy5wbGF0Zm9ybVZlcnNpb24gPSBhd2FpdCB0aGlzLm9wdHMuZGV2aWNlLmdldFBsYXRmb3JtVmVyc2lvbigpO1xuICAgICAgICBsb2cuaW5mbyhgTm8gcGxhdGZvcm1WZXJzaW9uIHNwZWNpZmllZC4gVXNpbmcgZGV2aWNlIHZlcnNpb246ICcke3RoaXMub3B0cy5wbGF0Zm9ybVZlcnNpb259J2ApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETzogdGhpcyBpcyB3aGVuIGl0IGlzIGEgcmVhbCBkZXZpY2UuIHdoZW4gd2UgaGF2ZSBhIHJlYWwgb2JqZWN0IHdpcmUgaXQgaW5cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0cy53ZWJEcml2ZXJBZ2VudFVybCAmJiB0aGlzLmlvc1Nka1ZlcnNpb24pIHtcbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSB4Y29kZSB3ZSBhcmUgdXNpbmcgY2FuIGhhbmRsZSB0aGUgcGxhdGZvcm1cbiAgICAgIGlmIChwYXJzZUZsb2F0KHRoaXMub3B0cy5wbGF0Zm9ybVZlcnNpb24pID4gcGFyc2VGbG9hdCh0aGlzLmlvc1Nka1ZlcnNpb24pKSB7XG4gICAgICAgIGxldCBtc2cgPSBgWGNvZGUgJHt0aGlzLnhjb2RlVmVyc2lvbi52ZXJzaW9uU3RyaW5nfSBoYXMgYSBtYXhpbXVtIFNESyB2ZXJzaW9uIG9mICR7dGhpcy5pb3NTZGtWZXJzaW9ufS4gYCArXG4gICAgICAgICAgICAgICAgICBgSXQgZG9lcyBub3Qgc3VwcG9ydCBpT1MgdmVyc2lvbiAke3RoaXMub3B0cy5wbGF0Zm9ybVZlcnNpb259YDtcbiAgICAgICAgbG9nLmVycm9yQW5kVGhyb3cobXNnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbG9nLmRlYnVnKCdYY29kZSB2ZXJzaW9uIHdpbGwgbm90IGJlIHZhbGlkYXRlZCBhZ2FpbnN0IGlPUyBTREsgdmVyc2lvbi4nKTtcbiAgICB9XG5cbiAgICBpZiAoKHRoaXMub3B0cy5icm93c2VyTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PT0gJ3NhZmFyaScpIHtcbiAgICAgIGxvZy5pbmZvKCdTYWZhcmkgdGVzdCByZXF1ZXN0ZWQnKTtcbiAgICAgIHRoaXMuc2FmYXJpID0gdHJ1ZTtcbiAgICAgIHRoaXMub3B0cy5hcHAgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLm9wdHMucHJvY2Vzc0FyZ3VtZW50cyA9IHRoaXMub3B0cy5wcm9jZXNzQXJndW1lbnRzIHx8IHt9O1xuICAgICAgdGhpcy5vcHRzLmJ1bmRsZUlkID0gU0FGQVJJX0JVTkRMRV9JRDtcbiAgICAgIHRoaXMuX2N1cnJlbnRVcmwgPSB0aGlzLm9wdHMuc2FmYXJpSW5pdGlhbFVybCB8fCAoXG4gICAgICAgIHRoaXMuaXNSZWFsRGV2aWNlKCkgP1xuICAgICAgICAnaHR0cDovL2FwcGl1bS5pbycgOlxuICAgICAgICBgaHR0cDovLyR7dGhpcy5vcHRzLmFkZHJlc3N9OiR7dGhpcy5vcHRzLnBvcnR9L3dlbGNvbWVgXG4gICAgICApO1xuICAgICAgdGhpcy5vcHRzLnByb2Nlc3NBcmd1bWVudHMuYXJncyA9IFsnLXUnLCB0aGlzLl9jdXJyZW50VXJsXTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy5jb25maWd1cmVBcHAoKTtcbiAgICB9XG4gICAgdGhpcy5sb2dFdmVudCgnYXBwQ29uZmlndXJlZCcpO1xuXG4gICAgLy8gZmFpbCB2ZXJ5IGVhcmx5IGlmIHRoZSBhcHAgZG9lc24ndCBhY3R1YWxseSBleGlzdFxuICAgIC8vIG9yIGlmIGJ1bmRsZSBpZCBkb2Vzbid0IHBvaW50IHRvIGFuIGluc3RhbGxlZCBhcHBcbiAgICBpZiAodGhpcy5vcHRzLmFwcCkge1xuICAgICAgYXdhaXQgY2hlY2tBcHBQcmVzZW50KHRoaXMub3B0cy5hcHApO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5vcHRzLmJ1bmRsZUlkKSB7XG4gICAgICB0aGlzLm9wdHMuYnVuZGxlSWQgPSBhd2FpdCBhcHBVdGlscy5leHRyYWN0QnVuZGxlSWQodGhpcy5vcHRzLmFwcCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5ydW5SZXNldCgpO1xuXG4gICAgY29uc3Qgc3RhcnRMb2dDYXB0dXJlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zdGFydExvZ0NhcHR1cmUoKTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgdGhpcy5sb2dFdmVudCgnbG9nQ2FwdHVyZVN0YXJ0ZWQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBjb25zdCBpc0xvZ0NhcHR1cmVTdGFydGVkID0gYXdhaXQgc3RhcnRMb2dDYXB0dXJlKCk7XG5cbiAgICBsb2cuaW5mbyhgU2V0dGluZyB1cCAke3RoaXMuaXNSZWFsRGV2aWNlKCkgPyAncmVhbCBkZXZpY2UnIDogJ3NpbXVsYXRvcid9YCk7XG5cbiAgICBpZiAodGhpcy5pc1NpbXVsYXRvcigpKSB7XG4gICAgICBpZiAodGhpcy5vcHRzLnNodXRkb3duT3RoZXJTaW11bGF0b3JzKSB7XG4gICAgICAgIGlmICghdGhpcy5yZWxheGVkU2VjdXJpdHlFbmFibGVkKSB7XG4gICAgICAgICAgbG9nLmVycm9yQW5kVGhyb3coYEFwcGl1bSBzZXJ2ZXIgbXVzdCBoYXZlIHJlbGF4ZWQgc2VjdXJpdHkgZmxhZyBzZXQgaW4gb3JkZXIgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYGZvciAnc2h1dGRvd25PdGhlclNpbXVsYXRvcnMnIGNhcGFiaWxpdHkgdG8gd29ya2ApO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHNodXRkb3duT3RoZXJTaW11bGF0b3JzKHRoaXMub3B0cy5kZXZpY2UpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxvY2FsQ29uZmlnID0gYXdhaXQgaW9zU2V0dGluZ3Muc2V0TG9jYWxlQW5kUHJlZmVyZW5jZXModGhpcy5vcHRzLmRldmljZSwgdGhpcy5vcHRzLCB0aGlzLmlzU2FmYXJpKCksIGFzeW5jIChzaW0pID0+IHtcbiAgICAgICAgYXdhaXQgc2h1dGRvd25TaW11bGF0b3Ioc2ltKTtcbiAgICAgICAgLy8gd2UgZG9uJ3Qga25vdyBpZiB0aGVyZSBuZWVkcyB0byBiZSBjaGFuZ2VzIGEgcHJpb3JpLCBzbyBjaGFuZ2UgZmlyc3QuXG4gICAgICAgIC8vIHNvbWV0aW1lcyB0aGUgc2h1dGRvd24gcHJvY2VzcyBjaGFuZ2VzIHRoZSBzZXR0aW5ncywgc28gcmVzZXQgdGhlbSxcbiAgICAgICAgLy8ga25vd2luZyB0aGF0IHRoZSBzaW0gaXMgYWxyZWFkeSBzaHV0XG4gICAgICAgIGF3YWl0IGlvc1NldHRpbmdzLnNldExvY2FsZUFuZFByZWZlcmVuY2VzKHNpbSwgdGhpcy5vcHRzLCB0aGlzLmlzU2FmYXJpKCkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIENsZWFudXAgb2YgaW5zdGFsbGQgY2FjaGUgaGVscHMgdG8gc2F2ZSBkaXNrIHNwYWNlIHdoaWxlIHJ1bm5pbmcgbXVsdGlwbGUgdGVzdHNcbiAgICAgIC8vIHdpdGhvdXQgcmVzdGFydGluZyB0aGUgU2ltdWxhdG9yOiBodHRwczovL2dpdGh1Yi5jb20vYXBwaXVtL2FwcGl1bS9pc3N1ZXMvOTQxMFxuICAgICAgYXdhaXQgdGhpcy5vcHRzLmRldmljZS5jbGVhckNhY2hlcygnY29tLmFwcGxlLm1vYmlsZS5pbnN0YWxsZC5zdGFnaW5nJyk7XG5cbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRTaW0oKTtcblxuICAgICAgaWYgKHRoaXMub3B0cy5jdXN0b21TU0xDZXJ0KSB7XG4gICAgICAgIGlmIChhd2FpdCBoYXNTU0xDZXJ0KHRoaXMub3B0cy5jdXN0b21TU0xDZXJ0LCB0aGlzLm9wdHMudWRpZCkpIHtcbiAgICAgICAgICBsb2cuaW5mbyhgU1NMIGNlcnQgJyR7Xy50cnVuY2F0ZSh0aGlzLm9wdHMuY3VzdG9tU1NMQ2VydCwge2xlbmd0aDogMjB9KX0nIGFscmVhZHkgaW5zdGFsbGVkYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nLmluZm8oYEluc3RhbGxpbmcgc3NsIGNlcnQgJyR7Xy50cnVuY2F0ZSh0aGlzLm9wdHMuY3VzdG9tU1NMQ2VydCwge2xlbmd0aDogMjB9KX0nYCk7XG4gICAgICAgICAgYXdhaXQgc2h1dGRvd25TaW11bGF0b3IodGhpcy5vcHRzLmRldmljZSk7XG4gICAgICAgICAgYXdhaXQgaW5zdGFsbFNTTENlcnQodGhpcy5vcHRzLmN1c3RvbVNTTENlcnQsIHRoaXMub3B0cy51ZGlkKTtcbiAgICAgICAgICBsb2cuaW5mbyhgUmVzdGFydGluZyBTaW11bGF0b3Igc28gdGhhdCBTU0wgY2VydGlmaWNhdGUgaW5zdGFsbGF0aW9uIHRha2VzIGVmZmVjdGApO1xuICAgICAgICAgIGF3YWl0IHRoaXMuc3RhcnRTaW0oKTtcbiAgICAgICAgICB0aGlzLmxvZ0V2ZW50KCdjdXN0b21DZXJ0SW5zdGFsbGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5sb2dFdmVudCgnc2ltU3RhcnRlZCcpO1xuICAgICAgaWYgKCFpc0xvZ0NhcHR1cmVTdGFydGVkKSB7XG4gICAgICAgIC8vIFJldHJ5IGxvZyBjYXB0dXJlIGlmIFNpbXVsYXRvciB3YXMgbm90IHJ1bm5pbmcgYmVmb3JlXG4gICAgICAgIGF3YWl0IHN0YXJ0TG9nQ2FwdHVyZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdHMuYXBwKSB7XG4gICAgICBhd2FpdCB0aGlzLmluc3RhbGxBVVQoKTtcbiAgICAgIHRoaXMubG9nRXZlbnQoJ2FwcEluc3RhbGxlZCcpO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIG9ubHkgaGF2ZSBidW5kbGUgaWRlbnRpZmllciBhbmQgbm8gYXBwLCBmYWlsIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGluc3RhbGxlZFxuICAgIGlmICghdGhpcy5vcHRzLmFwcCAmJiB0aGlzLm9wdHMuYnVuZGxlSWQgJiYgIXRoaXMuc2FmYXJpKSB7XG4gICAgICBpZiAoIWF3YWl0IHRoaXMub3B0cy5kZXZpY2UuaXNBcHBJbnN0YWxsZWQodGhpcy5vcHRzLmJ1bmRsZUlkKSkge1xuICAgICAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQXBwIHdpdGggYnVuZGxlIGlkZW50aWZpZXIgJyR7dGhpcy5vcHRzLmJ1bmRsZUlkfScgdW5rbm93bmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGF3YWl0IFNIQVJFRF9SRVNPVVJDRVNfR1VBUkQuYWNxdWlyZShYQ1VJVGVzdERyaXZlci5uYW1lLFxuICAgICAgYXN5bmMgKCkgPT4gYXdhaXQgdGhpcy5zdGFydFdkYSh0aGlzLm9wdHMuc2Vzc2lvbklkLCByZWFsRGV2aWNlKSk7XG5cbiAgICBhd2FpdCB0aGlzLnNldEluaXRpYWxPcmllbnRhdGlvbih0aGlzLm9wdHMub3JpZW50YXRpb24pO1xuICAgIHRoaXMubG9nRXZlbnQoJ29yaWVudGF0aW9uU2V0Jyk7XG5cbiAgICBpZiAodGhpcy5pc1JlYWxEZXZpY2UoKSAmJiB0aGlzLm9wdHMuc3RhcnRJV0RQKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLnN0YXJ0SVdEUCgpO1xuICAgICAgICBsb2cuZGVidWcoYFN0YXJ0ZWQgaW9zX3dlYmtpdF9kZWJ1ZyBwcm94eSBzZXJ2ZXIgYXQ6ICR7dGhpcy5pd2RwU2VydmVyLmVuZHBvaW50fWApO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZy5lcnJvckFuZFRocm93KGBDb3VsZCBub3Qgc3RhcnQgaW9zX3dlYmtpdF9kZWJ1Z19wcm94eSBzZXJ2ZXI6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNTYWZhcmkoKSB8fCB0aGlzLm9wdHMuYXV0b1dlYnZpZXcpIHtcbiAgICAgIGxvZy5kZWJ1ZygnV2FpdGluZyBmb3IgaW5pdGlhbCB3ZWJ2aWV3Jyk7XG4gICAgICBhd2FpdCB0aGlzLm5hdlRvSW5pdGlhbFdlYnZpZXcoKTtcbiAgICAgIHRoaXMubG9nRXZlbnQoJ2luaXRpYWxXZWJ2aWV3TmF2aWdhdGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzUmVhbERldmljZSgpKSB7XG4gICAgICBpZiAodGhpcy5vcHRzLmNhbGVuZGFyQWNjZXNzQXV0aG9yaXplZCkge1xuICAgICAgICBhd2FpdCB0aGlzLm9wdHMuZGV2aWNlLmVuYWJsZUNhbGVuZGFyQWNjZXNzKHRoaXMub3B0cy5idW5kbGVJZCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0cy5jYWxlbmRhckFjY2Vzc0F1dGhvcml6ZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIGF3YWl0IHRoaXMub3B0cy5kZXZpY2UuZGlzYWJsZUNhbGVuZGFyQWNjZXNzKHRoaXMub3B0cy5idW5kbGVJZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IFdlYkRyaXZlckFnZW50UnVubmVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZXNzaW9uSWQgLSBUaGUgaWQgb2YgdGhlIHRhcmdldCBzZXNzaW9uIHRvIGxhdW5jaCBXREEgd2l0aC5cbiAgICogQHBhcmFtIHtib29sZWFufSByZWFsRGV2aWNlIC0gRXF1YWxzIHRvIHRydWUgaWYgdGhlIHRlc3QgdGFyZ2V0IGRldmljZSBpcyBhIHJlYWwgZGV2aWNlLlxuICAgKi9cbiAgYXN5bmMgc3RhcnRXZGEgKHNlc3Npb25JZCwgcmVhbERldmljZSkge1xuICAgIHRoaXMud2RhID0gbmV3IFdlYkRyaXZlckFnZW50KHRoaXMueGNvZGVWZXJzaW9uLCB0aGlzLm9wdHMpO1xuXG4gICAgYXdhaXQgdGhpcy53ZGEuY2xlYW51cE9ic29sZXRlUHJvY2Vzc2VzKCk7XG5cbiAgICBpZiAodGhpcy5vcHRzLnVzZU5ld1dEQSkge1xuICAgICAgbG9nLmRlYnVnKGBDYXBhYmlsaXR5ICd1c2VOZXdXREEnIHNldCB0byB0cnVlLCBzbyB1bmluc3RhbGxpbmcgV0RBIGJlZm9yZSBwcm9jZWVkaW5nYCk7XG4gICAgICBhd2FpdCB0aGlzLndkYS5xdWl0QW5kVW5pbnN0YWxsKCk7XG4gICAgICB0aGlzLmxvZ0V2ZW50KCd3ZGFVbmluc3RhbGxlZCcpO1xuICAgIH0gZWxzZSBpZiAoIXV0aWwuaGFzVmFsdWUodGhpcy53ZGEud2ViRHJpdmVyQWdlbnRVcmwpKSB7XG4gICAgICBhd2FpdCB0aGlzLndkYS5zZXR1cENhY2hpbmcodGhpcy5vcHRzLnVwZGF0ZWRXREFCdW5kbGVJZCk7XG4gICAgfVxuXG4gICAgLy8gbG9jYWwgaGVscGVyIGZvciB0aGUgdHdvIHBsYWNlcyB3ZSBuZWVkIHRvIHVuaW5zdGFsbCB3ZGEgYW5kIHJlLXN0YXJ0IGl0XG4gICAgY29uc3QgcXVpdEFuZFVuaW5zdGFsbCA9IGFzeW5jIChtc2cpID0+IHtcbiAgICAgIGxvZy5kZWJ1Zyhtc2cpO1xuICAgICAgaWYgKHRoaXMub3B0cy53ZWJEcml2ZXJBZ2VudFVybCkge1xuICAgICAgICBsb2cuZGVidWcoJ05vdCBxdWl0dGluZyBhbmQgdW5zaW5zdGFsbGluZyBXZWJEcml2ZXJBZ2VudCBhcyB3ZWJEcml2ZXJBZ2VudFVybCBpcyBwcm92aWRlZCcpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIGxvZy53YXJuKCdRdWl0dGluZyBhbmQgdW5pbnN0YWxsaW5nIFdlYkRyaXZlckFnZW50LCB0aGVuIHJldHJ5aW5nJyk7XG4gICAgICBhd2FpdCB0aGlzLndkYS5xdWl0QW5kVW5pbnN0YWxsKCk7XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH07XG5cbiAgICBjb25zdCBzdGFydHVwUmV0cmllcyA9IHRoaXMub3B0cy53ZGFTdGFydHVwUmV0cmllcyB8fCAodGhpcy5pc1JlYWxEZXZpY2UoKSA/IFdEQV9SRUFMX0RFVl9TVEFSVFVQX1JFVFJJRVMgOiBXREFfU0lNX1NUQVJUVVBfUkVUUklFUyk7XG4gICAgY29uc3Qgc3RhcnR1cFJldHJ5SW50ZXJ2YWwgPSB0aGlzLm9wdHMud2RhU3RhcnR1cFJldHJ5SW50ZXJ2YWwgfHwgV0RBX1NUQVJUVVBfUkVUUllfSU5URVJWQUw7XG4gICAgbG9nLmRlYnVnKGBUcnlpbmcgdG8gc3RhcnQgV2ViRHJpdmVyQWdlbnQgJHtzdGFydHVwUmV0cmllc30gdGltZXMgd2l0aCAke3N0YXJ0dXBSZXRyeUludGVydmFsfW1zIGludGVydmFsYCk7XG4gICAgYXdhaXQgcmV0cnlJbnRlcnZhbChzdGFydHVwUmV0cmllcywgc3RhcnR1cFJldHJ5SW50ZXJ2YWwsIGFzeW5jICgpID0+IHtcbiAgICAgIHRoaXMubG9nRXZlbnQoJ3dkYVN0YXJ0QXR0ZW1wdGVkJyk7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBvbiB4Y29kZSAxMCBpbnN0YWxsZCB3aWxsIG9mdGVuIHRyeSB0byBhY2Nlc3MgdGhlIGFwcCBmcm9tIGl0cyBzdGFnaW5nXG4gICAgICAgIC8vIGRpcmVjdG9yeSBiZWZvcmUgZnVsbHkgbW92aW5nIGl0IHRoZXJlLCBhbmQgZmFpbC4gUmV0cnlpbmcgb25jZVxuICAgICAgICAvLyBpbW1lZGlhdGVseSBoZWxwc1xuICAgICAgICBjb25zdCByZXRyaWVzID0gdGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPj0gMTAgPyAyIDogMTtcbiAgICAgICAgdGhpcy5jYWNoZWRXZGFTdGF0dXMgPSBhd2FpdCByZXRyeShyZXRyaWVzLCB0aGlzLndkYS5sYXVuY2guYmluZCh0aGlzLndkYSksIHNlc3Npb25JZCwgcmVhbERldmljZSk7XG4gICAgICAgIC8vIHRoaXMuY2FjaGVkV2RhU3RhdHVzID0gYXdhaXQgdGhpcy53ZGEubGF1bmNoKHNlc3Npb25JZCwgcmVhbERldmljZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5sb2dFdmVudCgnd2RhU3RhcnRGYWlsZWQnKTtcbiAgICAgICAgbGV0IGVycm9yTXNnID0gYFVuYWJsZSB0byBsYXVuY2ggV2ViRHJpdmVyQWdlbnQgYmVjYXVzZSBvZiB4Y29kZWJ1aWxkIGZhaWx1cmU6IFwiJHtlcnIubWVzc2FnZX1cIi5gO1xuICAgICAgICBpZiAodGhpcy5pc1JlYWxEZXZpY2UoKSkge1xuICAgICAgICAgIGVycm9yTXNnICs9IGAgTWFrZSBzdXJlIHlvdSBmb2xsb3cgdGhlIHR1dG9yaWFsIGF0ICR7V0RBX1JFQUxfREVWX1RVVE9SSUFMX1VSTH0uIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGBUcnkgdG8gcmVtb3ZlIHRoZSBXZWJEcml2ZXJBZ2VudFJ1bm5lciBhcHBsaWNhdGlvbiBmcm9tIHRoZSBkZXZpY2UgaWYgaXQgaXMgaW5zdGFsbGVkIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGBhbmQgcmVib290IHRoZSBkZXZpY2UuYDtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBxdWl0QW5kVW5pbnN0YWxsKGVycm9yTXNnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm94eVJlcVJlcyA9IHRoaXMud2RhLnByb3h5UmVxUmVzLmJpbmQodGhpcy53ZGEpO1xuICAgICAgdGhpcy5qd3BQcm94eUFjdGl2ZSA9IHRydWU7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHJldHJ5SW50ZXJ2YWwoMTUsIDEwMDAsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLmxvZ0V2ZW50KCd3ZGFTZXNzaW9uQXR0ZW1wdGVkJyk7XG4gICAgICAgICAgbG9nLmRlYnVnKCdTZW5kaW5nIGNyZWF0ZVNlc3Npb24gY29tbWFuZCB0byBXREEnKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRXZGFTdGF0dXMgPSB0aGlzLmNhY2hlZFdkYVN0YXR1cyB8fCBhd2FpdCB0aGlzLnByb3h5Q29tbWFuZCgnL3N0YXR1cycsICdHRVQnKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RhcnRXZGFTZXNzaW9uKHRoaXMub3B0cy5idW5kbGVJZCwgdGhpcy5vcHRzLnByb2Nlc3NBcmd1bWVudHMpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nLmRlYnVnKGBGYWlsZWQgdG8gY3JlYXRlIFdEQSBzZXNzaW9uICgke2Vyci5tZXNzYWdlfSkuIFJldHJ5aW5nLi4uYCk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sb2dFdmVudCgnd2RhU2Vzc2lvblN0YXJ0ZWQnKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBsZXQgZXJyb3JNc2cgPSBgVW5hYmxlIHRvIHN0YXJ0IFdlYkRyaXZlckFnZW50IHNlc3Npb24gYmVjYXVzZSBvZiB4Y29kZWJ1aWxkIGZhaWx1cmU6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsRGV2aWNlKCkpIHtcbiAgICAgICAgICBlcnJvck1zZyArPSBgIE1ha2Ugc3VyZSB5b3UgZm9sbG93IHRoZSB0dXRvcmlhbCBhdCAke1dEQV9SRUFMX0RFVl9UVVRPUklBTF9VUkx9LiBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgVHJ5IHRvIHJlbW92ZSB0aGUgV2ViRHJpdmVyQWdlbnRSdW5uZXIgYXBwbGljYXRpb24gZnJvbSB0aGUgZGV2aWNlIGlmIGl0IGlzIGluc3RhbGxlZCBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgYW5kIHJlYm9vdCB0aGUgZGV2aWNlLmA7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgcXVpdEFuZFVuaW5zdGFsbChlcnJvck1zZyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdXRpbC5oYXNWYWx1ZSh0aGlzLm9wdHMucHJldmVudFdEQUF0dGFjaG1lbnRzKSkge1xuICAgICAgICAvLyBYQ1Rlc3QgcHJpb3IgdG8gWGNvZGUgOSBTREsgaGFzIG5vIG5hdGl2ZSB3YXkgdG8gZGlzYWJsZSBhdHRhY2htZW50c1xuICAgICAgICB0aGlzLm9wdHMucHJldmVudFdEQUF0dGFjaG1lbnRzID0gdGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPCA5O1xuICAgICAgICBpZiAodGhpcy5vcHRzLnByZXZlbnRXREFBdHRhY2htZW50cykge1xuICAgICAgICAgIGxvZy5pbmZvKCdFbmFibGVkIFdEQSBhdHRhY2htZW50cyBwcmV2ZW50aW9uIGJ5IGRlZmF1bHQgdG8gc2F2ZSB0aGUgZGlzayBzcGFjZS4gJyArXG4gICAgICAgICAgICAgICAgICAgYFNldCAncHJldmVudFdEQUF0dGFjaG1lbnRzJyBjYXBhYmlsaXR5IHRvIGZhbHNlIGlmIHRoaXMgaXMgYW4gdW5kZXNpcmVkIGJlaGF2aW9yLmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRzLnByZXZlbnRXREFBdHRhY2htZW50cykge1xuICAgICAgICBhd2FpdCBhZGp1c3RXREFBdHRhY2htZW50c1Blcm1pc3Npb25zKHRoaXMud2RhLCB0aGlzLm9wdHMucHJldmVudFdEQUF0dGFjaG1lbnRzID8gJzU1NScgOiAnNzU1Jyk7XG4gICAgICAgIHRoaXMubG9nRXZlbnQoJ3dkYVBlcm1zQWRqdXN0ZWQnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0cy5jbGVhclN5c3RlbUZpbGVzKSB7XG4gICAgICAgIGF3YWl0IG1hcmtTeXN0ZW1GaWxlc0ZvckNsZWFudXAodGhpcy53ZGEpO1xuICAgICAgfVxuXG4gICAgICAvLyB3ZSBleHBlY3QgY2VydGFpbiBzb2NrZXQgZXJyb3JzIHVudGlsIHRoaXMgcG9pbnQsIGJ1dCBub3dcbiAgICAgIC8vIG1hcmsgdGhpbmdzIGFzIGZ1bGx5IHdvcmtpbmdcbiAgICAgIHRoaXMud2RhLmZ1bGx5U3RhcnRlZCA9IHRydWU7XG4gICAgICB0aGlzLmxvZ0V2ZW50KCd3ZGFTdGFydGVkJyk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBydW5SZXNldCAob3B0cyA9IG51bGwpIHtcbiAgICB0aGlzLmxvZ0V2ZW50KCdyZXNldFN0YXJ0ZWQnKTtcbiAgICBpZiAodGhpcy5pc1JlYWxEZXZpY2UoKSkge1xuICAgICAgYXdhaXQgcnVuUmVhbERldmljZVJlc2V0KHRoaXMub3B0cy5kZXZpY2UsIG9wdHMgfHwgdGhpcy5vcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgcnVuU2ltdWxhdG9yUmVzZXQodGhpcy5vcHRzLmRldmljZSwgb3B0cyB8fCB0aGlzLm9wdHMpO1xuICAgIH1cbiAgICB0aGlzLmxvZ0V2ZW50KCdyZXNldENvbXBsZXRlJyk7XG4gIH1cblxuICBhc3luYyBkZWxldGVTZXNzaW9uICgpIHtcbiAgICBhd2FpdCByZW1vdmVBbGxTZXNzaW9uV2ViU29ja2V0SGFuZGxlcnModGhpcy5zZXJ2ZXIsIHRoaXMuc2Vzc2lvbklkKTtcblxuICAgIGF3YWl0IFNIQVJFRF9SRVNPVVJDRVNfR1VBUkQuYWNxdWlyZShYQ1VJVGVzdERyaXZlci5uYW1lLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLnN0b3AoKTtcblxuICAgICAgLy8gcmVzZXQgdGhlIHBlcm1pc3Npb25zIG9uIHRoZSBkZXJpdmVkIGRhdGEgZm9sZGVyLCBpZiBuZWNlc3NhcnlcbiAgICAgIGlmICh0aGlzLm9wdHMucHJldmVudFdEQUF0dGFjaG1lbnRzKSB7XG4gICAgICAgIGF3YWl0IGFkanVzdFdEQUF0dGFjaG1lbnRzUGVybWlzc2lvbnModGhpcy53ZGEsICc3NTUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0cy5jbGVhclN5c3RlbUZpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQXBwVGVtcG9yYXJ5KSB7XG4gICAgICAgICAgYXdhaXQgZnMucmltcmFmKHRoaXMub3B0cy5hcHApO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGNsZWFyU3lzdGVtRmlsZXModGhpcy53ZGEsICEhdGhpcy5vcHRzLnNob3dYY29kZUxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2cuZGVidWcoJ05vdCBjbGVhcmluZyBsb2cgZmlsZXMuIFVzZSBgY2xlYXJTeXN0ZW1GaWxlc2AgY2FwYWJpbGl0eSB0byB0dXJuIG9uLicpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuaXNXZWJDb250ZXh0KCkpIHtcbiAgICAgIGxvZy5kZWJ1ZygnSW4gYSB3ZWIgc2Vzc2lvbi4gUmVtb3ZpbmcgcmVtb3RlIGRlYnVnZ2VyJyk7XG4gICAgICBhd2FpdCB0aGlzLnN0b3BSZW1vdGUoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRzLnJlc2V0T25TZXNzaW9uU3RhcnRPbmx5ID09PSBmYWxzZSkge1xuICAgICAgYXdhaXQgdGhpcy5ydW5SZXNldCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzU2ltdWxhdG9yKCkgJiYgIXRoaXMub3B0cy5ub1Jlc2V0ICYmICEhdGhpcy5vcHRzLmRldmljZSkge1xuICAgICAgaWYgKHRoaXMubGlmZWN5Y2xlRGF0YS5jcmVhdGVTaW0pIHtcbiAgICAgICAgbG9nLmRlYnVnKGBEZWxldGluZyBzaW11bGF0b3IgY3JlYXRlZCBmb3IgdGhpcyBydW4gKHVkaWQ6ICcke3RoaXMub3B0cy51ZGlkfScpYCk7XG4gICAgICAgIGF3YWl0IHNodXRkb3duU2ltdWxhdG9yKHRoaXMub3B0cy5kZXZpY2UpO1xuICAgICAgICBhd2FpdCB0aGlzLm9wdHMuZGV2aWNlLmRlbGV0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghXy5pc0VtcHR5KHRoaXMubG9ncykpIHtcbiAgICAgIGF3YWl0IHRoaXMubG9ncy5zeXNsb2cuc3RvcENhcHR1cmUoKTtcbiAgICAgIHRoaXMubG9ncyA9IHt9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLml3ZHBTZXJ2ZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RvcElXRFAoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRzLmVuYWJsZUFzeW5jRXhlY3V0ZUZyb21IdHRwcyAmJiAhdGhpcy5pc1JlYWxEZXZpY2UoKSkge1xuICAgICAgYXdhaXQgdGhpcy5zdG9wSHR0cHNBc3luY1NlcnZlcigpO1xuICAgIH1cblxuICAgIHRoaXMucmVzZXRJb3MoKTtcblxuICAgIGF3YWl0IHN1cGVyLmRlbGV0ZVNlc3Npb24oKTtcbiAgfVxuXG4gIGFzeW5jIHN0b3AgKCkge1xuICAgIHRoaXMuandwUHJveHlBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLnByb3h5UmVxUmVzID0gbnVsbDtcblxuICAgIGlmICh0aGlzLndkYSAmJiB0aGlzLndkYS5mdWxseVN0YXJ0ZWQpIHtcbiAgICAgIGlmICh0aGlzLndkYS5qd3Byb3h5KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoYC9zZXNzaW9uLyR7dGhpcy5zZXNzaW9uSWR9YCwgJ0RFTEVURScpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAvLyBhbiBlcnJvciBoZXJlIHNob3VsZCBub3Qgc2hvcnQtY2lyY3VpdCB0aGUgcmVzdCBvZiBjbGVhbiB1cFxuICAgICAgICAgIGxvZy5kZWJ1ZyhgVW5hYmxlIHRvIERFTEVURSBzZXNzaW9uIG9uIFdEQTogJyR7ZXJyLm1lc3NhZ2V9Jy4gQ29udGludWluZyBzaHV0ZG93bi5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMud2RhICYmICF0aGlzLndkYS53ZWJEcml2ZXJBZ2VudFVybCAmJiB0aGlzLm9wdHMudXNlTmV3V0RBKSB7XG4gICAgICAgIGF3YWl0IHRoaXMud2RhLnF1aXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBleGVjdXRlQ29tbWFuZCAoY21kLCAuLi5hcmdzKSB7XG4gICAgbG9nLmRlYnVnKGBFeGVjdXRpbmcgY29tbWFuZCAnJHtjbWR9J2ApO1xuXG4gICAgaWYgKGNtZCA9PT0gJ3JlY2VpdmVBc3luY1Jlc3BvbnNlJykge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmVjZWl2ZUFzeW5jUmVzcG9uc2UoLi4uYXJncyk7XG4gICAgfVxuICAgIC8vIFRPRE86IG9uY2UgdGhpcyBmaXggZ2V0cyBpbnRvIGJhc2UgZHJpdmVyIHJlbW92ZSBmcm9tIGhlcmVcbiAgICBpZiAoY21kID09PSAnZ2V0U3RhdHVzJykge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U3RhdHVzKCk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBzdXBlci5leGVjdXRlQ29tbWFuZChjbWQsIC4uLmFyZ3MpO1xuICB9XG5cbiAgYXN5bmMgY29uZmlndXJlQXBwICgpIHtcbiAgICBmdW5jdGlvbiBhcHBJc1BhY2thZ2VPckJ1bmRsZSAoYXBwKSB7XG4gICAgICByZXR1cm4gKC9eKFthLXpBLVowLTlcXC1fXStcXC5bYS16QS1aMC05XFwtX10rKSskLykudGVzdChhcHApO1xuICAgIH1cblxuICAgIC8vIHRoZSBhcHAgbmFtZSBpcyBhIGJ1bmRsZUlkIGFzc2lnbiBpdCB0byB0aGUgYnVuZGxlSWQgcHJvcGVydHlcbiAgICBpZiAoIXRoaXMub3B0cy5idW5kbGVJZCAmJiBhcHBJc1BhY2thZ2VPckJ1bmRsZSh0aGlzLm9wdHMuYXBwKSkge1xuICAgICAgdGhpcy5vcHRzLmJ1bmRsZUlkID0gdGhpcy5vcHRzLmFwcDtcbiAgICAgIHRoaXMub3B0cy5hcHAgPSAnJztcbiAgICB9XG4gICAgLy8gd2UgaGF2ZSBhIGJ1bmRsZSBJRCwgYnV0IG5vIGFwcCwgb3IgYXBwIGlzIGFsc28gYSBidW5kbGVcbiAgICBpZiAoKHRoaXMub3B0cy5idW5kbGVJZCAmJiBhcHBJc1BhY2thZ2VPckJ1bmRsZSh0aGlzLm9wdHMuYnVuZGxlSWQpKSAmJlxuICAgICAgICAodGhpcy5vcHRzLmFwcCA9PT0gJycgfHwgYXBwSXNQYWNrYWdlT3JCdW5kbGUodGhpcy5vcHRzLmFwcCkpKSB7XG4gICAgICBsb2cuZGVidWcoJ0FwcCBpcyBhbiBpT1MgYnVuZGxlLCB3aWxsIGF0dGVtcHQgdG8gcnVuIGFzIHByZS1leGlzdGluZycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGZvciBzdXBwb3J0ZWQgYnVpbGQtaW4gYXBwc1xuICAgIGlmICh0aGlzLm9wdHMuYXBwICYmIHRoaXMub3B0cy5hcHAudG9Mb3dlckNhc2UoKSA9PT0gJ3NldHRpbmdzJykge1xuICAgICAgdGhpcy5vcHRzLmJ1bmRsZUlkID0gJ2NvbS5hcHBsZS5QcmVmZXJlbmNlcyc7XG4gICAgICB0aGlzLm9wdHMuYXBwID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0cy5hcHAgJiYgdGhpcy5vcHRzLmFwcC50b0xvd2VyQ2FzZSgpID09PSAnY2FsZW5kYXInKSB7XG4gICAgICB0aGlzLm9wdHMuYnVuZGxlSWQgPSAnY29tLmFwcGxlLm1vYmlsZWNhbCc7XG4gICAgICB0aGlzLm9wdHMuYXBwID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbEFwcFBhdGggPSB0aGlzLm9wdHMuYXBwO1xuICAgIHRyeSB7XG4gICAgICAvLyBkb3dubG9hZCBpZiBuZWNlc3NhcnlcbiAgICAgIHRoaXMub3B0cy5hcHAgPSBhd2FpdCB0aGlzLmhlbHBlcnMuY29uZmlndXJlQXBwKHRoaXMub3B0cy5hcHAsICcuYXBwJywgdGhpcy5vcHRzLm1vdW50Um9vdCwgdGhpcy5vcHRzLndpbmRvd3NTaGFyZVVzZXJOYW1lLCB0aGlzLm9wdHMud2luZG93c1NoYXJlUGFzc3dvcmQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBCYWQgYXBwOiAke3RoaXMub3B0cy5hcHB9LiBBcHAgcGF0aHMgbmVlZCB0byBiZSBhYnNvbHV0ZSwgb3IgcmVsYXRpdmUgdG8gdGhlIGFwcGl1bSBgICtcbiAgICAgICAgJ3NlcnZlciBpbnN0YWxsIGRpciwgb3IgYSBVUkwgdG8gY29tcHJlc3NlZCBmaWxlLCBvciBhIHNwZWNpYWwgYXBwIG5hbWUuJyk7XG4gICAgfVxuICAgIHRoaXMuaXNBcHBUZW1wb3JhcnkgPSB0aGlzLm9wdHMuYXBwICYmIG9yaWdpbmFsQXBwUGF0aCAhPT0gdGhpcy5vcHRzLmFwcDtcbiAgfVxuXG4gIGFzeW5jIGRldGVybWluZURldmljZSAoKSB7XG4gICAgLy8gaW4gdGhlIG9uZSBjYXNlIHdoZXJlIHdlIGNyZWF0ZSBhIHNpbSwgd2Ugd2lsbCBzZXQgdGhpcyBzdGF0ZVxuICAgIHRoaXMubGlmZWN5Y2xlRGF0YS5jcmVhdGVTaW0gPSBmYWxzZTtcblxuICAgIC8vIGlmIHdlIGdldCBnZW5lcmljIG5hbWVzLCB0cmFuc2xhdGUgdGhlbVxuICAgIHRoaXMub3B0cy5kZXZpY2VOYW1lID0gYXdhaXQgdHJhbnNsYXRlRGV2aWNlTmFtZSh0aGlzLnhjb2RlVmVyc2lvbiwgdGhpcy5vcHRzLnBsYXRmb3JtVmVyc2lvbiwgdGhpcy5vcHRzLmRldmljZU5hbWUpO1xuXG4gICAgLy8gY2hlY2sgZm9yIGEgcGFydGljdWxhciBzaW11bGF0b3JcbiAgICBpZiAodGhpcy5vcHRzLnVkaWQgJiYgKGF3YWl0IHNpbUV4aXN0cyh0aGlzLm9wdHMudWRpZCkpKSB7XG4gICAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBnZXRTaW11bGF0b3IodGhpcy5vcHRzLnVkaWQpO1xuICAgICAgcmV0dXJuIHtkZXZpY2UsIHJlYWxEZXZpY2U6IGZhbHNlLCB1ZGlkOiB0aGlzLm9wdHMudWRpZH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0cy51ZGlkKSB7XG4gICAgICBpZiAodGhpcy5vcHRzLnVkaWQudG9Mb3dlckNhc2UoKSA9PT0gJ2F1dG8nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5vcHRzLnVkaWQgPSBhd2FpdCBkZXRlY3RVZGlkKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIC8vIFRyeWluZyB0byBmaW5kIG1hdGNoaW5nIFVESUQgZm9yIFNpbXVsYXRvclxuICAgICAgICAgIGxvZy53YXJuKGBDYW5ub3QgZGV0ZWN0IGFueSBjb25uZWN0ZWQgcmVhbCBkZXZpY2VzLiBGYWxsaW5nIGJhY2sgdG8gU2ltdWxhdG9yLiBPcmlnaW5hbCBlcnJvcjogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBnZXRFeGlzdGluZ1NpbSh0aGlzLm9wdHMpO1xuICAgICAgICAgIGlmICghZGV2aWNlKSB7XG4gICAgICAgICAgICAvLyBObyBtYXRjaGluZyBTaW11bGF0b3IgaXMgZm91bmQuIFRocm93IGFuIGVycm9yXG4gICAgICAgICAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQ2Fubm90IGRldGVjdCB1ZGlkIGZvciAke3RoaXMub3B0cy5kZXZpY2VOYW1lfSBTaW11bGF0b3IgcnVubmluZyBpT1MgJHt0aGlzLm9wdHMucGxhdGZvcm1WZXJzaW9ufWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBNYXRjaGluZyBTaW11bGF0b3IgZXhpc3RzIGFuZCBpcyBmb3VuZC4gVXNlIGl0XG4gICAgICAgICAgdGhpcy5vcHRzLnVkaWQgPSBkZXZpY2UudWRpZDtcbiAgICAgICAgICByZXR1cm4ge2RldmljZSwgcmVhbERldmljZTogZmFsc2UsIHVkaWQ6IGRldmljZS51ZGlkfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIGl0IGlzIGEgY29ubmVjdGVkIGRldmljZS4gSWYgbm90LCB0aGUgdWRpZCBwYXNzZWQgaW4gaXMgaW52YWxpZFxuICAgICAgICBjb25zdCBkZXZpY2VzID0gYXdhaXQgZ2V0Q29ubmVjdGVkRGV2aWNlcygpO1xuICAgICAgICBsb2cuZGVidWcoYEF2YWlsYWJsZSBkZXZpY2VzOiAke2RldmljZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgaWYgKGRldmljZXMuaW5kZXhPZih0aGlzLm9wdHMudWRpZCkgPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGRldmljZSBvciBzaW11bGF0b3IgVURJRDogJyR7dGhpcy5vcHRzLnVkaWR9J2ApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRldmljZSA9IGF3YWl0IGdldFJlYWxEZXZpY2VPYmoodGhpcy5vcHRzLnVkaWQpO1xuICAgICAgcmV0dXJuIHtkZXZpY2UsIHJlYWxEZXZpY2U6IHRydWUsIHVkaWQ6IHRoaXMub3B0cy51ZGlkfTtcbiAgICB9XG5cbiAgICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IHNpbXVsYXRvciB0byB1c2UsIGdpdmVuIHRoZSBkZXNpcmVkIGNhcGFiaWxpdGllc1xuICAgIGxldCBkZXZpY2UgPSBhd2FpdCBnZXRFeGlzdGluZ1NpbSh0aGlzLm9wdHMpO1xuXG4gICAgLy8gY2hlY2sgZm9yIGFuIGV4aXN0aW5nIHNpbXVsYXRvclxuICAgIGlmIChkZXZpY2UpIHtcbiAgICAgIHJldHVybiB7ZGV2aWNlLCByZWFsRGV2aWNlOiBmYWxzZSwgdWRpZDogZGV2aWNlLnVkaWR9O1xuICAgIH1cblxuICAgIC8vIG5vIGRldmljZSBvZiB0aGlzIHR5cGUgZXhpc3RzLCBzbyBjcmVhdGUgb25lXG4gICAgbG9nLmluZm8oJ1NpbXVsYXRvciB1ZGlkIG5vdCBwcm92aWRlZCwgdXNpbmcgZGVzaXJlZCBjYXBzIHRvIGNyZWF0ZSBhIG5ldyBzaW11bGF0b3InKTtcbiAgICBpZiAoIXRoaXMub3B0cy5wbGF0Zm9ybVZlcnNpb24gJiYgdGhpcy5pb3NTZGtWZXJzaW9uKSB7XG4gICAgICBsb2cuaW5mbyhgTm8gcGxhdGZvcm1WZXJzaW9uIHNwZWNpZmllZC4gVXNpbmcgbGF0ZXN0IHZlcnNpb24gWGNvZGUgc3VwcG9ydHM6ICcke3RoaXMuaW9zU2RrVmVyc2lvbn0nIGAgK1xuICAgICAgICAgICAgICAgYFRoaXMgbWF5IGNhdXNlIHByb2JsZW1zIGlmIGEgc2ltdWxhdG9yIGRvZXMgbm90IGV4aXN0IGZvciB0aGlzIHBsYXRmb3JtIHZlcnNpb24uYCk7XG4gICAgICB0aGlzLm9wdHMucGxhdGZvcm1WZXJzaW9uID0gdGhpcy5pb3NTZGtWZXJzaW9uO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdHMubm9SZXNldCkge1xuICAgICAgLy8gQ2hlY2sgZm9yIGV4aXN0aW5nIHNpbXVsYXRvciBqdXN0IHdpdGggY29ycmVjdCBjYXBhYmlsaXRpZXNcbiAgICAgIGxldCBkZXZpY2UgPSBhd2FpdCBnZXRFeGlzdGluZ1NpbSh0aGlzLm9wdHMpO1xuICAgICAgaWYgKGRldmljZSkge1xuICAgICAgICByZXR1cm4ge2RldmljZSwgcmVhbERldmljZTogZmFsc2UsIHVkaWQ6IGRldmljZS51ZGlkfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZXZpY2UgPSBhd2FpdCB0aGlzLmNyZWF0ZVNpbSgpO1xuICAgIHJldHVybiB7ZGV2aWNlLCByZWFsRGV2aWNlOiBmYWxzZSwgdWRpZDogZGV2aWNlLnVkaWR9O1xuICB9XG5cbiAgYXN5bmMgc3RhcnRTaW0gKCkge1xuICAgIGNvbnN0IHJ1bk9wdHMgPSB7XG4gICAgICBzY2FsZUZhY3RvcjogdGhpcy5vcHRzLnNjYWxlRmFjdG9yLFxuICAgICAgY29ubmVjdEhhcmR3YXJlS2V5Ym9hcmQ6ICEhdGhpcy5vcHRzLmNvbm5lY3RIYXJkd2FyZUtleWJvYXJkLFxuICAgICAgaXNIZWFkbGVzczogISF0aGlzLm9wdHMuaXNIZWFkbGVzcyxcbiAgICAgIGRldmljZVByZWZlcmVuY2VzOiB7fSxcbiAgICB9O1xuXG4gICAgLy8gYWRkIHRoZSB3aW5kb3cgY2VudGVyLCBpZiBpdCBpcyBzcGVjaWZpZWRcbiAgICBpZiAodGhpcy5vcHRzLlNpbXVsYXRvcldpbmRvd0NlbnRlcikge1xuICAgICAgcnVuT3B0cy5kZXZpY2VQcmVmZXJlbmNlcy5TaW11bGF0b3JXaW5kb3dDZW50ZXIgPSB0aGlzLm9wdHMuU2ltdWxhdG9yV2luZG93Q2VudGVyO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgdG8gd29ya2Fyb3VuZCBYQ1Rlc3QgYnVnIGFib3V0IGNoYW5naW5nIFNpbXVsYXRvclxuICAgIC8vIG9yaWVudGF0aW9uIGlzIG5vdCBzeW5jaHJvbml6ZWQgdG8gdGhlIGFjdHVhbCB3aW5kb3cgb3JpZW50YXRpb25cbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IF8uaXNTdHJpbmcodGhpcy5vcHRzLm9yaWVudGF0aW9uKSAmJiB0aGlzLm9wdHMub3JpZW50YXRpb24udG9VcHBlckNhc2UoKTtcbiAgICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgICBjYXNlICdMQU5EU0NBUEUnOlxuICAgICAgICBydW5PcHRzLmRldmljZVByZWZlcmVuY2VzLlNpbXVsYXRvcldpbmRvd09yaWVudGF0aW9uID0gJ0xhbmRzY2FwZUxlZnQnO1xuICAgICAgICBydW5PcHRzLmRldmljZVByZWZlcmVuY2VzLlNpbXVsYXRvcldpbmRvd1JvdGF0aW9uQW5nbGUgPSA5MDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdQT1JUUkFJVCc6XG4gICAgICAgIHJ1bk9wdHMuZGV2aWNlUHJlZmVyZW5jZXMuU2ltdWxhdG9yV2luZG93T3JpZW50YXRpb24gPSAnUG9ydHJhaXQnO1xuICAgICAgICBydW5PcHRzLmRldmljZVByZWZlcmVuY2VzLlNpbXVsYXRvcldpbmRvd1JvdGF0aW9uQW5nbGUgPSAwO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLm9wdHMuZGV2aWNlLnJ1bihydW5PcHRzKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZVNpbSAoKSB7XG4gICAgdGhpcy5saWZlY3ljbGVEYXRhLmNyZWF0ZVNpbSA9IHRydWU7XG5cbiAgICAvLyBjcmVhdGUgc2ltIGZvciBjYXBzXG4gICAgbGV0IHNpbSA9IGF3YWl0IGNyZWF0ZVNpbSh0aGlzLm9wdHMpO1xuICAgIGxvZy5pbmZvKGBDcmVhdGVkIHNpbXVsYXRvciB3aXRoIHVkaWQgJyR7c2ltLnVkaWR9Jy5gKTtcblxuICAgIHJldHVybiBzaW07XG4gIH1cblxuICBhc3luYyBsYXVuY2hBcHAgKCkge1xuICAgIGNvbnN0IEFQUF9MQVVOQ0hfVElNRU9VVCA9IDIwICogMTAwMDtcblxuICAgIHRoaXMubG9nRXZlbnQoJ2FwcExhdW5jaEF0dGVtcHRlZCcpO1xuICAgIGF3YWl0IGxhdW5jaCh0aGlzLm9wdHMuZGV2aWNlLnVkaWQsIHRoaXMub3B0cy5idW5kbGVJZCk7XG5cbiAgICBsZXQgY2hlY2tTdGF0dXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnByb3h5Q29tbWFuZCgnL3N0YXR1cycsICdHRVQnKTtcbiAgICAgIGxldCBjdXJyZW50QXBwID0gcmVzcG9uc2UuY3VycmVudEFwcC5idW5kbGVJRDtcbiAgICAgIGlmIChjdXJyZW50QXBwICE9PSB0aGlzLm9wdHMuYnVuZGxlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMub3B0cy5idW5kbGVJZH0gbm90IGluIGZvcmVncm91bmQuICR7Y3VycmVudEFwcH0gaXMgaW4gZm9yZWdyb3VuZGApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsb2cuaW5mbyhgV2FpdGluZyBmb3IgJyR7dGhpcy5vcHRzLmJ1bmRsZUlkfScgdG8gYmUgaW4gZm9yZWdyb3VuZGApO1xuICAgIGxldCByZXRyaWVzID0gcGFyc2VJbnQoQVBQX0xBVU5DSF9USU1FT1VUIC8gMjAwLCAxMCk7XG4gICAgYXdhaXQgcmV0cnlJbnRlcnZhbChyZXRyaWVzLCAyMDAsIGNoZWNrU3RhdHVzKTtcbiAgICBsb2cuaW5mbyhgJHt0aGlzLm9wdHMuYnVuZGxlSWR9IGlzIGluIGZvcmVncm91bmRgKTtcbiAgICB0aGlzLmxvZ0V2ZW50KCdhcHBMYXVuY2hlZCcpO1xuICB9XG5cbiAgYXN5bmMgc3RhcnRXZGFTZXNzaW9uIChidW5kbGVJZCwgcHJvY2Vzc0FyZ3VtZW50cykge1xuICAgIGxldCBhcmdzID0gcHJvY2Vzc0FyZ3VtZW50cyA/IChwcm9jZXNzQXJndW1lbnRzLmFyZ3MgfHwgW10pIDogW107XG4gICAgaWYgKCFfLmlzQXJyYXkoYXJncykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgcHJvY2Vzc0FyZ3VtZW50cy5hcmdzIGNhcGFiaWxpdHkgaXMgZXhwZWN0ZWQgdG8gYmUgYW4gYXJyYXkuIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGAke0pTT04uc3RyaW5naWZ5KGFyZ3MpfSBpcyBnaXZlbiBpbnN0ZWFkYCk7XG4gICAgfVxuICAgIGxldCBlbnYgPSBwcm9jZXNzQXJndW1lbnRzID8gKHByb2Nlc3NBcmd1bWVudHMuZW52IHx8IHt9KSA6IHt9O1xuICAgIGlmICghXy5pc1BsYWluT2JqZWN0KGVudikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgcHJvY2Vzc0FyZ3VtZW50cy5lbnYgY2FwYWJpbGl0eSBpcyBleHBlY3RlZCB0byBiZSBhIGRpY3Rpb25hcnkuIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGAke0pTT04uc3RyaW5naWZ5KGVudil9IGlzIGdpdmVuIGluc3RlYWRgKTtcbiAgICB9XG5cbiAgICBsZXQgc2hvdWxkV2FpdEZvclF1aWVzY2VuY2UgPSB1dGlsLmhhc1ZhbHVlKHRoaXMub3B0cy53YWl0Rm9yUXVpZXNjZW5jZSkgPyB0aGlzLm9wdHMud2FpdEZvclF1aWVzY2VuY2UgOiB0cnVlO1xuICAgIGxldCBtYXhUeXBpbmdGcmVxdWVuY3kgPSB1dGlsLmhhc1ZhbHVlKHRoaXMub3B0cy5tYXhUeXBpbmdGcmVxdWVuY3kpID8gdGhpcy5vcHRzLm1heFR5cGluZ0ZyZXF1ZW5jeSA6IDYwO1xuICAgIGxldCBzaG91bGRVc2VTaW5nbGV0b25UZXN0TWFuYWdlciA9IHV0aWwuaGFzVmFsdWUodGhpcy5vcHRzLnNob3VsZFVzZVNpbmdsZXRvblRlc3RNYW5hZ2VyKSA/IHRoaXMub3B0cy5zaG91bGRVc2VTaW5nbGV0b25UZXN0TWFuYWdlciA6IHRydWU7XG4gICAgbGV0IHNob3VsZFVzZVRlc3RNYW5hZ2VyRm9yVmlzaWJpbGl0eURldGVjdGlvbiA9IGZhbHNlO1xuICAgIGlmICh1dGlsLmhhc1ZhbHVlKHRoaXMub3B0cy5zaW1wbGVJc1Zpc2libGVDaGVjaykpIHtcbiAgICAgIHNob3VsZFVzZVRlc3RNYW5hZ2VyRm9yVmlzaWJpbGl0eURldGVjdGlvbiA9IHRoaXMub3B0cy5zaW1wbGVJc1Zpc2libGVDaGVjaztcbiAgICB9XG4gICAgaWYgKCFpc05hTihwYXJzZUZsb2F0KHRoaXMub3B0cy5wbGF0Zm9ybVZlcnNpb24pKSAmJiBwYXJzZUZsb2F0KHRoaXMub3B0cy5wbGF0Zm9ybVZlcnNpb24pLnRvRml4ZWQoMSkgPT09ICc5LjMnKSB7XG4gICAgICBsb2cuaW5mbyhgRm9yY2luZyBzaG91bGRVc2VTaW5nbGV0b25UZXN0TWFuYWdlciBjYXBhYmlsaXR5IHZhbHVlIHRvIHRydWUsIGJlY2F1c2Ugb2Yga25vd24gWENUZXN0IGlzc3VlcyB1bmRlciA5LjMgcGxhdGZvcm0gdmVyc2lvbmApO1xuICAgICAgc2hvdWxkVXNlVGVzdE1hbmFnZXJGb3JWaXNpYmlsaXR5RGV0ZWN0aW9uID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHV0aWwuaGFzVmFsdWUodGhpcy5vcHRzLmxhbmd1YWdlKSkge1xuICAgICAgYXJncy5wdXNoKCctQXBwbGVMYW5ndWFnZXMnLCBgKCR7dGhpcy5vcHRzLmxhbmd1YWdlfSlgKTtcbiAgICAgIGFyZ3MucHVzaCgnLU5TTGFuZ3VhZ2VzJywgYCgke3RoaXMub3B0cy5sYW5ndWFnZX0pYCk7XG4gICAgfVxuXG4gICAgaWYgKHV0aWwuaGFzVmFsdWUodGhpcy5vcHRzLmxvY2FsZSkpIHtcbiAgICAgIGFyZ3MucHVzaCgnLUFwcGxlTG9jYWxlJywgdGhpcy5vcHRzLmxvY2FsZSk7XG4gICAgfVxuXG4gICAgbGV0IGRlc2lyZWQgPSB7XG4gICAgICBkZXNpcmVkQ2FwYWJpbGl0aWVzOiB7XG4gICAgICAgIGJ1bmRsZUlkLFxuICAgICAgICBhcmd1bWVudHM6IGFyZ3MsXG4gICAgICAgIGVudmlyb25tZW50OiBlbnYsXG4gICAgICAgIHNob3VsZFdhaXRGb3JRdWllc2NlbmNlLFxuICAgICAgICBzaG91bGRVc2VUZXN0TWFuYWdlckZvclZpc2liaWxpdHlEZXRlY3Rpb24sXG4gICAgICAgIG1heFR5cGluZ0ZyZXF1ZW5jeSxcbiAgICAgICAgc2hvdWxkVXNlU2luZ2xldG9uVGVzdE1hbmFnZXIsXG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAodXRpbC5oYXNWYWx1ZSh0aGlzLm9wdHMuc2hvdWxkVXNlQ29tcGFjdFJlc3BvbnNlcykpIHtcbiAgICAgIGRlc2lyZWQuZGVzaXJlZENhcGFiaWxpdGllcy5zaG91bGRVc2VDb21wYWN0UmVzcG9uc2VzID0gdGhpcy5vcHRzLnNob3VsZFVzZUNvbXBhY3RSZXNwb25zZXM7XG4gICAgfVxuICAgIGlmICh1dGlsLmhhc1ZhbHVlKHRoaXMub3B0cy5lbGVtZW50UmVzcG9uc2VGaWVsZHMpKSB7XG4gICAgICBkZXNpcmVkLmRlc2lyZWRDYXBhYmlsaXRpZXMuZWxlbWVudFJlc3BvbnNlRmllbGRzID0gdGhpcy5vcHRzLmVsZW1lbnRSZXNwb25zZUZpZWxkcztcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0cy5hdXRvQWNjZXB0QWxlcnRzKSB7XG4gICAgICBkZXNpcmVkLmRlc2lyZWRDYXBhYmlsaXRpZXMuZGVmYXVsdEFsZXJ0QWN0aW9uID0gJ2FjY2VwdCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdHMuYXV0b0Rpc21pc3NBbGVydHMpIHtcbiAgICAgIGRlc2lyZWQuZGVzaXJlZENhcGFiaWxpdGllcy5kZWZhdWx0QWxlcnRBY3Rpb24gPSAnZGlzbWlzcyc7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoJy9zZXNzaW9uJywgJ1BPU1QnLCBkZXNpcmVkKTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIFByb3h5IG1ldGhvZHMgZnJvbSBCYXNlRHJpdmVyXG4gIHByb3h5QWN0aXZlICgpIHtcbiAgICByZXR1cm4gdGhpcy5qd3BQcm94eUFjdGl2ZTtcbiAgfVxuXG4gIGdldFByb3h5QXZvaWRMaXN0ICgpIHtcbiAgICBpZiAodGhpcy5pc1dlYnZpZXcoKSkge1xuICAgICAgcmV0dXJuIE5PX1BST1hZX1dFQl9MSVNUO1xuICAgIH1cbiAgICByZXR1cm4gTk9fUFJPWFlfTkFUSVZFX0xJU1Q7XG4gIH1cblxuICBjYW5Qcm94eSAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpc1NhZmFyaSAoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5zYWZhcmk7XG4gIH1cblxuICBpc1JlYWxEZXZpY2UgKCkge1xuICAgIHJldHVybiB0aGlzLm9wdHMucmVhbERldmljZTtcbiAgfVxuXG4gIGlzU2ltdWxhdG9yICgpIHtcbiAgICByZXR1cm4gIXRoaXMub3B0cy5yZWFsRGV2aWNlO1xuICB9XG5cbiAgaXNXZWJ2aWV3ICgpIHtcbiAgICByZXR1cm4gdGhpcy5pc1NhZmFyaSgpIHx8IHRoaXMuaXNXZWJDb250ZXh0KCk7XG4gIH1cblxuICB2YWxpZGF0ZUxvY2F0b3JTdHJhdGVneSAoc3RyYXRlZ3kpIHtcbiAgICBzdXBlci52YWxpZGF0ZUxvY2F0b3JTdHJhdGVneShzdHJhdGVneSwgdGhpcy5pc1dlYkNvbnRleHQoKSk7XG4gIH1cblxuICB2YWxpZGF0ZURlc2lyZWRDYXBzIChjYXBzKSB7XG4gICAgaWYgKCFzdXBlci52YWxpZGF0ZURlc2lyZWRDYXBzKGNhcHMpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGNhcGFiaWxpdGllcyBoYXZlIG9uZSBvZiBgYXBwYCBvciBgYnVuZGxlSWRgXG4gICAgaWYgKChjYXBzLmJyb3dzZXJOYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpICE9PSAnc2FmYXJpJyAmJiAhY2Fwcy5hcHAgJiYgIWNhcHMuYnVuZGxlSWQpIHtcbiAgICAgIGxldCBtc2cgPSAnVGhlIGRlc2lyZWQgY2FwYWJpbGl0aWVzIG11c3QgaW5jbHVkZSBlaXRoZXIgYW4gYXBwIG9yIGEgYnVuZGxlSWQgZm9yIGlPUyc7XG4gICAgICBsb2cuZXJyb3JBbmRUaHJvdyhtc2cpO1xuICAgIH1cblxuICAgIGxldCB2ZXJpZnlQcm9jZXNzQXJndW1lbnQgPSAocHJvY2Vzc0FyZ3VtZW50cykgPT4ge1xuICAgICAgY29uc3Qge2FyZ3MsIGVudn0gPSBwcm9jZXNzQXJndW1lbnRzO1xuICAgICAgaWYgKCFfLmlzTmlsKGFyZ3MpICYmICFfLmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgbG9nLmVycm9yQW5kVGhyb3coJ3Byb2Nlc3NBcmd1bWVudHMuYXJncyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnKTtcbiAgICAgIH1cbiAgICAgIGlmICghXy5pc05pbChlbnYpICYmICFfLmlzUGxhaW5PYmplY3QoZW52KSkge1xuICAgICAgICBsb2cuZXJyb3JBbmRUaHJvdygncHJvY2Vzc0FyZ3VtZW50cy5lbnYgbXVzdCBiZSBhbiBvYmplY3QgPGtleSx2YWx1ZT4gcGFpciB7YTpiLCBjOmR9Jyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGBwcm9jZXNzQXJndW1lbnRzYCBzaG91bGQgYmUgSlNPTiBzdHJpbmcgb3IgYW4gb2JqZWN0IHdpdGggYXJndW1lbnRzIGFuZC8gZW52aXJvbm1lbnQgZGV0YWlsc1xuICAgIGlmIChjYXBzLnByb2Nlc3NBcmd1bWVudHMpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKGNhcHMucHJvY2Vzc0FyZ3VtZW50cykpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyB0cnkgdG8gcGFyc2UgdGhlIHN0cmluZyBhcyBKU09OXG4gICAgICAgICAgY2Fwcy5wcm9jZXNzQXJndW1lbnRzID0gSlNPTi5wYXJzZShjYXBzLnByb2Nlc3NBcmd1bWVudHMpO1xuICAgICAgICAgIHZlcmlmeVByb2Nlc3NBcmd1bWVudChjYXBzLnByb2Nlc3NBcmd1bWVudHMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBsb2cuZXJyb3JBbmRUaHJvdyhgcHJvY2Vzc0FyZ3VtZW50cyBtdXN0IGJlIGEganNvbiBmb3JtYXQgb3IgYW4gb2JqZWN0IHdpdGggZm9ybWF0IHthcmdzIDogW10sIGVudiA6IHthOmIsIGM6ZH19LiBgICtcbiAgICAgICAgICAgIGBCb3RoIGVudmlyb25tZW50IGFuZCBhcmd1bWVudCBjYW4gYmUgbnVsbC4gRXJyb3I6ICR7ZXJyfWApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKF8uaXNQbGFpbk9iamVjdChjYXBzLnByb2Nlc3NBcmd1bWVudHMpKSB7XG4gICAgICAgIHZlcmlmeVByb2Nlc3NBcmd1bWVudChjYXBzLnByb2Nlc3NBcmd1bWVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nLmVycm9yQW5kVGhyb3coYCdwcm9jZXNzQXJndW1lbnRzIG11c3QgYmUgYW4gb2JqZWN0LCBvciBhIHN0cmluZyBKU09OIG9iamVjdCB3aXRoIGZvcm1hdCB7YXJncyA6IFtdLCBlbnYgOiB7YTpiLCBjOmR9fS4gYCArXG4gICAgICAgICAgYEJvdGggZW52aXJvbm1lbnQgYW5kIGFyZ3VtZW50IGNhbiBiZSBudWxsLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoZXJlIGlzIG5vIHBvaW50IGluIGhhdmluZyBga2V5Y2hhaW5QYXRoYCB3aXRob3V0IGBrZXljaGFpblBhc3N3b3JkYFxuICAgIGlmICgoY2Fwcy5rZXljaGFpblBhdGggJiYgIWNhcHMua2V5Y2hhaW5QYXNzd29yZCkgfHwgKCFjYXBzLmtleWNoYWluUGF0aCAmJiBjYXBzLmtleWNoYWluUGFzc3dvcmQpKSB7XG4gICAgICBsb2cuZXJyb3JBbmRUaHJvdyhgSWYgJ2tleWNoYWluUGF0aCcgaXMgc2V0LCAna2V5Y2hhaW5QYXNzd29yZCcgbXVzdCBhbHNvIGJlIHNldCAoYW5kIHZpY2UgdmVyc2EpLmApO1xuICAgIH1cblxuICAgIC8vIGByZXNldE9uU2Vzc2lvblN0YXJ0T25seWAgc2hvdWxkIGJlIHNldCB0byB0cnVlIGJ5IGRlZmF1bHRcbiAgICB0aGlzLm9wdHMucmVzZXRPblNlc3Npb25TdGFydE9ubHkgPSAhdXRpbC5oYXNWYWx1ZSh0aGlzLm9wdHMucmVzZXRPblNlc3Npb25TdGFydE9ubHkpIHx8IHRoaXMub3B0cy5yZXNldE9uU2Vzc2lvblN0YXJ0T25seTtcbiAgICB0aGlzLm9wdHMudXNlTmV3V0RBID0gdXRpbC5oYXNWYWx1ZSh0aGlzLm9wdHMudXNlTmV3V0RBKSA/IHRoaXMub3B0cy51c2VOZXdXREEgOiBmYWxzZTtcblxuICAgIGlmIChjYXBzLmNvbW1hbmRUaW1lb3V0cykge1xuICAgICAgY2Fwcy5jb21tYW5kVGltZW91dHMgPSBub3JtYWxpemVDb21tYW5kVGltZW91dHMoY2Fwcy5jb21tYW5kVGltZW91dHMpO1xuICAgIH1cblxuICAgIGlmIChfLmlzU3RyaW5nKGNhcHMud2ViRHJpdmVyQWdlbnRVcmwpKSB7XG4gICAgICBjb25zdCB7cHJvdG9jb2wsIGhvc3R9ID0gdXJsLnBhcnNlKGNhcHMud2ViRHJpdmVyQWdlbnRVcmwpO1xuICAgICAgaWYgKF8uaXNFbXB0eShwcm90b2NvbCkgfHwgXy5pc0VtcHR5KGhvc3QpKSB7XG4gICAgICAgIGxvZy5lcnJvckFuZFRocm93KGAnd2ViRHJpdmVyQWdlbnRVcmwnIGNhcGFiaWxpdHkgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBhIHZhbGlkIFdlYkRyaXZlckFnZW50IHNlcnZlciBVUkwuIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBgJyR7Y2Fwcy53ZWJEcml2ZXJBZ2VudFVybH0nIGlzIGdpdmVuIGluc3RlYWRgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2Fwcy5icm93c2VyTmFtZSkge1xuICAgICAgaWYgKGNhcHMuYnVuZGxlSWQpIHtcbiAgICAgICAgbG9nLmVycm9yQW5kVGhyb3coYCdicm93c2VyTmFtZScgY2Fubm90IGJlIHNldCB0b2dldGhlciB3aXRoICdidW5kbGVJZCcgY2FwYWJpbGl0eWApO1xuICAgICAgfVxuICAgICAgLy8gd2FybiBpZiB0aGUgY2FwYWJpbGl0aWVzIGhhdmUgYm90aCBgYXBwYCBhbmQgYGJyb3dzZXIsIGFsdGhvdWdoIHRoaXNcbiAgICAgIC8vIGlzIGNvbW1vbiB3aXRoIHNlbGVuaXVtIGdyaWRcbiAgICAgIGlmIChjYXBzLmFwcCkge1xuICAgICAgICBsb2cud2FybihgVGhlIGNhcGFiaWxpdGllcyBzaG91bGQgZ2VuZXJhbGx5IG5vdCBpbmNsdWRlIGJvdGggYW4gJ2FwcCcgYW5kIGEgJ2Jyb3dzZXJOYW1lJ2ApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGZpbmFsbHksIHJldHVybiB0cnVlIHNpbmNlIHRoZSBzdXBlcmNsYXNzIGNoZWNrIHBhc3NlZCwgYXMgZGlkIHRoaXNcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGluc3RhbGxBVVQgKCkge1xuICAgIGlmICh0aGlzLmlzU2FmYXJpKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gaWYgdXNlciBoYXMgcGFzc2VkIGluIGRlc2lyZWRDYXBzLmF1dG9MYXVuY2ggPSBmYWxzZVxuICAgIC8vIG1lYW5pbmcgdGhleSB3aWxsIG1hbmFnZSBhcHAgaW5zdGFsbCAvIGxhdW5jaGluZ1xuICAgIGlmICh0aGlzLm9wdHMuYXV0b0xhdW5jaCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdmVyaWZ5QXBwbGljYXRpb25QbGF0Zm9ybSh0aGlzLm9wdHMuYXBwLCB0aGlzLmlzU2ltdWxhdG9yKCkpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gVE9ETzogTGV0IGl0IHRocm93IGFmdGVyIHdlIGNvbmZpcm0gdGhlIGFyY2hpdGVjdHVyZSB2ZXJpZmljYXRpb24gYWxnb3JpdGhtIGlzIHN0YWJsZVxuICAgICAgbG9nLndhcm4oYCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKmApO1xuICAgICAgbG9nLndhcm4oYCR7dGhpcy5pc1NpbXVsYXRvcigpID8gJ1NpbXVsYXRvcicgOiAnUmVhbCBkZXZpY2UnfSBhcmNoaXRlY3R1cmUgYXBwZWFycyB0byBiZSB1bnN1cHBvcnRlZCBgICtcbiAgICAgICAgICAgICAgIGBieSB0aGUgJyR7dGhpcy5vcHRzLmFwcH0nIGFwcGxpY2F0aW9uLiBgICtcbiAgICAgICAgICAgICAgIGBNYWtlIHN1cmUgdGhlIGNvcnJlY3QgZGVwbG95bWVudCB0YXJnZXQgaGFzIGJlZW4gc2VsZWN0ZWQgZm9yIGl0cyBjb21waWxhdGlvbiBpbiBYY29kZS5gKTtcbiAgICAgIGxvZy53YXJuKCdEb25cXCd0IGJlIHN1cnByaXNlZCBpZiB0aGUgYXBwbGljYXRpb24gZmFpbHMgdG8gbGF1bmNoLicpO1xuICAgICAgbG9nLndhcm4oYCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKmApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzUmVhbERldmljZSgpKSB7XG4gICAgICBhd2FpdCBpbnN0YWxsVG9SZWFsRGV2aWNlKHRoaXMub3B0cy5kZXZpY2UsIHRoaXMub3B0cy5hcHAsIHRoaXMub3B0cy5idW5kbGVJZCwgdGhpcy5vcHRzLm5vUmVzZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCBpbnN0YWxsVG9TaW11bGF0b3IodGhpcy5vcHRzLmRldmljZSwgdGhpcy5vcHRzLmFwcCwgdGhpcy5vcHRzLmJ1bmRsZUlkLCB0aGlzLm9wdHMubm9SZXNldCk7XG4gICAgfVxuXG4gICAgaWYgKHV0aWwuaGFzVmFsdWUodGhpcy5vcHRzLmlvc0luc3RhbGxQYXVzZSkpIHtcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hcHBpdW0vYXBwaXVtL2lzc3Vlcy82ODg5XG4gICAgICBsZXQgcGF1c2UgPSBwYXJzZUludCh0aGlzLm9wdHMuaW9zSW5zdGFsbFBhdXNlLCAxMCk7XG4gICAgICBsb2cuZGVidWcoYGlvc0luc3RhbGxQYXVzZSBzZXQuIFBhdXNpbmcgJHtwYXVzZX0gbXMgYmVmb3JlIGNvbnRpbnVpbmdgKTtcbiAgICAgIGF3YWl0IEIuZGVsYXkocGF1c2UpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNldEluaXRpYWxPcmllbnRhdGlvbiAob3JpZW50YXRpb24pIHtcbiAgICBpZiAoIV8uaXNTdHJpbmcob3JpZW50YXRpb24pKSB7XG4gICAgICBsb2cuaW5mbygnU2tpcHBpbmcgc2V0dGluZyBvZiB0aGUgaW5pdGlhbCBkaXNwbGF5IG9yaWVudGF0aW9uLiAnICtcbiAgICAgICAgJ1NldCB0aGUgXCJvcmllbnRhdGlvblwiIGNhcGFiaWxpdHkgdG8gZWl0aGVyIFwiTEFORFNDQVBFXCIgb3IgXCJQT1JUUkFJVFwiLCBpZiB0aGlzIGlzIGFuIHVuZGVzaXJlZCBiZWhhdmlvci4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgb3JpZW50YXRpb24gPSBvcmllbnRhdGlvbi50b1VwcGVyQ2FzZSgpO1xuICAgIGlmICghXy5pbmNsdWRlcyhbJ0xBTkRTQ0FQRScsICdQT1JUUkFJVCddLCBvcmllbnRhdGlvbikpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgVW5hYmxlIHRvIHNldCBpbml0aWFsIG9yaWVudGF0aW9uIHRvICcke29yaWVudGF0aW9ufSdgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nLmRlYnVnKGBTZXR0aW5nIGluaXRpYWwgb3JpZW50YXRpb24gdG8gJyR7b3JpZW50YXRpb259J2ApO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnByb3h5Q29tbWFuZCgnL29yaWVudGF0aW9uJywgJ1BPU1QnLCB7b3JpZW50YXRpb259KTtcbiAgICAgIHRoaXMub3B0cy5jdXJPcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLndhcm4oYFNldHRpbmcgaW5pdGlhbCBvcmllbnRhdGlvbiBmYWlsZWQgd2l0aDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0Q29tbWFuZFRpbWVvdXQgKGNtZE5hbWUpIHtcbiAgICBpZiAodGhpcy5vcHRzLmNvbW1hbmRUaW1lb3V0cykge1xuICAgICAgaWYgKGNtZE5hbWUgJiYgXy5oYXModGhpcy5vcHRzLmNvbW1hbmRUaW1lb3V0cywgY21kTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5jb21tYW5kVGltZW91dHNbY21kTmFtZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vcHRzLmNvbW1hbmRUaW1lb3V0c1tERUZBVUxUX1RJTUVPVVRfS0VZXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNlc3Npb24gY2FwYWJpbGl0aWVzIG1lcmdlZCB3aXRoIHdoYXQgV0RBIHJlcG9ydHNcbiAgICogVGhpcyBpcyBhIGxpYnJhcnkgY29tbWFuZCBidXQgbmVlZHMgdG8gY2FsbCAnc3VwZXInIHNvIGNhbid0IGJlIG9uXG4gICAqIGEgaGVscGVyIG9iamVjdFxuICAgKi9cbiAgYXN5bmMgZ2V0U2Vzc2lvbiAoKSB7XG4gICAgLy8gY2FsbCBzdXBlciB0byBnZXQgZXZlbnQgdGltaW5ncywgZXRjLi4uXG4gICAgY29uc3QgZHJpdmVyU2Vzc2lvbiA9IGF3YWl0IHN1cGVyLmdldFNlc3Npb24oKTtcbiAgICBpZiAoIXRoaXMud2RhQ2Fwcykge1xuICAgICAgdGhpcy53ZGFDYXBzID0gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoJy8nLCAnR0VUJyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5kZXZpY2VDYXBzKSB7XG4gICAgICBjb25zdCB7c3RhdHVzQmFyU2l6ZSwgc2NhbGV9ID0gYXdhaXQgdGhpcy5nZXRTY3JlZW5JbmZvKCk7XG4gICAgICB0aGlzLmRldmljZUNhcHMgPSB7XG4gICAgICAgIHBpeGVsUmF0aW86IHNjYWxlLFxuICAgICAgICBzdGF0QmFySGVpZ2h0OiBzdGF0dXNCYXJTaXplLmhlaWdodCxcbiAgICAgICAgdmlld3BvcnRSZWN0OiBhd2FpdCB0aGlzLmdldFZpZXdwb3J0UmVjdCgpLFxuICAgICAgfTtcbiAgICB9XG4gICAgbG9nLmluZm8oXCJNZXJnaW5nIFdEQSBjYXBzIG92ZXIgQXBwaXVtIGNhcHMgZm9yIHNlc3Npb24gZGV0YWlsIHJlc3BvbnNlXCIpO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt1ZGlkOiB0aGlzLm9wdHMudWRpZH0sIGRyaXZlclNlc3Npb24sXG4gICAgICB0aGlzLndkYUNhcHMuY2FwYWJpbGl0aWVzLCB0aGlzLmRldmljZUNhcHMpO1xuICB9XG5cbiAgYXN5bmMgc3RhcnRJV0RQICgpIHtcbiAgICB0aGlzLmxvZ0V2ZW50KCdpd2RwU3RhcnRpbmcnKTtcbiAgICB0aGlzLml3ZHBTZXJ2ZXIgPSBuZXcgSVdEUCh0aGlzLm9wdHMud2Via2l0RGVidWdQcm94eVBvcnQsIHRoaXMub3B0cy51ZGlkKTtcbiAgICBhd2FpdCB0aGlzLml3ZHBTZXJ2ZXIuc3RhcnQoKTtcbiAgICB0aGlzLmxvZ0V2ZW50KCdpd2RwU3RhcnRlZCcpO1xuICB9XG5cbiAgYXN5bmMgc3RvcElXRFAgKCkge1xuICAgIGlmICh0aGlzLml3ZHBTZXJ2ZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuaXdkcFNlcnZlci5zdG9wKCk7XG4gICAgICBkZWxldGUgdGhpcy5pd2RwU2VydmVyO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlc2V0ICgpIHtcbiAgICBpZiAodGhpcy5vcHRzLm5vUmVzZXQpIHtcbiAgICAgIC8vIFRoaXMgaXMgdG8gbWFrZSBzdXJlIHJlc2V0IGhhcHBlbnMgZXZlbiBpZiBub1Jlc2V0IGlzIHNldCB0byB0cnVlXG4gICAgICBsZXQgb3B0cyA9IF8uY2xvbmVEZWVwKHRoaXMub3B0cyk7XG4gICAgICBvcHRzLm5vUmVzZXQgPSBmYWxzZTtcbiAgICAgIG9wdHMuZnVsbFJlc2V0ID0gZmFsc2U7XG4gICAgICBjb25zdCBzaHV0ZG93bkhhbmRsZXIgPSB0aGlzLnJlc2V0T25VbmV4cGVjdGVkU2h1dGRvd247XG4gICAgICB0aGlzLnJlc2V0T25VbmV4cGVjdGVkU2h1dGRvd24gPSAoKSA9PiB7fTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMucnVuUmVzZXQob3B0cyk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLnJlc2V0T25VbmV4cGVjdGVkU2h1dGRvd24gPSBzaHV0ZG93bkhhbmRsZXI7XG4gICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHN1cGVyLnJlc2V0KCk7XG4gIH1cbn1cblxuT2JqZWN0LmFzc2lnbihYQ1VJVGVzdERyaXZlci5wcm90b3R5cGUsIGNvbW1hbmRzKTtcblxuZXhwb3J0IGRlZmF1bHQgWENVSVRlc3REcml2ZXI7XG5leHBvcnQgeyBYQ1VJVGVzdERyaXZlciB9O1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLiJ9
