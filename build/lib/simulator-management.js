'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _appiumIosSimulator = require('appium-ios-simulator');

var _nodeSimctl = require('node-simctl');

var _utils = require('./utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _asyncbox = require('asyncbox');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

/**
 * Create a new simulator with `appiumTest-` prefix and return the object.
 *
 * @param {object} caps - Capability set by a user. The options available are:
 *   - `deviceName` - a name for the device
 *   - `platformVersion` - the version of iOS to use
 * @returns {object} Simulator object associated with the udid passed in.
 */
function createSim(caps) {
  var appiumTestDeviceName, udid;
  return _regeneratorRuntime.async(function createSim$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        appiumTestDeviceName = 'appiumTest-' + caps.deviceName;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap((0, _nodeSimctl.createDevice)(appiumTestDeviceName, caps.deviceName, caps.platformVersion));

      case 3:
        udid = context$1$0.sent;
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap((0, _appiumIosSimulator.getSimulator)(udid));

      case 6:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 7:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

/**
 * Get a simulator which is already running.
 *
 * @param {object} opts - Capability set by a user. The options available are:
 *   - `deviceName` - a name for the device
 *   - `platformVersion` - the version of iOS to use
 * @returns {?object} Simulator object associated with the udid passed in. Or null if no device is running.
 */
function getExistingSim(opts) {
  var devices, appiumTestDeviceName, appiumTestDevice, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, device;

  return _regeneratorRuntime.async(function getExistingSim$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _nodeSimctl.getDevices)(opts.platformVersion));

      case 2:
        devices = context$1$0.sent;
        appiumTestDeviceName = 'appiumTest-' + opts.deviceName;
        appiumTestDevice = undefined;
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 8;
        _iterator = _getIterator(_lodash2['default'].values(devices));

      case 10:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 20;
          break;
        }

        device = _step.value;

        if (!(device.name === opts.deviceName)) {
          context$1$0.next = 16;
          break;
        }

        context$1$0.next = 15;
        return _regeneratorRuntime.awrap((0, _appiumIosSimulator.getSimulator)(device.udid));

      case 15:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 16:

        if (device.name === appiumTestDeviceName) {
          appiumTestDevice = device;
        }

      case 17:
        _iteratorNormalCompletion = true;
        context$1$0.next = 10;
        break;

      case 20:
        context$1$0.next = 26;
        break;

      case 22:
        context$1$0.prev = 22;
        context$1$0.t0 = context$1$0['catch'](8);
        _didIteratorError = true;
        _iteratorError = context$1$0.t0;

      case 26:
        context$1$0.prev = 26;
        context$1$0.prev = 27;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 29:
        context$1$0.prev = 29;

        if (!_didIteratorError) {
          context$1$0.next = 32;
          break;
        }

        throw _iteratorError;

      case 32:
        return context$1$0.finish(29);

      case 33:
        return context$1$0.finish(26);

      case 34:
        if (!appiumTestDevice) {
          context$1$0.next = 39;
          break;
        }

        _logger2['default'].warn('Unable to find device \'' + opts.deviceName + '\'. Found \'' + appiumTestDevice.name + '\' (udid: \'' + appiumTestDevice.udid + '\') instead');
        context$1$0.next = 38;
        return _regeneratorRuntime.awrap((0, _appiumIosSimulator.getSimulator)(appiumTestDevice.udid));

      case 38:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 39:
        return context$1$0.abrupt('return', null);

      case 40:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[8, 22, 26, 34], [27,, 29, 33]]);
}

