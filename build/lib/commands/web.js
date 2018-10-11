'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _appiumIosDriver = require('appium-ios-driver');

var _asyncbox = require('asyncbox');

var _appiumSupport = require('appium-support');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var IPHONE_EXTRA_WEB_COORD_SCROLL_OFFSET = -15;
var IPHONE_EXTRA_WEB_COORD_NON_SCROLL_OFFSET = 10;
var IPHONE_WEB_COORD_OFFSET = -10;
var IPHONE_WEB_COORD_SMART_APP_BANNER_OFFSET = 84;
var IPHONE_X_EXTRA_WEB_COORD_SCROLL_OFFSET = -90;
var IPHONE_X_EXTRA_WEB_COORD_NON_SCROLL_OFFSET = -10;
var IPHONE_X_WEB_COORD_OFFSET = 40;
var IPAD_EXTRA_WEB_COORD_SCROLL_OFFSET = -10;
var IPAD_EXTRA_WEB_COORD_NON_SCROLL_OFFSET = 0;
var IPAD_WEB_COORD_OFFSET = 10;
var IPAD_WEB_COORD_SMART_APP_BANNER_OFFSET = 95;

var IPHONE_X_WIDTH = 375;
var IPHONE_X_HEIGHT = 812;

var ATOM_WAIT_TIMEOUT = 5 * 60000;

var extensions = {};

_Object$assign(extensions, _appiumIosDriver.iosCommands.web);

extensions.getSafariIsIphone = function getSafariIsIphone() {
  var userAgent;
  return _regeneratorRuntime.async(function getSafariIsIphone$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.execute('return navigator.userAgent'));

      case 3:
        userAgent = context$1$0.sent;
        return context$1$0.abrupt('return', userAgent.toLowerCase().includes('iphone'));

      case 7:
        context$1$0.prev = 7;
        context$1$0.t0 = context$1$0['catch'](0);

        _logger2['default'].warn('Unable to find device type from useragent. Assuming iPhone');
        _logger2['default'].debug('Error: ' + context$1$0.t0.message);

      case 11:
        return context$1$0.abrupt('return', true);

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 7]]);
};

extensions.getSafariIsIphoneX = function getSafariIsIphone() {
  var script, _ref, height, width;

  return _regeneratorRuntime.async(function getSafariIsIphone$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        script = 'return {height: window.screen.availHeight, width: window.screen.availWidth};';
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.execute(script));

      case 4:
        _ref = context$1$0.sent;
        height = _ref.height;
        width = _ref.width;
        return context$1$0.abrupt('return', height === IPHONE_X_HEIGHT && width === IPHONE_X_WIDTH || height === IPHONE_X_WIDTH && width === IPHONE_X_HEIGHT);

      case 10:
        context$1$0.prev = 10;
        context$1$0.t0 = context$1$0['catch'](0);

        _logger2['default'].warn('Unable to find device type from useragent. Assuming not iPhone X');
        _logger2['default'].debug('Error: ' + context$1$0.t0.message);

      case 14:
        return context$1$0.abrupt('return', false);

      case 15:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 10]]);
};

var getElementHeightMemoized = _lodash2['default'].memoize(function callee$0$0(key, driver, el) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        el = _appiumSupport.util.unwrapElement(el);
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(driver.getNativeRect(el));

      case 3:
        return context$1$0.abrupt('return', context$1$0.sent.height);

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
});

extensions.getExtraTranslateWebCoordsOffset = function callee$0$0(coords, webviewRect) {
  var offset, implicitWaitMs, isIphone, isIphoneX, el;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        offset = 0;
        implicitWaitMs = this.implicitWaitMs;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.getSafariIsIphone());

      case 4:
        isIphone = context$1$0.sent;
        context$1$0.t0 = isIphone;

        if (!context$1$0.t0) {
          context$1$0.next = 10;
          break;
        }

        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(this.getSafariIsIphoneX());

      case 9:
        context$1$0.t0 = context$1$0.sent;

      case 10:
        isIphoneX = context$1$0.t0;
        context$1$0.prev = 11;

        this.setImplicitWait(0);

        // check if the full url bar is up
        context$1$0.next = 15;
        return _regeneratorRuntime.awrap(this.findNativeElementOrElements('accessibility id', 'ReloadButton', false));

      case 15:

        // reload button found, which means scrolling has not happened
        if (isIphoneX) {
          offset += IPHONE_X_EXTRA_WEB_COORD_NON_SCROLL_OFFSET;
        } else if (isIphone) {
          offset += IPHONE_EXTRA_WEB_COORD_NON_SCROLL_OFFSET;
        } else {
          offset += IPAD_EXTRA_WEB_COORD_NON_SCROLL_OFFSET;
        }
        context$1$0.next = 31;
        break;

      case 18:
        context$1$0.prev = 18;
        context$1$0.t1 = context$1$0['catch'](11);
        context$1$0.prev = 20;
        context$1$0.next = 23;
        return _regeneratorRuntime.awrap(this.findNativeElementOrElements('accessibility id', 'URL', false));

      case 23:
        el = context$1$0.sent;
        context$1$0.next = 26;
        return _regeneratorRuntime.awrap(getElementHeightMemoized('URLBar', this, el));

      case 26:
        offset -= context$1$0.sent;
        context$1$0.next = 31;
        break;

      case 29:
        context$1$0.prev = 29;
        context$1$0.t2 = context$1$0['catch'](20);

      case 31:
        context$1$0.prev = 31;

        // return implicit wait to what it was
        this.setImplicitWait(implicitWaitMs);
        return context$1$0.finish(31);

      case 34:

        if (coords.y > webviewRect.height) {
          // when scrolling has happened, there is a tick more offset needed
          if (isIphoneX) {
            offset += IPHONE_X_EXTRA_WEB_COORD_SCROLL_OFFSET;
          } else if (isIphone) {
            offset += IPHONE_EXTRA_WEB_COORD_SCROLL_OFFSET;
          } else {
            offset += IPAD_EXTRA_WEB_COORD_SCROLL_OFFSET;
          }
        }

        // extra offset necessary
        offset += isIphone ? IPHONE_WEB_COORD_OFFSET : IPAD_WEB_COORD_OFFSET;

        offset += isIphoneX ? IPHONE_X_WEB_COORD_OFFSET : 0;

        _logger2['default'].debug('Extra translated web coordinates offset: ' + offset);
        return context$1$0.abrupt('return', offset);

      case 39:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[11, 18, 31, 34], [20, 29]]);
};

extensions.getExtraNativeWebTapOffset = function callee$0$0() {
  var offset, implicitWaitMs, el;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        offset = 0;
        implicitWaitMs = this.implicitWaitMs;
        context$1$0.prev = 2;

        this.setImplicitWait(0);

        // first try to get tab offset
        context$1$0.prev = 4;
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(this.findNativeElementOrElements('-ios predicate string', 'name LIKE \'*, Tab\' AND visible = 1', false));

      case 7:
        el = context$1$0.sent;
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(getElementHeightMemoized('TabBar', this, el));

      case 10:
        offset += context$1$0.sent;
        context$1$0.next = 15;
        break;

      case 13:
        context$1$0.prev = 13;
        context$1$0.t0 = context$1$0['catch'](4);

      case 15:
        context$1$0.prev = 15;
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap(this.findNativeElementOrElements('accessibility id', 'Close app download offer', false));

      case 18:
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap(this.getSafariIsIphone());

      case 20:
        if (!context$1$0.sent) {
          context$1$0.next = 24;
          break;
        }

        context$1$0.t1 = IPHONE_WEB_COORD_SMART_APP_BANNER_OFFSET;
        context$1$0.next = 25;
        break;

      case 24:
        context$1$0.t1 = IPAD_WEB_COORD_SMART_APP_BANNER_OFFSET;

      case 25:
        offset += context$1$0.t1;
        context$1$0.next = 30;
        break;

      case 28:
        context$1$0.prev = 28;
        context$1$0.t2 = context$1$0['catch'](15);

      case 30:
        context$1$0.prev = 30;

        // return implicit wait to what it was
        this.setImplicitWait(implicitWaitMs);
        return context$1$0.finish(30);

      case 33:

        _logger2['default'].debug('Additional native web tap offset computed: ' + offset);
        return context$1$0.abrupt('return', offset);

      case 35:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[2,, 30, 33], [4, 13], [15, 28]]);
};

