'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _appiumBaseDriver = require('appium-base-driver');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var GET = 'GET';
var POST = 'POST';
var DELETE = 'DELETE';
var SUPPORTED_METHODS = [GET, POST, DELETE];

var helpers = {},
    extensions = {};

var WDA_ROUTES = {
  '/wda/touch/perform': {
    POST: 'performTouch'
  },
  '/wda/touch/multi/perform': {
    POST: 'performMultiAction'
  },
  '/wda/screen': {
    GET: 'getScreenInfo'
  },
  '/wda/alert/buttons': {
    GET: 'getAlertButtons'
  },
  '/wda/apps/launch': {
    POST: 'mobileLaunchApp'
  },
  '/wda/apps/terminate': {
    POST: 'mobileTerminateApp'
  },
  '/wda/apps/activate': {
    POST: 'mobileActivateApp'
  },
  '/wda/apps/state': {
    POST: 'mobileQueryAppState'
  },
  '/wda/keys': {
    POST: 'keys'
  },
  '/wda/touch_id': {
    POST: 'touchId'
  },
  '/wda/keyboard/dismiss': {
    POST: 'hideKeyboard'
  },
  '/wda/lock': {
    POST: 'lock'
  },
  '/wda/unlock': {
    POST: 'unlock'
  },
  '/wda/locked': {
    GET: 'isLocked'
  },
  '/wda/tap/nil': {
    POST: 'clickCoords'
  },
  '/window/size': {
    GET: 'getWindowSize'
  }
};

function wdaRouteToCommandName(endpoint, method) {
  return WDA_ROUTES[endpoint] ? WDA_ROUTES[endpoint][method] : null;
}

helpers.proxyCommand = function callee$0$0(endpoint, method, body) {
  var isSessionCommand = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
  var proxy, cmdName, timeout, isCommandExpired, res, errMsg;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!this.shutdownUnexpectedly) {
          context$1$0.next = 2;
          break;
        }

        return context$1$0.abrupt('return');

      case 2:

        if (!endpoint) {
          _logger2['default'].errorAndThrow('Proxying requires an endpoint');
        } else if (SUPPORTED_METHODS.indexOf(method) === -1) {
          _logger2['default'].errorAndThrow('Proxying only works for the following requests: ' + SUPPORTED_METHODS.join(', '));
        }

        if (this.wda) {
          context$1$0.next = 5;
          break;
        }

        throw new Error('Cannot call proxyCommand without WDA driver active');

      case 5:
        proxy = isSessionCommand ? this.wda.jwproxy : this.wda.noSessionProxy;

        if (proxy) {
          context$1$0.next = 8;
          break;
        }

        throw new Error('Cannot call proxyCommand without WDA proxy active');

      case 8:
        cmdName = wdaRouteToCommandName(endpoint, method) || (0, _appiumBaseDriver.routeToCommandName)(endpoint, method);
        timeout = this._getCommandTimeout(cmdName);

        if (!cmdName) {
          // this should never happen except when adding new routes
          cmdName = 'Unknown'; // just for logging purposes below
          _logger2['default'].warn('Proxying to WDA with an unknown route: ' + method + ' ' + endpoint);
        }

        if (timeout) {
          context$1$0.next = 15;
          break;
        }

        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(proxy.command(endpoint, method, body));

      case 14:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 15:

        _logger2['default'].debug('Setting custom timeout to ' + timeout + ' ms for \'' + cmdName + '\' command');
        isCommandExpired = false;
        context$1$0.next = 19;
        return _regeneratorRuntime.awrap(_bluebird2['default'].resolve(proxy.command(endpoint, method, body)).timeout(timeout)['catch'](_bluebird2['default'].Promise.TimeoutError, function () {
          isCommandExpired = true;
        }));

      case 19:
        res = context$1$0.sent;

        if (!isCommandExpired) {
          context$1$0.next = 26;
          break;
        }

        proxy.cancelActiveRequests();
        errMsg = 'Appium did not get any response from \'' + cmdName + '\' command in ' + timeout + ' ms';
        context$1$0.next = 25;
        return _regeneratorRuntime.awrap(this.startUnexpectedShutdown(new _appiumBaseDriver.errors.TimeoutError(errMsg)));

      case 25:
        _logger2['default'].errorAndThrow(errMsg);

      case 26:
        return context$1$0.abrupt('return', res);

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

