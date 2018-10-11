'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumSupport = require('appium-support');

var _appiumIosDriver = require('appium-ios-driver');

var _appiumBaseDriver = require('appium-base-driver');

var _nodeSimctl = require('node-simctl');

var _asyncbox = require('asyncbox');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _uuidJs = require('uuid-js');

var _uuidJs2 = _interopRequireDefault(_uuidJs);

var _teen_process = require('teen_process');

var extensions = {},
    commands = {};

var CONFIG_EXTENSION = 'mobileconfig';

function extractCommonName(certBuffer) {
  var tempCert, _ref, stdout, cnMatch;

  return _regeneratorRuntime.async(function extractCommonName$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.open({
          prefix: 'cert',
          suffix: '.cer'
        }));

      case 2:
        tempCert = context$1$0.sent;
        context$1$0.prev = 3;
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.writeFile(tempCert.path, certBuffer));

      case 6:
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('openssl', ['x509', '-noout', '-subject', '-in', tempCert.path]));

      case 8:
        _ref = context$1$0.sent;
        stdout = _ref.stdout;
        cnMatch = /\/CN=([^\/]+)/.exec(stdout);

        if (!cnMatch) {
          context$1$0.next = 13;
          break;
        }

        return context$1$0.abrupt('return', cnMatch[1].trim());

      case 13:
        throw new Error('There is no common name value in \'' + stdout + '\' output');

      case 16:
        context$1$0.prev = 16;
        context$1$0.t0 = context$1$0['catch'](3);
        throw new Error('Cannot parse common name value from the certificate. Is it valid and base64-encoded? ' + ('Original error: ' + context$1$0.t0.message));

      case 19:
        context$1$0.prev = 19;
        context$1$0.next = 22;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(tempCert.path));

      case 22:
        return context$1$0.finish(19);

      case 23:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[3, 16, 19, 23]]);
}

/**
 * Generates Apple's over-the-air configuration profile
 * for certificate deployment based on the given PEM certificate content.
 * Read https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/iPhoneOTAConfiguration/Introduction/Introduction.html
 * for more details on such profiles.
 *
 * @param {Buffer} certBuffer - The actual content of PEM certificate encoded into NodeJS buffer
 * @param {string} commonName - Certificate's common name
 * @returns {Object} The encoded structure of the given certificate, which is ready to be passed
 * as an argument to plist builder
 * @throws {Error} If the given certificate cannot be parsed
 */
function toMobileConfig(certBuffer, commonName) {
  var getUUID = function getUUID() {
    return _uuidJs2['default'].create().hex.toUpperCase();
  };
  var contentUuid = getUUID();
  return {
    PayloadContent: [{
      PayloadCertificateFileName: commonName + '.cer',
      PayloadContent: certBuffer,
      PayloadDescription: 'Adds a CA root certificate',
      PayloadDisplayName: commonName,
      PayloadIdentifier: 'com.apple.security.root.' + contentUuid,
      PayloadType: 'com.apple.security.root',
      PayloadUUID: contentUuid,
      PayloadVersion: 1
    }],
    PayloadDisplayName: commonName,
    PayloadIdentifier: _os2['default'].hostname().split('.')[0] + '.' + getUUID(),
    PayloadRemovalDisallowed: false,
    PayloadType: 'Configuration',
    PayloadUUID: getUUID(),
    PayloadVersion: 1
  };
}

function clickElement(driver, locator) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var element, _options$timeout, timeout, _options$skipIfInvisible, skipIfInvisible, lookupDelay;

  return _regeneratorRuntime.async(function clickElement$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        element = null;
        _options$timeout = options.timeout;
        timeout = _options$timeout === undefined ? 5000 : _options$timeout;
        _options$skipIfInvisible = options.skipIfInvisible;
        skipIfInvisible = _options$skipIfInvisible === undefined ? false : _options$skipIfInvisible;
        lookupDelay = 500;
        context$1$0.prev = 6;
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(timeout < lookupDelay ? 1 : timeout / lookupDelay, lookupDelay, function () {
          return driver.findNativeElementOrElements(locator.type, locator.value, false);
        }));

      case 9:
        element = context$1$0.sent;
        context$1$0.next = 17;
        break;

      case 12:
        context$1$0.prev = 12;
        context$1$0.t0 = context$1$0['catch'](6);

        if (!skipIfInvisible) {
          context$1$0.next = 16;
          break;
        }

        return context$1$0.abrupt('return', false);

      case 16:
        throw new Error('Cannot find ' + JSON.stringify(locator) + ' within ' + timeout + 'ms timeout');

      case 17:
        context$1$0.next = 19;
        return _regeneratorRuntime.awrap(driver.nativeClick(element));

      case 19:
        return context$1$0.abrupt('return', true);

      case 20:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[6, 12]]);
}