function shutdownSimulator(device) {
  return _regeneratorRuntime.async(function shutdownSimulator$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _utils.resetXCTestProcesses)(device.udid, true));

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(device.shutdown());

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function runSimulatorReset(device, opts) {
  var isKeychainsBackupSuccessful, isSafari;
  return _regeneratorRuntime.async(function runSimulatorReset$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!(opts.noReset && !opts.fullReset)) {
          context$1$0.next = 3;
          break;
        }

        // noReset === true && fullReset === false
        _logger2['default'].debug('Reset: noReset is on. Leaving simulator as is');
        return context$1$0.abrupt('return');

      case 3:
        if (device) {
          context$1$0.next = 6;
          break;
        }

        _logger2['default'].debug('Reset: no device available. Skipping');
        return context$1$0.abrupt('return');

      case 6:
        if (!opts.fullReset) {
          context$1$0.next = 26;
          break;
        }

        _logger2['default'].debug('Reset: fullReset is on. Cleaning simulator');
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(shutdownSimulator(device));

      case 10:
        isKeychainsBackupSuccessful = false;

        if (!(opts.keychainsExcludePatterns || opts.keepKeyChains)) {
          context$1$0.next = 15;
          break;
        }

        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(device.backupKeychains());

      case 14:
        isKeychainsBackupSuccessful = context$1$0.sent;

      case 15:
        context$1$0.next = 17;
        return _regeneratorRuntime.awrap(device.clean());

      case 17:
        if (!isKeychainsBackupSuccessful) {
          context$1$0.next = 23;
          break;
        }

        context$1$0.next = 20;
        return _regeneratorRuntime.awrap(device.restoreKeychains(opts.keychainsExcludePatterns || []));

      case 20:
        _logger2['default'].info('Successfully restored keychains after full reset');
        context$1$0.next = 24;
        break;

      case 23:
        if (opts.keychainsExcludePatterns || opts.keepKeyChains) {
          _logger2['default'].warn('Cannot restore keychains after full reset, because ' + 'the backup operation did not succeed');
        }

      case 24:
        context$1$0.next = 61;
        break;

      case 26:
        if (!opts.bundleId) {
          context$1$0.next = 61;
          break;
        }

        context$1$0.next = 29;
        return _regeneratorRuntime.awrap(device.isRunning());

      case 29:
        if (!context$1$0.sent) {
          context$1$0.next = 43;
          break;
        }

        if (!(device.xcodeVersion.major >= 8)) {
          context$1$0.next = 41;
          break;
        }

        context$1$0.prev = 31;
        context$1$0.next = 34;
        return _regeneratorRuntime.awrap((0, _nodeSimctl.terminate)(device.udid, opts.bundleId));

      case 34:
        context$1$0.next = 39;
        break;

      case 36:
        context$1$0.prev = 36;
        context$1$0.t0 = context$1$0['catch'](31);

        _logger2['default'].warn('Reset: failed to terminate Simulator application with id "' + opts.bundleId + '"');

      case 39:
        context$1$0.next = 43;
        break;

      case 41:
        context$1$0.next = 43;
        return _regeneratorRuntime.awrap(shutdownSimulator(device));

      case 43:
        if (!opts.app) {
          context$1$0.next = 46;
          break;
        }

        _logger2['default'].info('Not scrubbing third party app in anticipation of uninstall');
        return context$1$0.abrupt('return');

      case 46:
        isSafari = (opts.browserName || '').toLowerCase() === 'safari';
        context$1$0.prev = 47;

        if (!isSafari) {
          context$1$0.next = 53;
          break;
        }

        context$1$0.next = 51;
        return _regeneratorRuntime.awrap(device.cleanSafari());

      case 51:
        context$1$0.next = 55;
        break;

      case 53:
        context$1$0.next = 55;
        return _regeneratorRuntime.awrap(device.scrubCustomApp(_path2['default'].basename(opts.app), opts.bundleId));

      case 55:
        context$1$0.next = 61;
        break;

      case 57:
        context$1$0.prev = 57;
        context$1$0.t1 = context$1$0['catch'](47);

        _logger2['default'].warn(context$1$0.t1.message);
        _logger2['default'].warn('Reset: could not scrub ' + (isSafari ? 'Safari browser' : 'application with id "' + opts.bundleId + '"') + '. Leaving as is.');

      case 61:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[31, 36], [47, 57]]);
}

