'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumIosDriver = require('appium-ios-driver');

var _appiumBaseDriver = require('appium-base-driver');

var extensions = {};

_Object$assign(extensions, _appiumIosDriver.iosCommands.execute);

var iosExecute = extensions.execute;
extensions.execute = function callee$0$0(script, args) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!(!script.match(/^mobile\:/) && !this.isWebContext())) {
          context$1$0.next = 2;
          break;
        }

        throw new _appiumBaseDriver.errors.NotImplementedError();

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(iosExecute.call(this, script, args));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

var iosExecuteAsync = extensions.executeAsync;
extensions.executeAsync = function callee$0$0(script, args, sessionId) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (this.isWebContext()) {
          context$1$0.next = 2;
          break;
        }

        throw new _appiumBaseDriver.errors.NotImplementedError();

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(iosExecuteAsync.call(this, script, args, sessionId));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

// Overrides the 'executeMobile' function defined in appium-ios-driver
extensions.executeMobile = function callee$0$0(mobileCommand) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var commandMap;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        commandMap = {
          //region gestures support
          scroll: 'mobileScroll',
          swipe: 'mobileSwipe',
          pinch: 'mobilePinch',
          doubleTap: 'mobileDoubleTap',
          twoFingerTap: 'mobileTwoFingerTap',
          touchAndHold: 'mobileTouchAndHold',
          tap: 'mobileTap',
          dragFromToForDuration: 'mobileDragFromToForDuration',
          selectPickerWheelValue: 'mobileSelectPickerWheelValue',
          //endregion gestures support
          alert: 'mobileHandleAlert',
          setPasteboard: 'mobileSetPasteboard',
          getPasteboard: 'mobileGetPasteboard',
          source: 'mobileGetSource',
          getContexts: 'mobileGetContexts',
          //region multiple apps management
          installApp: 'mobileInstallApp',
          isAppInstalled: 'mobileIsAppInstalled',
          removeApp: 'mobileRemoveApp',
          launchApp: 'mobileLaunchApp',
          terminateApp: 'mobileTerminateApp',
          queryAppState: 'mobileQueryAppState',
          activateApp: 'mobileActivateApp',
          //endregion multiple apps management
          viewportScreenshot: 'getViewportScreenshot',
          startPerfRecord: 'mobileStartPerfRecord',
          stopPerfRecord: 'mobileStopPerfRecord',
          installCertificate: 'mobileInstallCertificate',
          startLogsBroadcast: 'mobileStartLogsBroadcast',
          stopLogsBroadcast: 'mobileStopLogsBroadcast',
          batteryInfo: 'mobileGetBatteryInfo'
        };

        if (_lodash2['default'].has(commandMap, mobileCommand)) {
          context$1$0.next = 3;
          break;
        }

        throw new _appiumBaseDriver.errors.UnknownCommandError('Unknown mobile command "' + mobileCommand + '". Only ' + _lodash2['default'].keys(commandMap) + ' commands are supported.');

      case 3:
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(this[commandMap[mobileCommand]](opts));

      case 5:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

