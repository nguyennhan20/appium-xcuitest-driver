'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _appiumBaseDriver = require('appium-base-driver');

var _driver = require('./driver');

function startServer(port, address) {
  var driver, router, server;
  return _regeneratorRuntime.async(function startServer$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        driver = new _driver.XCUITestDriver({ port: port, address: address });
        router = (0, _appiumBaseDriver.routeConfiguringFunction)(driver);
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap((0, _appiumBaseDriver.server)(router, port, address));

      case 4:
        server = context$1$0.sent;

        // make the driver available
        server.driver = driver;
        _logger2['default'].info('XCUITestDriver server listening on http://' + address + ':' + port);
        return context$1$0.abrupt('return', server);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

exports.startServer = startServer;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9zZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFBZ0IsVUFBVTs7OztnQ0FDcUMsb0JBQW9COztzQkFDcEQsVUFBVTs7QUFFekMsU0FBZSxXQUFXLENBQUUsSUFBSSxFQUFFLE9BQU87TUFDbkMsTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNOzs7O0FBRk4sY0FBTSxHQUFHLDJCQUFtQixFQUFDLElBQUksRUFBSixJQUFJLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxDQUFDO0FBQzVDLGNBQU0sR0FBRyxnREFBeUIsTUFBTSxDQUFDOzt5Q0FDMUIsOEJBQVcsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7OztBQUFoRCxjQUFNOzs7QUFFVixjQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN2Qiw0QkFBSSxJQUFJLGdEQUE4QyxPQUFPLFNBQUksSUFBSSxDQUFHLENBQUM7NENBQ2xFLE1BQU07Ozs7Ozs7Q0FDZDs7UUFFUSxXQUFXLEdBQVgsV0FBVyIsImZpbGUiOiJsaWIvc2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxvZyBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyBzZXJ2ZXIgYXMgYmFzZVNlcnZlciwgcm91dGVDb25maWd1cmluZ0Z1bmN0aW9uIH0gZnJvbSAnYXBwaXVtLWJhc2UtZHJpdmVyJztcbmltcG9ydCB7IFhDVUlUZXN0RHJpdmVyIH0gZnJvbSAnLi9kcml2ZXInO1xuXG5hc3luYyBmdW5jdGlvbiBzdGFydFNlcnZlciAocG9ydCwgYWRkcmVzcykge1xuICBsZXQgZHJpdmVyID0gbmV3IFhDVUlUZXN0RHJpdmVyKHtwb3J0LCBhZGRyZXNzfSk7XG4gIGxldCByb3V0ZXIgPSByb3V0ZUNvbmZpZ3VyaW5nRnVuY3Rpb24oZHJpdmVyKTtcbiAgbGV0IHNlcnZlciA9IGF3YWl0IGJhc2VTZXJ2ZXIocm91dGVyLCBwb3J0LCBhZGRyZXNzKTtcbiAgLy8gbWFrZSB0aGUgZHJpdmVyIGF2YWlsYWJsZVxuICBzZXJ2ZXIuZHJpdmVyID0gZHJpdmVyO1xuICBsb2cuaW5mbyhgWENVSVRlc3REcml2ZXIgc2VydmVyIGxpc3RlbmluZyBvbiBodHRwOi8vJHthZGRyZXNzfToke3BvcnR9YCk7XG4gIHJldHVybiBzZXJ2ZXI7XG59XG5cbmV4cG9ydCB7IHN0YXJ0U2VydmVyIH07XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uIn0=