function tapWebElementNatively(driver, atomsElement) {
  var text, el, rect, coords;
  return _regeneratorRuntime.async(function tapWebElementNatively$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(driver.executeAtom('get_text', [atomsElement]));

      case 3:
        text = context$1$0.sent;

        if (text) {
          context$1$0.next = 8;
          break;
        }

        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(driver.executeAtom('get_attribute_value', [atomsElement, 'value']));

      case 7:
        text = context$1$0.sent;

      case 8:
        if (!text) {
          context$1$0.next = 19;
          break;
        }

        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(driver.findNativeElementOrElements('accessibility id', text, false));

      case 11:
        el = context$1$0.sent;
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(driver.proxyCommand('/element/' + el.ELEMENT + '/rect', 'GET'));

      case 14:
        rect = context$1$0.sent;
        coords = {
          x: Math.round(rect.x + rect.width / 2),
          y: Math.round(rect.y + rect.height / 2)
        };
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap(driver.clickCoords(coords));

      case 18:
        return context$1$0.abrupt('return', true);

      case 19:
        context$1$0.next = 24;
        break;

      case 21:
        context$1$0.prev = 21;
        context$1$0.t0 = context$1$0['catch'](0);

        // any failure should fall through and trigger the more elaborate
        // method of clicking
        _logger2['default'].warn('Error attempting to click: ' + context$1$0.t0.message);

      case 24:
        return context$1$0.abrupt('return', false);

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 21]]);
}

extensions.nativeWebTap = function callee$0$0(el) {
  var atomsElement, _ref2, width, height, _ref3, x, y;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        atomsElement = this.useAtomsElement(el);
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(tapWebElementNatively(this, atomsElement));

      case 3:
        if (!context$1$0.sent) {
          context$1$0.next = 5;
          break;
        }

        return context$1$0.abrupt('return');

      case 5:
        _logger2['default'].warn('Unable to do simple native web tap. Attempting to convert coordinates');

        // `get_top_left_coordinates` returns the wrong value sometimes,
        // unless we pre-call both of these functions before the actual calls
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(this.executeAtom('get_size', [atomsElement]));

      case 8:
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(this.executeAtom('get_top_left_coordinates', [atomsElement]));

      case 10:
        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(this.executeAtom('get_size', [atomsElement]));

      case 12:
        _ref2 = context$1$0.sent;
        width = _ref2.width;
        height = _ref2.height;
        context$1$0.next = 17;
        return _regeneratorRuntime.awrap(this.executeAtom('get_top_left_coordinates', [atomsElement]));

      case 17:
        _ref3 = context$1$0.sent;
        x = _ref3.x;
        y = _ref3.y;

        x += width / 2;
        y += height / 2;

        this.curWebCoords = { x: x, y: y };
        context$1$0.next = 25;
        return _regeneratorRuntime.awrap(this.clickWebCoords());

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

extensions.clickCoords = function callee$0$0(coords) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this.performTouch([{
          action: 'tap',
          options: coords
        }]));

      case 2:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

extensions.translateWebCoords = function callee$0$0(coords) {
  var implicitWaitMs, webview, rect, wvPos, realDims, cmd, wvDims, urlBarHeight, realDimensionHeight, yOffset, xRatio, yRatio, newCoords;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Translating coordinates (' + JSON.stringify(coords) + ') to web coordinates');

        // absolutize web coords
        implicitWaitMs = this.implicitWaitMs;
        webview = undefined;
        context$1$0.prev = 3;

        this.setImplicitWait(0);
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(5, 100, function callee$1$0() {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap(this.findNativeElementOrElements('-ios predicate string', 'type = \'XCUIElementTypeWebView\' AND visible = 1', false));

              case 2:
                return context$2$0.abrupt('return', context$2$0.sent);

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        }));

      case 7:
        webview = context$1$0.sent;

      case 8:
        context$1$0.prev = 8;

        this.setImplicitWait(implicitWaitMs);
        return context$1$0.finish(8);

      case 11:

        webview = _appiumSupport.util.unwrapElement(webview);
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(this.proxyCommand('/element/' + webview + '/rect', 'GET'));

      case 14:
        rect = context$1$0.sent;
        wvPos = { x: rect.x, y: rect.y };
        realDims = { w: rect.width, h: rect.height };
        cmd = '(function () { return {w: document.documentElement.clientWidth, h: document.documentElement.clientHeight}; })()';
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap(this.remote.execute(cmd));

      case 20:
        wvDims = context$1$0.sent;
        urlBarHeight = 64;

        wvPos.y += urlBarHeight;

        realDimensionHeight = 108;

        realDims.h -= realDimensionHeight;

        // add static offset for safari in landscape mode
        yOffset = this.opts.curOrientation === 'LANDSCAPE' ? this.landscapeWebCoordsOffset : 0;
        context$1$0.next = 28;
        return _regeneratorRuntime.awrap(this.getExtraNativeWebTapOffset());

      case 28:
        yOffset += context$1$0.sent;
        context$1$0.next = 31;
        return _regeneratorRuntime.awrap(this.getExtraTranslateWebCoordsOffset(coords, rect));

      case 31:
        coords.y += context$1$0.sent;

        if (!(wvDims && realDims && wvPos)) {
          context$1$0.next = 46;
          break;
        }

        xRatio = realDims.w / wvDims.w;
        yRatio = realDims.h / wvDims.h;
        newCoords = {
          x: wvPos.x + Math.round(xRatio * coords.x),
          y: wvPos.y + yOffset + Math.round(yRatio * coords.y)
        };

        // additional logging for coordinates, since it is sometimes broken
        //   see https://github.com/appium/appium/issues/9159
        _logger2['default'].debug('Converted coordinates: ' + JSON.stringify(newCoords));
        _logger2['default'].debug('    rect: ' + JSON.stringify(rect));
        _logger2['default'].debug('    wvPos: ' + JSON.stringify(wvPos));
        _logger2['default'].debug('    realDims: ' + JSON.stringify(realDims));
        _logger2['default'].debug('    wvDims: ' + JSON.stringify(wvDims));
        _logger2['default'].debug('    xRatio: ' + JSON.stringify(xRatio));
        _logger2['default'].debug('    yRatio: ' + JSON.stringify(yRatio));
        _logger2['default'].debug('    yOffset: ' + JSON.stringify(yOffset));

        _logger2['default'].debug('Converted web coords ' + JSON.stringify(coords) + ' ' + ('into real coords ' + JSON.stringify(newCoords)));
        return context$1$0.abrupt('return', newCoords);

      case 46:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[3,, 8, 11]]);
};