function installCertificateInPreferences(driver) {
  return _regeneratorRuntime.async(function installCertificateInPreferences$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: 'accessibility id',
          value: 'Allow'
        }, {
          // certificate load might take some time on slow machines
          timeout: 15000
        }));

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_bluebird2['default'].delay(2000));

      case 4:
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: 'accessibility id',
          value: 'Install'
        }, {
          skipIfInvisible: true
        }));

      case 6:
        if (context$1$0.sent) {
          context$1$0.next = 8;
          break;
        }

        return context$1$0.abrupt('return', false);

      case 8:
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(_bluebird2['default'].delay(1500));

      case 10:
        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: 'accessibility id',
          value: 'Install'
        }));

      case 12:
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: '-ios class chain',
          value: '**/XCUIElementTypeSheet/**/XCUIElementTypeButton[`label == \'Install\'`]'
        }));

      case 14:
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: 'accessibility id',
          value: 'Done'
        }));

      case 16:
        return context$1$0.abrupt('return', true);

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function trustCertificateInPreferences(driver, name) {
  var switchLocator;
  return _regeneratorRuntime.async(function trustCertificateInPreferences$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: 'accessibility id',
          value: 'Return to Settings'
        }));

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: 'accessibility id',
          value: 'General'
        }));

      case 4:
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: 'accessibility id',
          value: 'About'
        }));

      case 6:
        switchLocator = {
          type: '-ios class chain',
          value: '**/XCUIElementTypeCell[`label == \'' + name + '\'`]/**/XCUIElementTypeSwitch'
        };
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap((0, _asyncbox.retry)(5, function callee$1$0() {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.t0 = _regeneratorRuntime;
                context$2$0.t1 = driver;
                context$2$0.next = 4;
                return _regeneratorRuntime.awrap(driver.findNativeElementOrElements('class name', 'XCUIElementTypeTable', false));

              case 4:
                context$2$0.t2 = context$2$0.sent;
                context$2$0.t3 = {
                  element: context$2$0.t2,
                  direction: 'up'
                };
                context$2$0.t4 = context$2$0.t1.mobileSwipe.call(context$2$0.t1, context$2$0.t3);
                context$2$0.next = 9;
                return context$2$0.t0.awrap.call(context$2$0.t0, context$2$0.t4);

              case 9:
                context$2$0.next = 11;
                return _regeneratorRuntime.awrap(clickElement(driver, {
                  type: 'accessibility id',
                  value: 'Certificate Trust Settings'
                }, {
                  timeout: 500
                }));

              case 11:
                context$2$0.next = 13;
                return _regeneratorRuntime.awrap(driver.findNativeElementOrElements(switchLocator.type, switchLocator.value, false));

              case 13:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        }));

      case 9:
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(clickElement(driver, {
          type: switchLocator.type,
          value: switchLocator.value + '[`value == \'0\'`]'
        }, {
          timeout: 1000,
          skipIfInvisible: true
        }));

      case 11:
        if (!context$1$0.sent) {
          context$1$0.next = 14;
          break;
        }

        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(driver.postAcceptAlert());

      case 14:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

/**
 * @typedef {Object} CertificateInstallationOptions
 *
 * @property {!string} content - Base64-encoded content of the public certificate
 * @property {?string} commonName - Common name of the certificate. If this is not set
 *                                  then the script will try to parse it from the given
 *                                  certificate content.
 */

/**
 * Installs a custom certificate onto the device.
 * Since Apple provides no official way to do it via command line,
 * this method tries to wrap the certificate into .mobileconfig format
 * and then deploys the wrapped file to the internal HTTP server,
 * so one can open it with mobile Safari.
 * Then the algorithm goes through the profile installation procedure by
 * clicking the necessary buttons using WebDriverAgent.
 *
 * @param {CertificateInstallationOptions} opts
 * @returns {string} The content of the generated .mobileconfig file as
 * base64-encoded string. This config might be useful for debugging purposes.
 */
