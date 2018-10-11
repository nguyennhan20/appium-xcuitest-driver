'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _appiumIosDriver = require('appium-ios-driver');

var _appiumRemoteDebugger = require('appium-remote-debugger');

var _appiumSupport = require('appium-support');

var extensions = {};

_Object$assign(extensions, _appiumIosDriver.iosCommands.context);

// override, as appium-ios-driver's version uses UI Automation to close
extensions.closeAlertBeforeTest = function callee$0$0() {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        return context$1$0.abrupt('return', true);

      case 1:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

extensions._setContext = extensions.setContext;
extensions.setContext = function callee$0$0(name, callback, skipReadyCheck) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this._setContext(name, callback, skipReadyCheck));

      case 2:
        if (!(name && name !== _appiumIosDriver.NATIVE_WIN && this.logs)) {
          context$1$0.next = 9;
          break;
        }

        if (!this.logs.safariConsole) {
          context$1$0.next = 6;
          break;
        }

        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(this.remote.startConsole(this.logs.safariConsole.addLogLine.bind(this.logs.safariConsole)));

      case 6:
        if (!this.logs.safariNetwork) {
          context$1$0.next = 9;
          break;
        }

        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(this.remote.startNetwork(this.logs.safariNetwork.addLogLine.bind(this.logs.safariNetwork)));

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

// the appium-ios-driver version of this function fails in CI,
// and the wrong webview is almost always retrieved
extensions._getLatestWebviewContextForTitle = extensions.getLatestWebviewContextForTitle;
extensions.getLatestWebviewContextForTitle = function callee$0$0(regExp) {
  var currentUrl, contexts, matchingCtx, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ctx, url;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        currentUrl = this.getCurrentUrl();

        if (currentUrl) {
          context$1$0.next = 5;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this._getLatestWebviewContextForTitle(regExp));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(this.getContextsAndViews());

      case 7:
        contexts = context$1$0.sent;
        matchingCtx = undefined;
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 12;
        _iterator = _getIterator(contexts);

      case 14:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 24;
          break;
        }

        ctx = _step.value;

        if (!ctx.view) {
          context$1$0.next = 21;
          break;
        }

        url = ctx.view.url || '';

        if (!(url === this.getCurrentUrl())) {
          context$1$0.next = 21;
          break;
        }

        matchingCtx = ctx;
        return context$1$0.abrupt('break', 24);

      case 21:
        _iteratorNormalCompletion = true;
        context$1$0.next = 14;
        break;

      case 24:
        context$1$0.next = 30;
        break;

      case 26:
        context$1$0.prev = 26;
        context$1$0.t0 = context$1$0['catch'](12);
        _didIteratorError = true;
        _iteratorError = context$1$0.t0;

      case 30:
        context$1$0.prev = 30;
        context$1$0.prev = 31;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 33:
        context$1$0.prev = 33;

        if (!_didIteratorError) {
          context$1$0.next = 36;
          break;
        }

        throw _iteratorError;

      case 36:
        return context$1$0.finish(33);

      case 37:
        return context$1$0.finish(30);

      case 38:
        if (!matchingCtx) {
          context$1$0.next = 40;
          break;
        }

        return context$1$0.abrupt('return', matchingCtx.id);

      case 40:
        context$1$0.next = 42;
        return _regeneratorRuntime.awrap(this._getLatestWebviewContextForTitle(regExp));

      case 42:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 43:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[12, 26, 30, 38], [31,, 33, 37]]);
};

extensions.isWebContext = function () {
  return !!this.curContext && this.curContext !== _appiumIosDriver.iosCommands.context.NATIVE_WIN;
};

extensions.isWebview = function () {
  return this.isWebContext();
};

extensions.getNewRemoteDebugger = function callee$0$0() {
  var socketPath;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this.opts.device.getWebInspectorSocket());

      case 2:
        socketPath = context$1$0.sent;
        return context$1$0.abrupt('return', new _appiumRemoteDebugger.RemoteDebugger({
          bundleId: this.opts.bundleId,
          useNewSafari: this.useNewSafari(),
          pageLoadMs: this.pageLoadMs,
          platformVersion: this.opts.platformVersion,
          socketPath: socketPath,
          remoteDebugProxy: this.opts.remoteDebugProxy,
          garbageCollectOnExecute: _appiumSupport.util.hasValue(this.opts.safariGarbageCollect) ? !!this.opts.safariGarbageCollect : true
        }));

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * @typedef {Object} Context
 *
 * @property {string} id - The identifier of the context. The native context
 *                          will be 'NATIVE_APP' and the webviews will be
 *                          'WEBVIEW_xxx'
 * @property {?string} title - The title associated with the webview content
 * @property {?string} url - The url associated with the webview content
 */

/**
 * Get the contexts available, with information about the url and title of each
 * webview
 * @returns {Array} List of Context objects
 */
