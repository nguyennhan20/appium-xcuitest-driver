'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _appiumBaseDriver = require('appium-base-driver');

var _appiumSupport = require('appium-support');

var _appiumIosDriver = require('appium-ios-driver');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var helpers = {},
    extensions = {},
    commands = {};

commands.moveTo = _appiumIosDriver.iosCommands.gesture.moveTo;

commands.mobileShake = function callee$0$0() {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (this.isSimulator()) {
          context$1$0.next = 2;
          break;
        }

        throw new _appiumBaseDriver.errors.UnknownError('Shake is not supported on real devices');

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.opts.device.shake());

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.click = function callee$0$0(el) {
  var atomsElement;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (this.isWebContext()) {
          context$1$0.next = 4;
          break;
        }

        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.nativeClick(el));

      case 3:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 4:
        el = _appiumSupport.util.unwrapElement(el);
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(this.settings.getSettings());

      case 7:
        if (!context$1$0.sent.nativeWebTap) {
          context$1$0.next = 13;
          break;
        }

        // atoms-based clicks don't always work in safari 7
        _logger2['default'].debug('Using native web tap');
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(this.nativeWebTap(el));

      case 11:
        context$1$0.next = 17;
        break;

      case 13:
        atomsElement = this.useAtomsElement(el);
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap(this.executeAtom('click', [atomsElement]));

      case 16:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

function gesturesChainToString(gestures) {
  var keysToInclude = arguments.length <= 1 || arguments[1] === undefined ? ['options'] : arguments[1];

  return gestures.map(function (item) {
    var otherKeys = _lodash2['default'].difference(_lodash2['default'].keys(item), ['action']);
    otherKeys = _lodash2['default'].isArray(keysToInclude) ? _lodash2['default'].intersection(otherKeys, keysToInclude) : otherKeys;
    if (otherKeys.length) {
      return '' + item.action + ('(' + _lodash2['default'].map(otherKeys, function (x) {
        return x + '=' + (_lodash2['default'].isPlainObject(item[x]) ? JSON.stringify(item[x]) : item[x]);
      }).join(', ') + ')');
    }
    return item.action;
  }).join('-');
}

commands.performActions = function callee$0$0(actions) {
  var preprocessedActions;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Received the following W3C actions: ' + JSON.stringify(actions, null, '  '));
        // This is mandatory, since WDA only supports TOUCH pointer type
        // and Selenium API uses MOUSE as the default one
        preprocessedActions = actions.map(function (action) {
          return _Object$assign({}, action, action.type === 'pointer' ? {
            parameters: {
              pointerType: 'touch'
            }
          } : {});
        }).map(function (action) {
          var modifiedAction = _lodash2['default'].clone(action) || {};
          // Selenium API unexpectedly inserts zero pauses, which are not supported by WDA
          modifiedAction.actions = (action.actions || []).filter(function (innerAction) {
            return !(innerAction.type === 'pause' && innerAction.duration === 0);
          });
          return modifiedAction;
        });

        _logger2['default'].debug('Preprocessed actions: ' + JSON.stringify(preprocessedActions, null, '  '));
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(this.proxyCommand('/actions', 'POST', { actions: preprocessedActions }));

      case 5:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.performTouch = function callee$0$0(gestures) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Received the following touch action: ' + gesturesChainToString(gestures));
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/touch/perform', 'POST', { actions: gestures }));

      case 3:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.performMultiAction = function callee$0$0(actions) {
  var i;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Received the following multi touch action:');
        for (i in actions) {
          _logger2['default'].debug('    ' + (parseInt(i, 10) + 1) + ': ' + _lodash2['default'].map(actions[i], 'action').join('-'));
        }
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/touch/multi/perform', 'POST', { actions: actions }));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.nativeClick = function callee$0$0(el) {
  var endpoint;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        el = _appiumSupport.util.unwrapElement(el);
        endpoint = '/element/' + el + '/click';
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.proxyCommand(endpoint, 'POST', {}));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/*
 * See https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBElementCommands.m
 * to get the info about available WDA gestures API
 *
 * See https://developer.apple.com/reference/xctest/xcuielement and
 * https://developer.apple.com/reference/xctest/xcuicoordinate to get the detailed description of
 * all XCTest gestures
*/

helpers.mobileScroll = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var swipe = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
  var params, msg, element, endpoint;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (opts.element) {
          context$1$0.next = 4;
          break;
        }

        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.findNativeElementOrElements('class name', 'XCUIElementTypeApplication', false));

      case 3:
        opts.element = context$1$0.sent;

      case 4:
        params = {};

        if (opts.name && !swipe) {
          params.name = opts.name;
        } else if (opts.direction) {
          if (['up', 'down', 'left', 'right'].indexOf(opts.direction.toLowerCase()) < 0) {
            msg = 'Direction must be up, down, left or right';

            _logger2['default'].errorAndThrow(msg);
          }
          params.direction = opts.direction;
        } else if (opts.predicateString && !swipe) {
          params.predicateString = opts.predicateString;
        } else if (opts.toVisible && !swipe) {
          params.toVisible = opts.toVisible;
        } else {
          msg = swipe ? 'Mobile swipe requires direction' : 'Mobile scroll supports the following strategies: name, direction, predicateString, and toVisible. Specify one of these';

          _logger2['default'].errorAndThrow(msg);
        }

        // we can also optionally pass a distance which appears to be a ratio of
        // screen height, so 1.0 means a full screen's worth of scrolling
        if (!swipe && opts.distance) {
          params.distance = opts.distance;
        }

        element = opts.element.ELEMENT || opts.element;
        endpoint = '/wda/element/' + element + '/' + (swipe ? 'swipe' : 'scroll');
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(this.proxyCommand(endpoint, 'POST', params));

      case 11:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.mobileSwipe = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this.mobileScroll(opts, true));

      case 2:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