commands.mobileInstallCertificate = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var content, commonName, configName, configPath, certBuffer, cn, mobileConfig, _server$address, address, port, certUrl;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        content = opts.content;
        commonName = opts.commonName;

        if (!_lodash2['default'].isEmpty(content)) {
          context$1$0.next = 4;
          break;
        }

        throw new Error('Certificate content should not be empty');

      case 4:
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(_appiumBaseDriver.STATIC_DIR));

      case 6:
        if (context$1$0.sent) {
          context$1$0.next = 8;
          break;
        }

        throw new Error('The static content root \'' + _appiumBaseDriver.STATIC_DIR + '\' ' + 'does not exist or is not accessible');

      case 8:
        configName = (Math.random() * 0x100000000 + 1).toString(36) + '.' + CONFIG_EXTENSION;
        configPath = _path2['default'].resolve(_appiumBaseDriver.STATIC_DIR, configName);
        certBuffer = Buffer.from(content, 'base64');
        context$1$0.t0 = commonName;

        if (context$1$0.t0) {
          context$1$0.next = 16;
          break;
        }

        context$1$0.next = 15;
        return _regeneratorRuntime.awrap(extractCommonName(certBuffer));

      case 15:
        context$1$0.t0 = context$1$0.sent;

      case 16:
        cn = context$1$0.t0;
        mobileConfig = toMobileConfig(certBuffer, cn);
        context$1$0.prev = 18;
        context$1$0.next = 21;
        return _regeneratorRuntime.awrap(_appiumSupport.plist.updatePlistFile(configPath, mobileConfig, false, false));

      case 21:
        context$1$0.next = 26;
        break;

      case 23:
        context$1$0.prev = 23;
        context$1$0.t1 = context$1$0['catch'](18);
        throw new Error('Cannot store the generated config as \'' + configPath + '\'. ' + ('Original error: ' + context$1$0.t1.message));

      case 26:
        context$1$0.prev = 26;
        _server$address = this.server.address();
        address = _server$address.address;
        port = _server$address.port;
        certUrl = 'http://' + (address ? address : _os2['default'].hostname()) + ':' + (port ? port : 4723) + '/' + configName;
        context$1$0.prev = 31;

        if (!this.isRealDevice()) {
          context$1$0.next = 48;
          break;
        }

        context$1$0.prev = 33;
        context$1$0.next = 36;
        return _regeneratorRuntime.awrap(this.proxyCommand('/url', 'POST', { url: certUrl }));

      case 36:
        context$1$0.next = 46;
        break;

      case 38:
        context$1$0.prev = 38;
        context$1$0.t2 = context$1$0['catch'](33);

        if (!this.isWebContext()) {
          context$1$0.next = 45;
          break;
        }

        context$1$0.next = 43;
        return _regeneratorRuntime.awrap(_appiumIosDriver.iosCommands.general.setUrl.call(this, certUrl));

      case 43:
        context$1$0.next = 46;
        break;

      case 45:
        throw context$1$0.t2;

      case 46:
        context$1$0.next = 50;
        break;

      case 48:
        context$1$0.next = 50;
        return _regeneratorRuntime.awrap((0, _nodeSimctl.openUrl)(this.opts.udid || this.sim.udid, certUrl));

      case 50:
        context$1$0.next = 52;
        return _regeneratorRuntime.awrap(installCertificateInPreferences(this));

      case 52:
        if (!context$1$0.sent) {
          context$1$0.next = 57;
          break;
        }

        context$1$0.next = 55;
        return _regeneratorRuntime.awrap(trustCertificateInPreferences(this, cn));

      case 55:
        context$1$0.next = 58;
        break;

      case 57:
        _logger2['default'].info('It looks like the \'' + cn + '\' certificate has been already added to the CA root');

      case 58:
        context$1$0.prev = 58;
        context$1$0.prev = 59;
        context$1$0.next = 62;
        return _regeneratorRuntime.awrap(this.activateApp(this.opts.bundleId));

      case 62:
        context$1$0.next = 67;
        break;

      case 64:
        context$1$0.prev = 64;
        context$1$0.t3 = context$1$0['catch'](59);

        _logger2['default'].warn('Cannot restore the application \'' + this.opts.bundleId + '\'. Original error: ' + context$1$0.t3.message);

      case 67:
        return context$1$0.finish(58);

      case 68:
        context$1$0.next = 70;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.readFile(configPath));

      case 70:
        return context$1$0.abrupt('return', context$1$0.sent.toString('base64'));

      case 71:
        context$1$0.prev = 71;
        context$1$0.next = 74;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(configPath));

      case 74:
        return context$1$0.finish(71);

      case 75:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[18, 23], [26,, 71, 75], [31,, 58, 68], [33, 38], [59, 64]]);
};

_Object$assign(extensions, commands);
exports.commands = commands;
exports['default'] = extensions;

// Accept Safari alert

// Wait until Preferences are opened

// Go through Preferences wizard

// We need to click Install button on two different tabs
// The second one confirms the previous

// Accept sheet alert

// Finish adding certificate

// Only click the switch if it is set to Off

