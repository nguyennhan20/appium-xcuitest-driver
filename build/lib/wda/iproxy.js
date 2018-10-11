'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _utils = require('./utils');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _appiumSupport = require('appium-support');

var _teen_process = require('teen_process');

var IPROXY_TIMEOUT = 5000;

var iproxyLog = _appiumSupport.logger.getLogger('iProxy');

var iProxy = (function () {
  function iProxy(udid, localport, deviceport) {
    _classCallCheck(this, iProxy);

    _logger2['default'].debug('Starting iproxy to forward traffic from local port ' + localport + ' to device port ' + deviceport + ' over USB ' + ('for the device ' + udid));
    this.expectIProxyErrors = true;
    this.iproxy = new _teen_process.SubProcess('iproxy', [localport, deviceport, udid], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }

  _createClass(iProxy, [{
    key: 'start',
    value: function start() {
      return _regeneratorRuntime.async(function start$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.expectIProxyErrors = true;

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(new _bluebird2['default'](function (resolve, reject) {
              _this.iproxy.on('exit', function (code) {
                _logger2['default'].debug('iproxy exited with code \'' + code + '\'');
                if (code) {
                  return reject(new Error('iproxy exited with code \'' + code + '\''));
                }
              });
              _this.iproxy.on('output', function (stdout, stderr) {
                // do nothing if we expect errors
                if (_this.expectIProxyErrors) {
                  return;
                }

                var out = stdout || stderr;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = _getIterator(out.split('\n')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var line = _step.value;

                    if (!line.length) {
                      continue;
                    }

                    if (line.indexOf('Resource temporarily unavailable') !== -1) {
                      // this generally happens when WDA does not respond,
                      // so print a more useful message
                      _logger2['default'].debug('Connection to WDA timed out');
                    } else {
                      iproxyLog.debug(line);
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
              });

              return (function callee$3$0() {
                return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                  while (1) switch (context$4$0.prev = context$4$0.next) {
                    case 0:
                      context$4$0.prev = 0;
                      context$4$0.next = 3;
                      return _regeneratorRuntime.awrap(this.iproxy.start(IPROXY_TIMEOUT));

                    case 3:
                      this.iproxy.proc.unref();
                      resolve();
                      context$4$0.next = 11;
                      break;

                    case 7:
                      context$4$0.prev = 7;
                      context$4$0.t0 = context$4$0['catch'](0);

                      _logger2['default'].error('Error starting iproxy: \'' + context$4$0.t0.message + '\'');
                      reject(new Error('Unable to start iproxy. Is it installed?'));

                    case 11:
                    case 'end':
                      return context$4$0.stop();
                  }
                }, null, _this, [[0, 7]]);
              })();
            }));

          case 3:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'quit',
    value: function quit() {
      return _regeneratorRuntime.async(function quit$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap((0, _utils.killProcess)('iproxy', this.iproxy));

          case 2:
            this.expectIProxyErrors = true;

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return iProxy;
})();

exports.iProxy = iProxy;
exports['default'] = iProxy;
//# sourceMappingURL=data:application/json;charset=utf8;base64,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TixNQUFNO3FCQUNBLE1BQU0iLCJmaWxlIjoibGliL3dkYS9pcHJveHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBraWxsUHJvY2VzcyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEIgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHsgU3ViUHJvY2VzcyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5cblxuY29uc3QgSVBST1hZX1RJTUVPVVQgPSA1MDAwO1xuXG5jb25zdCBpcHJveHlMb2cgPSBsb2dnZXIuZ2V0TG9nZ2VyKCdpUHJveHknKTtcblxuY2xhc3MgaVByb3h5IHtcbiAgY29uc3RydWN0b3IgKHVkaWQsIGxvY2FscG9ydCwgZGV2aWNlcG9ydCkge1xuICAgIGxvZy5kZWJ1ZyhgU3RhcnRpbmcgaXByb3h5IHRvIGZvcndhcmQgdHJhZmZpYyBmcm9tIGxvY2FsIHBvcnQgJHtsb2NhbHBvcnR9IHRvIGRldmljZSBwb3J0ICR7ZGV2aWNlcG9ydH0gb3ZlciBVU0IgYCArXG4gICAgICBgZm9yIHRoZSBkZXZpY2UgJHt1ZGlkfWApO1xuICAgIHRoaXMuZXhwZWN0SVByb3h5RXJyb3JzID0gdHJ1ZTtcbiAgICB0aGlzLmlwcm94eSA9IG5ldyBTdWJQcm9jZXNzKCdpcHJveHknLCBbbG9jYWxwb3J0LCBkZXZpY2Vwb3J0LCB1ZGlkXSwge1xuICAgICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBzdGFydCAoKSB7XG4gICAgdGhpcy5leHBlY3RJUHJveHlFcnJvcnMgPSB0cnVlO1xuXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBCKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuaXByb3h5Lm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgbG9nLmRlYnVnKGBpcHJveHkgZXhpdGVkIHdpdGggY29kZSAnJHtjb2RlfSdgKTtcbiAgICAgICAgaWYgKGNvZGUpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgaXByb3h5IGV4aXRlZCB3aXRoIGNvZGUgJyR7Y29kZX0nYCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuaXByb3h5Lm9uKCdvdXRwdXQnLCAoc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgLy8gZG8gbm90aGluZyBpZiB3ZSBleHBlY3QgZXJyb3JzXG4gICAgICAgIGlmICh0aGlzLmV4cGVjdElQcm94eUVycm9ycykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvdXQgPSBzdGRvdXQgfHwgc3RkZXJyO1xuICAgICAgICBmb3IgKGxldCBsaW5lIG9mIG91dC5zcGxpdCgnXFxuJykpIHtcbiAgICAgICAgICBpZiAoIWxpbmUubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobGluZS5pbmRleE9mKCdSZXNvdXJjZSB0ZW1wb3JhcmlseSB1bmF2YWlsYWJsZScpICE9PSAtMSkge1xuICAgICAgICAgICAgLy8gdGhpcyBnZW5lcmFsbHkgaGFwcGVucyB3aGVuIFdEQSBkb2VzIG5vdCByZXNwb25kLFxuICAgICAgICAgICAgLy8gc28gcHJpbnQgYSBtb3JlIHVzZWZ1bCBtZXNzYWdlXG4gICAgICAgICAgICBsb2cuZGVidWcoJ0Nvbm5lY3Rpb24gdG8gV0RBIHRpbWVkIG91dCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpcHJveHlMb2cuZGVidWcobGluZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIChhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5pcHJveHkuc3RhcnQoSVBST1hZX1RJTUVPVVQpO1xuICAgICAgICAgIHRoaXMuaXByb3h5LnByb2MudW5yZWYoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGxvZy5lcnJvcihgRXJyb3Igc3RhcnRpbmcgaXByb3h5OiAnJHtlcnIubWVzc2FnZX0nYCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVW5hYmxlIHRvIHN0YXJ0IGlwcm94eS4gSXMgaXQgaW5zdGFsbGVkPycpKTtcbiAgICAgICAgfVxuICAgICAgfSkoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHF1aXQgKCkge1xuICAgIGF3YWl0IGtpbGxQcm9jZXNzKCdpcHJveHknLCB0aGlzLmlwcm94eSk7XG4gICAgdGhpcy5leHBlY3RJUHJveHlFcnJvcnMgPSB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCB7IGlQcm94eSB9O1xuZXhwb3J0IGRlZmF1bHQgaVByb3h5O1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