extensions.checkForAlert = function callee$0$0() {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        return context$1$0.abrupt('return', false);

      case 1:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

extensions.waitForAtom = function callee$0$0(promise) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.t0 = this;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_bluebird2['default'].resolve(promise).timeout(ATOM_WAIT_TIMEOUT));

      case 4:
        context$1$0.t1 = context$1$0.sent;
        return context$1$0.abrupt('return', context$1$0.t0.parseExecuteResponse.call(context$1$0.t0, context$1$0.t1));

      case 8:
        context$1$0.prev = 8;
        context$1$0.t2 = context$1$0['catch'](0);

        if (!(context$1$0.t2 instanceof _bluebird2['default'].TimeoutError)) {
          context$1$0.next = 12;
          break;
        }

        throw new Error('Did not get any response after ' + ATOM_WAIT_TIMEOUT / 1000 + 's');

      case 12:
        throw context$1$0.t2;

      case 13:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 8]]);
};

exports['default'] = extensions;
module.exports = exports['default'];

// check for the correct height and width

// keep track of implicit wait, and set locally to 0

// no reload button, which indicates scrolling has happened
// the URL bar may or may not be visible

// no URL elements found, so continue

// keep track of implicit wait, and set locally to 0

// no element found, so no tabs and no need to deal with offset

// next try to see if there is an Smart App Banner

// no smart app banner found, so continue

// try to get the text of the element, which will be accessible in the
// native context

// use tap because on iOS 11.2 and below `nativeClick` crashes WDA

// TODO: investigate where these come from. They appear to be constants in my tests