// The command above does not always work on real devices
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9jZXJ0aWZpY2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBQWMsUUFBUTs7Ozs2QkFDYSxnQkFBZ0I7OytCQUN2QixtQkFBbUI7O2dDQUNwQixvQkFBb0I7OzBCQUN2QixhQUFhOzt3QkFDQSxVQUFVOzt3QkFDakMsVUFBVTs7OztzQkFDUixXQUFXOzs7O2tCQUNaLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztzQkFDTixTQUFTOzs7OzRCQUNMLGNBQWM7O0FBRW5DLElBQUksVUFBVSxHQUFHLEVBQUU7SUFBRSxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVuQyxJQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQzs7QUFHeEMsU0FBZSxpQkFBaUIsQ0FBRSxVQUFVO01BQ3BDLFFBQVEsUUFNTCxNQUFNLEVBQ1AsT0FBTzs7Ozs7O3lDQVBRLHVCQUFRLElBQUksQ0FBQztBQUNsQyxnQkFBTSxFQUFFLE1BQU07QUFDZCxnQkFBTSxFQUFFLE1BQU07U0FDZixDQUFDOzs7QUFISSxnQkFBUTs7O3lDQUtOLGtCQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQzs7Ozt5Q0FDdEIsd0JBQUssU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7OztBQUFyRixjQUFNLFFBQU4sTUFBTTtBQUNQLGVBQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7YUFDeEMsT0FBTzs7Ozs7NENBQ0YsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRTs7O2NBRXBCLElBQUksS0FBSyx5Q0FBc0MsTUFBTSxlQUFXOzs7OztjQUVoRSxJQUFJLEtBQUssQ0FBQyxnSEFDbUIsZUFBSSxPQUFPLENBQUUsQ0FBQzs7Ozs7eUNBRTNDLGtCQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxD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LENBQUMsVUFBVSxDQUFDOzs7Ozs7Ozs7O0NBRTlCLENBQUM7O0FBRUYsZUFBYyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0IsUUFBUSxHQUFSLFFBQVE7cUJBQ0YsVUFBVSIsImZpbGUiOiJsaWIvY29tbWFuZHMvY2VydGlmaWNhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgZnMsIHBsaXN0LCB0ZW1wRGlyIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHsgaW9zQ29tbWFuZHMgfSBmcm9tICdhcHBpdW0taW9zLWRyaXZlcic7XG5pbXBvcnQgeyBTVEFUSUNfRElSIH0gZnJvbSAnYXBwaXVtLWJhc2UtZHJpdmVyJztcbmltcG9ydCB7IG9wZW5VcmwgfSBmcm9tICdub2RlLXNpbWN0bCc7XG5pbXBvcnQgeyByZXRyeUludGVydmFsLCByZXRyeSB9IGZyb20gJ2FzeW5jYm94JztcbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBsb2cgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBVVUlEIGZyb20gJ3V1aWQtanMnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5cbmxldCBleHRlbnNpb25zID0ge30sIGNvbW1hbmRzID0ge307XG5cbmNvbnN0IENPTkZJR19FWFRFTlNJT04gPSAnbW9iaWxlY29uZmlnJztcblxuXG5hc3luYyBmdW5jdGlvbiBleHRyYWN0Q29tbW9uTmFtZSAoY2VydEJ1ZmZlcikge1xuICBjb25zdCB0ZW1wQ2VydCA9IGF3YWl0IHRlbXBEaXIub3Blbih7XG4gICAgcHJlZml4OiAnY2VydCcsXG4gICAgc3VmZml4OiAnLmNlcidcbiAgfSk7XG4gIHRyeSB7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHRlbXBDZXJ0LnBhdGgsIGNlcnRCdWZmZXIpO1xuICAgIGNvbnN0IHtzdGRvdXR9ID0gYXdhaXQgZXhlYygnb3BlbnNzbCcsIFsneDUwOScsICctbm9vdXQnLCAnLXN1YmplY3QnLCAnLWluJywgdGVtcENlcnQucGF0aF0pO1xuICAgIGNvbnN0IGNuTWF0Y2ggPSAvXFwvQ049KFteXFwvXSspLy5leGVjKHN0ZG91dCk7XG4gICAgaWYgKGNuTWF0Y2gpIHtcbiAgICAgIHJldHVybiBjbk1hdGNoWzFdLnRyaW0oKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSBpcyBubyBjb21tb24gbmFtZSB2YWx1ZSBpbiAnJHtzdGRvdXR9JyBvdXRwdXRgKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcGFyc2UgY29tbW9uIG5hbWUgdmFsdWUgZnJvbSB0aGUgY2VydGlmaWNhdGUuIElzIGl0IHZhbGlkIGFuZCBiYXNlNjQtZW5jb2RlZD8gYCArXG4gICAgICAgICAgICAgICAgICAgIGBPcmlnaW5hbCBlcnJvcjogJHtlcnIubWVzc2FnZX1gKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBhd2FpdCBmcy5yaW1yYWYodGVtcENlcnQucGF0aCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgQXBwbGUncyBvdmVyLXRoZS1haXIgY29uZmlndXJhdGlvbiBwcm9maWxlXG4gKiBmb3IgY2VydGlmaWNhdGUgZGVwbG95bWVudCBiYXNlZCBvbiB0aGUgZ2l2ZW4gUEVNIGNlcnRpZmljYXRlIGNvbnRlbnQuXG4gKiBSZWFkIGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L2NvbnRlbnQvZG9jdW1lbnRhdGlvbi9OZXR3b3JraW5nSW50ZXJuZXQvQ29uY2VwdHVhbC9pUGhvbmVPVEFDb25maWd1cmF0aW9uL0ludHJvZHVjdGlvbi9JbnRyb2R1Y3Rpb24uaHRtbFxuICogZm9yIG1vcmUgZGV0YWlscyBvbiBzdWNoIHByb2ZpbGVzLlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBjZXJ0QnVmZmVyIC0gVGhlIGFjdHVhbCBjb250ZW50IG9mIFBFTSBjZXJ0aWZpY2F0ZSBlbmNvZGVkIGludG8gTm9kZUpTIGJ1ZmZlclxuICogQHBhcmFtIHtzdHJpbmd9IGNvbW1vbk5hbWUgLSBDZXJ0aWZpY2F0ZSdzIGNvbW1vbiBuYW1lXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgZW5jb2RlZCBzdHJ1Y3R1cmUgb2YgdGhlIGdpdmVuIGNlcnRpZmljYXRlLCB3aGljaCBpcyByZWFkeSB0byBiZSBwYXNzZWRcbiAqIGFzIGFuIGFyZ3VtZW50IHRvIHBsaXN0IGJ1aWxkZXJcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgZ2l2ZW4gY2VydGlmaWNhdGUgY2Fubm90IGJlIHBhcnNlZFxuICovXG5mdW5jdGlvbiB0b01vYmlsZUNvbmZpZyAoY2VydEJ1ZmZlciwgY29tbW9uTmFtZSkge1xuICBjb25zdCBnZXRVVUlEID0gKCkgPT4gVVVJRC5jcmVhdGUoKS5oZXgudG9VcHBlckNhc2UoKTtcbiAgY29uc3QgY29udGVudFV1aWQgPSBnZXRVVUlEKCk7XG4gIHJldHVybiB7XG4gICAgUGF5bG9hZENvbnRlbnQ6IFt7XG4gICAgICBQYXlsb2FkQ2VydGlmaWNhdGVGaWxlTmFtZTogYCR7Y29tbW9uTmFtZX0uY2VyYCxcbiAgICAgIFBheWxvYWRDb250ZW50OiBjZXJ0QnVmZmVyLFxuICAgICAgUGF5bG9hZERlc2NyaXB0aW9uOiAnQWRkcyBhIENBIHJvb3QgY2VydGlmaWNhdGUnLFxuICAgICAgUGF5bG9hZERpc3BsYXlOYW1lOiBjb21tb25OYW1lLFxuICAgICAgUGF5bG9hZElkZW50aWZpZXI6IGBjb20uYXBwbGUuc2VjdXJpdHkucm9vdC4ke2NvbnRlbnRVdWlkfWAsXG4gICAgICBQYXlsb2FkVHlwZTogJ2NvbS5hcHBsZS5zZWN1cml0eS5yb290JyxcbiAgICAgIFBheWxvYWRVVUlEOiBjb250ZW50VXVpZCxcbiAgICAgIFBheWxvYWRWZXJzaW9uOiAxXG4gICAgfV0sXG4gICAgUGF5bG9hZERpc3BsYXlOYW1lOiBjb21tb25OYW1lLFxuICAgIFBheWxvYWRJZGVudGlmaWVyOiBgJHtvcy5ob3N0bmFtZSgpLnNwbGl0KCcuJylbMF19LiR7Z2V0VVVJRCgpfWAsXG4gICAgUGF5bG9hZFJlbW92YWxEaXNhbGxvd2VkOiBmYWxzZSxcbiAgICBQYXlsb2FkVHlwZTogJ0NvbmZpZ3VyYXRpb24nLFxuICAgIFBheWxvYWRVVUlEOiBnZXRVVUlEKCksXG4gICAgUGF5bG9hZFZlcnNpb246IDFcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2xpY2tFbGVtZW50IChkcml2ZXIsIGxvY2F0b3IsIG9wdGlvbnMgPSB7fSkge1xuICBsZXQgZWxlbWVudCA9IG51bGw7XG4gIGNvbnN0IHtcbiAgICB0aW1lb3V0ID0gNTAwMCxcbiAgICBza2lwSWZJbnZpc2libGUgPSBmYWxzZVxuICB9ID0gb3B0aW9ucztcbiAgY29uc3QgbG9va3VwRGVsYXkgPSA1MDA7XG4gIHRyeSB7XG4gICAgZWxlbWVudCA9IGF3YWl0IHJldHJ5SW50ZXJ2YWwodGltZW91dCA8IGxvb2t1cERlbGF5ID8gMSA6IHRpbWVvdXQgLyBsb29rdXBEZWxheSwgbG9va3VwRGVsYXksXG4gICAgICAoKSA9PiBkcml2ZXIuZmluZE5hdGl2ZUVsZW1lbnRPckVsZW1lbnRzKGxvY2F0b3IudHlwZSwgbG9jYXRvci52YWx1ZSwgZmFsc2UpXG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHNraXBJZkludmlzaWJsZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kICR7SlNPTi5zdHJpbmdpZnkobG9jYXRvcil9IHdpdGhpbiAke3RpbWVvdXR9bXMgdGltZW91dGApO1xuICB9XG4gIGF3YWl0IGRyaXZlci5uYXRpdmVDbGljayhlbGVtZW50KTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluc3RhbGxDZXJ0aWZpY2F0ZUluUHJlZmVyZW5jZXMgKGRyaXZlcikge1xuICAvLyBBY2NlcHQgU2FmYXJpIGFsZXJ0XG4gIGF3YWl0IGNsaWNrRWxlbWVudChkcml2ZXIsIHtcbiAgICB0eXBlOiAnYWNjZXNzaWJpbGl0eSBpZCcsXG4gICAgdmFsdWU6ICdBbGxvdycsXG4gIH0sIHtcbiAgICAvLyBjZXJ0aWZpY2F0ZSBsb2FkIG1pZ2h0IHRha2Ugc29tZSB0aW1lIG9uIHNsb3cgbWFjaGluZXNcbiAgICB0aW1lb3V0OiAxNTAwMCxcbiAgfSk7XG4gIC8vIFdhaXQgdW50aWwgUHJlZmVyZW5jZXMgYXJlIG9wZW5lZFxuICBhd2FpdCBCLmRlbGF5KDIwMDApO1xuXG4gIC8vIEdvIHRocm91Z2ggUHJlZmVyZW5jZXMgd2l6YXJkXG4gIGlmICghYXdhaXQgY2xpY2tFbGVtZW50KGRyaXZlciwge1xuICAgIHR5cGU6ICdhY2Nlc3NpYmlsaXR5IGlkJyxcbiAgICB2YWx1ZTogJ0luc3RhbGwnXG4gIH0sIHtcbiAgICBza2lwSWZJbnZpc2libGU6IHRydWUsXG4gIH0pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFdlIG5lZWQgdG8gY2xpY2sgSW5zdGFsbCBidXR0b24gb24gdHdvIGRpZmZlcmVudCB0YWJzXG4gIC8vIFRoZSBzZWNvbmQgb25lIGNvbmZpcm1zIHRoZSBwcmV2aW91c1xuICBhd2FpdCBCLmRlbGF5KDE1MDApO1xuICBhd2FpdCBjbGlja0VsZW1lbnQoZHJpdmVyLCB7XG4gICAgdHlwZTogJ2FjY2Vzc2liaWxpdHkgaWQnLFxuICAgIHZhbHVlOiAnSW5zdGFsbCdcbiAgfSk7XG4gIC8vIEFjY2VwdCBzaGVldCBhbGVydFxuICBhd2FpdCBjbGlja0VsZW1lbnQoZHJpdmVyLCB7XG4gICAgdHlwZTogJy1pb3MgY2xhc3MgY2hhaW4nLFxuICAgIHZhbHVlOiAnKiovWENVSUVsZW1lbnRUeXBlU2hlZXQvKiovWENVSUVsZW1lbnRUeXBlQnV0dG9uW2BsYWJlbCA9PSBcXCdJbnN0YWxsXFwnYF0nXG4gIH0pO1xuICAvLyBGaW5pc2ggYWRkaW5nIGNlcnRpZmljYXRlXG4gIGF3YWl0IGNsaWNrRWxlbWVudChkcml2ZXIsIHtcbiAgICB0eXBlOiAnYWNjZXNzaWJpbGl0eSBpZCcsXG4gICAgdmFsdWU6ICdEb25lJ1xuICB9KTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRydXN0Q2VydGlmaWNhdGVJblByZWZlcmVuY2VzIChkcml2ZXIsIG5hbWUpIHtcbiAgYXdhaXQgY2xpY2tFbGVtZW50KGRyaXZlciwge1xuICAgIHR5cGU6ICdhY2Nlc3NpYmlsaXR5IGlkJyxcbiAgICB2YWx1ZTogJ1JldHVybiB0byBTZXR0aW5ncydcbiAgfSk7XG4gIGF3YWl0IGNsaWNrRWxlbWVudChkcml2ZXIsIHtcbiAgICB0eXBlOiAnYWNjZXNzaWJpbGl0eSBpZCcsXG4gICAgdmFsdWU6ICdHZW5lcmFsJ1xuICB9KTtcbiAgYXdhaXQgY2xpY2tFbGVtZW50KGRyaXZlciwge1xuICAgIHR5cGU6ICdhY2Nlc3NpYmlsaXR5IGlkJyxcbiAgICB2YWx1ZTogJ0Fib3V0J1xuICB9KTtcbiAgY29uc3Qgc3dpdGNoTG9jYXRvciA9IHtcbiAgICB0eXBlOiAnLWlvcyBjbGFzcyBjaGFpbicsXG4gICAgdmFsdWU6IGAqKi9YQ1VJRWxlbWVudFR5cGVDZWxsW1xcYGxhYmVsID09ICcke25hbWV9J1xcYF0vKiovWENVSUVsZW1lbnRUeXBlU3dpdGNoYCxcbiAgfTtcbiAgYXdhaXQgcmV0cnkoNSwgYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IGRyaXZlci5tb2JpbGVTd2lwZSh7XG4gICAgICBlbGVtZW50OiBhd2FpdCBkcml2ZXIuZmluZE5hdGl2ZUVsZW1lbnRPckVsZW1lbnRzKCdjbGFzcyBuYW1lJywgJ1hDVUlFbGVtZW50VHlwZVRhYmxlJywgZmFsc2UpLFxuICAgICAgZGlyZWN0aW9uOiAndXAnXG4gICAgfSk7XG4gICAgYXdhaXQgY2xpY2tFbGVtZW50KGRyaXZlciwge1xuICAgICAgdHlwZTogJ2FjY2Vzc2liaWxpdHkgaWQnLFxuICAgICAgdmFsdWU6ICdDZXJ0aWZpY2F0ZSBUcnVzdCBTZXR0aW5ncydcbiAgICB9LCB7XG4gICAgICB0aW1lb3V0OiA1MDAsXG4gICAgfSk7XG5cbiAgICBhd2FpdCBkcml2ZXIuZmluZE5hdGl2ZUVsZW1lbnRPckVsZW1lbnRzKHN3aXRjaExvY2F0b3IudHlwZSwgc3dpdGNoTG9jYXRvci52YWx1ZSwgZmFsc2UpO1xuICB9KTtcbiAgLy8gT25seSBjbGljayB0aGUgc3dpdGNoIGlmIGl0IGlzIHNldCB0byBPZmZcbiAgaWYgKGF3YWl0IGNsaWNrRWxlbWVudChkcml2ZXIsIHtcbiAgICB0eXBlOiBzd2l0Y2hMb2NhdG9yLnR5cGUsXG4gICAgdmFsdWU6IGAke3N3aXRjaExvY2F0b3IudmFsdWV9W1xcYHZhbHVlID09ICcwJ1xcYF1gXG4gIH0sIHtcbiAgICB0aW1lb3V0OiAxMDAwLFxuICAgIHNraXBJZkludmlzaWJsZTogdHJ1ZSxcbiAgfSkpIHtcbiAgICBhd2FpdCBkcml2ZXIucG9zdEFjY2VwdEFsZXJ0KCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDZXJ0aWZpY2F0ZUluc3RhbGxhdGlvbk9wdGlvbnNcbiAqXG4gKiBAcHJvcGVydHkgeyFzdHJpbmd9IGNvbnRlbnQgLSBCYXNlNjQtZW5jb2RlZCBjb250ZW50IG9mIHRoZSBwdWJsaWMgY2VydGlmaWNhdGVcbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gY29tbW9uTmFtZSAtIENvbW1vbiBuYW1lIG9mIHRoZSBjZXJ0aWZpY2F0ZS4gSWYgdGhpcyBpcyBub3Qgc2V0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIHRoZSBzY3JpcHQgd2lsbCB0cnkgdG8gcGFyc2UgaXQgZnJvbSB0aGUgZ2l2ZW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlIGNvbnRlbnQuXG4gKi9cblxuLyoqXG4gKiBJbnN0YWxscyBhIGN1c3RvbSBjZXJ0aWZpY2F0ZSBvbnRvIHRoZSBkZXZpY2UuXG4gKiBTaW5jZSBBcHBsZSBwcm92aWRlcyBubyBvZmZpY2lhbCB3YXkgdG8gZG8gaXQgdmlhIGNvbW1hbmQgbGluZSxcbiAqIHRoaXMgbWV0aG9kIHRyaWVzIHRvIHdyYXAgdGhlIGNlcnRpZmljYXRlIGludG8gLm1vYmlsZWNvbmZpZyBmb3JtYXRcbiAqIGFuZCB0aGVuIGRlcGxveXMgdGhlIHdyYXBwZWQgZmlsZSB0byB0aGUgaW50ZXJuYWwgSFRUUCBzZXJ2ZXIsXG4gKiBzbyBvbmUgY2FuIG9wZW4gaXQgd2l0aCBtb2JpbGUgU2FmYXJpLlxuICogVGhlbiB0aGUgYWxnb3JpdGhtIGdvZXMgdGhyb3VnaCB0aGUgcHJvZmlsZSBpbnN0YWxsYXRpb24gcHJvY2VkdXJlIGJ5XG4gKiBjbGlja2luZyB0aGUgbmVjZXNzYXJ5IGJ1dHRvbnMgdXNpbmcgV2ViRHJpdmVyQWdlbnQuXG4gKlxuICogQHBhcmFtIHtDZXJ0aWZpY2F0ZUluc3RhbGxhdGlvbk9wdGlvbnN9IG9wdHNcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb250ZW50IG9mIHRoZSBnZW5lcmF0ZWQgLm1vYmlsZWNvbmZpZyBmaWxlIGFzXG4gKiBiYXNlNjQtZW5jb2RlZCBzdHJpbmcuIFRoaXMgY29uZmlnIG1pZ2h0IGJlIHVzZWZ1bCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLlxuICovXG5jb21tYW5kcy5tb2JpbGVJbnN0YWxsQ2VydGlmaWNhdGUgPSBhc3luYyBmdW5jdGlvbiAob3B0cyA9IHt9KSB7XG4gIGNvbnN0IHtjb250ZW50LCBjb21tb25OYW1lfSA9IG9wdHM7XG4gIGlmIChfLmlzRW1wdHkoY29udGVudCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NlcnRpZmljYXRlIGNvbnRlbnQgc2hvdWxkIG5vdCBiZSBlbXB0eScpO1xuICB9XG5cbiAgaWYgKCFhd2FpdCBmcy5leGlzdHMoU1RBVElDX0RJUikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBzdGF0aWMgY29udGVudCByb290ICcke1NUQVRJQ19ESVJ9JyBgICtcbiAgICAgICAgICAgICAgICAgICAgYGRvZXMgbm90IGV4aXN0IG9yIGlzIG5vdCBhY2Nlc3NpYmxlYCk7XG4gIH1cbiAgY29uc3QgY29uZmlnTmFtZSA9IGAkeyhNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDAgKyAxKS50b1N0cmluZygzNil9LiR7Q09ORklHX0VYVEVOU0lPTn1gO1xuICBjb25zdCBjb25maWdQYXRoID0gcGF0aC5yZXNvbHZlKFNUQVRJQ19ESVIsIGNvbmZpZ05hbWUpO1xuICBjb25zdCBjZXJ0QnVmZmVyID0gQnVmZmVyLmZyb20oY29udGVudCwgJ2Jhc2U2NCcpO1xuICBjb25zdCBjbiA9IGNvbW1vbk5hbWUgfHwgYXdhaXQgZXh0cmFjdENvbW1vbk5hbWUoY2VydEJ1ZmZlcik7XG4gIGNvbnN0IG1vYmlsZUNvbmZpZyA9IHRvTW9iaWxlQ29uZmlnKGNlcnRCdWZmZXIsIGNuKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBwbGlzdC51cGRhdGVQbGlzdEZpbGUoY29uZmlnUGF0aCwgbW9iaWxlQ29uZmlnLCBmYWxzZSwgZmFsc2UpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzdG9yZSB0aGUgZ2VuZXJhdGVkIGNvbmZpZyBhcyAnJHtjb25maWdQYXRofScuIGAgK1xuICAgICAgICAgICAgICAgICAgICBgT3JpZ2luYWwgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCB7YWRkcmVzcywgcG9ydH0gPSB0aGlzLnNlcnZlci5hZGRyZXNzKCk7XG4gICAgY29uc3QgY2VydFVybCA9IGBodHRwOi8vJHthZGRyZXNzID8gYWRkcmVzcyA6IG9zLmhvc3RuYW1lKCl9OiR7cG9ydCA/IHBvcnQgOiA0NzIzfS8ke2NvbmZpZ05hbWV9YDtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuaXNSZWFsRGV2aWNlKCkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnByb3h5Q29tbWFuZCgnL3VybCcsICdQT1NUJywge3VybDogY2VydFVybH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc1dlYkNvbnRleHQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIGNvbW1hbmQgYWJvdmUgZG9lcyBub3QgYWx3YXlzIHdvcmsgb24gcmVhbCBkZXZpY2VzXG4gICAgICAgICAgICBhd2FpdCBpb3NDb21tYW5kcy5nZW5lcmFsLnNldFVybC5jYWxsKHRoaXMsIGNlcnRVcmwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBvcGVuVXJsKHRoaXMub3B0cy51ZGlkIHx8IHRoaXMuc2ltLnVkaWQsIGNlcnRVcmwpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXdhaXQgaW5zdGFsbENlcnRpZmljYXRlSW5QcmVmZXJlbmNlcyh0aGlzKSkge1xuICAgICAgICBhd2FpdCB0cnVzdENlcnRpZmljYXRlSW5QcmVmZXJlbmNlcyh0aGlzLCBjbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2cuaW5mbyhgSXQgbG9va3MgbGlrZSB0aGUgJyR7Y259JyBjZXJ0aWZpY2F0ZSBoYXMgYmVlbiBhbHJlYWR5IGFkZGVkIHRvIHRoZSBDQSByb290YCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYWN0aXZhdGVBcHAodGhpcy5vcHRzLmJ1bmRsZUlkKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nLndhcm4oYENhbm5vdCByZXN0b3JlIHRoZSBhcHBsaWNhdGlvbiAnJHt0aGlzLm9wdHMuYnVuZGxlSWR9Jy4gT3JpZ2luYWwgZXJyb3I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoYXdhaXQgZnMucmVhZEZpbGUoY29uZmlnUGF0aCkpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBhd2FpdCBmcy5yaW1yYWYoY29uZmlnUGF0aCk7XG4gIH1cbn07XG5cbk9iamVjdC5hc3NpZ24oZXh0ZW5zaW9ucywgY29tbWFuZHMpO1xuZXhwb3J0IHsgY29tbWFuZHMgfTtcbmV4cG9ydCBkZWZhdWx0IGV4dGVuc2lvbnM7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
