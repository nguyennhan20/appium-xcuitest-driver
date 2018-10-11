'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _appiumBaseDriver = require('appium-base-driver');

var commands = {},
    helpers = {},
    extensions = {};

commands.getCookies = function getCookies() {
  var cookies;
  return _regeneratorRuntime.async(function getCookies$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (this.isWebContext()) {
          context$1$0.next = 2;
          break;
        }

        throw new _appiumBaseDriver.errors.NotImplementedError();

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.remote.getCookies());

      case 4:
        context$1$0.t0 = context$1$0.sent;

        if (context$1$0.t0) {
          context$1$0.next = 7;
          break;
        }

        context$1$0.t0 = { cookies: [] };

      case 7:
        cookies = context$1$0.t0;
        return context$1$0.abrupt('return', cookies.cookies.map(function (cookie) {
          return _Object$assign({}, cookie, {
            value: decodeURI(cookie.value)
          });
        }));

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.deleteCookie = function deleteCookie(cookieName) {
  var cookies, cookie;
  return _regeneratorRuntime.async(function deleteCookie$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (this.isWebContext()) {
          context$1$0.next = 2;
          break;
        }

        throw new _appiumBaseDriver.errors.NotImplementedError();

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.getCookies());

      case 4:
        cookies = context$1$0.sent;
        cookie = cookies.find(function (cookie) {
          return cookie.name === cookieName;
        });

        if (cookie) {
          context$1$0.next = 9;
          break;
        }

        _logger2['default'].debug('Cookie \'' + cookieName + '\' not found. Ignoring.');
        return context$1$0.abrupt('return', true);

      case 9:
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(this._deleteCookie(cookie));

      case 11:
        return context$1$0.abrupt('return', true);

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.deleteCookies = function deleteCookies() {
  var cookies, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, cookie;

  return _regeneratorRuntime.async(function deleteCookies$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (this.isWebContext()) {
          context$1$0.next = 2;
          break;
        }

        throw new _appiumBaseDriver.errors.NotImplementedError();

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.getCookies());

      case 4:
        cookies = context$1$0.sent;
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 8;
        _iterator = _getIterator(cookies);

      case 10:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 17;
          break;
        }

        cookie = _step.value;
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(this._deleteCookie(cookie));

      case 14:
        _iteratorNormalCompletion = true;
        context$1$0.next = 10;
        break;

      case 17:
        context$1$0.next = 23;
        break;

      case 19:
        context$1$0.prev = 19;
        context$1$0.t0 = context$1$0['catch'](8);
        _didIteratorError = true;
        _iteratorError = context$1$0.t0;

      case 23:
        context$1$0.prev = 23;
        context$1$0.prev = 24;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 26:
        context$1$0.prev = 26;

        if (!_didIteratorError) {
          context$1$0.next = 29;
          break;
        }

        throw _iteratorError;

      case 29:
        return context$1$0.finish(26);

      case 30:
        return context$1$0.finish(23);

      case 31:
        return context$1$0.abrupt('return', true);

      case 32:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[8, 19, 23, 31], [24,, 26, 30]]);
};