function parseFloatParameter(paramName, paramValue, methodName) {
  if (_lodash2['default'].isUndefined(paramValue)) {
    _logger2['default'].errorAndThrow('"' + paramName + '" parameter is mandatory for "' + methodName + '" call');
  }
  var result = parseFloat(paramValue);
  if (isNaN(result)) {
    _logger2['default'].errorAndThrow('"' + paramName + '" parameter should be a valid number. "' + paramValue + '" is given instead');
  }
  return result;
}

helpers.mobilePinch = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var params, el;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (opts.element) {
          context$1$0.next = 4;
          break;
        }

        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.findNativeElementOrElements('class name', 'XCUIElementTypeApplication', false));

      case 3:
        opts.element = context$1$0.sent;

      case 4:
        params = {
          scale: parseFloatParameter('scale', opts.scale, 'pinch'),
          velocity: parseFloatParameter('velocity', opts.velocity, 'pinch')
        };
        el = opts.element.ELEMENT || opts.element;
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/element/' + el + '/pinch', 'POST', params));

      case 8:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.mobileDoubleTap = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var el, params;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!opts.element) {
          context$1$0.next = 5;
          break;
        }

        el = opts.element.ELEMENT || opts.element;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/element/' + el + '/doubleTap', 'POST'));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
        params = {
          x: parseFloatParameter('x', opts.x, 'doubleTap'),
          y: parseFloatParameter('y', opts.y, 'doubleTap')
        };
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/doubleTap', 'POST', params));

      case 8:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.mobileTwoFingerTap = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var el;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (opts.element) {
          context$1$0.next = 4;
          break;
        }

        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.findNativeElementOrElements('class name', 'XCUIElementTypeApplication', false));

      case 3:
        opts.element = context$1$0.sent;

      case 4:
        el = opts.element.ELEMENT || opts.element;
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/element/' + el + '/twoFingerTap', 'POST'));

      case 7:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.mobileTouchAndHold = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var params, el;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        params = {
          duration: parseFloatParameter('duration', opts.duration, 'touchAndHold')
        };

        if (!opts.element) {
          context$1$0.next = 6;
          break;
        }

        el = opts.element.ELEMENT || opts.element;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/element/' + el + '/touchAndHold', 'POST', params));

      case 5:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 6:
        // Long tap coordinates
        params.x = parseFloatParameter('x', opts.x, 'touchAndHold');
        params.y = parseFloatParameter('y', opts.y, 'touchAndHold');
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/touchAndHold', 'POST', params));

      case 10:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.mobileTap = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var params, el;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        params = {
          x: parseFloatParameter('x', opts.x, 'tap'),
          y: parseFloatParameter('y', opts.y, 'tap')
        };
        el = opts.element ? opts.element.ELEMENT || opts.element : '0';
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/tap/' + el, 'POST', params));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.mobileDragFromToForDuration = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var params, el;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        params = {
          duration: parseFloatParameter('duration', opts.duration, 'dragFromToForDuration'),
          fromX: parseFloatParameter('fromX', opts.fromX, 'dragFromToForDuration'),
          fromY: parseFloatParameter('fromY', opts.fromY, 'dragFromToForDuration'),
          toX: parseFloatParameter('toX', opts.toX, 'dragFromToForDuration'),
          toY: parseFloatParameter('toY', opts.toY, 'dragFromToForDuration')
        };

        if (!opts.element) {
          context$1$0.next = 6;
          break;
        }

        el = opts.element.ELEMENT || opts.element;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/element/' + el + '/dragfromtoforduration', 'POST', params));

      case 5:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 6:
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/dragfromtoforduration', 'POST', params));

      case 8:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.mobileSelectPickerWheelValue = function callee$0$0() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var el, params;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!opts.element) {
          _logger2['default'].errorAndThrow('Element id is expected to be set for selectPickerWheelValue method');
        }
        if (!_lodash2['default'].isString(opts.order) || ['next', 'previous'].indexOf(opts.order.toLowerCase()) === -1) {
          _logger2['default'].errorAndThrow('The mandatory "order" parameter is expected to be equal either to \'next\' or \'previous\'. ' + ('\'' + opts.order + '\' is given instead'));
        }
        el = opts.element.ELEMENT || opts.element;
        params = { order: opts.order };

        if (opts.offset) {
          params.offset = parseFloatParameter('offset', opts.offset, 'selectPickerWheelValue');
        }
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(this.proxyCommand('/wda/pickerwheel/' + el + '/select', 'POST', params));

      case 7:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.getCoordinates = function callee$0$0(gesture) {
  var el, coordinates, optionX, optionY, rect, pos, size, offsetX, offsetY;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        el = gesture.options.element;
        coordinates = { x: 0, y: 0, areOffsets: false };
        optionX = null;

        if (gesture.options.x) {
          optionX = parseFloatParameter('x', gesture.options.x, 'getCoordinates');
        }
        optionY = null;

        if (gesture.options.y) {
          optionY = parseFloatParameter('y', gesture.options.y, 'getCoordinates');
        }

        // figure out the element coordinates.

        if (!el) {
          context$1$0.next = 19;
          break;
        }

        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(this.getRect(el));

      case 9:
        rect = context$1$0.sent;
        pos = { x: rect.x, y: rect.y };
        size = { w: rect.width, h: rect.height };
        offsetX = 0;
        offsetY = 0;

        // get the real offsets
        if (optionX || optionY) {
          offsetX = optionX || 0;
          offsetY = optionY || 0;
        } else {
          offsetX = size.w / 2;
          offsetY = size.h / 2;
        }

        // apply the offsets
        coordinates.x = pos.x + offsetX;
        coordinates.y = pos.y + offsetY;
        context$1$0.next = 22;
        break;

      case 19:
        // moveTo coordinates are passed in as offsets
        coordinates.areOffsets = gesture.action === 'moveTo';
        coordinates.x = optionX || 0;
        coordinates.y = optionY || 0;

      case 22:
        return context$1$0.abrupt('return', coordinates);

      case 23:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.applyMoveToOffset = function (firstCoordinates, secondCoordinates) {
  if (secondCoordinates.areOffsets) {
    return {
      x: firstCoordinates.x + secondCoordinates.x,
      y: firstCoordinates.y + secondCoordinates.y
    };
  } else {
    return secondCoordinates;
  }
};

_Object$assign(extensions, helpers, commands);
exports.extensions = extensions;
exports.helpers = helpers;
exports.commands = commands;
exports.gesturesChainToString = gesturesChainToString;
exports['default'] = extensions;

// there are multiple commands that map here, so manually proxy

// WDA supports four scrolling strategies: predication based on name, direction,
// predicateString, and toVisible, in that order. Swiping requires direction.

// Double tap element

// Double tap coordinates

// Long tap element

// Drag element

// Drag coordinates

// defaults

// defaults
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9nZXN0dXJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztnQ0FBdUIsb0JBQW9COzs2QkFDdEIsZ0JBQWdCOzsrQkFDVCxtQkFBbUI7O3NCQUNqQyxRQUFROzs7O3NCQUNOLFdBQVc7Ozs7QUFHM0IsSUFBSSxPQUFPLEdBQUcsRUFBRTtJQUFFLFVBQVUsR0FBRyxFQUFFO0lBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFFakQsUUFBUSxDQUFDLE1BQU0sR0FBRyw2QkFBWSxPQUFPLENBQUMsTUFBTSxDQUFDOztBQUU3QyxRQUFRLENBQUMsV0FBVyxHQUFHOzs7O1lBQ2hCLElBQUksQ0FBQyxXQUFXLEVBQUU7Ozs7O2NBQ2YsSUFBSSx5QkFBTyxZQUFZLENBQUMsd0NBQXdDLENBQUM7Ozs7eUNBRW5FLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTs7Ozs7OztDQUMvQixDQUFDOztBQUVGLFFBQVEsQ0FBQyxLQUFLLEdBQUcsb0JBQWdCLEVBQUU7TUFXM0IsWUFBWTs7OztZQVZiLElBQUksQ0FBQyxZQUFZLEVBQUU7Ozs7Ozt5Q0FFVCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzs7Ozs7O0FBRW5DLFVBQUUsR0FBRyxvQkFBSyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7O3lDQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTs7OzhCQUFFLFlBQVk7Ozs7OztBQUVsRCw0QkFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7eUNBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDOzs7Ozs7O0FBRXZCLG9CQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7O3lDQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7Ozs7Ozs7O0NBRXpELENBQUM7O0FBRUYsU0FBUyxxQkFBcUIs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QUFNO0FBQ0wsV0FBTyxpQkFBaUIsQ0FBQztHQUMxQjtDQUNGLENBQUM7O0FBRUYsZUFBYyxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLFVBQVUsR0FBVixVQUFVO1FBQUUsT0FBTyxHQUFQLE9BQU87UUFBRSxRQUFRLEdBQVIsUUFBUTtRQUFFLHFCQUFxQixHQUFyQixxQkFBcUI7cUJBQzlDLFVBQVUiLCJmaWxlIjoibGliL2NvbW1hbmRzL2dlc3R1cmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlcnJvcnMgfSBmcm9tICdhcHBpdW0tYmFzZS1kcml2ZXInO1xuaW1wb3J0IHsgdXRpbCB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCB7IGlvc0NvbW1hbmRzIH0gZnJvbSAnYXBwaXVtLWlvcy1kcml2ZXInO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBsb2cgZnJvbSAnLi4vbG9nZ2VyJztcblxuXG5sZXQgaGVscGVycyA9IHt9LCBleHRlbnNpb25zID0ge30sIGNvbW1hbmRzID0ge307XG5cbmNvbW1hbmRzLm1vdmVUbyA9IGlvc0NvbW1hbmRzLmdlc3R1cmUubW92ZVRvO1xuXG5jb21tYW5kcy5tb2JpbGVTaGFrZSA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmlzU2ltdWxhdG9yKCkpIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLlVua25vd25FcnJvcignU2hha2UgaXMgbm90IHN1cHBvcnRlZCBvbiByZWFsIGRldmljZXMnKTtcbiAgfVxuICBhd2FpdCB0aGlzLm9wdHMuZGV2aWNlLnNoYWtlKCk7XG59O1xuXG5jb21tYW5kcy5jbGljayA9IGFzeW5jIGZ1bmN0aW9uIChlbCkge1xuICBpZiAoIXRoaXMuaXNXZWJDb250ZXh0KCkpIHtcbiAgICAvLyB0aGVyZSBhcmUgbXVsdGlwbGUgY29tbWFuZHMgdGhhdCBtYXAgaGVyZSwgc28gbWFudWFsbHkgcHJveHlcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5uYXRpdmVDbGljayhlbCk7XG4gIH1cbiAgZWwgPSB1dGlsLnVud3JhcEVsZW1lbnQoZWwpO1xuICBpZiAoKGF3YWl0IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZ3MoKSkubmF0aXZlV2ViVGFwKSB7XG4gICAgLy8gYXRvbXMtYmFzZWQgY2xpY2tzIGRvbid0IGFsd2F5cyB3b3JrIGluIHNhZmFyaSA3XG4gICAgbG9nLmRlYnVnKCdVc2luZyBuYXRpdmUgd2ViIHRhcCcpO1xuICAgIGF3YWl0IHRoaXMubmF0aXZlV2ViVGFwKGVsKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgYXRvbXNFbGVtZW50ID0gdGhpcy51c2VBdG9tc0VsZW1lbnQoZWwpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmV4ZWN1dGVBdG9tKCdjbGljaycsIFthdG9tc0VsZW1lbnRdKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2VzdHVyZXNDaGFpblRvU3RyaW5nIChnZXN0dXJlcywga2V5c1RvSW5jbHVkZSA9IFsnb3B0aW9ucyddKSB7XG4gIHJldHVybiBnZXN0dXJlcy5tYXAoKGl0ZW0pID0+IHtcbiAgICBsZXQgb3RoZXJLZXlzID0gXy5kaWZmZXJlbmNlKF8ua2V5cyhpdGVtKSwgWydhY3Rpb24nXSk7XG4gICAgb3RoZXJLZXlzID0gXy5pc0FycmF5KGtleXNUb0luY2x1ZGUpID8gXy5pbnRlcnNlY3Rpb24ob3RoZXJLZXlzLCBrZXlzVG9JbmNsdWRlKSA6IG90aGVyS2V5cztcbiAgICBpZiAob3RoZXJLZXlzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGAke2l0ZW0uYWN0aW9ufWAgK1xuICAgICAgICBgKCR7Xy5tYXAob3RoZXJLZXlzLCAoeCkgPT4geCArICc9JyArIChfLmlzUGxhaW5PYmplY3QoaXRlbVt4XSkgPyBKU09OLnN0cmluZ2lmeShpdGVtW3hdKSA6IGl0ZW1beF0pKS5qb2luKCcsICcpfSlgO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbS5hY3Rpb247XG4gIH0pLmpvaW4oJy0nKTtcbn1cblxuY29tbWFuZHMucGVyZm9ybUFjdGlvbnMgPSBhc3luYyBmdW5jdGlvbiAoYWN0aW9ucykge1xuICBsb2cuZGVidWcoYFJlY2VpdmVkIHRoZSBmb2xsb3dpbmcgVzNDIGFjdGlvbnM6ICR7SlNPTi5zdHJpbmdpZnkoYWN0aW9ucywgbnVsbCwgJyAgJyl9YCk7XG4gIC8vIFRoaXMgaXMgbWFuZGF0b3J5LCBzaW5jZSBXREEgb25seSBzdXBwb3J0cyBUT1VDSCBwb2ludGVyIHR5cGVcbiAgLy8gYW5kIFNlbGVuaXVtIEFQSSB1c2VzIE1PVVNFIGFzIHRoZSBkZWZhdWx0IG9uZVxuICBjb25zdCBwcmVwcm9jZXNzZWRBY3Rpb25zID0gYWN0aW9uc1xuICAgIC5tYXAoKGFjdGlvbikgPT4gT2JqZWN0LmFzc2lnbih7fSwgYWN0aW9uLCBhY3Rpb24udHlwZSA9PT0gJ3BvaW50ZXInID8ge1xuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICBwb2ludGVyVHlwZTogJ3RvdWNoJ1xuICAgICAgfVxuICAgIH0gOiB7fSkpXG4gICAgLm1hcCgoYWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCBtb2RpZmllZEFjdGlvbiA9IF8uY2xvbmUoYWN0aW9uKSB8fCB7fTtcbiAgICAgIC8vIFNlbGVuaXVtIEFQSSB1bmV4cGVjdGVkbHkgaW5zZXJ0cyB6ZXJvIHBhdXNlcywgd2hpY2ggYXJlIG5vdCBzdXBwb3J0ZWQgYnkgV0RBXG4gICAgICBtb2RpZmllZEFjdGlvbi5hY3Rpb25zID0gKGFjdGlvbi5hY3Rpb25zIHx8IFtdKVxuICAgICAgICAuZmlsdGVyKChpbm5lckFjdGlvbikgPT4gIShpbm5lckFjdGlvbi50eXBlID09PSAncGF1c2UnICYmIGlubmVyQWN0aW9uLmR1cmF0aW9uID09PSAwKSk7XG4gICAgICByZXR1cm4gbW9kaWZpZWRBY3Rpb247XG4gICAgfSk7XG4gIGxvZy5kZWJ1ZyhgUHJlcHJvY2Vzc2VkIGFjdGlvbnM6ICR7SlNPTi5zdHJpbmdpZnkocHJlcHJvY2Vzc2VkQWN0aW9ucywgbnVsbCwgJyAgJyl9YCk7XG4gIHJldHVybiBhd2FpdCB0aGlzLnByb3h5Q29tbWFuZCgnL2FjdGlvbnMnLCAnUE9TVCcsIHthY3Rpb25zOiBwcmVwcm9jZXNzZWRBY3Rpb25zfSk7XG59O1xuXG5jb21tYW5kcy5wZXJmb3JtVG91Y2ggPSBhc3luYyBmdW5jdGlvbiAoZ2VzdHVyZXMpIHtcbiAgbG9nLmRlYnVnKGBSZWNlaXZlZCB0aGUgZm9sbG93aW5nIHRvdWNoIGFjdGlvbjogJHtnZXN0dXJlc0NoYWluVG9TdHJpbmcoZ2VzdHVyZXMpfWApO1xuICByZXR1cm4gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoJy93ZGEvdG91Y2gvcGVyZm9ybScsICdQT1NUJywge2FjdGlvbnM6IGdlc3R1cmVzfSk7XG59O1xuXG5jb21tYW5kcy5wZXJmb3JtTXVsdGlBY3Rpb24gPSBhc3luYyBmdW5jdGlvbiAoYWN0aW9ucykge1xuICBsb2cuZGVidWcoYFJlY2VpdmVkIHRoZSBmb2xsb3dpbmcgbXVsdGkgdG91Y2ggYWN0aW9uOmApO1xuICBmb3IgKGxldCBpIGluIGFjdGlvbnMpIHtcbiAgICBsb2cuZGVidWcoYCAgICAke3BhcnNlSW50KGksIDEwKSsxfTogJHtfLm1hcChhY3Rpb25zW2ldLCAnYWN0aW9uJykuam9pbignLScpfWApO1xuICB9XG4gIHJldHVybiBhd2FpdCB0aGlzLnByb3h5Q29tbWFuZCgnL3dkYS90b3VjaC9tdWx0aS9wZXJmb3JtJywgJ1BPU1QnLCB7YWN0aW9uc30pO1xufTtcblxuY29tbWFuZHMubmF0aXZlQ2xpY2sgPSBhc3luYyBmdW5jdGlvbiAoZWwpIHtcbiAgZWwgPSB1dGlsLnVud3JhcEVsZW1lbnQoZWwpO1xuICBsZXQgZW5kcG9pbnQgPSBgL2VsZW1lbnQvJHtlbH0vY2xpY2tgO1xuICByZXR1cm4gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoZW5kcG9pbnQsICdQT1NUJywge30pO1xufTtcblxuLypcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svV2ViRHJpdmVyQWdlbnQvYmxvYi9tYXN0ZXIvV2ViRHJpdmVyQWdlbnRMaWIvQ29tbWFuZHMvRkJFbGVtZW50Q29tbWFuZHMubVxuICogdG8gZ2V0IHRoZSBpbmZvIGFib3V0IGF2YWlsYWJsZSBXREEgZ2VzdHVyZXMgQVBJXG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9yZWZlcmVuY2UveGN0ZXN0L3hjdWllbGVtZW50IGFuZFxuICogaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL3JlZmVyZW5jZS94Y3Rlc3QveGN1aWNvb3JkaW5hdGUgdG8gZ2V0IHRoZSBkZXRhaWxlZCBkZXNjcmlwdGlvbiBvZlxuICogYWxsIFhDVGVzdCBnZXN0dXJlc1xuKi9cblxuaGVscGVycy5tb2JpbGVTY3JvbGwgPSBhc3luYyBmdW5jdGlvbiAob3B0cz17fSwgc3dpcGU9ZmFsc2UpIHtcbiAgaWYgKCFvcHRzLmVsZW1lbnQpIHtcbiAgICBvcHRzLmVsZW1lbnQgPSBhd2FpdCB0aGlzLmZpbmROYXRpdmVFbGVtZW50T3JFbGVtZW50cyhgY2xhc3MgbmFtZWAsIGBYQ1VJRWxlbWVudFR5cGVBcHBsaWNhdGlvbmAsIGZhbHNlKTtcbiAgfVxuICAvLyBXREEgc3VwcG9ydHMgZm91ciBzY3JvbGxpbmcgc3RyYXRlZ2llczogcHJlZGljYXRpb24gYmFzZWQgb24gbmFtZSwgZGlyZWN0aW9uLFxuICAvLyBwcmVkaWNhdGVTdHJpbmcsIGFuZCB0b1Zpc2libGUsIGluIHRoYXQgb3JkZXIuIFN3aXBpbmcgcmVxdWlyZXMgZGlyZWN0aW9uLlxuICBsZXQgcGFyYW1zID0ge307XG4gIGlmIChvcHRzLm5hbWUgJiYgIXN3aXBlKSB7XG4gICAgcGFyYW1zLm5hbWUgPSBvcHRzLm5hbWU7XG4gIH0gZWxzZSBpZiAob3B0cy5kaXJlY3Rpb24pIHtcbiAgICBpZiAoWyd1cCcsICdkb3duJywgJ2xlZnQnLCAncmlnaHQnXS5pbmRleE9mKG9wdHMuZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkpIDwgMCkge1xuICAgICAgbGV0IG1zZyA9ICdEaXJlY3Rpb24gbXVzdCBiZSB1cCwgZG93biwgbGVmdCBvciByaWdodCc7XG4gICAgICBsb2cuZXJyb3JBbmRUaHJvdyhtc2cpO1xuICAgIH1cbiAgICBwYXJhbXMuZGlyZWN0aW9uID0gb3B0cy5kaXJlY3Rpb247XG4gIH0gIGVsc2UgaWYgKG9wdHMucHJlZGljYXRlU3RyaW5nICYmICFzd2lwZSkge1xuICAgIHBhcmFtcy5wcmVkaWNhdGVTdHJpbmcgPSBvcHRzLnByZWRpY2F0ZVN0cmluZztcbiAgfSBlbHNlIGlmIChvcHRzLnRvVmlzaWJsZSAmJiAhc3dpcGUpIHtcbiAgICBwYXJhbXMudG9WaXNpYmxlID0gb3B0cy50b1Zpc2libGU7XG4gIH0gZWxzZSB7XG4gICAgbGV0IG1zZyA9IHN3aXBlID8gJ01vYmlsZSBzd2lwZSByZXF1aXJlcyBkaXJlY3Rpb24nIDogICdNb2JpbGUgc2Nyb2xsIHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgc3RyYXRlZ2llczogbmFtZSwgZGlyZWN0aW9uLCBwcmVkaWNhdGVTdHJpbmcsIGFuZCB0b1Zpc2libGUuIFNwZWNpZnkgb25lIG9mIHRoZXNlJztcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhtc2cpO1xuICB9XG5cbiAgLy8gd2UgY2FuIGFsc28gb3B0aW9uYWxseSBwYXNzIGEgZGlzdGFuY2Ugd2hpY2ggYXBwZWFycyB0byBiZSBhIHJhdGlvIG9mXG4gIC8vIHNjcmVlbiBoZWlnaHQsIHNvIDEuMCBtZWFucyBhIGZ1bGwgc2NyZWVuJ3Mgd29ydGggb2Ygc2Nyb2xsaW5nXG4gIGlmICghc3dpcGUgJiYgb3B0cy5kaXN0YW5jZSkge1xuICAgIHBhcmFtcy5kaXN0YW5jZSA9IG9wdHMuZGlzdGFuY2U7XG4gIH1cblxuICBsZXQgZWxlbWVudCA9IG9wdHMuZWxlbWVudC5FTEVNRU5UIHx8IG9wdHMuZWxlbWVudDtcbiAgbGV0IGVuZHBvaW50ID0gYC93ZGEvZWxlbWVudC8ke2VsZW1lbnR9LyR7c3dpcGUgPyAnc3dpcGUnIDogJ3Njcm9sbCd9YDtcbiAgcmV0dXJuIGF3YWl0IHRoaXMucHJveHlDb21tYW5kKGVuZHBvaW50LCAnUE9TVCcsIHBhcmFtcyk7XG59O1xuXG5oZWxwZXJzLm1vYmlsZVN3aXBlID0gYXN5bmMgZnVuY3Rpb24gKG9wdHM9e30pIHtcbiAgcmV0dXJuIGF3YWl0IHRoaXMubW9iaWxlU2Nyb2xsKG9wdHMsIHRydWUpO1xufTtcblxuZnVuY3Rpb24gcGFyc2VGbG9hdFBhcmFtZXRlciAocGFyYW1OYW1lLCBwYXJhbVZhbHVlLCBtZXRob2ROYW1lKSB7XG4gIGlmIChfLmlzVW5kZWZpbmVkKHBhcmFtVmFsdWUpKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYFwiJHtwYXJhbU5hbWV9XCIgcGFyYW1ldGVyIGlzIG1hbmRhdG9yeSBmb3IgXCIke21ldGhvZE5hbWV9XCIgY2FsbGApO1xuICB9XG4gIGNvbnN0IHJlc3VsdCA9IHBhcnNlRmxvYXQocGFyYW1WYWx1ZSk7XG4gIGlmIChpc05hTihyZXN1bHQpKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYFwiJHtwYXJhbU5hbWV9XCIgcGFyYW1ldGVyIHNob3VsZCBiZSBhIHZhbGlkIG51bWJlci4gXCIke3BhcmFtVmFsdWV9XCIgaXMgZ2l2ZW4gaW5zdGVhZGApO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmhlbHBlcnMubW9iaWxlUGluY2ggPSBhc3luYyBmdW5jdGlvbiAob3B0cz17fSkge1xuICBpZiAoIW9wdHMuZWxlbWVudCkge1xuICAgIG9wdHMuZWxlbWVudCA9IGF3YWl0IHRoaXMuZmluZE5hdGl2ZUVsZW1lbnRPckVsZW1lbnRzKGBjbGFzcyBuYW1lYCwgYFhDVUlFbGVtZW50VHlwZUFwcGxpY2F0aW9uYCwgZmFsc2UpO1xuICB9XG4gIGNvbnN0IHBhcmFtcyA9IHtcbiAgICBzY2FsZTogcGFyc2VGbG9hdFBhcmFtZXRlcignc2NhbGUnLCBvcHRzLnNjYWxlLCAncGluY2gnKSxcbiAgICB2ZWxvY2l0eTogcGFyc2VGbG9hdFBhcmFtZXRlcigndmVsb2NpdHknLCBvcHRzLnZlbG9jaXR5LCAncGluY2gnKVxuICB9O1xuICBjb25zdCBlbCA9IG9wdHMuZWxlbWVudC5FTEVNRU5UIHx8IG9wdHMuZWxlbWVudDtcbiAgcmV0dXJuIGF3YWl0IHRoaXMucHJveHlDb21tYW5kKGAvd2RhL2VsZW1lbnQvJHtlbH0vcGluY2hgLCAnUE9TVCcsIHBhcmFtcyk7XG59O1xuXG5oZWxwZXJzLm1vYmlsZURvdWJsZVRhcCA9IGFzeW5jIGZ1bmN0aW9uIChvcHRzPXt9KSB7XG4gIGlmIChvcHRzLmVsZW1lbnQpIHtcbiAgICAvLyBEb3VibGUgdGFwIGVsZW1lbnRcbiAgICBjb25zdCBlbCA9IG9wdHMuZWxlbWVudC5FTEVNRU5UIHx8IG9wdHMuZWxlbWVudDtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoYC93ZGEvZWxlbWVudC8ke2VsfS9kb3VibGVUYXBgLCAnUE9TVCcpO1xuICB9XG4gIC8vIERvdWJsZSB0YXAgY29vcmRpbmF0ZXNcbiAgY29uc3QgcGFyYW1zID0ge1xuICAgIHg6IHBhcnNlRmxvYXRQYXJhbWV0ZXIoJ3gnLCBvcHRzLngsICdkb3VibGVUYXAnKSxcbiAgICB5OiBwYXJzZUZsb2F0UGFyYW1ldGVyKCd5Jywgb3B0cy55LCAnZG91YmxlVGFwJylcbiAgfTtcbiAgcmV0dXJuIGF3YWl0IHRoaXMucHJveHlDb21tYW5kKCcvd2RhL2RvdWJsZVRhcCcsICdQT1NUJywgcGFyYW1zKTtcbn07XG5cbmhlbHBlcnMubW9iaWxlVHdvRmluZ2VyVGFwID0gYXN5bmMgZnVuY3Rpb24gKG9wdHM9e30pIHtcbiAgaWYgKCFvcHRzLmVsZW1lbnQpIHtcbiAgICBvcHRzLmVsZW1lbnQgPSBhd2FpdCB0aGlzLmZpbmROYXRpdmVFbGVtZW50T3JFbGVtZW50cyhgY2xhc3MgbmFtZWAsIGBYQ1VJRWxlbWVudFR5cGVBcHBsaWNhdGlvbmAsIGZhbHNlKTtcbiAgfVxuICBjb25zdCBlbCA9IG9wdHMuZWxlbWVudC5FTEVNRU5UIHx8IG9wdHMuZWxlbWVudDtcbiAgcmV0dXJuIGF3YWl0IHRoaXMucHJveHlDb21tYW5kKGAvd2RhL2VsZW1lbnQvJHtlbH0vdHdvRmluZ2VyVGFwYCwgJ1BPU1QnKTtcbn07XG5cbmhlbHBlcnMubW9iaWxlVG91Y2hBbmRIb2xkID0gYXN5bmMgZnVuY3Rpb24gKG9wdHM9e30pIHtcbiAgbGV0IHBhcmFtcyA9IHtcbiAgICBkdXJhdGlvbjogcGFyc2VGbG9hdFBhcmFtZXRlcignZHVyYXRpb24nLCBvcHRzLmR1cmF0aW9uLCAndG91Y2hBbmRIb2xkJylcbiAgfTtcbiAgaWYgKG9wdHMuZWxlbWVudCkge1xuICAgIC8vIExvbmcgdGFwIGVsZW1lbnRcbiAgICBjb25zdCBlbCA9IG9wdHMuZWxlbWVudC5FTEVNRU5UIHx8IG9wdHMuZWxlbWVudDtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoYC93ZGEvZWxlbWVudC8ke2VsfS90b3VjaEFuZEhvbGRgLCAnUE9TVCcsIHBhcmFtcyk7XG4gIH1cbiAgLy8gTG9uZyB0YXAgY29vcmRpbmF0ZXNcbiAgcGFyYW1zLnggPSBwYXJzZUZsb2F0UGFyYW1ldGVyKCd4Jywgb3B0cy54LCAndG91Y2hBbmRIb2xkJyk7XG4gIHBhcmFtcy55ID0gcGFyc2VGbG9hdFBhcmFtZXRlcigneScsIG9wdHMueSwgJ3RvdWNoQW5kSG9sZCcpO1xuICByZXR1cm4gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoJy93ZGEvdG91Y2hBbmRIb2xkJywgJ1BPU1QnLCBwYXJhbXMpO1xufTtcblxuaGVscGVycy5tb2JpbGVUYXAgPSBhc3luYyBmdW5jdGlvbiAob3B0cz17fSkge1xuICBjb25zdCBwYXJhbXMgPSB7XG4gICAgeDogcGFyc2VGbG9hdFBhcmFtZXRlcigneCcsIG9wdHMueCwgJ3RhcCcpLFxuICAgIHk6IHBhcnNlRmxvYXRQYXJhbWV0ZXIoJ3knLCBvcHRzLnksICd0YXAnKVxuICB9O1xuICBjb25zdCBlbCA9IG9wdHMuZWxlbWVudCA/IChvcHRzLmVsZW1lbnQuRUxFTUVOVCB8fCBvcHRzLmVsZW1lbnQpIDogJzAnO1xuICByZXR1cm4gYXdhaXQgdGhpcy5wcm94eUNvbW1hbmQoYC93ZGEvdGFwLyR7ZWx9YCwgJ1BPU1QnLCBwYXJhbXMpO1xufTtcblxuaGVscGVycy5tb2JpbGVEcmFnRnJvbVRvRm9yRHVyYXRpb24gPSBhc3luYyBmdW5jdGlvbiAob3B0cz17fSkge1xuICBjb25zdCBwYXJhbXMgPSB7XG4gICAgZHVyYXRpb246IHBhcnNlRmxvYXRQYXJhbWV0ZXIoJ2R1cmF0aW9uJywgb3B0cy5kdXJhdGlvbiwgJ2RyYWdGcm9tVG9Gb3JEdXJhdGlvbicpLFxuICAgIGZyb21YOiBwYXJzZUZsb2F0UGFyYW1ldGVyKCdmcm9tWCcsIG9wdHMuZnJvbVgsICdkcmFnRnJvbVRvRm9yRHVyYXRpb24nKSxcbiAgICBmcm9tWTogcGFyc2VGbG9hdFBhcmFtZXRlcignZnJvbVknLCBvcHRzLmZyb21ZLCAnZHJhZ0Zyb21Ub0ZvckR1cmF0aW9uJyksXG4gICAgdG9YOiBwYXJzZUZsb2F0UGFyYW1ldGVyKCd0b1gnLCBvcHRzLnRvWCwgJ2RyYWdGcm9tVG9Gb3JEdXJhdGlvbicpLFxuICAgIHRvWTogcGFyc2VGbG9hdFBhcmFtZXRlcigndG9ZJywgb3B0cy50b1ksICdkcmFnRnJvbVRvRm9yRHVyYXRpb24nKVxuICB9O1xuICBpZiAob3B0cy5lbGVtZW50KSB7XG4gICAgLy8gRHJhZyBlbGVtZW50XG4gICAgY29uc3QgZWwgPSBvcHRzLmVsZW1lbnQuRUxFTUVOVCB8fCBvcHRzLmVsZW1lbnQ7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMucHJveHlDb21tYW5kKGAvd2RhL2VsZW1lbnQvJHtlbH0vZHJhZ2Zyb210b2ZvcmR1cmF0aW9uYCwgJ1BPU1QnLCBwYXJhbXMpO1xuICB9XG4gIC8vIERyYWcgY29vcmRpbmF0ZXNcbiAgcmV0dXJuIGF3YWl0IHRoaXMucHJveHlDb21tYW5kKCcvd2RhL2RyYWdmcm9tdG9mb3JkdXJhdGlvbicsICdQT1NUJywgcGFyYW1zKTtcbn07XG5cbmhlbHBlcnMubW9iaWxlU2VsZWN0UGlja2VyV2hlZWxWYWx1ZSA9IGFzeW5jIGZ1bmN0aW9uIChvcHRzPXt9KSB7XG4gIGlmICghb3B0cy5lbGVtZW50KSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coJ0VsZW1lbnQgaWQgaXMgZXhwZWN0ZWQgdG8gYmUgc2V0IGZvciBzZWxlY3RQaWNrZXJXaGVlbFZhbHVlIG1ldGhvZCcpO1xuICB9XG4gIGlmICghXy5pc1N0cmluZyhvcHRzLm9yZGVyKSB8fCBbJ25leHQnLCAncHJldmlvdXMnXS5pbmRleE9mKG9wdHMub3JkZXIudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYFRoZSBtYW5kYXRvcnkgXCJvcmRlclwiIHBhcmFtZXRlciBpcyBleHBlY3RlZCB0byBiZSBlcXVhbCBlaXRoZXIgdG8gJ25leHQnIG9yICdwcmV2aW91cycuIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGAnJHtvcHRzLm9yZGVyfScgaXMgZ2l2ZW4gaW5zdGVhZGApO1xuICB9XG4gIGNvbnN0IGVsID0gb3B0cy5lbGVtZW50LkVMRU1FTlQgfHwgb3B0cy5lbGVtZW50O1xuICBjb25zdCBwYXJhbXMgPSB7b3JkZXI6IG9wdHMub3JkZXJ9O1xuICBpZiAob3B0cy5vZmZzZXQpIHtcbiAgICBwYXJhbXMub2Zmc2V0ID0gcGFyc2VGbG9hdFBhcmFtZXRlcignb2Zmc2V0Jywgb3B0cy5vZmZzZXQsICdzZWxlY3RQaWNrZXJXaGVlbFZhbHVlJyk7XG4gIH1cbiAgcmV0dXJuIGF3YWl0IHRoaXMucHJveHlDb21tYW5kKGAvd2RhL3BpY2tlcndoZWVsLyR7ZWx9L3NlbGVjdGAsICdQT1NUJywgcGFyYW1zKTtcbn07XG5cbmhlbHBlcnMuZ2V0Q29vcmRpbmF0ZXMgPSBhc3luYyBmdW5jdGlvbiAoZ2VzdHVyZSkge1xuICBsZXQgZWwgPSBnZXN0dXJlLm9wdGlvbnMuZWxlbWVudDtcblxuICAvLyBkZWZhdWx0c1xuICBsZXQgY29vcmRpbmF0ZXMgPSB7eDogMCwgeTogMCwgYXJlT2Zmc2V0czogZmFsc2V9O1xuXG4gIGxldCBvcHRpb25YID0gbnVsbDtcbiAgaWYgKGdlc3R1cmUub3B0aW9ucy54KSB7XG4gICAgb3B0aW9uWCA9IHBhcnNlRmxvYXRQYXJhbWV0ZXIoJ3gnLCBnZXN0dXJlLm9wdGlvbnMueCwgJ2dldENvb3JkaW5hdGVzJyk7XG4gIH1cbiAgbGV0IG9wdGlvblkgPSBudWxsO1xuICBpZiAoZ2VzdHVyZS5vcHRpb25zLnkpIHtcbiAgICBvcHRpb25ZID0gcGFyc2VGbG9hdFBhcmFtZXRlcigneScsIGdlc3R1cmUub3B0aW9ucy55LCAnZ2V0Q29vcmRpbmF0ZXMnKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgdGhlIGVsZW1lbnQgY29vcmRpbmF0ZXMuXG4gIGlmIChlbCkge1xuICAgIGxldCByZWN0ID0gYXdhaXQgdGhpcy5nZXRSZWN0KGVsKTtcbiAgICBsZXQgcG9zID0ge3g6IHJlY3QueCwgeTogcmVjdC55fTtcbiAgICBsZXQgc2l6ZSA9IHt3OiByZWN0LndpZHRoLCBoOiByZWN0LmhlaWdodH07XG5cbiAgICAvLyBkZWZhdWx0c1xuICAgIGxldCBvZmZzZXRYID0gMDtcbiAgICBsZXQgb2Zmc2V0WSA9IDA7XG5cbiAgICAvLyBnZXQgdGhlIHJlYWwgb2Zmc2V0c1xuICAgIGlmIChvcHRpb25YIHx8IG9wdGlvblkpIHtcbiAgICAgIG9mZnNldFggPSAob3B0aW9uWCB8fCAwKTtcbiAgICAgIG9mZnNldFkgPSAob3B0aW9uWSB8fCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2Zmc2V0WCA9IChzaXplLncgLyAyKTtcbiAgICAgIG9mZnNldFkgPSAoc2l6ZS5oIC8gMik7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgdGhlIG9mZnNldHNcbiAgICBjb29yZGluYXRlcy54ID0gcG9zLnggKyBvZmZzZXRYO1xuICAgIGNvb3JkaW5hdGVzLnkgPSBwb3MueSArIG9mZnNldFk7XG4gIH0gZWxzZSB7XG4gICAgLy8gbW92ZVRvIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWQgaW4gYXMgb2Zmc2V0c1xuICAgIGNvb3JkaW5hdGVzLmFyZU9mZnNldHMgPSAoZ2VzdHVyZS5hY3Rpb24gPT09ICdtb3ZlVG8nKTtcbiAgICBjb29yZGluYXRlcy54ID0gKG9wdGlvblggfHwgMCk7XG4gICAgY29vcmRpbmF0ZXMueSA9IChvcHRpb25ZIHx8IDApO1xuICB9XG4gIHJldHVybiBjb29yZGluYXRlcztcbn07XG5cbmhlbHBlcnMuYXBwbHlNb3ZlVG9PZmZzZXQgPSBmdW5jdGlvbiAoZmlyc3RDb29yZGluYXRlcywgc2Vjb25kQ29vcmRpbmF0ZXMpIHtcbiAgaWYgKHNlY29uZENvb3JkaW5hdGVzLmFyZU9mZnNldHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogZmlyc3RDb29yZGluYXRlcy54ICsgc2Vjb25kQ29vcmRpbmF0ZXMueCxcbiAgICAgIHk6IGZpcnN0Q29vcmRpbmF0ZXMueSArIHNlY29uZENvb3JkaW5hdGVzLnksXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc2Vjb25kQ29vcmRpbmF0ZXM7XG4gIH1cbn07XG5cbk9iamVjdC5hc3NpZ24oZXh0ZW5zaW9ucywgaGVscGVycywgY29tbWFuZHMpO1xuZXhwb3J0IHsgZXh0ZW5zaW9ucywgaGVscGVycywgY29tbWFuZHMsIGdlc3R1cmVzQ2hhaW5Ub1N0cmluZyB9O1xuZXhwb3J0IGRlZmF1bHQgZXh0ZW5zaW9ucztcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