_Object$assign(extensions, helpers);
exports.helpers = helpers;
exports['default'] = extensions;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9wcm94eS1oZWxwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUEyQyxvQkFBb0I7O3NCQUMvQyxXQUFXOzs7O3dCQUNiLFVBQVU7Ozs7QUFHeEIsSUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNwQixJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDeEIsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRTlDLElBQUksT0FBTyxHQUFHLEVBQUU7SUFBRSxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVsQyxJQUFNLFVBQVUsR0FBRztBQUNqQixzQkFBb0IsRUFBRTtBQUNwQixRQUFJLEVBQUUsY0FBYztHQUNyQjtBQUNELDRCQUEwQixFQUFFO0FBQzFCLFFBQUksRUFBRSxvQkFBb0I7R0FDM0I7QUFDRCxlQUFhLEVBQUU7QUFDYixPQUFHLEVBQUUsZUFBZTtHQUNyQjtBQUNELHNCQUFvQixFQUFFO0FBQ3BCLE9BQUcsRUFBRSxpQkFBaUI7R0FDdkI7QUFDRCxvQkFBa0IsRUFBRTtBQUNsQixRQUFJLEVBQUUsaUJBQWlCO0dBQ3hCO0FBQ0QsdUJBQXFCLEVBQUU7QUFDckIsUUFBSSxFQUFFLG9CQUFvQjtHQUMzQjtBQUNELHNCQUFvQixFQUFFO0FBQ3BCLFFBQUksRUFBRSxtQkFBbUI7R0FDMUI7QUFDRCxtQkFBaUIsRUFBRTtBQUNqQixRQUFJLEVBQUUscUJBQXFCO0dBQzVCO0FBQ0QsYUFBVyxFQUFFO0FBQ1gsUUFBSSxFQUFFLE1BQU07R0FDYjtBQUNELGlCQUFlLEVBQUU7QUFDZixRQUFJLEVBQUUsU0FBUztHQUNoQjtBQUNELHlCQUF1QixFQUFFO0FBQ3ZCLFFBQUksRUFBRSxjQUFjO0dBQ3JCO0FBQ0QsYUFBVyxFQUFFO0FBQ1gsUUFBSSxFQUFFLE1BQU07R0FDYjtBQUNELGVB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dGVudCI6WyJpbXBvcnQgeyBlcnJvcnMsIHJvdXRlVG9Db21tYW5kTmFtZSB9IGZyb20gJ2FwcGl1bS1iYXNlLWRyaXZlcic7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgQiBmcm9tICdibHVlYmlyZCc7XG5cblxuY29uc3QgR0VUID0gJ0dFVCc7XG5jb25zdCBQT1NUID0gJ1BPU1QnO1xuY29uc3QgREVMRVRFID0gJ0RFTEVURSc7XG5jb25zdCBTVVBQT1JURURfTUVUSE9EUyA9IFtHRVQsIFBPU1QsIERFTEVURV07XG5cbmxldCBoZWxwZXJzID0ge30sIGV4dGVuc2lvbnMgPSB7fTtcblxuY29uc3QgV0RBX1JPVVRFUyA9IHtcbiAgJy93ZGEvdG91Y2gvcGVyZm9ybSc6IHtcbiAgICBQT1NUOiAncGVyZm9ybVRvdWNoJyxcbiAgfSxcbiAgJy93ZGEvdG91Y2gvbXVsdGkvcGVyZm9ybSc6IHtcbiAgICBQT1NUOiAncGVyZm9ybU11bHRpQWN0aW9uJyxcbiAgfSxcbiAgJy93ZGEvc2NyZWVuJzoge1xuICAgIEdFVDogJ2dldFNjcmVlbkluZm8nLFxuICB9LFxuICAnL3dkYS9hbGVydC9idXR0b25zJzoge1xuICAgIEdFVDogJ2dldEFsZXJ0QnV0dG9ucycsXG4gIH0sXG4gICcvd2RhL2FwcHMvbGF1bmNoJzoge1xuICAgIFBPU1Q6ICdtb2JpbGVMYXVuY2hBcHAnLFxuICB9LFxuICAnL3dkYS9hcHBzL3Rlcm1pbmF0ZSc6IHtcbiAgICBQT1NUOiAnbW9iaWxlVGVybWluYXRlQXBwJyxcbiAgfSxcbiAgJy93ZGEvYXBwcy9hY3RpdmF0ZSc6IHtcbiAgICBQT1NUOiAnbW9iaWxlQWN0aXZhdGVBcHAnLFxuICB9LFxuICAnL3dkYS9hcHBzL3N0YXRlJzoge1xuICAgIFBPU1Q6ICdtb2JpbGVRdWVyeUFwcFN0YXRlJyxcbiAgfSxcbiAgJy93ZGEva2V5cyc6IHtcbiAgICBQT1NUOiAna2V5cycsXG4gIH0sXG4gICcvd2RhL3RvdWNoX2lkJzoge1xuICAgIFBPU1Q6ICd0b3VjaElkJyxcbiAgfSxcbiAgJy93ZGEva2V5Ym9hcmQvZGlzbWlzcyc6IHtcbiAgICBQT1NUOiAnaGlkZUtleWJvYXJkJyxcbiAgfSxcbiAgJy93ZGEvbG9jayc6IHtcbiAgICBQT1NUOiAnbG9jaycsXG4gIH0sXG4gICcvd2RhL3VubG9jayc6IHtcbiAgICBQT1NUOiAndW5sb2NrJyxcbiAgfSxcbiAgJy93ZGEvbG9ja2VkJzoge1xuICAgIEdFVDogJ2lzTG9ja2VkJyxcbiAgfSxcbiAgJy93ZGEvdGFwL25pbCc6IHtcbiAgICBQT1NUOiAnY2xpY2tDb29yZHMnLFxuICB9LFxuICAnL3dpbmRvdy9zaXplJzoge1xuICAgIEdFVDogJ2dldFdpbmRvd1NpemUnLFxuICB9LFxufTtcblxuZnVuY3Rpb24gd2RhUm91dGVUb0NvbW1hbmROYW1lIChlbmRwb2ludCwgbWV0aG9kKSB7XG4gIHJldHVybiBXREFfUk9VVEVTW2VuZHBvaW50XSA/IFdEQV9ST1VURVNbZW5kcG9pbnRdW21ldGhvZF0gOiBudWxsO1xufVxuXG5oZWxwZXJzLnByb3h5Q29tbWFuZCA9IGFzeW5jIGZ1bmN0aW9uIChlbmRwb2ludCwgbWV0aG9kLCBib2R5LCBpc1Nlc3Npb25Db21tYW5kID0gdHJ1ZSkge1xuICBpZiAodGhpcy5zaHV0ZG93blVuZXhwZWN0ZWRseSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghZW5kcG9pbnQpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdygnUHJveHlpbmcgcmVxdWlyZXMgYW4gZW5kcG9pbnQnKTtcbiAgfSBlbHNlIGlmIChTVVBQT1JURURfTUVUSE9EUy5pbmRleE9mKG1ldGhvZCkgPT09IC0xKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYFByb3h5aW5nIG9ubHkgd29ya3MgZm9yIHRoZSBmb2xsb3dpbmcgcmVxdWVzdHM6ICR7U1VQUE9SVEVEX01FVEhPRFMuam9pbignLCAnKX1gKTtcbiAgfVxuXG4gIGlmICghdGhpcy53ZGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjYWxsIHByb3h5Q29tbWFuZCB3aXRob3V0IFdEQSBkcml2ZXIgYWN0aXZlJyk7XG4gIH1cbiAgY29uc3QgcHJveHkgPSBpc1Nlc3Npb25Db21tYW5kID8gdGhpcy53ZGEuandwcm94eSA6IHRoaXMud2RhLm5vU2Vzc2lvblByb3h5O1xuICBpZiAoIXByb3h5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBwcm94eUNvbW1hbmQgd2l0aG91dCBXREEgcHJveHkgYWN0aXZlJyk7XG4gIH1cblxuICBsZXQgY21kTmFtZSA9IHdkYVJvdXRlVG9Db21tYW5kTmFtZShlbmRwb2ludCwgbWV0aG9kKSB8fCByb3V0ZVRvQ29tbWFuZE5hbWUoZW5kcG9pbnQsIG1ldGhvZCk7XG4gIGNvbnN0IHRpbWVvdXQgPSB0aGlzLl9nZXRDb21tYW5kVGltZW91dChjbWROYW1lKTtcbiAgaWYgKCFjbWROYW1lKSB7XG4gICAgLy8gdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIGV4Y2VwdCB3aGVuIGFkZGluZyBuZXcgcm91dGVzXG4gICAgY21kTmFtZSA9ICdVbmtub3duJzsgLy8ganVzdCBmb3IgbG9nZ2luZyBwdXJwb3NlcyBiZWxvd1xuICAgIGxvZy53YXJuKGBQcm94eWluZyB0byBXREEgd2l0aCBhbiB1bmtub3duIHJvdXRlOiAke21ldGhvZH0gJHtlbmRwb2ludH1gKTtcbiAgfVxuXG4gIGlmICghdGltZW91dCkge1xuICAgIHJldHVybiBhd2FpdCBwcm94eS5jb21tYW5kKGVuZHBvaW50LCBtZXRob2QsIGJvZHkpO1xuICB9XG5cbiAgbG9nLmRlYnVnKGBTZXR0aW5nIGN1c3RvbSB0aW1lb3V0IHRvICR7dGltZW91dH0gbXMgZm9yICcke2NtZE5hbWV9JyBjb21tYW5kYCk7XG4gIGxldCBpc0NvbW1hbmRFeHBpcmVkID0gZmFsc2U7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IEIucmVzb2x2ZShwcm94eS5jb21tYW5kKGVuZHBvaW50LCBtZXRob2QsIGJvZHkpKVxuICAgICAgICAgICAgICAgIC50aW1lb3V0KHRpbWVvdXQpXG4gICAgICAgICAgICAgICAgLmNhdGNoKEIuUHJvbWlzZS5UaW1lb3V0RXJyb3IsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlzQ29tbWFuZEV4cGlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICBpZiAoaXNDb21tYW5kRXhwaXJlZCkge1xuICAgIHByb3h5LmNhbmNlbEFjdGl2ZVJlcXVlc3RzKCk7XG4gICAgY29uc3QgZXJyTXNnID0gYEFwcGl1bSBkaWQgbm90IGdldCBhbnkgcmVzcG9uc2UgZnJvbSAnJHtjbWROYW1lfScgY29tbWFuZCBpbiAke3RpbWVvdXR9IG1zYDtcbiAgICBhd2FpdCB0aGlzLnN0YXJ0VW5leHBlY3RlZFNodXRkb3duKG5ldyBlcnJvcnMuVGltZW91dEVycm9yKGVyck1zZykpO1xuICAgIGxvZy5lcnJvckFuZFRocm93KGVyck1zZyk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG5cbk9iamVjdC5hc3NpZ24oZXh0ZW5zaW9ucywgaGVscGVycyk7XG5leHBvcnQgeyBoZWxwZXJzIH07XG5leHBvcnQgZGVmYXVsdCBleHRlbnNpb25zO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