function installToSimulator(device, app, bundleId) {
  var noReset = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
  return _regeneratorRuntime.async(function installToSimulator$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (app) {
          context$1$0.next = 3;
          break;
        }

        _logger2['default'].debug('No app path is given. Nothing to install.');
        return context$1$0.abrupt('return');

      case 3:
        if (!bundleId) {
          context$1$0.next = 13;
          break;
        }

        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(device.isAppInstalled(bundleId));

      case 6:
        if (!context$1$0.sent) {
          context$1$0.next = 13;
          break;
        }

        if (!noReset) {
          context$1$0.next = 10;
          break;
        }

        _logger2['default'].debug('App \'' + bundleId + '\' is already installed. No need to reinstall.');
        return context$1$0.abrupt('return');

      case 10:
        _logger2['default'].debug('Reset requested. Removing app with id \'' + bundleId + '\' from the device');
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(device.removeApp(bundleId));

      case 13:
        _logger2['default'].debug('Installing \'' + app + '\' on Simulator with UUID \'' + device.udid + '\'...');
        // on Xcode 10 sometimes this is too fast and it fails
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap((0, _asyncbox.retry)(2, device.installApp.bind(device), app));

      case 16:
        _logger2['default'].debug('The app has been installed successfully.');

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function shutdownOtherSimulators(currentDevice) {
  var allDevices, otherBootedDevices, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, udid;

  return _regeneratorRuntime.async(function shutdownOtherSimulators$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.t0 = _lodash2['default'];
        context$1$0.t1 = _lodash2['default'];
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap((0, _nodeSimctl.getDevices)());

      case 4:
        context$1$0.t2 = context$1$0.sent;
        context$1$0.t3 = context$1$0.t1.values.call(context$1$0.t1, context$1$0.t2);
        allDevices = context$1$0.t0.flatMap.call(context$1$0.t0, context$1$0.t3);
        otherBootedDevices = allDevices.filter(function (device) {
          return device.udid !== currentDevice.udid && device.state === 'Booted';
        });

        if (!_lodash2['default'].isEmpty(otherBootedDevices)) {
          context$1$0.next = 11;
          break;
        }

        _logger2['default'].info('No other running simulators have been detected');
        return context$1$0.abrupt('return');

      case 11:
        _logger2['default'].info('Detected ' + otherBootedDevices.length + ' other running Simulator' + (otherBootedDevices.length === 1 ? '' : 's') + '.' + ('Shutting ' + (otherBootedDevices.length === 1 ? 'it' : 'them') + ' down...'));
        _iteratorNormalCompletion2 = true;
        _didIteratorError2 = false;
        _iteratorError2 = undefined;
        context$1$0.prev = 15;
        _iterator2 = _getIterator(otherBootedDevices);

      case 17:
        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
          context$1$0.next = 26;
          break;
        }

        udid = _step2.value.udid;
        context$1$0.next = 21;
        return _regeneratorRuntime.awrap((0, _utils.resetXCTestProcesses)(udid, true));

      case 21:
        context$1$0.next = 23;
        return _regeneratorRuntime.awrap((0, _nodeSimctl.shutdown)(udid));

      case 23:
        _iteratorNormalCompletion2 = true;
        context$1$0.next = 17;
        break;

      case 26:
        context$1$0.next = 32;
        break;

      case 28:
        context$1$0.prev = 28;
        context$1$0.t4 = context$1$0['catch'](15);
        _didIteratorError2 = true;
        _iteratorError2 = context$1$0.t4;

      case 32:
        context$1$0.prev = 32;
        context$1$0.prev = 33;

        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }

      case 35:
        context$1$0.prev = 35;

        if (!_didIteratorError2) {
          context$1$0.next = 38;
          break;
        }

        throw _iteratorError2;

      case 38:
        return context$1$0.finish(35);

      case 39:
        return context$1$0.finish(32);

      case 40:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[15, 28, 32, 40], [33,, 35, 39]]);
}

