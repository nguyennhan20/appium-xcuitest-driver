'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _this = this;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumBaseDriver = require('appium-base-driver');

var _appiumIosDriver = require('appium-ios-driver');

var _deviceLogIosCrashLog = require('../device-log/ios-crash-log');

var _deviceLogIosLog = require('../device-log/ios-log');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _deviceLogSafariConsoleLog = require('../device-log/safari-console-log');

var _deviceLogSafariConsoleLog2 = _interopRequireDefault(_deviceLogSafariConsoleLog);

var _deviceLogSafariNetworkLog = require('../device-log/safari-network-log');

var _deviceLogSafariNetworkLog2 = _interopRequireDefault(_deviceLogSafariNetworkLog);

var extensions = {};

var WEBSOCKET_ENDPOINT = function WEBSOCKET_ENDPOINT(sessionId) {
  return _appiumBaseDriver.DEFAULT_WS_PATHNAME_PREFIX + '/session/' + sessionId + '/appium/device/syslog';
};

_Object$assign(extensions, _appiumIosDriver.iosCommands.logging);

extensions.supportedLogTypes.safariConsole = {
  description: 'Safari Console Logs - data written to the JS console in Safari',
  getter: function getter(self) {
    return _regeneratorRuntime.async(function getter$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          context$1$0.next = 2;
          return _regeneratorRuntime.awrap(self.extractLogs('safariConsole', self.logs));

        case 2:
          return context$1$0.abrupt('return', context$1$0.sent);

        case 3:
        case 'end':
          return context$1$0.stop();
      }
    }, null, _this);
  }
};

extensions.supportedLogTypes.safariNetwork = {
  description: 'Safari Network Logs - information about network operations undertaken by Safari',
  getter: function getter(self) {
    return _regeneratorRuntime.async(function getter$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          context$1$0.next = 2;
          return _regeneratorRuntime.awrap(self.extractLogs('safariNetwork', self.logs));

        case 2:
          return context$1$0.abrupt('return', context$1$0.sent);

        case 3:
        case 'end':
          return context$1$0.stop();
      }
    }, null, _this);
  }
};

extensions.startLogCapture = function callee$0$0() {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        this.logs = this.logs || {};

        if (!(!_lodash2['default'].isUndefined(this.logs.syslog) && this.logs.syslog.isCapturing)) {
          context$1$0.next = 4;
          break;
        }

        _logger2['default'].warn('Trying to start iOS log capture but it has already started!');
        return context$1$0.abrupt('return', true);

      case 4:
        if (_lodash2['default'].isUndefined(this.logs.syslog)) {
          this.logs.crashlog = new _deviceLogIosCrashLog.IOSCrashLog({
            sim: this.opts.device,
            udid: this.isRealDevice() ? this.opts.udid : undefined
          });
          this.logs.syslog = new _deviceLogIosLog.IOSLog({
            sim: this.opts.device,
            udid: this.isRealDevice() ? this.opts.udid : undefined,
            showLogs: this.opts.showIOSLog,
            realDeviceLogger: this.opts.realDeviceLogger,
            xcodeVersion: this.xcodeVersion
          });
          this.logs.safariConsole = new _deviceLogSafariConsoleLog2['default'](!!this.opts.showSafariConsoleLog);
          this.logs.safariNetwork = new _deviceLogSafariNetworkLog2['default'](!!this.opts.showSafariNetworkLog);
        }
        context$1$0.prev = 5;
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(this.logs.syslog.startCapture());

      case 8:
        context$1$0.next = 14;
        break;

      case 10:
        context$1$0.prev = 10;
        context$1$0.t0 = context$1$0['catch'](5);

        _logger2['default'].warn('Continuing without capturing device logs: ' + context$1$0.t0.message);
        return context$1$0.abrupt('return', false);

      case 14:
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap(this.logs.crashlog.startCapture());

      case 16:
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap(this.logs.safariConsole.startCapture());

      case 18:
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap(this.logs.safariNetwork.startCapture());

      case 20:
        return context$1$0.abrupt('return', true);

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[5, 10]]);
};

/**
 * Starts iOS system logs broadcast websocket on the same host and port
 * where Appium server is running at `/ws/session/:sessionId:/appium/syslog` endpoint. The method
 * will return immediately if the web socket is already listening.
 *
 * Each connected webcoket listener will receive syslog lines
 * as soon as they are visible to Appium.
 */