exports['default'] = extensions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9leGVjdXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztzQkFBYyxRQUFROzs7OytCQUNNLG1CQUFtQjs7Z0NBQ3hCLG9CQUFvQjs7QUFHM0MsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVwQixlQUFjLFVBQVUsRUFBRSw2QkFBWSxPQUFPLENBQUMsQ0FBQzs7QUFFL0MsSUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUN0QyxVQUFVLENBQUMsT0FBTyxHQUFHLG9CQUFnQixNQUFNLEVBQUUsSUFBSTs7OztjQUMzQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7Ozs7O2NBQzlDLElBQUkseUJBQU8sbUJBQW1CLEVBQUU7Ozs7eUNBRzNCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7Ozs7Ozs7Ozs7Q0FDakQsQ0FBQzs7QUFFRixJQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO0FBQ2hELFVBQVUsQ0FBQyxZQUFZLEdBQUcsb0JBQWdCLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUzs7OztZQUMxRCxJQUFJLENBQUMsWUFBWSxFQUFFOzs7OztjQUNoQixJQUFJLHlCQUFPLG1CQUFtQixFQUFFOzs7O3lDQUczQixlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQzs7Ozs7Ozs7OztDQUNqRSxDQUFDOzs7QUFHRixVQUFVLENBQUMsYUFBYSxHQUFHLG9CQUFnQixhQUFhO01BQUUsSUFBSSx5REFBRyxFQUFFO01BQzNELFVBQVU7Ozs7QUFBVixrQkFBVSxHQUFHOztBQUVqQixnQkFBTSxFQUFFLGNBQWM7QUFDdEIsZUFBSyxFQUFFLGFBQWE7QUFDcEIsZUFBSyxFQUFFLGFBQWE7QUFDcEIsbUJBQVMsRUFBRSxpQkFBaUI7QUFDNUIsc0JBQVksRUFBRSxvQkFBb0I7QUFDbEMsc0JBQVksRUFBRSxvQkFBb0I7QUFDbEMsYUFBRyxFQUFFLFdBQVc7QUFDaEIsK0JBQXFCLEVBQUUsNkJBQTZCO0FBQ3BELGdDQUFzQixFQUFFLDhCQUE4Qjs7QUFFdEQsZUFBSyxFQUFFLG1CQUFtQjtBQUMxQix1QkFBYSxFQUFFLHFCQUFxQjtBQUNwQyx1QkFBYSxFQUFFLHFCQUFxQjtBQUNwQyxnQkFBTSxFQUFFLGlCQUFpQjtBQUN6QixxQkFBVyxFQUFFLG1CQUFtQjs7QUFFaEMsb0JBQVUsRUFBRSxrQkFBa0I7QUFDOUIsd0JBQWMsRUFBRSxzQkFBc0I7QUFDdEMsbUJBQVMsRUFBRSxpQkFBaUI7QUFDNUIsbUJBQVMsRUFBRSxpQkFBaUI7QUFDNUIsc0JBQVksRUFBRSxvQkFBb0I7QUFDbEMsdUJBQWEsRUFBRSxxQkFBcUI7QUFDcEMscUJBQVcsRUFBRSxtQkFBbUI7O0FBRWhDLDRCQUFrQixFQUFFLHVCQUF1QjtBQUMzQyx5QkFBZSxFQUFFLHVCQUF1QjtBQUN4Qyx3QkFBYyxFQUFFLHNCQUFzQjtBQUN0Qyw0QkFBa0IsRUFBRSwwQkFBMEI7QUFDOUMsNEJBQWtCLEVBQUUsMEJBQTBCO0FBQzlDLDJCQUFpQixFQUFFLHlCQUF5QjtBQUM1QyxxQkFBVyxFQUFFLHNCQUFzQjtTQUNwQzs7WUFFSSxvQkFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQzs7Ozs7Y0FDN0IsSUFBSSx5QkFBTyxtQkFBbUIsOEJBQTRCLGFBQWEsZ0JBQVcsb0JBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyw4QkFBMkI7Ozs7eUNBRTFILElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Q0FDbkQsQ0FBQzs7cUJBRWEsVUFBVSIsImZpbGUiOiJsaWIvY29tbWFuZHMvZXhlY3V0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBpb3NDb21tYW5kcyB9IGZyb20gJ2FwcGl1bS1pb3MtZHJpdmVyJztcbmltcG9ydCB7IGVycm9ycyB9IGZyb20gJ2FwcGl1bS1iYXNlLWRyaXZlcic7XG5cblxubGV0IGV4dGVuc2lvbnMgPSB7fTtcblxuT2JqZWN0LmFzc2lnbihleHRlbnNpb25zLCBpb3NDb21tYW5kcy5leGVjdXRlKTtcblxuY29uc3QgaW9zRXhlY3V0ZSA9IGV4dGVuc2lvbnMuZXhlY3V0ZTtcbmV4dGVuc2lvbnMuZXhlY3V0ZSA9IGFzeW5jIGZ1bmN0aW9uIChzY3JpcHQsIGFyZ3MpIHtcbiAgaWYgKCFzY3JpcHQubWF0Y2goL15tb2JpbGVcXDovKSAmJiAhdGhpcy5pc1dlYkNvbnRleHQoKSkge1xuICAgIHRocm93IG5ldyBlcnJvcnMuTm90SW1wbGVtZW50ZWRFcnJvcigpO1xuICB9XG5cbiAgcmV0dXJuIGF3YWl0IGlvc0V4ZWN1dGUuY2FsbCh0aGlzLCBzY3JpcHQsIGFyZ3MpO1xufTtcblxuY29uc3QgaW9zRXhlY3V0ZUFzeW5jID0gZXh0ZW5zaW9ucy5leGVjdXRlQXN5bmM7XG5leHRlbnNpb25zLmV4ZWN1dGVBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChzY3JpcHQsIGFyZ3MsIHNlc3Npb25JZCkge1xuICBpZiAoIXRoaXMuaXNXZWJDb250ZXh0KCkpIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLk5vdEltcGxlbWVudGVkRXJyb3IoKTtcbiAgfVxuXG4gIHJldHVybiBhd2FpdCBpb3NFeGVjdXRlQXN5bmMuY2FsbCh0aGlzLCBzY3JpcHQsIGFyZ3MsIHNlc3Npb25JZCk7XG59O1xuXG4vLyBPdmVycmlkZXMgdGhlICdleGVjdXRlTW9iaWxlJyBmdW5jdGlvbiBkZWZpbmVkIGluIGFwcGl1bS1pb3MtZHJpdmVyXG5leHRlbnNpb25zLmV4ZWN1dGVNb2JpbGUgPSBhc3luYyBmdW5jdGlvbiAobW9iaWxlQ29tbWFuZCwgb3B0cyA9IHt9KSB7XG4gIGNvbnN0IGNvbW1hbmRNYXAgPSB7XG4gICAgLy9yZWdpb24gZ2VzdHVyZXMgc3VwcG9ydFxuICAgIHNjcm9sbDogJ21vYmlsZVNjcm9sbCcsXG4gICAgc3dpcGU6ICdtb2JpbGVTd2lwZScsXG4gICAgcGluY2g6ICdtb2JpbGVQaW5jaCcsXG4gICAgZG91YmxlVGFwOiAnbW9iaWxlRG91YmxlVGFwJyxcbiAgICB0d29GaW5nZXJUYXA6ICdtb2JpbGVUd29GaW5nZXJUYXAnLFxuICAgIHRvdWNoQW5kSG9sZDogJ21vYmlsZVRvdWNoQW5kSG9sZCcsXG4gICAgdGFwOiAnbW9iaWxlVGFwJyxcbiAgICBkcmFnRnJvbVRvRm9yRHVyYXRpb246ICdtb2JpbGVEcmFnRnJvbVRvRm9yRHVyYXRpb24nLFxuICAgIHNlbGVjdFBpY2tlcldoZWVsVmFsdWU6ICdtb2JpbGVTZWxlY3RQaWNrZXJXaGVlbFZhbHVlJyxcbiAgICAvL2VuZHJlZ2lvbiBnZXN0dXJlcyBzdXBwb3J0XG4gICAgYWxlcnQ6ICdtb2JpbGVIYW5kbGVBbGVydCcsXG4gICAgc2V0UGFzdGVib2FyZDogJ21vYmlsZVNldFBhc3RlYm9hcmQnLFxuICAgIGdldFBhc3RlYm9hcmQ6ICdtb2JpbGVHZXRQYXN0ZWJvYXJkJyxcbiAgICBzb3VyY2U6ICdtb2JpbGVHZXRTb3VyY2UnLFxuICAgIGdldENvbnRleHRzOiAnbW9iaWxlR2V0Q29udGV4dHMnLFxuICAgIC8vcmVnaW9uIG11bHRpcGxlIGFwcHMgbWFuYWdlbWVudFxuICAgIGluc3RhbGxBcHA6ICdtb2JpbGVJbnN0YWxsQXBwJyxcbiAgICBpc0FwcEluc3RhbGxlZDogJ21vYmlsZUlzQXBwSW5zdGFsbGVkJyxcbiAgICByZW1vdmVBcHA6ICdtb2JpbGVSZW1vdmVBcHAnLFxuICAgIGxhdW5jaEFwcDogJ21vYmlsZUxhdW5jaEFwcCcsXG4gICAgdGVybWluYXRlQXBwOiAnbW9iaWxlVGVybWluYXRlQXBwJyxcbiAgICBxdWVyeUFwcFN0YXRlOiAnbW9iaWxlUXVlcnlBcHBTdGF0ZScsXG4gICAgYWN0aXZhdGVBcHA6ICdtb2JpbGVBY3RpdmF0ZUFwcCcsXG4gICAgLy9lbmRyZWdpb24gbXVsdGlwbGUgYXBwcyBtYW5hZ2VtZW50XG4gICAgdmlld3BvcnRTY3JlZW5zaG90OiAnZ2V0Vmlld3BvcnRTY3JlZW5zaG90JyxcbiAgICBzdGFydFBlcmZSZWNvcmQ6ICdtb2JpbGVTdGFydFBlcmZSZWNvcmQnLFxuICAgIHN0b3BQZXJmUmVjb3JkOiAnbW9iaWxlU3RvcFBlcmZSZWNvcmQnLFxuICAgIGluc3RhbGxDZXJ0aWZpY2F0ZTogJ21vYmlsZUluc3RhbGxDZXJ0aWZpY2F0ZScsXG4gICAgc3RhcnRMb2dzQnJvYWRjYXN0OiAnbW9iaWxlU3RhcnRMb2dzQnJvYWRjYXN0JyxcbiAgICBzdG9wTG9nc0Jyb2FkY2FzdDogJ21vYmlsZVN0b3BMb2dzQnJvYWRjYXN0JyxcbiAgICBiYXR0ZXJ5SW5mbzogJ21vYmlsZUdldEJhdHRlcnlJbmZvJyxcbiAgfTtcblxuICBpZiAoIV8uaGFzKGNvbW1hbmRNYXAsIG1vYmlsZUNvbW1hbmQpKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5Vbmtub3duQ29tbWFuZEVycm9yKGBVbmtub3duIG1vYmlsZSBjb21tYW5kIFwiJHttb2JpbGVDb21tYW5kfVwiLiBPbmx5ICR7Xy5rZXlzKGNvbW1hbmRNYXApfSBjb21tYW5kcyBhcmUgc3VwcG9ydGVkLmApO1xuICB9XG4gIHJldHVybiBhd2FpdCB0aGlzW2NvbW1hbmRNYXBbbW9iaWxlQ29tbWFuZF1dKG9wdHMpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZXh0ZW5zaW9ucztcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