// add extra offset for possible extra things in the top of the page
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy93ZWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OytCQUE0QixtQkFBbUI7O3dCQUNqQixVQUFVOzs2QkFDbkIsZ0JBQWdCOztzQkFDckIsV0FBVzs7OztzQkFDYixRQUFROzs7O3dCQUNSLFVBQVU7Ozs7QUFHeEIsSUFBTSxvQ0FBb0MsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNqRCxJQUFNLHdDQUF3QyxHQUFHLEVBQUUsQ0FBQztBQUNwRCxJQUFNLHVCQUF1QixHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3BDLElBQU0sd0NBQXdDLEdBQUcsRUFBRSxDQUFDO0FBQ3BELElBQU0sc0NBQXNDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDbkQsSUFBTSwwQ0FBMEMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUN2RCxJQUFNLHlCQUF5QixHQUFHLEVBQUUsQ0FBQztBQUNyQyxJQUFNLGtDQUFrQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQy9DLElBQU0sc0NBQXNDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pELElBQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDO0FBQ2pDLElBQU0sc0NBQXNDLEdBQUcsRUFBRSxDQUFDOztBQUVsRCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFDM0IsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDOztBQUU1QixJQUFNLGlCQUFpQixHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7O0FBRXBDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsZUFBYyxVQUFVLEVBQUUsNkJBQVksR0FBRyxDQUFDLENBQUM7O0FBSTNDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxTQUFlLGlCQUFpQjtNQUVyRCxTQUFTOzs7Ozs7eUNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQzs7O0FBQTVELGlCQUFTOzRDQUNSLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDOzs7Ozs7QUFFakQsNEJBQUksSUFBSSw4REFBOEQsQ0FBQztBQUN2RSw0QkFBSSxLQUFLLGFBQVcsZUFBSSxPQUFPLENBQUcsQ0FBQzs7OzRDQUU5QixJQUFJOzs7Ozs7O0NBQ1osQ0FBQzs7QUFFRixVQUFVLENBQUMsa0JBQWtCLEdBQUcsU0FBZSxpQkFBaUI7TUFFdEQsTUFBTSxRQUNMLE1BQU0sRUFBRSxLQUFLOzs7Ozs7QUFEZCxjQUFNLEdBQUcsOEVBQThFOzt5Q0FDL0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Ozs7QUFBM0MsY0FBTSxRQUFOLE1BQU07QUFBRSxhQUFLLFFBQUwsS0FBSzs0Q0FFYixBQUFDLE1BQU0sS0FBSyxlQUFlLElBQUksS0FBSyxLQUFLLGNBQWMsSUFDdEQsTUFBTSxLQUFLLGNBQWMsSUFBSSxLQUFLLEtBQUssZUFBZSxBQUFDOzs7Ozs7QUFFL0QsNEJBQUksSUFBSSxvRUFBb0UsQ0FBQztBQUM3RSw0QkFBSSxLQUFLLGFBQVcsZUFBSSxPQUFPLENBQUcsQ0FBQzs7OzRDQUU5QixLQUFLOzs7Ozs7O0NBQ2IsQ0FBQzs7QUFFRixJQUFNLHdCQUF3QixHQUFHLG9CQUFFLE9BQU8sQ0FBQyxvQkFBZ0IsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFOzs7O0FBQ3hFLFVBQUUsR0FBRyxvQkFBSyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7O3lDQUNkLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDOzs7NkRBQUUsTUFBTTs7Ozs7OztDQUMvQyxDQUFDLENBQUM7O0FBRUgsVUFBVSxDQUFDLGdDQUFnQyxHQUFHLG9CQUFnQixNQUFNLEVBQUUsV0FBVztNQUMzRSxNQUFNLEVBR0osY0FBYyxFQUVkLFFBQVEsRUFDUixTQUFTLEVBb0JMLEVBQUU7Ozs7QUExQlIsY0FBTSxHQUFHLENBQUM7QUFHUixzQkFBYyxHQUFHLElBQUksQ0FBQyxjQUFjOzt5Q0FFbkIsSUFBSSxDQUFDLGlCQUFpQixFQUFFOzs7QUFBekMsZ0JBQVE7eUJBQ0ksUUFBUTs7Ozs7Ozs7eUNBQVUsSUFBSSxDQUFDLGtCQUFrQixFQUFFOzs7Ozs7QUFBdkQsaUJBQVM7OztBQUdiLFlBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7eUNBR2xCLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDOzs7OztBQUdqRixZQUFJLFNBQVMsRUFBRTtBQUNiLGdCQUFNLElBQUksMENBQTBDLENBQUM7U0FDdEQsTUFBTSxJQUFJLFFBQVEsRUFBRTtBQUNuQixnQkFBTSxJQUFJLHdDQUF3QyxDQUFDO1NBQ3BELE1BQU07QUFDTCxnQkFBTSxJQUFJLHNDQUFzQyxDQUFDO1NBQ2xEOzs7Ozs7Ozs7eUNBS2tCLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDOzs7QUFBN0UsVUFBRTs7eUNBQ1Esd0JBQXdCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7OztBQUE1RCxjQUFNOzs7Ozs7Ozs7Ozs7QUFNUixZQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDOzs7OztBQUd2QyxZQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRTs7QUFFakMsY0FBSSxTQUFTLEVBQUU7QUFDYixrQkFBTSxJQUFJLHNDQUFzQyxDQUFDO1dBQ2xELE1BQU0sSUFBSSxRQUFRLEVBQUU7QUFDbkIsa0JBQU0sSUFBSSxvQ0FBb0MsQ0FBQztXQUNoRCxNQUFNO0FBQ0wsa0JBQU0sSUFBSSxrQ0FBa0MsQ0FBQztXQUM5QztTQUNGOzs7QUFHRCxjQUFNLElBQUksUUFBUSxHQUFHLHVCQUF1QixHQUFHLHFCQUFxQixDQUFDOztBQUVyRSxjQUFNLElBQUksU0FBUyxHQUFHLHlCQUF5QixHQUFHLENBQUMsQ0FBQzs7QUFFcEQsNEJBQUksS0FBSywrQ0FBNkMsTUFBTSxDQUFHLENBQUM7NENBQ3pELE1BQU07Ozs7Ozs7Q0FDZCxDQUFDOztBQUVGLFVBQVUsQ0FBQywwQkFBMEIsR0FBRztNQUNsQyxNQUFNLEVBR0osY0FBYyxFQU1WLEVBQUU7Ozs7QUFUUixjQUFNLEdBQUcsQ0FBQztBQUdSLHNCQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWM7OztBQUV4QyxZQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozt5Q0FJTCxJQUFJLENBQUMsMkJBQTJCLENBQUMsdUJBQXVCLDBDQUF3QyxLQUFLLENBQUM7OztBQUFqSCxVQUFFOzt5Q0FDUSx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQzs7O0FBQTVELGNBQU07Ozs7Ozs7Ozs7O3lDQU9BLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxrQkFBa0IsRUFBRSwwQkFBMEIsRUFBRSxLQUFLLENBQUM7Ozs7eUNBQzdFLElBQUksQ0FBQyxpQkFBaUIsRUFBRTs7Ozs7Ozs7eUJBQ3RDLHdDQUF3Qzs7Ozs7eUJBQ3hDLHNDQUFzQzs7O0FBRnhDLGNBQU07Ozs7Ozs7Ozs7OztBQVFSLFlBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7Ozs7O0FBR3ZDLDRCQUFJLEtBQUssaURBQStDLE1BQU0sQ0FBRyxDQUFDOzRDQUMzRCxNQUFNOzs7Ozs7O0NBQ2QsQ0FBQzs7QUFFRixTQUFlLHFCQUFxQixDQUFFLE1BQU0sRUFBRSxZQUFZO01BSWxELElBQUksRUFNQSxFQUFFLEVBRUYsSUFBSSxFQUNKLE1BQU07Ozs7Ozt5Q0FURyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7QUFBM0QsWUFBSTs7WUFDSCxJQUFJOzs7Ozs7eUNBQ00sTUFBTSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQzs7O0FBQS9FLFlBQUk7OzthQUdGLElBQUk7Ozs7Ozt5Q0FDVyxNQUFNLENBQUMsMkJBQTJCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQzs7O0FBQTlFLFVBQUU7O3lDQUVXLE1BQU0sQ0FBQyxZQUFZLGVBQWEsRUFBRSxDQUFDLE9BQU8sWUFBUyxLQUFLLENBQUM7OztBQUF0RSxZQUFJO0FBQ0osY0FBTSxHQUFHO0FBQ2IsV0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN0QyxXQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDOzt5Q0FDSyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQzs7OzRDQUN6QixJQUFJOzs7Ozs7Ozs7Ozs7QUFLYiw0QkFBSSxJQUFJLGlDQUErQixlQUFJLE9BQU8sQ0FBRyxDQUFDOzs7NENBRWpELEtBQUs7Ozs7Ozs7Q0FDYjs7QUFFRCxVQUFVLENBQUMsWUFBWSxHQUFHLG9CQUFnQixFQUFFO01BQ3BDLFlBQVksU0FZWCxLQUFLLEVBQUUsTUFBTSxTQUNmLENBQUMsRUFBRSxDQUFDOzs7OztBQWJILG9CQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7O3lDQUVuQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDOzs7Ozs7Ozs7OztBQUduRCw0QkFBSSxJQUFJLENBQUMsdUVBQXVFLENBQUMsQ0FBQzs7Ozs7eUNBSTVFLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7Ozs7eUNBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Ozt5Q0FFcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7OztBQUFuRSxhQUFLLFNBQUwsS0FBSztBQUFFLGNBQU0sU0FBTixNQUFNOzt5Q0FDRCxJQUFJLENBQUMsV0FBVyxDQUFDLDBCQUEwQixFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7Ozs7QUFBMUUsU0FBQyxTQUFELENBQUM7QUFBRSxTQUFDLFNBQUQsQ0FBQzs7QUFDVCxTQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLFNBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUVoQixZQUFJLENBQUMsWUFBWSxHQUFHLEVBQUMsQ0FBQyxFQUFELENBQUMsRUFBRSxDQUFDLEVBQUQsQ0FBQyxFQUFDLENBQUM7O3lDQUNyQixJQUFJLENBQUMsY0FBYyxFQUFFOzs7Ozs7O0NBQzVCLENBQUM7O0FBRUYsVUFBVSxDQUFDLFdBQVcsR0FBRyxvQkFBZ0IsTUFBTTs7Ozs7eUNBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FDdEI7QUFDRSxnQkFBTSxFQUFFLEtBQUs7QUFDYixpQkFBTyxFQUFFLE1BQU07U0FDaEIsQ0FDRixDQUFDOzs7Ozs7O0NBQ0gsQ0FBQzs7QUFFRixVQUFVLENBQUMsa0JBQWtCLEdBQUcsb0JBQWdCLE1BQU07TUFJOUMsY0FBYyxFQUNoQixPQUFPLEVBV0wsSUFBSSxFQUNKLEtBQUssRUFDTCxRQUFRLEVBRVIsR0FBRyxFQUNILE1BQU0sRUFHTixZQUFZLEVBR1osbUJBQW1CLEVBSXJCLE9BQU8sRUFPTCxNQUFNLEVBQ04sTUFBTSxFQUNOLFNBQVM7Ozs7OztBQXZDZiw0QkFBSSxLQUFLLCtCQUE2QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQywwQkFBdUIsQ0FBQzs7O0FBRzlFLHNCQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWM7QUFDdEMsZUFBTzs7O0FBRVQsWUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7eUNBQ1IsNkJBQWMsQ0FBQyxFQUFFLEdBQUcsRUFBRTs7Ozs7aURBQ3ZCLElBQUksQ0FBQywyQkFBMkIsQ0FBQyx1QkFBdUIsdURBQXFELEtBQUssQ0FBQzs7Ozs7Ozs7OztTQUNqSSxDQUFDOzs7QUFGRixlQUFPOzs7OztBQUlQLFlBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7Ozs7O0FBR3ZDLGVBQU8sR0FBRyxvQkFBSyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7O3lDQUNuQixJQUFJLENBQUMsWUFBWSxlQUFhLE9BQU8sWUFBUyxLQUFLLENBQUM7OztBQUFqRSxZQUFJO0FBQ0osYUFBSyxHQUFHLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUM7QUFDOUIsZ0JBQVEsR0FBRyxFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDO0FBRTFDLFdBQUcsR0FBRyxpSEFBaUg7O3lDQUN4RyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7OztBQUF2QyxjQUFNO0FBR04sb0JBQVksR0FBRyxFQUFFOztBQUN2QixhQUFLLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQzs7QUFFbEIsMkJBQW1CLEdBQUcsR0FBRzs7QUFDL0IsZ0JBQVEsQ0FBQyxDQUFDLElBQUksbUJBQW1CLENBQUM7OztBQUc5QixlQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEtBQUssV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxDQUFDOzt5Q0FHekUsSUFBSSxDQUFDLDBCQUEwQixFQUFFOzs7QUFBbEQsZUFBTzs7eUNBQ1csSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7OztBQUFyRSxjQUFNLENBQUMsQ0FBQzs7Y0FFSixNQUFNLElBQUksUUFBUSxJQUFJLEtBQUssQ0FBQTs7Ozs7QUFDekIsY0FBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDOUIsY0FBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDOUIsaUJBQVMsR0FBRztBQUNkLFdBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDMUMsV0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDckQ7Ozs7QUFJRCw0QkFBSSxLQUFLLDZCQUEyQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFHLENBQUM7QUFDakUsNEJBQUksS0FBSyxnQkFBYyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFHLENBQUM7QUFDL0MsNEJBQUksS0FBSyxpQkFBZSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFHLENBQUM7QUFDakQsNEJBQUksS0FBSyxvQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBRyxDQUFDO0FBQ3ZELDRCQUFJLEtBQUssa0JBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUcsQ0FBQztBQUNuRCw0QkFBSSxLQUFLLGtCQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFHLENBQUM7QUFDbkQsNEJBQUksS0FBSyxrQkFBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBRyxDQUFDO0FBQ25ELDRCQUFJLEtBQUssbUJBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUcsQ0FBQzs7QUFFckQsNEJBQUksS0FBSyxDQUFDLDBCQUF3QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxnQ0FDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBRSxDQUFDLENBQUM7NENBQ3BELFNBQVM7Ozs7Ozs7Q0FFbkIsQ0FBQzs7QUFFRixVQUFVLENBQUMsYUFBYSxHQUFHOzs7OzRDQUNsQixLQUFLOzs7Ozs7O0NBQ2IsQ0FBQzs7QUFFRixVQUFVLENBQUMsV0FBVyxHQUFHLG9CQUFnQixPQUFPOzs7Ozt5QkFFckMsSUFBSTs7eUNBQTRCLHNCQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FDdEQsT0FBTyxDQUFDLGlCQUFpQixDQUFDOzs7OzJEQURqQixvQkFBb0I7Ozs7OztjQUc1QiwwQkFBZSxzQkFBRSxZQUFZLENBQUE7Ozs7O2NBQ3pCLElBQUksS0FBSyxxQ0FBbUMsaUJBQWlCLEdBQUcsSUFBSSxPQUFJOzs7Ozs7Ozs7O0NBSW5GLENBQUM7O3FCQUVhLFVBQVUiLCJmaWxlIjoibGliL2NvbW1hbmRzL3dlYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlvc0NvbW1hbmRzIH0gZnJvbSAnYXBwaXVtLWlvcy1kcml2ZXInO1xuaW1wb3J0IHsgcmV0cnlJbnRlcnZhbCB9IGZyb20gJ2FzeW5jYm94JztcbmltcG9ydCB7IHV0aWwgfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEIgZnJvbSAnYmx1ZWJpcmQnO1xuXG5cbmNvbnN0IElQSE9ORV9FWFRSQV9XRUJfQ09PUkRfU0NST0xMX09GRlNFVCA9IC0xNTtcbmNvbnN0IElQSE9ORV9FWFRSQV9XRUJfQ09PUkRfTk9OX1NDUk9MTF9PRkZTRVQgPSAxMDtcbmNvbnN0IElQSE9ORV9XRUJfQ09PUkRfT0ZGU0VUID0gLTEwO1xuY29uc3QgSVBIT05FX1dFQl9DT09SRF9TTUFSVF9BUFBfQkFOTkVSX09GRlNFVCA9IDg0O1xuY29uc3QgSVBIT05FX1hfRVhUUkFfV0VCX0NPT1JEX1NDUk9MTF9PRkZTRVQgPSAtOTA7XG5jb25zdCBJUEhPTkVfWF9FWFRSQV9XRUJfQ09PUkRfTk9OX1NDUk9MTF9PRkZTRVQgPSAtMTA7XG5jb25zdCBJUEhPTkVfWF9XRUJfQ09PUkRfT0ZGU0VUID0gNDA7XG5jb25zdCBJUEFEX0VYVFJBX1dFQl9DT09SRF9TQ1JPTExfT0ZGU0VUID0gLTEwO1xuY29uc3QgSVBBRF9FWFRSQV9XRUJfQ09PUkRfTk9OX1NDUk9MTF9PRkZTRVQgPSAwO1xuY29uc3QgSVBBRF9XRUJfQ09PUkRfT0ZGU0VUID0gMTA7XG5jb25zdCBJUEFEX1dFQl9DT09SRF9TTUFSVF9BUFBfQkFOTkVSX09GRlNFVCA9IDk1O1xuXG5jb25zdCBJUEhPTkVfWF9XSURUSCA9IDM3NTtcbmNvbnN0IElQSE9ORV9YX0hFSUdIVCA9IDgxMjtcblxuY29uc3QgQVRPTV9XQUlUX1RJTUVPVVQgPSA1ICogNjAwMDA7XG5cbmxldCBleHRlbnNpb25zID0ge307XG5cbk9iamVjdC5hc3NpZ24oZXh0ZW5zaW9ucywgaW9zQ29tbWFuZHMud2ViKTtcblxuXG5cbmV4dGVuc2lvbnMuZ2V0U2FmYXJpSXNJcGhvbmUgPSBhc3luYyBmdW5jdGlvbiBnZXRTYWZhcmlJc0lwaG9uZSAoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdXNlckFnZW50ID0gYXdhaXQgdGhpcy5leGVjdXRlKCdyZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudCcpO1xuICAgIHJldHVybiB1c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnaXBob25lJyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy53YXJuKGBVbmFibGUgdG8gZmluZCBkZXZpY2UgdHlwZSBmcm9tIHVzZXJhZ2VudC4gQXNzdW1pbmcgaVBob25lYCk7XG4gICAgbG9nLmRlYnVnKGBFcnJvcjogJHtlcnIubWVzc2FnZX1gKTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmV4dGVuc2lvbnMuZ2V0U2FmYXJpSXNJcGhvbmVYID0gYXN5bmMgZnVuY3Rpb24gZ2V0U2FmYXJpSXNJcGhvbmUgKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHNjcmlwdCA9ICdyZXR1cm4ge2hlaWdodDogd2luZG93LnNjcmVlbi5hdmFpbEhlaWdodCwgd2lkdGg6IHdpbmRvdy5zY3JlZW4uYXZhaWxXaWR0aH07JztcbiAgICBjb25zdCB7aGVpZ2h0LCB3aWR0aH0gPSBhd2FpdCB0aGlzLmV4ZWN1dGUoc2NyaXB0KTtcbiAgICAvLyBjaGVjayBmb3IgdGhlIGNvcnJlY3QgaGVpZ2h0IGFuZCB3aWR0aFxuICAgIHJldHVybiAoaGVpZ2h0ID09PSBJUEhPTkVfWF9IRUlHSFQgJiYgd2lkdGggPT09IElQSE9ORV9YX1dJRFRIKSB8fFxuICAgICAgICAgICAoaGVpZ2h0ID09PSBJUEhPTkVfWF9XSURUSCAmJiB3aWR0aCA9PT0gSVBIT05FX1hfSEVJR0hUKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nLndhcm4oYFVuYWJsZSB0byBmaW5kIGRldmljZSB0eXBlIGZyb20gdXNlcmFnZW50LiBBc3N1bWluZyBub3QgaVBob25lIFhgKTtcbiAgICBsb2cuZGVidWcoYEVycm9yOiAke2Vyci5tZXNzYWdlfWApO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldEVsZW1lbnRIZWlnaHRNZW1vaXplZCA9IF8ubWVtb2l6ZShhc3luYyBmdW5jdGlvbiAoa2V5LCBkcml2ZXIsIGVsKSB7XG4gIGVsID0gdXRpbC51bndyYXBFbGVtZW50KGVsKTtcbiAgcmV0dXJuIChhd2FpdCBkcml2ZXIuZ2V0TmF0aXZlUmVjdChlbCkpLmhlaWdodDtcbn0pO1xuXG5leHRlbnNpb25zLmdldEV4dHJhVHJhbnNsYXRlV2ViQ29vcmRzT2Zmc2V0ID0gYXN5bmMgZnVuY3Rpb24gKGNvb3Jkcywgd2Vidmlld1JlY3QpIHtcbiAgbGV0IG9mZnNldCA9IDA7XG5cbiAgLy8ga2VlcCB0cmFjayBvZiBpbXBsaWNpdCB3YWl0LCBhbmQgc2V0IGxvY2FsbHkgdG8gMFxuICBjb25zdCBpbXBsaWNpdFdhaXRNcyA9IHRoaXMuaW1wbGljaXRXYWl0TXM7XG5cbiAgY29uc3QgaXNJcGhvbmUgPSBhd2FpdCB0aGlzLmdldFNhZmFyaUlzSXBob25lKCk7XG4gIGNvbnN0IGlzSXBob25lWCA9IGlzSXBob25lICYmIGF3YWl0IHRoaXMuZ2V0U2FmYXJpSXNJcGhvbmVYKCk7XG5cbiAgdHJ5IHtcbiAgICB0aGlzLnNldEltcGxpY2l0V2FpdCgwKTtcblxuICAgIC8vIGNoZWNrIGlmIHRoZSBmdWxsIHVybCBiYXIgaXMgdXBcbiAgICBhd2FpdCB0aGlzLmZpbmROYXRpdmVFbGVtZW50T3JFbGVtZW50cygnYWNjZXNzaWJpbGl0eSBpZCcsICdSZWxvYWRCdXR0b24nLCBmYWxzZSk7XG5cbiAgICAvLyByZWxvYWQgYnV0dG9uIGZvdW5kLCB3aGljaCBtZWFucyBzY3JvbGxpbmcgaGFzIG5vdCBoYXBwZW5lZFxuICAgIGlmIChpc0lwaG9uZVgpIHtcbiAgICAgIG9mZnNldCArPSBJUEhPTkVfWF9FWFRSQV9XRUJfQ09PUkRfTk9OX1NDUk9MTF9PRkZTRVQ7XG4gICAgfSBlbHNlIGlmIChpc0lwaG9uZSkge1xuICAgICAgb2Zmc2V0ICs9IElQSE9ORV9FWFRSQV9XRUJfQ09PUkRfTk9OX1NDUk9MTF9PRkZTRVQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9mZnNldCArPSBJUEFEX0VYVFJBX1dFQl9DT09SRF9OT05fU0NST0xMX09GRlNFVDtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIG5vIHJlbG9hZCBidXR0b24sIHdoaWNoIGluZGljYXRlcyBzY3JvbGxpbmcgaGFzIGhhcHBlbmVkXG4gICAgLy8gdGhlIFVSTCBiYXIgbWF5IG9yIG1heSBub3QgYmUgdmlzaWJsZVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbCA9IGF3YWl0IHRoaXMuZmluZE5hdGl2ZUVsZW1lbnRPckVsZW1lbnRzKCdhY2Nlc3NpYmlsaXR5IGlkJywgJ1VSTCcsIGZhbHNlKTtcbiAgICAgIG9mZnNldCAtPSBhd2FpdCBnZXRFbGVtZW50SGVpZ2h0TWVtb2l6ZWQoJ1VSTEJhcicsIHRoaXMsIGVsKTtcbiAgICB9IGNhdGNoIChpZ24pIHtcbiAgICAgIC8vIG5vIFVSTCBlbGVtZW50cyBmb3VuZCwgc28gY29udGludWVcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgLy8gcmV0dXJuIGltcGxpY2l0IHdhaXQgdG8gd2hhdCBpdCB3YXNcbiAgICB0aGlzLnNldEltcGxpY2l0V2FpdChpbXBsaWNpdFdhaXRNcyk7XG4gIH1cblxuICBpZiAoY29vcmRzLnkgPiB3ZWJ2aWV3UmVjdC5oZWlnaHQpIHtcbiAgICAvLyB3aGVuIHNjcm9sbGluZyBoYXMgaGFwcGVuZWQsIHRoZXJlIGlzIGEgdGljayBtb3JlIG9mZnNldCBuZWVkZWRcbiAgICBpZiAoaXNJcGhvbmVYKSB7XG4gICAgICBvZmZzZXQgKz0gSVBIT05FX1hfRVhUUkFfV0VCX0NPT1JEX1NDUk9MTF9PRkZTRVQ7XG4gICAgfSBlbHNlIGlmIChpc0lwaG9uZSkge1xuICAgICAgb2Zmc2V0ICs9IElQSE9ORV9FWFRSQV9XRUJfQ09PUkRfU0NST0xMX09GRlNFVDtcbiAgICB9IGVsc2Uge1xuICAgICAgb2Zmc2V0ICs9IElQQURfRVhUUkFfV0VCX0NPT1JEX1NDUk9MTF9PRkZTRVQ7XG4gICAgfVxuICB9XG5cbiAgLy8gZXh0cmEgb2Zmc2V0IG5lY2Vzc2FyeVxuICBvZmZzZXQgKz0gaXNJcGhvbmUgPyBJUEhPTkVfV0VCX0NPT1JEX09GRlNFVCA6IElQQURfV0VCX0NPT1JEX09GRlNFVDtcblxuICBvZmZzZXQgKz0gaXNJcGhvbmVYID8gSVBIT05FX1hfV0VCX0NPT1JEX09GRlNFVCA6IDA7XG5cbiAgbG9nLmRlYnVnKGBFeHRyYSB0cmFuc2xhdGVkIHdlYiBjb29yZGluYXRlcyBvZmZzZXQ6ICR7b2Zmc2V0fWApO1xuICByZXR1cm4gb2Zmc2V0O1xufTtcblxuZXh0ZW5zaW9ucy5nZXRFeHRyYU5hdGl2ZVdlYlRhcE9mZnNldCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgbGV0IG9mZnNldCA9IDA7XG5cbiAgLy8ga2VlcCB0cmFjayBvZiBpbXBsaWNpdCB3YWl0LCBhbmQgc2V0IGxvY2FsbHkgdG8gMFxuICBjb25zdCBpbXBsaWNpdFdhaXRNcyA9IHRoaXMuaW1wbGljaXRXYWl0TXM7XG4gIHRyeSB7XG4gICAgdGhpcy5zZXRJbXBsaWNpdFdhaXQoMCk7XG5cbiAgICAvLyBmaXJzdCB0cnkgdG8gZ2V0IHRhYiBvZmZzZXRcbiAgICB0cnkge1xuICAgICAgY29uc3QgZWwgPSBhd2FpdCB0aGlzLmZpbmROYXRpdmVFbGVtZW50T3JFbGVtZW50cygnLWlvcyBwcmVkaWNhdGUgc3RyaW5nJywgYG5hbWUgTElLRSAnKiwgVGFiJyBBTkQgdmlzaWJsZSA9IDFgLCBmYWxzZSk7XG4gICAgICBvZmZzZXQgKz0gYXdhaXQgZ2V0RWxlbWVudEhlaWdodE1lbW9pemVkKCdUYWJCYXInLCB0aGlzLCBlbCk7XG4gICAgfSBjYXRjaCAoaWduKSB7XG4gICAgICAvLyBubyBlbGVtZW50IGZvdW5kLCBzbyBubyB0YWJzIGFuZCBubyBuZWVkIHRvIGRlYWwgd2l0aCBvZmZzZXRcbiAgICB9XG5cbiAgICAvLyBuZXh0IHRyeSB0byBzZWUgaWYgdGhlcmUgaXMgYW4gU21hcnQgQXBwIEJhbm5lclxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmZpbmROYXRpdmVFbGVtZW50T3JFbGVtZW50cygnYWNjZXNzaWJpbGl0eSBpZCcsICdDbG9zZSBhcHAgZG93bmxvYWQgb2ZmZXInLCBmYWxzZSk7XG4gICAgICBvZmZzZXQgKz0gYXdhaXQgdGhpcy5nZXRTYWZhcmlJc0lwaG9uZSgpID9cbiAgICAgICAgSVBIT05FX1dFQl9DT09SRF9TTUFSVF9BUFBfQkFOTkVSX09GRlNFVCA6XG4gICAgICAgIElQQURfV0VCX0NPT1JEX1NNQVJUX0FQUF9CQU5ORVJfT0ZGU0VUO1xuICAgIH0gY2F0Y2ggKGlnbikge1xuICAgICAgLy8gbm8gc21hcnQgYXBwIGJhbm5lciBmb3VuZCwgc28gY29udGludWVcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgLy8gcmV0dXJuIGltcGxpY2l0IHdhaXQgdG8gd2hhdCBpdCB3YXNcbiAgICB0aGlzLnNldEltcGxpY2l0V2FpdChpbXBsaWNpdFdhaXRNcyk7XG4gIH1cblxuICBsb2cuZGVidWcoYEFkZGl0aW9uYWwgbmF0aXZlIHdlYiB0YXAgb2Zmc2V0IGNvbXB1dGVkOiAke29mZnNldH1gKTtcbiAgcmV0dXJuIG9mZnNldDtcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHRhcFdlYkVsZW1lbnROYXRpdmVseSAoZHJpdmVyLCBhdG9tc0VsZW1lbnQpIHtcbiAgLy8gdHJ5IHRvIGdldCB0aGUgdGV4dCBvZiB0aGUgZWxlbWVudCwgd2hpY2ggd2lsbCBiZSBhY2Nlc3NpYmxlIGluIHRoZVxuICAvLyBuYXRpdmUgY29udGV4dFxuICB0cnkge1xuICAgIGxldCB0ZXh0ID0gYXdhaXQgZHJpdmVyLmV4ZWN1dGVBdG9tKCdnZXRfdGV4dCcsIFthdG9tc0VsZW1lbnRdKTtcbiAgICBpZiAoIXRleHQpIHtcbiAgICAgIHRleHQgPSBhd2FpdCBkcml2ZXIuZXhlY3V0ZUF0b20oJ2dldF9hdHRyaWJ1dGVfdmFsdWUnLCBbYXRvbXNFbGVtZW50LCAndmFsdWUnXSk7XG4gICAgfVxuXG4gICAgaWYgKHRleHQpIHtcbiAgICAgIGNvbnN0IGVsID0gYXdhaXQgZHJpdmVyLmZpbmROYXRpdmVFbGVtZW50T3JFbGVtZW50cygnYWNjZXNzaWJpbGl0eSBpZCcsIHRleHQsIGZhbHNlKTtcbiAgICAgIC8vIHVzZSB0YXAgYmVjYXVzZSBvbiBpT1MgMTEuMiBhbmQgYmVsb3cgYG5hdGl2ZUNsaWNrYCBjcmFzaGVzIFdEQVxuICAgICAgY29uc3QgcmVjdCA9IGF3YWl0IGRyaXZlci5wcm94eUNvbW1hbmQoYC9lbGVtZW50LyR7ZWwuRUxFTUVOVH0vcmVjdGAsICdHRVQnKTtcbiAgICAgIGNvbnN0IGNvb3JkcyA9IHtcbiAgICAgICAgeDogTWF0aC5yb3VuZChyZWN0LnggKyByZWN0LndpZHRoIC8gMiksXG4gICAgICAgIHk6IE1hdGgucm91bmQocmVjdC55ICsgcmVjdC5oZWlnaHQgLyAyKSxcbiAgICAgIH07XG4gICAgICBhd2FpdCBkcml2ZXIuY2xpY2tDb29yZHMoY29vcmRzKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gYW55IGZhaWx1cmUgc2hvdWxkIGZhbGwgdGhyb3VnaCBhbmQgdHJpZ2dlciB0aGUgbW9yZSBlbGFib3JhdGVcbiAgICAvLyBtZXRob2Qgb2YgY2xpY2tpbmdcbiAgICBsb2cud2FybihgRXJyb3IgYXR0ZW1wdGluZyB0byBjbGljazogJHtlcnIubWVzc2FnZX1gKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4dGVuc2lvbnMubmF0aXZlV2ViVGFwID0gYXN5bmMgZnVuY3Rpb24gKGVsKSB7XG4gIGNvbnN0IGF0b21zRWxlbWVudCA9IHRoaXMudXNlQXRvbXNFbGVtZW50KGVsKTtcblxuICBpZiAoYXdhaXQgdGFwV2ViRWxlbWVudE5hdGl2ZWx5KHRoaXMsIGF0b21zRWxlbWVudCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbG9nLndhcm4oJ1VuYWJsZSB0byBkbyBzaW1wbGUgbmF0aXZlIHdlYiB0YXAuIEF0dGVtcHRpbmcgdG8gY29udmVydCBjb29yZGluYXRlcycpO1xuXG4gIC8vIGBnZXRfdG9wX2xlZnRfY29vcmRpbmF0ZXNgIHJldHVybnMgdGhlIHdyb25nIHZhbHVlIHNvbWV0aW1lcyxcbiAgLy8gdW5sZXNzIHdlIHByZS1jYWxsIGJvdGggb2YgdGhlc2UgZnVuY3Rpb25zIGJlZm9yZSB0aGUgYWN0dWFsIGNhbGxzXG4gIGF3YWl0IHRoaXMuZXhlY3V0ZUF0b20oJ2dldF9zaXplJywgW2F0b21zRWxlbWVudF0pO1xuICBhd2FpdCB0aGlzLmV4ZWN1dGVBdG9tKCdnZXRfdG9wX2xlZnRfY29vcmRpbmF0ZXMnLCBbYXRvbXNFbGVtZW50XSk7XG5cbiAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gYXdhaXQgdGhpcy5leGVjdXRlQXRvbSgnZ2V0X3NpemUnLCBbYXRvbXNFbGVtZW50XSk7XG4gIGxldCB7eCwgeX0gPSBhd2FpdCB0aGlzLmV4ZWN1dGVBdG9tKCdnZXRfdG9wX2xlZnRfY29vcmRpbmF0ZXMnLCBbYXRvbXNFbGVtZW50XSk7XG4gIHggKz0gd2lkdGggLyAyO1xuICB5ICs9IGhlaWdodCAvIDI7XG5cbiAgdGhpcy5jdXJXZWJDb29yZHMgPSB7eCwgeX07XG4gIGF3YWl0IHRoaXMuY2xpY2tXZWJDb29yZHMoKTtcbn07XG5cbmV4dGVuc2lvbnMuY2xpY2tDb29yZHMgPSBhc3luYyBmdW5jdGlvbiAoY29vcmRzKSB7XG4gIGF3YWl0IHRoaXMucGVyZm9ybVRvdWNoKFtcbiAgICB7XG4gICAgICBhY3Rpb246ICd0YXAnLFxuICAgICAgb3B0aW9uczogY29vcmRzLFxuICAgIH0sXG4gIF0pO1xufTtcblxuZXh0ZW5zaW9ucy50cmFuc2xhdGVXZWJDb29yZHMgPSBhc3luYyBmdW5jdGlvbiAoY29vcmRzKSB7XG4gIGxvZy5kZWJ1ZyhgVHJhbnNsYXRpbmcgY29vcmRpbmF0ZXMgKCR7SlNPTi5zdHJpbmdpZnkoY29vcmRzKX0pIHRvIHdlYiBjb29yZGluYXRlc2ApO1xuXG4gIC8vIGFic29sdXRpemUgd2ViIGNvb3Jkc1xuICBjb25zdCBpbXBsaWNpdFdhaXRNcyA9IHRoaXMuaW1wbGljaXRXYWl0TXM7XG4gIGxldCB3ZWJ2aWV3O1xuICB0cnkge1xuICAgIHRoaXMuc2V0SW1wbGljaXRXYWl0KDApO1xuICAgIHdlYnZpZXcgPSBhd2FpdCByZXRyeUludGVydmFsKDUsIDEwMCwgYXN5bmMgKCkgPT4ge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmluZE5hdGl2ZUVsZW1lbnRPckVsZW1lbnRzKCctaW9zIHByZWRpY2F0ZSBzdHJpbmcnLCBgdHlwZSA9ICdYQ1VJRWxlbWVudFR5cGVXZWJWaWV3JyBBTkQgdmlzaWJsZSA9IDFgLCBmYWxzZSk7XG4gICAgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgdGhpcy5zZXRJbXBsaWNpdFdhaXQoaW1wbGljaXRXYWl0TXMpO1xuICB9XG5cbiAgd2VidmlldyA9IHV0aWwudW53cmFwRWxlbWVudCh3ZWJ2aWV3KTtcbiAgY29uc3QgcmVjdCA9IGF3YWl0IHRoaXMucHJveHlDb21tYW5kKGAvZWxlbWVudC8ke3dlYnZpZXd9L3JlY3RgLCAnR0VUJyk7XG4gIGNvbnN0IHd2UG9zID0ge3g6IHJlY3QueCwgeTogcmVjdC55fTtcbiAgY29uc3QgcmVhbERpbXMgPSB7dzogcmVjdC53aWR0aCwgaDogcmVjdC5oZWlnaHR9O1xuXG4gIGNvbnN0IGNtZCA9ICcoZnVuY3Rpb24gKCkgeyByZXR1cm4ge3c6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCwgaDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodH07IH0pKCknO1xuICBjb25zdCB3dkRpbXMgPSBhd2FpdCB0aGlzLnJlbW90ZS5leGVjdXRlKGNtZCk7XG5cbiAgLy8gVE9ETzogaW52ZXN0aWdhdGUgd2hlcmUgdGhlc2UgY29tZSBmcm9tLiBUaGV5IGFwcGVhciB0byBiZSBjb25zdGFudHMgaW4gbXkgdGVzdHNcbiAgY29uc3QgdXJsQmFySGVpZ2h0ID0gNjQ7XG4gIHd2UG9zLnkgKz0gdXJsQmFySGVpZ2h0O1xuXG4gIGNvbnN0IHJlYWxEaW1lbnNpb25IZWlnaHQgPSAxMDg7XG4gIHJlYWxEaW1zLmggLT0gcmVhbERpbWVuc2lvbkhlaWdodDtcblxuICAvLyBhZGQgc3RhdGljIG9mZnNldCBmb3Igc2FmYXJpIGluIGxhbmRzY2FwZSBtb2RlXG4gIGxldCB5T2Zmc2V0ID0gdGhpcy5vcHRzLmN1ck9yaWVudGF0aW9uID09PSAnTEFORFNDQVBFJyA/IHRoaXMubGFuZHNjYXBlV2ViQ29vcmRzT2Zmc2V0IDogMDtcblxuICAvLyBhZGQgZXh0cmEgb2Zmc2V0IGZvciBwb3NzaWJsZSBleHRyYSB0aGluZ3MgaW4gdGhlIHRvcCBvZiB0aGUgcGFnZVxuICB5T2Zmc2V0ICs9IGF3YWl0IHRoaXMuZ2V0RXh0cmFOYXRpdmVXZWJUYXBPZmZzZXQoKTtcbiAgY29vcmRzLnkgKz0gYXdhaXQgdGhpcy5nZXRFeHRyYVRyYW5zbGF0ZVdlYkNvb3Jkc09mZnNldChjb29yZHMsIHJlY3QpO1xuXG4gIGlmICh3dkRpbXMgJiYgcmVhbERpbXMgJiYgd3ZQb3MpIHtcbiAgICBsZXQgeFJhdGlvID0gcmVhbERpbXMudyAvIHd2RGltcy53O1xuICAgIGxldCB5UmF0aW8gPSByZWFsRGltcy5oIC8gd3ZEaW1zLmg7XG4gICAgbGV0IG5ld0Nvb3JkcyA9IHtcbiAgICAgIHg6IHd2UG9zLnggKyBNYXRoLnJvdW5kKHhSYXRpbyAqIGNvb3Jkcy54KSxcbiAgICAgIHk6IHd2UG9zLnkgKyB5T2Zmc2V0ICsgTWF0aC5yb3VuZCh5UmF0aW8gKiBjb29yZHMueSksXG4gICAgfTtcblxuICAgIC8vIGFkZGl0aW9uYWwgbG9nZ2luZyBmb3IgY29vcmRpbmF0ZXMsIHNpbmNlIGl0IGlzIHNvbWV0aW1lcyBicm9rZW5cbiAgICAvLyAgIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYXBwaXVtL2FwcGl1bS9pc3N1ZXMvOTE1OVxuICAgIGxvZy5kZWJ1ZyhgQ29udmVydGVkIGNvb3JkaW5hdGVzOiAke0pTT04uc3RyaW5naWZ5KG5ld0Nvb3Jkcyl9YCk7XG4gICAgbG9nLmRlYnVnKGAgICAgcmVjdDogJHtKU09OLnN0cmluZ2lmeShyZWN0KX1gKTtcbiAgICBsb2cuZGVidWcoYCAgICB3dlBvczogJHtKU09OLnN0cmluZ2lmeSh3dlBvcyl9YCk7XG4gICAgbG9nLmRlYnVnKGAgICAgcmVhbERpbXM6ICR7SlNPTi5zdHJpbmdpZnkocmVhbERpbXMpfWApO1xuICAgIGxvZy5kZWJ1ZyhgICAgIHd2RGltczogJHtKU09OLnN0cmluZ2lmeSh3dkRpbXMpfWApO1xuICAgIGxvZy5kZWJ1ZyhgICAgIHhSYXRpbzogJHtKU09OLnN0cmluZ2lmeSh4UmF0aW8pfWApO1xuICAgIGxvZy5kZWJ1ZyhgICAgIHlSYXRpbzogJHtKU09OLnN0cmluZ2lmeSh5UmF0aW8pfWApO1xuICAgIGxvZy5kZWJ1ZyhgICAgIHlPZmZzZXQ6ICR7SlNPTi5zdHJpbmdpZnkoeU9mZnNldCl9YCk7XG5cbiAgICBsb2cuZGVidWcoYENvbnZlcnRlZCB3ZWIgY29vcmRzICR7SlNPTi5zdHJpbmdpZnkoY29vcmRzKX0gYCArXG4gICAgICAgICAgICAgIGBpbnRvIHJlYWwgY29vcmRzICR7SlNPTi5zdHJpbmdpZnkobmV3Q29vcmRzKX1gKTtcbiAgICByZXR1cm4gbmV3Q29vcmRzO1xuICB9XG59O1xuXG5leHRlbnNpb25zLmNoZWNrRm9yQWxlcnQgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4dGVuc2lvbnMud2FpdEZvckF0b20gPSBhc3luYyBmdW5jdGlvbiAocHJvbWlzZSkge1xuICB0cnkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlRXhlY3V0ZVJlc3BvbnNlKGF3YWl0IEIucmVzb2x2ZShwcm9taXNlKVxuICAgICAgLnRpbWVvdXQoQVRPTV9XQUlUX1RJTUVPVVQpKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIEIuVGltZW91dEVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERpZCBub3QgZ2V0IGFueSByZXNwb25zZSBhZnRlciAke0FUT01fV0FJVF9USU1FT1VUIC8gMTAwMH1zYCk7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZXh0ZW5zaW9ucztcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