exports.createSim = createSim;
exports.getExistingSim = getExistingSim;
exports.runSimulatorReset = runSimulatorReset;
exports.installToSimulator = installToSimulator;
exports.shutdownSimulator = shutdownSimulator;
exports.shutdownOtherSimulators = shutdownOtherSimulators;

// stop XCTest processes if running to avoid unexpected side effects

// Terminate the app under test if it is still running on Simulator
// Termination is not needed if Simulator is not running

// It is necessary to stop the corresponding xcodebuild process before killing
// the simulator, otherwise it will be automatically restarted
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9zaW11bGF0b3ItbWFuYWdlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBQWlCLE1BQU07Ozs7a0NBQ00sc0JBQXNCOzswQkFDVyxhQUFhOztxQkFDdEMsU0FBUzs7c0JBQ2hDLFFBQVE7Ozs7d0JBQ0EsVUFBVTs7c0JBQ2hCLFVBQVU7Ozs7Ozs7Ozs7OztBQVUxQixTQUFlLFNBQVMsQ0FBRSxJQUFJO01BQ3RCLG9CQUFvQixFQUNwQixJQUFJOzs7O0FBREosNEJBQW9CLG1CQUFpQixJQUFJLENBQUMsVUFBVTs7eUNBQ3ZDLDhCQUFhLG9CQUFvQixFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQzs7O0FBQXRGLFlBQUk7O3lDQUNHLHNDQUFhLElBQUksQ0FBQzs7Ozs7Ozs7OztDQUNoQzs7Ozs7Ozs7OztBQVVELFNBQWUsY0FBYyxDQUFFLElBQUk7TUFDM0IsT0FBTyxFQUNQLG9CQUFvQixFQUV0QixnQkFBZ0Isa0ZBRVQsTUFBTTs7Ozs7O3lDQUxLLDRCQUFXLElBQUksQ0FBQyxlQUFlLENBQUM7OztBQUFoRCxlQUFPO0FBQ1AsNEJBQW9CLG1CQUFpQixJQUFJLENBQUMsVUFBVTtBQUV0RCx3QkFBZ0I7Ozs7O2lDQUVDLG9CQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUM7Ozs7Ozs7O0FBQTNCLGNBQU07O2NBQ1gsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFBOzs7Ozs7eUNBQ3BCLHNDQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7QUFHeEMsWUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLG9CQUFvQixFQUFFO0FBQ3hDLDBCQUFnQixHQUFHLE1BQU0sQ0FBQztTQUMzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2FBR0MsZ0JBQWdCOzs7OztBQUNsQiw0QkFBSSxJQUFJLDhCQUEyQixJQUFJLENBQUMsVUFBVSxvQkFBYSxn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LElBQUk7O3lDQUdSLGlDQUFxQixJQUFJLEVBQUUsSUFBSSxDQUFDOzs7O3lDQUNoQywwQkFBUyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FFdkI7O1FBRVEsU0FBUyxHQUFULFNBQVM7UUFBRSxjQUFjLEdBQWQsY0FBYztRQUFFLGlCQUFpQixHQUFqQixpQkFBaUI7UUFBRSxrQkFBa0IsR0FBbEIsa0JBQWtCO1FBQ2hFLGlCQUFpQixHQUFqQixpQkFBaUI7UUFBRSx1QkFBdUIsR0FBdkIsdUJBQXVCIiwiZmlsZSI6ImxpYi9zaW11bGF0b3ItbWFuYWdlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0U2ltdWxhdG9yIH0gZnJvbSAnYXBwaXVtLWlvcy1zaW11bGF0b3InO1xuaW1wb3J0IHsgY3JlYXRlRGV2aWNlLCBnZXREZXZpY2VzLCB0ZXJtaW5hdGUsIHNodXRkb3duIH0gZnJvbSAnbm9kZS1zaW1jdGwnO1xuaW1wb3J0IHsgcmVzZXRYQ1Rlc3RQcm9jZXNzZXMgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyByZXRyeSB9IGZyb20gJ2FzeW5jYm94JztcbmltcG9ydCBsb2cgZnJvbSAnLi9sb2dnZXInO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzaW11bGF0b3Igd2l0aCBgYXBwaXVtVGVzdC1gIHByZWZpeCBhbmQgcmV0dXJuIHRoZSBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNhcHMgLSBDYXBhYmlsaXR5IHNldCBieSBhIHVzZXIuIFRoZSBvcHRpb25zIGF2YWlsYWJsZSBhcmU6XG4gKiAgIC0gYGRldmljZU5hbWVgIC0gYSBuYW1lIGZvciB0aGUgZGV2aWNlXG4gKiAgIC0gYHBsYXRmb3JtVmVyc2lvbmAgLSB0aGUgdmVyc2lvbiBvZiBpT1MgdG8gdXNlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBTaW11bGF0b3Igb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgdWRpZCBwYXNzZWQgaW4uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNpbSAoY2Fwcykge1xuICBjb25zdCBhcHBpdW1UZXN0RGV2aWNlTmFtZSA9IGBhcHBpdW1UZXN0LSR7Y2Fwcy5kZXZpY2VOYW1lfWA7XG4gIGNvbnN0IHVkaWQgPSBhd2FpdCBjcmVhdGVEZXZpY2UoYXBwaXVtVGVzdERldmljZU5hbWUsIGNhcHMuZGV2aWNlTmFtZSwgY2Fwcy5wbGF0Zm9ybVZlcnNpb24pO1xuICByZXR1cm4gYXdhaXQgZ2V0U2ltdWxhdG9yKHVkaWQpO1xufVxuXG4vKipcbiAqIEdldCBhIHNpbXVsYXRvciB3aGljaCBpcyBhbHJlYWR5IHJ1bm5pbmcuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgLSBDYXBhYmlsaXR5IHNldCBieSBhIHVzZXIuIFRoZSBvcHRpb25zIGF2YWlsYWJsZSBhcmU6XG4gKiAgIC0gYGRldmljZU5hbWVgIC0gYSBuYW1lIGZvciB0aGUgZGV2aWNlXG4gKiAgIC0gYHBsYXRmb3JtVmVyc2lvbmAgLSB0aGUgdmVyc2lvbiBvZiBpT1MgdG8gdXNlXG4gKiBAcmV0dXJucyB7P29iamVjdH0gU2ltdWxhdG9yIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIHVkaWQgcGFzc2VkIGluLiBPciBudWxsIGlmIG5vIGRldmljZSBpcyBydW5uaW5nLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRFeGlzdGluZ1NpbSAob3B0cykge1xuICBjb25zdCBkZXZpY2VzID0gYXdhaXQgZ2V0RGV2aWNlcyhvcHRzLnBsYXRmb3JtVmVyc2lvbik7XG4gIGNvbnN0IGFwcGl1bVRlc3REZXZpY2VOYW1lID0gYGFwcGl1bVRlc3QtJHtvcHRzLmRldmljZU5hbWV9YDtcblxuICBsZXQgYXBwaXVtVGVzdERldmljZTtcblxuICBmb3IgKGNvbnN0IGRldmljZSBvZiBfLnZhbHVlcyhkZXZpY2VzKSkge1xuICAgIGlmIChkZXZpY2UubmFtZSA9PT0gb3B0cy5kZXZpY2VOYW1lKSB7XG4gICAgICByZXR1cm4gYXdhaXQgZ2V0U2ltdWxhdG9yKGRldmljZS51ZGlkKTtcbiAgICB9XG5cbiAgICBpZiAoZGV2aWNlLm5hbWUgPT09IGFwcGl1bVRlc3REZXZpY2VOYW1lKSB7XG4gICAgICBhcHBpdW1UZXN0RGV2aWNlID0gZGV2aWNlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChhcHBpdW1UZXN0RGV2aWNlKSB7XG4gICAgbG9nLndhcm4oYFVuYWJsZSB0byBmaW5kIGRldmljZSAnJHtvcHRzLmRldmljZU5hbWV9Jy4gRm91bmQgJyR7YXBwaXVtVGVzdERldmljZS5uYW1lfScgKHVkaWQ6ICcke2FwcGl1bVRlc3REZXZpY2UudWRpZH0nKSBpbnN0ZWFkYCk7XG4gICAgcmV0dXJuIGF3YWl0IGdldFNpbXVsYXRvcihhcHBpdW1UZXN0RGV2aWNlLnVkaWQpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzaHV0ZG93blNpbXVsYXRvciAoZGV2aWNlKSB7XG4gIC8vIHN0b3AgWENUZXN0IHByb2Nlc3NlcyBpZiBydW5uaW5nIHRvIGF2b2lkIHVuZXhwZWN0ZWQgc2lkZSBlZmZlY3RzXG4gIGF3YWl0IHJlc2V0WENUZXN0UHJvY2Vzc2VzKGRldmljZS51ZGlkLCB0cnVlKTtcbiAgYXdhaXQgZGV2aWNlLnNodXRkb3duKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1blNpbXVsYXRvclJlc2V0IChkZXZpY2UsIG9wdHMpIHtcbiAgaWYgKG9wdHMubm9SZXNldCAmJiAhb3B0cy5mdWxsUmVzZXQpIHtcbiAgICAvLyBub1Jlc2V0ID09PSB0cnVlICYmIGZ1bGxSZXNldCA9PT0gZmFsc2VcbiAgICBsb2cuZGVidWcoJ1Jlc2V0OiBub1Jlc2V0IGlzIG9uLiBMZWF2aW5nIHNpbXVsYXRvciBhcyBpcycpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghZGV2aWNlKSB7XG4gICAgbG9nLmRlYnVnKCdSZXNldDogbm8gZGV2aWNlIGF2YWlsYWJsZS4gU2tpcHBpbmcnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAob3B0cy5mdWxsUmVzZXQpIHtcbiAgICBsb2cuZGVidWcoJ1Jlc2V0OiBmdWxsUmVzZXQgaXMgb24uIENsZWFuaW5nIHNpbXVsYXRvcicpO1xuICAgIGF3YWl0IHNodXRkb3duU2ltdWxhdG9yKGRldmljZSk7XG4gICAgbGV0IGlzS2V5Y2hhaW5zQmFja3VwU3VjY2Vzc2Z1bCA9IGZhbHNlO1xuICAgIGlmIChvcHRzLmtleWNoYWluc0V4Y2x1ZGVQYXR0ZXJucyB8fCBvcHRzLmtlZXBLZXlDaGFpbnMpIHtcbiAgICAgIGlzS2V5Y2hhaW5zQmFja3VwU3VjY2Vzc2Z1bCA9IGF3YWl0IGRldmljZS5iYWNrdXBLZXljaGFpbnMoKTtcbiAgICB9XG4gICAgYXdhaXQgZGV2aWNlLmNsZWFuKCk7XG4gICAgaWYgKGlzS2V5Y2hhaW5zQmFja3VwU3VjY2Vzc2Z1bCkge1xuICAgICAgYXdhaXQgZGV2aWNlLnJlc3RvcmVLZXljaGFpbnMob3B0cy5rZXljaGFpbnNFeGNsdWRlUGF0dGVybnMgfHwgW10pO1xuICAgICAgbG9nLmluZm8oYFN1Y2Nlc3NmdWxseSByZXN0b3JlZCBrZXljaGFpbnMgYWZ0ZXIgZnVsbCByZXNldGApO1xuICAgIH0gZWxzZSBpZiAob3B0cy5rZXljaGFpbnNFeGNsdWRlUGF0dGVybnMgfHwgb3B0cy5rZWVwS2V5Q2hhaW5zKSB7XG4gICAgICBsb2cud2FybignQ2Fubm90IHJlc3RvcmUga2V5Y2hhaW5zIGFmdGVyIGZ1bGwgcmVzZXQsIGJlY2F1c2UgJyArXG4gICAgICAgICAgICAgICAndGhlIGJhY2t1cCBvcGVyYXRpb24gZGlkIG5vdCBzdWNjZWVkJyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKG9wdHMuYnVuZGxlSWQpIHtcbiAgICAvLyBUZXJtaW5hdGUgdGhlIGFwcCB1bmRlciB0ZXN0IGlmIGl0IGlzIHN0aWxsIHJ1bm5pbmcgb24gU2ltdWxhdG9yXG4gICAgLy8gVGVybWluYXRpb24gaXMgbm90IG5lZWRlZCBpZiBTaW11bGF0b3IgaXMgbm90IHJ1bm5pbmdcbiAgICBpZiAoYXdhaXQgZGV2aWNlLmlzUnVubmluZygpKSB7XG4gICAgICBpZiAoZGV2aWNlLnhjb2RlVmVyc2lvbi5tYWpvciA+PSA4KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgdGVybWluYXRlKGRldmljZS51ZGlkLCBvcHRzLmJ1bmRsZUlkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbG9nLndhcm4oYFJlc2V0OiBmYWlsZWQgdG8gdGVybWluYXRlIFNpbXVsYXRvciBhcHBsaWNhdGlvbiB3aXRoIGlkIFwiJHtvcHRzLmJ1bmRsZUlkfVwiYCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IHNodXRkb3duU2ltdWxhdG9yKGRldmljZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRzLmFwcCkge1xuICAgICAgbG9nLmluZm8oJ05vdCBzY3J1YmJpbmcgdGhpcmQgcGFydHkgYXBwIGluIGFudGljaXBhdGlvbiBvZiB1bmluc3RhbGwnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaXNTYWZhcmkgPSAob3B0cy5icm93c2VyTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PT0gJ3NhZmFyaSc7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpc1NhZmFyaSkge1xuICAgICAgICBhd2FpdCBkZXZpY2UuY2xlYW5TYWZhcmkoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IGRldmljZS5zY3J1YkN1c3RvbUFwcChwYXRoLmJhc2VuYW1lKG9wdHMuYXBwKSwgb3B0cy5idW5kbGVJZCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2cud2FybihlcnIubWVzc2FnZSk7XG4gICAgICBsb2cud2FybihgUmVzZXQ6IGNvdWxkIG5vdCBzY3J1YiAke2lzU2FmYXJpID8gJ1NhZmFyaSBicm93c2VyJyA6ICdhcHBsaWNhdGlvbiB3aXRoIGlkIFwiJyArIG9wdHMuYnVuZGxlSWQgKyAnXCInfS4gTGVhdmluZyBhcyBpcy5gKTtcbiAgICB9XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5zdGFsbFRvU2ltdWxhdG9yIChkZXZpY2UsIGFwcCwgYnVuZGxlSWQsIG5vUmVzZXQgPSB0cnVlKSB7XG4gIGlmICghYXBwKSB7XG4gICAgbG9nLmRlYnVnKCdObyBhcHAgcGF0aCBpcyBnaXZlbi4gTm90aGluZyB0byBpbnN0YWxsLicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChidW5kbGVJZCkge1xuICAgIGlmIChhd2FpdCBkZXZpY2UuaXNBcHBJbnN0YWxsZWQoYnVuZGxlSWQpKSB7XG4gICAgICBpZiAobm9SZXNldCkge1xuICAgICAgICBsb2cuZGVidWcoYEFwcCAnJHtidW5kbGVJZH0nIGlzIGFscmVhZHkgaW5zdGFsbGVkLiBObyBuZWVkIHRvIHJlaW5zdGFsbC5gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nLmRlYnVnKGBSZXNldCByZXF1ZXN0ZWQuIFJlbW92aW5nIGFwcCB3aXRoIGlkICcke2J1bmRsZUlkfScgZnJvbSB0aGUgZGV2aWNlYCk7XG4gICAgICBhd2FpdCBkZXZpY2UucmVtb3ZlQXBwKGJ1bmRsZUlkKTtcbiAgICB9XG4gIH1cbiAgbG9nLmRlYnVnKGBJbnN0YWxsaW5nICcke2FwcH0nIG9uIFNpbXVsYXRvciB3aXRoIFVVSUQgJyR7ZGV2aWNlLnVkaWR9Jy4uLmApO1xuICAvLyBvbiBYY29kZSAxMCBzb21ldGltZXMgdGhpcyBpcyB0b28gZmFzdCBhbmQgaXQgZmFpbHNcbiAgYXdhaXQgcmV0cnkoMiwgZGV2aWNlLmluc3RhbGxBcHAuYmluZChkZXZpY2UpLCBhcHApO1xuICBsb2cuZGVidWcoJ1RoZSBhcHAgaGFzIGJlZW4gaW5zdGFsbGVkIHN1Y2Nlc3NmdWxseS4nKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2h1dGRvd25PdGhlclNpbXVsYXRvcnMgKGN1cnJlbnREZXZpY2UpIHtcbiAgY29uc3QgYWxsRGV2aWNlcyA9IF8uZmxhdE1hcChfLnZhbHVlcyhhd2FpdCBnZXREZXZpY2VzKCkpKTtcbiAgY29uc3Qgb3RoZXJCb290ZWREZXZpY2VzID0gYWxsRGV2aWNlcy5maWx0ZXIoKGRldmljZSkgPT4gZGV2aWNlLnVkaWQgIT09IGN1cnJlbnREZXZpY2UudWRpZCAmJiBkZXZpY2Uuc3RhdGUgPT09ICdCb290ZWQnKTtcbiAgaWYgKF8uaXNFbXB0eShvdGhlckJvb3RlZERldmljZXMpKSB7XG4gICAgbG9nLmluZm8oJ05vIG90aGVyIHJ1bm5pbmcgc2ltdWxhdG9ycyBoYXZlIGJlZW4gZGV0ZWN0ZWQnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbG9nLmluZm8oYERldGVjdGVkICR7b3RoZXJCb290ZWREZXZpY2VzLmxlbmd0aH0gb3RoZXIgcnVubmluZyBTaW11bGF0b3Ike290aGVyQm9vdGVkRGV2aWNlcy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJ30uYCArXG4gICAgICAgICAgIGBTaHV0dGluZyAke290aGVyQm9vdGVkRGV2aWNlcy5sZW5ndGggPT09IDEgPyAnaXQnIDogJ3RoZW0nfSBkb3duLi4uYCk7XG4gIGZvciAoY29uc3Qge3VkaWR9IG9mIG90aGVyQm9vdGVkRGV2aWNlcykge1xuICAgIC8vIEl0IGlzIG5lY2Vzc2FyeSB0byBzdG9wIHRoZSBjb3JyZXNwb25kaW5nIHhjb2RlYnVpbGQgcHJvY2VzcyBiZWZvcmUga2lsbGluZ1xuICAgIC8vIHRoZSBzaW11bGF0b3IsIG90aGVyd2lzZSBpdCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgcmVzdGFydGVkXG4gICAgYXdhaXQgcmVzZXRYQ1Rlc3RQcm9jZXNzZXModWRpZCwgdHJ1ZSk7XG4gICAgYXdhaXQgc2h1dGRvd24odWRpZCk7XG4gIH1cbn1cblxuZXhwb3J0IHsgY3JlYXRlU2ltLCBnZXRFeGlzdGluZ1NpbSwgcnVuU2ltdWxhdG9yUmVzZXQsIGluc3RhbGxUb1NpbXVsYXRvcixcbiAgICAgICAgIHNodXRkb3duU2ltdWxhdG9yLCBzaHV0ZG93bk90aGVyU2ltdWxhdG9ycyB9O1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLiJ9