extensions.mobileStartLogsBroadcast = function callee$0$0() {
  var pathname, wss;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this2 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        pathname = WEBSOCKET_ENDPOINT(this.sessionId);
        context$1$0.t0 = _lodash2['default'];
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.server.getWebSocketHandlers(pathname));

      case 4:
        context$1$0.t1 = context$1$0.sent;

        if (context$1$0.t0.isEmpty.call(context$1$0.t0, context$1$0.t1)) {
          context$1$0.next = 8;
          break;
        }

        _logger2['default'].debug('The system logs broadcasting web socket server is already listening at ' + pathname);
        return context$1$0.abrupt('return');

      case 8:

        _logger2['default'].info('Assigning system logs broadcasting web socket server to ' + pathname);
        // https://github.com/websockets/ws/blob/master/doc/ws.md
        wss = new _ws2['default'].Server({
          noServer: true
        });

        wss.on('connection', function (ws, req) {
          if (req) {
            var remoteIp = _lodash2['default'].isEmpty(req.headers['x-forwarded-for']) ? req.connection.remoteAddress : req.headers['x-forwarded-for'];
            _logger2['default'].debug('Established a new system logs listener web socket connection from ' + remoteIp);
          } else {
            _logger2['default'].debug('Established a new system logs listener web socket connection');
          }

          if (_lodash2['default'].isEmpty(_this2._syslogWebsocketListener)) {
            _this2._syslogWebsocketListener = function (logRecord) {
              if (ws && ws.readyState === _ws2['default'].OPEN) {
                ws.send(logRecord.message);
              }
            };
          }
          _this2.logs.syslog.on('output', _this2._syslogWebsocketListener);

          ws.on('close', function (code, reason) {
            if (!_lodash2['default'].isEmpty(_this2._syslogWebsocketListener)) {
              _this2.logs.syslog.removeListener('output', _this2._syslogWebsocketListener);
              _this2._syslogWebsocketListener = null;
            }

            var closeMsg = 'System logs listener web socket is closed.';
            if (!_lodash2['default'].isEmpty(code)) {
              closeMsg += ' Code: ' + code + '.';
            }
            if (!_lodash2['default'].isEmpty(reason)) {
              closeMsg += ' Reason: ' + reason + '.';
            }
            _logger2['default'].debug(closeMsg);
          });
        });
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(this.server.addWebSocketHandler(pathname, wss));

      case 13:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Stops the previously started syslog broadcasting wesocket server.
 * This method will return immediately if no server is running.
 */
extensions.mobileStopLogsBroadcast = function callee$0$0() {
  var pathname;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        pathname = WEBSOCKET_ENDPOINT(this.sessionId);
        context$1$0.t0 = _lodash2['default'];
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.server.getWebSocketHandlers(pathname));

      case 4:
        context$1$0.t1 = context$1$0.sent;

        if (!context$1$0.t0.isEmpty.call(context$1$0.t0, context$1$0.t1)) {
          context$1$0.next = 7;
          break;
        }

        return context$1$0.abrupt('return');

      case 7:

        _logger2['default'].debug('Stopping the system logs broadcasting web socket server');
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(this.server.removeWebSocketHandler(pathname));

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