extensions.mobileGetContexts = function callee$0$0() {
  var curOpt;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        curOpt = this.opts.fullContextList;
        context$1$0.prev = 1;

        // `appium-ios-driver#getContexts` returns the full list of contexts
        // if this option is on
        this.opts.fullContextList = true;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(this.getContexts());

      case 5:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 6:
        context$1$0.prev = 6;

        // reset the option so there are no side effects
        this.opts.fullContextList = curOpt;
        return context$1$0.finish(6);

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1,, 6, 9]]);
};

exports['default'] = extensions;
module.exports = exports['default'];

// start safari logging if the logs handlers are active
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OzsrQkFBd0MsbUJBQW1COztvQ0FDNUIsd0JBQXdCOzs2QkFDbEMsZ0JBQWdCOztBQUVyQyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLGVBQWMsVUFBVSxFQUFFLDZCQUFZLE9BQU8sQ0FBQyxDQUFDOzs7QUFHL0MsVUFBVSxDQUFDLG9CQUFvQixHQUFHOzs7OzRDQUN6QixJQUFJOzs7Ozs7O0NBQ1osQ0FBQzs7QUFFRixVQUFVLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFDL0MsVUFBVSxDQUFDLFVBQVUsR0FBRyxvQkFBZ0IsSUFBSSxFQUFFLFFBQVEsRUFBRSxjQUFjOzs7Ozt5Q0FDOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQzs7O2NBR2xELElBQUksSUFBSSxJQUFJLGdDQUFlLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQTs7Ozs7YUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhOzs7Ozs7eUNBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O2FBRTlGLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYTs7Ozs7O3lDQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Ozs7Ozs7Q0FHckcsQ0FBQzs7OztBQUlGLFVBQVUsQ0FBQyxnQ0FBZ0MsR0FBRyxVQUFVLENBQUMsK0JBQStCLENBQUM7QUFDekYsVUFBVSxDQUFDLCtCQUErQixHQUFHLG9CQUFnQixNQUFNO01BQzdELFVBQVUsRUFLVixRQUFRLEVBQ1IsV0FBVyxrRkFDTixHQUFHLEVBRUosR0FBRzs7Ozs7QUFUUCxrQkFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUU7O1lBQ2hDLFVBQVU7Ozs7Ozt5Q0FDQSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxDQUFDOzs7Ozs7O3lDQUd2QyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7OztBQUEzQyxnQkFBUTtBQUNSLG1CQUFXOzs7OztpQ0FDQyxRQUFROzs7Ozs7OztBQUFmLFdBQUc7O2FBQ04sR0FBRyxDQUFDLElBQUk7Ozs7O0FBQ04sV0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUU7O2NBQ3hCLEdBQUcsS0FBSyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7Ozs7O0FBQzlCLG1CQUFXLEdBQUcsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2FBS3BCLFdBQVc7Ozs7OzRDQUNOLFdBQVcsQ0FBQyxFQUFFOzs7O3lDQUVWLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7Q0FDM0QsQ0FBQzs7QUFFRixVQUFVLENBQUMsWUFBWSxHQUFHLFlBQVk7QUFDcEMsU0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLDZCQUFZLE9BQU8sQ0FBQyxVQUFVLENBQUM7Q0FDaEYsQ0FBQzs7QUFFRixVQUFVLENBQUMsU0FBUyxHQUFHLFlBQVk7QUFDakMsU0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Q0FDNUIsQ0FBQzs7QUFFRixVQUFVLENBQUMsb0JBQW9CLEdBQUc7TUFDMUIsVUFBVTs7Ozs7eUNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUU7OztBQUEzRCxrQkFBVTs0Q0FDVCx5Q0FBbUI7QUFDeEIsa0JBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7QUFDNUIsc0JBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ2pDLG9CQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDM0IseUJBQWUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWU7QUFDMUMsb0JBQVUsRUFBVixVQUFVO0FBQ1YsMEJBQWdCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0I7QUFDNUMsaUNBQXVCLEVBQUUsb0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FDbEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQ2hDLElBQUk7U0FDVCxDQUFDOzs7Ozs7O0NBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkYsVUFBVSxDQUFDLGlCQUFpQixHQUFHO01BQ3ZCLE1BQU07Ozs7QUFBTixjQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlOzs7OztBQUl0QyxZQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7O3lDQUNwQixJQUFJLENBQUMsV0FBVyxFQUFFOzs7Ozs7Ozs7QUFHL0IsWUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDOzs7Ozs7OztDQUV0QyxDQUFDOztxQkFHYSxVQUFVIiwiZmlsZSI6ImxpYi9jb21tYW5kcy9jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW9zQ29tbWFuZHMsIE5BVElWRV9XSU4gfSBmcm9tICdhcHBpdW0taW9zLWRyaXZlcic7XG5pbXBvcnQgeyBSZW1vdGVEZWJ1Z2dlciB9IGZyb20gJ2FwcGl1bS1yZW1vdGUtZGVidWdnZXInO1xuaW1wb3J0IHsgdXRpbCB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcblxubGV0IGV4dGVuc2lvbnMgPSB7fTtcblxuT2JqZWN0LmFzc2lnbihleHRlbnNpb25zLCBpb3NDb21tYW5kcy5jb250ZXh0KTtcblxuLy8gb3ZlcnJpZGUsIGFzIGFwcGl1bS1pb3MtZHJpdmVyJ3MgdmVyc2lvbiB1c2VzIFVJIEF1dG9tYXRpb24gdG8gY2xvc2VcbmV4dGVuc2lvbnMuY2xvc2VBbGVydEJlZm9yZVRlc3QgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcblxuZXh0ZW5zaW9ucy5fc2V0Q29udGV4dCA9IGV4dGVuc2lvbnMuc2V0Q29udGV4dDtcbmV4dGVuc2lvbnMuc2V0Q29udGV4dCA9IGFzeW5jIGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgc2tpcFJlYWR5Q2hlY2spIHtcbiAgYXdhaXQgdGhpcy5fc2V0Q29udGV4dChuYW1lLCBjYWxsYmFjaywgc2tpcFJlYWR5Q2hlY2spO1xuXG4gIC8vIHN0YXJ0IHNhZmFyaSBsb2dnaW5nIGlmIHRoZSBsb2dzIGhhbmRsZXJzIGFyZSBhY3RpdmVcbiAgaWYgKG5hbWUgJiYgbmFtZSAhPT0gTkFUSVZFX1dJTiAmJiB0aGlzLmxvZ3MpIHtcbiAgICBpZiAodGhpcy5sb2dzLnNhZmFyaUNvbnNvbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMucmVtb3RlLnN0YXJ0Q29uc29sZSh0aGlzLmxvZ3Muc2FmYXJpQ29uc29sZS5hZGRMb2dMaW5lLmJpbmQodGhpcy5sb2dzLnNhZmFyaUNvbnNvbGUpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubG9ncy5zYWZhcmlOZXR3b3JrKSB7XG4gICAgICBhd2FpdCB0aGlzLnJlbW90ZS5zdGFydE5ldHdvcmsodGhpcy5sb2dzLnNhZmFyaU5ldHdvcmsuYWRkTG9nTGluZS5iaW5kKHRoaXMubG9ncy5zYWZhcmlOZXR3b3JrKSk7XG4gICAgfVxuICB9XG59O1xuXG4vLyB0aGUgYXBwaXVtLWlvcy1kcml2ZXIgdmVyc2lvbiBvZiB0aGlzIGZ1bmN0aW9uIGZhaWxzIGluIENJLFxuLy8gYW5kIHRoZSB3cm9uZyB3ZWJ2aWV3IGlzIGFsbW9zdCBhbHdheXMgcmV0cmlldmVkXG5leHRlbnNpb25zLl9nZXRMYXRlc3RXZWJ2aWV3Q29udGV4dEZvclRpdGxlID0gZXh0ZW5zaW9ucy5nZXRMYXRlc3RXZWJ2aWV3Q29udGV4dEZvclRpdGxlO1xuZXh0ZW5zaW9ucy5nZXRMYXRlc3RXZWJ2aWV3Q29udGV4dEZvclRpdGxlID0gYXN5bmMgZnVuY3Rpb24gKHJlZ0V4cCkge1xuICBsZXQgY3VycmVudFVybCA9IHRoaXMuZ2V0Q3VycmVudFVybCgpO1xuICBpZiAoIWN1cnJlbnRVcmwpIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fZ2V0TGF0ZXN0V2Vidmlld0NvbnRleHRGb3JUaXRsZShyZWdFeHApO1xuICB9XG5cbiAgbGV0IGNvbnRleHRzID0gYXdhaXQgdGhpcy5nZXRDb250ZXh0c0FuZFZpZXdzKCk7XG4gIGxldCBtYXRjaGluZ0N0eDtcbiAgZm9yIChsZXQgY3R4IG9mIGNvbnRleHRzKSB7XG4gICAgaWYgKGN0eC52aWV3KSB7XG4gICAgICBsZXQgdXJsID0gY3R4LnZpZXcudXJsIHx8ICcnO1xuICAgICAgaWYgKHVybCA9PT0gdGhpcy5nZXRDdXJyZW50VXJsKCkpIHtcbiAgICAgICAgbWF0Y2hpbmdDdHggPSBjdHg7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAobWF0Y2hpbmdDdHgpIHtcbiAgICByZXR1cm4gbWF0Y2hpbmdDdHguaWQ7XG4gIH1cbiAgcmV0dXJuIGF3YWl0IHRoaXMuX2dldExhdGVzdFdlYnZpZXdDb250ZXh0Rm9yVGl0bGUocmVnRXhwKTtcbn07XG5cbmV4dGVuc2lvbnMuaXNXZWJDb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gISF0aGlzLmN1ckNvbnRleHQgJiYgdGhpcy5jdXJDb250ZXh0ICE9PSBpb3NDb21tYW5kcy5jb250ZXh0Lk5BVElWRV9XSU47XG59O1xuXG5leHRlbnNpb25zLmlzV2VidmlldyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuaXNXZWJDb250ZXh0KCk7XG59O1xuXG5leHRlbnNpb25zLmdldE5ld1JlbW90ZURlYnVnZ2VyID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICBjb25zdCBzb2NrZXRQYXRoID0gYXdhaXQgdGhpcy5vcHRzLmRldmljZS5nZXRXZWJJbnNwZWN0b3JTb2NrZXQoKTtcbiAgcmV0dXJuIG5ldyBSZW1vdGVEZWJ1Z2dlcih7XG4gICAgYnVuZGxlSWQ6IHRoaXMub3B0cy5idW5kbGVJZCxcbiAgICB1c2VOZXdTYWZhcmk6IHRoaXMudXNlTmV3U2FmYXJpKCksXG4gICAgcGFnZUxvYWRNczogdGhpcy5wYWdlTG9hZE1zLFxuICAgIHBsYXRmb3JtVmVyc2lvbjogdGhpcy5vcHRzLnBsYXRmb3JtVmVyc2lvbixcbiAgICBzb2NrZXRQYXRoLFxuICAgIHJlbW90ZURlYnVnUHJveHk6IHRoaXMub3B0cy5yZW1vdGVEZWJ1Z1Byb3h5LFxuICAgIGdhcmJhZ2VDb2xsZWN0T25FeGVjdXRlOiB1dGlsLmhhc1ZhbHVlKHRoaXMub3B0cy5zYWZhcmlHYXJiYWdlQ29sbGVjdClcbiAgICAgID8gISF0aGlzLm9wdHMuc2FmYXJpR2FyYmFnZUNvbGxlY3RcbiAgICAgIDogdHJ1ZSxcbiAgfSk7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvbnRleHRcbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaWQgLSBUaGUgaWRlbnRpZmllciBvZiB0aGUgY29udGV4dC4gVGhlIG5hdGl2ZSBjb250ZXh0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBiZSAnTkFUSVZFX0FQUCcgYW5kIHRoZSB3ZWJ2aWV3cyB3aWxsIGJlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQlZJRVdfeHh4J1xuICogQHByb3BlcnR5IHs/c3RyaW5nfSB0aXRsZSAtIFRoZSB0aXRsZSBhc3NvY2lhdGVkIHdpdGggdGhlIHdlYnZpZXcgY29udGVudFxuICogQHByb3BlcnR5IHs/c3RyaW5nfSB1cmwgLSBUaGUgdXJsIGFzc29jaWF0ZWQgd2l0aCB0aGUgd2VidmlldyBjb250ZW50XG4gKi9cblxuLyoqXG4gKiBHZXQgdGhlIGNvbnRleHRzIGF2YWlsYWJsZSwgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdXJsIGFuZCB0aXRsZSBvZiBlYWNoXG4gKiB3ZWJ2aWV3XG4gKiBAcmV0dXJucyB7QXJyYXl9IExpc3Qgb2YgQ29udGV4dCBvYmplY3RzXG4gKi9cbmV4dGVuc2lvbnMubW9iaWxlR2V0Q29udGV4dHMgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGN1ck9wdCA9IHRoaXMub3B0cy5mdWxsQ29udGV4dExpc3Q7XG4gIHRyeSB7XG4gICAgLy8gYGFwcGl1bS1pb3MtZHJpdmVyI2dldENvbnRleHRzYCByZXR1cm5zIHRoZSBmdWxsIGxpc3Qgb2YgY29udGV4dHNcbiAgICAvLyBpZiB0aGlzIG9wdGlvbiBpcyBvblxuICAgIHRoaXMub3B0cy5mdWxsQ29udGV4dExpc3QgPSB0cnVlO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldENvbnRleHRzKCk7XG4gIH0gZmluYWxseSB7XG4gICAgLy8gcmVzZXQgdGhlIG9wdGlvbiBzbyB0aGVyZSBhcmUgbm8gc2lkZSBlZmZlY3RzXG4gICAgdGhpcy5vcHRzLmZ1bGxDb250ZXh0TGlzdCA9IGN1ck9wdDtcbiAgfVxufTtcblxuXG5leHBvcnQgZGVmYXVsdCBleHRlbnNpb25zO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