helpers._deleteCookie = function _deleteCookie(cookie) {
  var url;
  return _regeneratorRuntime.async(function _deleteCookie$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        url = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.remote.deleteCookie(cookie.name, url));

      case 3:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

_Object$assign(extensions, commands, helpers);
exports.commands = commands;
exports.helpers = helpers;
exports['default'] = extensions;

// get the cookies from the remote debugger, or an empty object

// the value is URI encoded, so decode it
// but keep all the rest of the info intact
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9jb29raWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUFnQixXQUFXOzs7O2dDQUNKLG9CQUFvQjs7QUFHM0MsSUFBSSxRQUFRLEdBQUcsRUFBRTtJQUFFLE9BQU8sR0FBRyxFQUFFO0lBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFakQsUUFBUSxDQUFDLFVBQVUsR0FBRyxTQUFlLFVBQVU7TUFNdkMsT0FBTzs7OztZQUxSLElBQUksQ0FBQyxZQUFZLEVBQUU7Ozs7O2NBQ2hCLElBQUkseUJBQU8sbUJBQW1CLEVBQUU7Ozs7eUNBSWxCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFOzs7Ozs7Ozs7O3lCQUFJLEVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBQzs7O0FBQXpELGVBQU87NENBR04sT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDM0MsaUJBQU8sZUFBYyxFQUFFLEVBQUUsTUFBTSxFQUFFO0FBQy9CLGlCQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7V0FDL0IsQ0FBQyxDQUFDO1NBQ0osQ0FBQzs7Ozs7OztDQUNILENBQUM7O0FBRUYsUUFBUSxDQUFDLFlBQVksR0FBRyxTQUFlLFlBQVksQ0FBRSxVQUFVO01BS3ZELE9BQU8sRUFDUCxNQUFNOzs7O1lBTFAsSUFBSSxDQUFDLFlBQVksRUFBRTs7Ozs7Y0FDaEIsSUFBSSx5QkFBTyxtQkFBbUIsRUFBRTs7Ozt5Q0FHbEIsSUFBSSxDQUFDLFVBQVUsRUFBRTs7O0FBQWpDLGVBQU87QUFDUCxjQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU07aUJBQUssTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVO1NBQUEsQ0FBQzs7WUFDOUQsTUFBTTs7Ozs7QUFDVCw0QkFBSSxLQUFLLGVBQVksVUFBVSw2QkFBeUIsQ0FBQzs0Q0FDbEQsSUFBSTs7Ozt5Q0FHUCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQzs7OzRDQUN6QixJQUFJOzs7Ozs7O0NBQ1osQ0FBQzs7QUFFRixRQUFRLENBQUMsYUFBYSxHQUFHLFNBQWUsYUFBYTtNQUs3QyxPQUFPLGtGQUNGLE1BQU07Ozs7O1lBTFosSUFBSSxDQUFDLFlBQVksRUFBRTs7Ozs7Y0FDaEIsSUFBSSx5QkFBTyxtQkFBbUIsRUFBRTs7Ozt5Q0FHbEIsSUFBSSxDQUFDLFVBQVUsRUFBRTs7O0FBQWpDLGVBQU87Ozs7O2lDQUNRLE9BQU87Ozs7Ozs7O0FBQWpCLGNBQU07O3lDQUNULElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NENBRTNCLElBQUk7Ozs7Ozs7Q0FDWixDQUFDOztBQUVGLE9BQU8sQ0FBQyxhQUFhLEdBQUcsU0FBZSxhQUFhLENBQUUsTUFBTTtNQUNwRCxHQUFHOzs7O0FBQUgsV0FBRyxhQUFVLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQSxXQUFNLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUk7O3lDQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQzs7Ozs7Ozs7OztDQUN4RCxDQUFDOztBQUVGLGVBQWMsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwQyxRQUFRLEdBQVIsUUFBUTtRQUFFLE9BQU8sR0FBUCxPQUFPO3FCQUNYLFVBQVUiLCJmaWxlIjoibGliL2NvbW1hbmRzL2Nvb2tpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBlcnJvcnMgfSBmcm9tICdhcHBpdW0tYmFzZS1kcml2ZXInO1xuXG5cbmxldCBjb21tYW5kcyA9IHt9LCBoZWxwZXJzID0ge30sIGV4dGVuc2lvbnMgPSB7fTtcblxuY29tbWFuZHMuZ2V0Q29va2llcyA9IGFzeW5jIGZ1bmN0aW9uIGdldENvb2tpZXMgKCkge1xuICBpZiAoIXRoaXMuaXNXZWJDb250ZXh0KCkpIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLk5vdEltcGxlbWVudGVkRXJyb3IoKTtcbiAgfVxuXG4gIC8vIGdldCB0aGUgY29va2llcyBmcm9tIHRoZSByZW1vdGUgZGVidWdnZXIsIG9yIGFuIGVtcHR5IG9iamVjdFxuICBjb25zdCBjb29raWVzID0gYXdhaXQgdGhpcy5yZW1vdGUuZ2V0Q29va2llcygpIHx8IHtjb29raWVzOiBbXX07XG4gIC8vIHRoZSB2YWx1ZSBpcyBVUkkgZW5jb2RlZCwgc28gZGVjb2RlIGl0XG4gIC8vIGJ1dCBrZWVwIGFsbCB0aGUgcmVzdCBvZiB0aGUgaW5mbyBpbnRhY3RcbiAgcmV0dXJuIGNvb2tpZXMuY29va2llcy5tYXAoZnVuY3Rpb24gKGNvb2tpZSkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBjb29raWUsIHtcbiAgICAgIHZhbHVlOiBkZWNvZGVVUkkoY29va2llLnZhbHVlKSxcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5jb21tYW5kcy5kZWxldGVDb29raWUgPSBhc3luYyBmdW5jdGlvbiBkZWxldGVDb29raWUgKGNvb2tpZU5hbWUpIHtcbiAgaWYgKCF0aGlzLmlzV2ViQ29udGV4dCgpKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5Ob3RJbXBsZW1lbnRlZEVycm9yKCk7XG4gIH1cblxuICBjb25zdCBjb29raWVzID0gYXdhaXQgdGhpcy5nZXRDb29raWVzKCk7XG4gIGNvbnN0IGNvb2tpZSA9IGNvb2tpZXMuZmluZCgoY29va2llKSA9PiBjb29raWUubmFtZSA9PT0gY29va2llTmFtZSk7XG4gIGlmICghY29va2llKSB7XG4gICAgbG9nLmRlYnVnKGBDb29raWUgJyR7Y29va2llTmFtZX0nIG5vdCBmb3VuZC4gSWdub3JpbmcuYCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhd2FpdCB0aGlzLl9kZWxldGVDb29raWUoY29va2llKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb21tYW5kcy5kZWxldGVDb29raWVzID0gYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ29va2llcyAoKSB7XG4gIGlmICghdGhpcy5pc1dlYkNvbnRleHQoKSkge1xuICAgIHRocm93IG5ldyBlcnJvcnMuTm90SW1wbGVtZW50ZWRFcnJvcigpO1xuICB9XG5cbiAgY29uc3QgY29va2llcyA9IGF3YWl0IHRoaXMuZ2V0Q29va2llcygpO1xuICBmb3IgKGNvbnN0IGNvb2tpZSBvZiBjb29raWVzKSB7XG4gICAgYXdhaXQgdGhpcy5fZGVsZXRlQ29va2llKGNvb2tpZSk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5oZWxwZXJzLl9kZWxldGVDb29raWUgPSBhc3luYyBmdW5jdGlvbiBfZGVsZXRlQ29va2llIChjb29raWUpIHtcbiAgY29uc3QgdXJsID0gYGh0dHAke2Nvb2tpZS5zZWN1cmUgPyAncycgOiAnJ306Ly8ke2Nvb2tpZS5kb21haW59JHtjb29raWUucGF0aH1gO1xuICByZXR1cm4gYXdhaXQgdGhpcy5yZW1vdGUuZGVsZXRlQ29va2llKGNvb2tpZS5uYW1lLCB1cmwpO1xufTtcblxuT2JqZWN0LmFzc2lnbihleHRlbnNpb25zLCBjb21tYW5kcywgaGVscGVycyk7XG5leHBvcnQgeyBjb21tYW5kcywgaGVscGVycyB9O1xuZXhwb3J0IGRlZmF1bHQgZXh0ZW5zaW9ucztcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