exports['default'] = extensions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDOzs7Ozs0QkFBeEQsT0FBTzs7Ozs7Ozs7O0FBSWIsNEJBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7O3lDQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQzs7Ozs7OztDQUNuRCxDQUFDOztxQkFFYSxVQUFVIiwiZmlsZSI6ImxpYi9jb21tYW5kcy9sb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgREVGQVVMVF9XU19QQVRITkFNRV9QUkVGSVggfSBmcm9tICdhcHBpdW0tYmFzZS1kcml2ZXInO1xuaW1wb3J0IHsgaW9zQ29tbWFuZHMgfSBmcm9tICdhcHBpdW0taW9zLWRyaXZlcic7XG5pbXBvcnQgeyBJT1NDcmFzaExvZyB9IGZyb20gJy4uL2RldmljZS1sb2cvaW9zLWNyYXNoLWxvZyc7XG5pbXBvcnQgeyBJT1NMb2cgfSBmcm9tICcuLi9kZXZpY2UtbG9nL2lvcy1sb2cnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IFdlYlNvY2tldCBmcm9tICd3cyc7XG5pbXBvcnQgU2FmYXJpQ29uc29sZUxvZyBmcm9tICcuLi9kZXZpY2UtbG9nL3NhZmFyaS1jb25zb2xlLWxvZyc7XG5pbXBvcnQgU2FmYXJpTmV0d29ya0xvZyBmcm9tICcuLi9kZXZpY2UtbG9nL3NhZmFyaS1uZXR3b3JrLWxvZyc7XG5cblxubGV0IGV4dGVuc2lvbnMgPSB7fTtcblxuY29uc3QgV0VCU09DS0VUX0VORFBPSU5UID0gKHNlc3Npb25JZCkgPT4gYCR7REVGQVVMVF9XU19QQVRITkFNRV9QUkVGSVh9L3Nlc3Npb24vJHtzZXNzaW9uSWR9L2FwcGl1bS9kZXZpY2Uvc3lzbG9nYDtcblxuT2JqZWN0LmFzc2lnbihleHRlbnNpb25zLCBpb3NDb21tYW5kcy5sb2dnaW5nKTtcblxuZXh0ZW5zaW9ucy5zdXBwb3J0ZWRMb2dUeXBlcy5zYWZhcmlDb25zb2xlID0ge1xuICBkZXNjcmlwdGlvbjogJ1NhZmFyaSBDb25zb2xlIExvZ3MgLSBkYXRhIHdyaXR0ZW4gdG8gdGhlIEpTIGNvbnNvbGUgaW4gU2FmYXJpJyxcbiAgZ2V0dGVyOiBhc3luYyAoc2VsZikgPT4gYXdhaXQgc2VsZi5leHRyYWN0TG9ncygnc2FmYXJpQ29uc29sZScsIHNlbGYubG9ncyksXG59O1xuXG5leHRlbnNpb25zLnN1cHBvcnRlZExvZ1R5cGVzLnNhZmFyaU5ldHdvcmsgPSB7XG4gIGRlc2NyaXB0aW9uOiAnU2FmYXJpIE5ldHdvcmsgTG9ncyAtIGluZm9ybWF0aW9uIGFib3V0IG5ldHdvcmsgb3BlcmF0aW9ucyB1bmRlcnRha2VuIGJ5IFNhZmFyaScsXG4gIGdldHRlcjogYXN5bmMgKHNlbGYpID0+IGF3YWl0IHNlbGYuZXh0cmFjdExvZ3MoJ3NhZmFyaU5ldHdvcmsnLCBzZWxmLmxvZ3MpLFxufTtcblxuZXh0ZW5zaW9ucy5zdGFydExvZ0NhcHR1cmUgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubG9ncyA9IHRoaXMubG9ncyB8fCB7fTtcbiAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMubG9ncy5zeXNsb2cpICYmIHRoaXMubG9ncy5zeXNsb2cuaXNDYXB0dXJpbmcpIHtcbiAgICBsb2cud2FybignVHJ5aW5nIHRvIHN0YXJ0IGlPUyBsb2cgY2FwdHVyZSBidXQgaXQgaGFzIGFscmVhZHkgc3RhcnRlZCEnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoXy5pc1VuZGVmaW5lZCh0aGlzLmxvZ3Muc3lzbG9nKSkge1xuICAgIHRoaXMubG9ncy5jcmFzaGxvZyA9IG5ldyBJT1NDcmFzaExvZyh7XG4gICAgICBzaW06IHRoaXMub3B0cy5kZXZpY2UsXG4gICAgICB1ZGlkOiB0aGlzLmlzUmVhbERldmljZSgpID8gdGhpcy5vcHRzLnVkaWQgOiB1bmRlZmluZWQsXG4gICAgfSk7XG4gICAgdGhpcy5sb2dzLnN5c2xvZyA9IG5ldyBJT1NMb2coe1xuICAgICAgc2ltOiB0aGlzLm9wdHMuZGV2aWNlLFxuICAgICAgdWRpZDogdGhpcy5pc1JlYWxEZXZpY2UoKSA/IHRoaXMub3B0cy51ZGlkIDogdW5kZWZpbmVkLFxuICAgICAgc2hvd0xvZ3M6IHRoaXMub3B0cy5zaG93SU9TTG9nLFxuICAgICAgcmVhbERldmljZUxvZ2dlcjogdGhpcy5vcHRzLnJlYWxEZXZpY2VMb2dnZXIsXG4gICAgICB4Y29kZVZlcnNpb246IHRoaXMueGNvZGVWZXJzaW9uLFxuICAgIH0pO1xuICAgIHRoaXMubG9ncy5zYWZhcmlDb25zb2xlID0gbmV3IFNhZmFyaUNvbnNvbGVMb2coISF0aGlzLm9wdHMuc2hvd1NhZmFyaUNvbnNvbGVMb2cpO1xuICAgIHRoaXMubG9ncy5zYWZhcmlOZXR3b3JrID0gbmV3IFNhZmFyaU5ldHdvcmtMb2coISF0aGlzLm9wdHMuc2hvd1NhZmFyaU5ldHdvcmtMb2cpO1xuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgdGhpcy5sb2dzLnN5c2xvZy5zdGFydENhcHR1cmUoKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nLndhcm4oYENvbnRpbnVpbmcgd2l0aG91dCBjYXB0dXJpbmcgZGV2aWNlIGxvZ3M6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGF3YWl0IHRoaXMubG9ncy5jcmFzaGxvZy5zdGFydENhcHR1cmUoKTtcbiAgYXdhaXQgdGhpcy5sb2dzLnNhZmFyaUNvbnNvbGUuc3RhcnRDYXB0dXJlKCk7XG4gIGF3YWl0IHRoaXMubG9ncy5zYWZhcmlOZXR3b3JrLnN0YXJ0Q2FwdHVyZSgpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBTdGFydHMgaU9TIHN5c3RlbSBsb2dzIGJyb2FkY2FzdCB3ZWJzb2NrZXQgb24gdGhlIHNhbWUgaG9zdCBhbmQgcG9ydFxuICogd2hlcmUgQXBwaXVtIHNlcnZlciBpcyBydW5uaW5nIGF0IGAvd3Mvc2Vzc2lvbi86c2Vzc2lvbklkOi9hcHBpdW0vc3lzbG9nYCBlbmRwb2ludC4gVGhlIG1ldGhvZFxuICogd2lsbCByZXR1cm4gaW1tZWRpYXRlbHkgaWYgdGhlIHdlYiBzb2NrZXQgaXMgYWxyZWFkeSBsaXN0ZW5pbmcuXG4gKlxuICogRWFjaCBjb25uZWN0ZWQgd2ViY29rZXQgbGlzdGVuZXIgd2lsbCByZWNlaXZlIHN5c2xvZyBsaW5lc1xuICogYXMgc29vbiBhcyB0aGV5IGFyZSB2aXNpYmxlIHRvIEFwcGl1bS5cbiAqL1xuZXh0ZW5zaW9ucy5tb2JpbGVTdGFydExvZ3NCcm9hZGNhc3QgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHBhdGhuYW1lID0gV0VCU09DS0VUX0VORFBPSU5UKHRoaXMuc2Vzc2lvbklkKTtcbiAgaWYgKCFfLmlzRW1wdHkoYXdhaXQgdGhpcy5zZXJ2ZXIuZ2V0V2ViU29ja2V0SGFuZGxlcnMocGF0aG5hbWUpKSkge1xuICAgIGxvZy5kZWJ1ZyhgVGhlIHN5c3RlbSBsb2dzIGJyb2FkY2FzdGluZyB3ZWIgc29ja2V0IHNlcnZlciBpcyBhbHJlYWR5IGxpc3RlbmluZyBhdCAke3BhdGhuYW1lfWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxvZy5pbmZvKGBBc3NpZ25pbmcgc3lzdGVtIGxvZ3MgYnJvYWRjYXN0aW5nIHdlYiBzb2NrZXQgc2VydmVyIHRvICR7cGF0aG5hbWV9YCk7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJzb2NrZXRzL3dzL2Jsb2IvbWFzdGVyL2RvYy93cy5tZFxuICBjb25zdCB3c3MgPSBuZXcgV2ViU29ja2V0LlNlcnZlcih7XG4gICAgbm9TZXJ2ZXI6IHRydWUsXG4gIH0pO1xuICB3c3Mub24oJ2Nvbm5lY3Rpb24nLCAod3MsIHJlcSkgPT4ge1xuICAgIGlmIChyZXEpIHtcbiAgICAgIGNvbnN0IHJlbW90ZUlwID0gXy5pc0VtcHR5KHJlcS5oZWFkZXJzWyd4LWZvcndhcmRlZC1mb3InXSlcbiAgICAgICAgPyByZXEuY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzXG4gICAgICAgIDogcmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLWZvciddO1xuICAgICAgbG9nLmRlYnVnKGBFc3RhYmxpc2hlZCBhIG5ldyBzeXN0ZW0gbG9ncyBsaXN0ZW5lciB3ZWIgc29ja2V0IGNvbm5lY3Rpb24gZnJvbSAke3JlbW90ZUlwfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2cuZGVidWcoJ0VzdGFibGlzaGVkIGEgbmV3IHN5c3RlbSBsb2dzIGxpc3RlbmVyIHdlYiBzb2NrZXQgY29ubmVjdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChfLmlzRW1wdHkodGhpcy5fc3lzbG9nV2Vic29ja2V0TGlzdGVuZXIpKSB7XG4gICAgICB0aGlzLl9zeXNsb2dXZWJzb2NrZXRMaXN0ZW5lciA9IChsb2dSZWNvcmQpID0+IHtcbiAgICAgICAgaWYgKHdzICYmIHdzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgd3Muc2VuZChsb2dSZWNvcmQubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMubG9ncy5zeXNsb2cub24oJ291dHB1dCcsIHRoaXMuX3N5c2xvZ1dlYnNvY2tldExpc3RlbmVyKTtcblxuICAgIHdzLm9uKCdjbG9zZScsIChjb2RlLCByZWFzb24pID0+IHtcbiAgICAgIGlmICghXy5pc0VtcHR5KHRoaXMuX3N5c2xvZ1dlYnNvY2tldExpc3RlbmVyKSkge1xuICAgICAgICB0aGlzLmxvZ3Muc3lzbG9nLnJlbW92ZUxpc3RlbmVyKCdvdXRwdXQnLCB0aGlzLl9zeXNsb2dXZWJzb2NrZXRMaXN0ZW5lcik7XG4gICAgICAgIHRoaXMuX3N5c2xvZ1dlYnNvY2tldExpc3RlbmVyID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgbGV0IGNsb3NlTXNnID0gJ1N5c3RlbSBsb2dzIGxpc3RlbmVyIHdlYiBzb2NrZXQgaXMgY2xvc2VkLic7XG4gICAgICBpZiAoIV8uaXNFbXB0eShjb2RlKSkge1xuICAgICAgICBjbG9zZU1zZyArPSBgIENvZGU6ICR7Y29kZX0uYDtcbiAgICAgIH1cbiAgICAgIGlmICghXy5pc0VtcHR5KHJlYXNvbikpIHtcbiAgICAgICAgY2xvc2VNc2cgKz0gYCBSZWFzb246ICR7cmVhc29ufS5gO1xuICAgICAgfVxuICAgICAgbG9nLmRlYnVnKGNsb3NlTXNnKTtcbiAgICB9KTtcbiAgfSk7XG4gIGF3YWl0IHRoaXMuc2VydmVyLmFkZFdlYlNvY2tldEhhbmRsZXIocGF0aG5hbWUsIHdzcyk7XG59O1xuXG4vKipcbiAqIFN0b3BzIHRoZSBwcmV2aW91c2x5IHN0YXJ0ZWQgc3lzbG9nIGJyb2FkY2FzdGluZyB3ZXNvY2tldCBzZXJ2ZXIuXG4gKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiBpbW1lZGlhdGVseSBpZiBubyBzZXJ2ZXIgaXMgcnVubmluZy5cbiAqL1xuZXh0ZW5zaW9ucy5tb2JpbGVTdG9wTG9nc0Jyb2FkY2FzdCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGF0aG5hbWUgPSBXRUJTT0NLRVRfRU5EUE9JTlQodGhpcy5zZXNzaW9uSWQpO1xuICBpZiAoXy5pc0VtcHR5KGF3YWl0IHRoaXMuc2VydmVyLmdldFdlYlNvY2tldEhhbmRsZXJzKHBhdGhuYW1lKSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsb2cuZGVidWcoJ1N0b3BwaW5nIHRoZSBzeXN0ZW0gbG9ncyBicm9hZGNhc3Rpbmcgd2ViIHNvY2tldCBzZXJ2ZXInKTtcbiAgYXdhaXQgdGhpcy5zZXJ2ZXIucmVtb3ZlV2ViU29ja2V0SGFuZGxlcihwYXRobmFtZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBleHRlbnNpb25zO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
