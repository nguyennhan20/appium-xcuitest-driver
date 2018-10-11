'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumIosDriver = require('appium-ios-driver');

var desiredCapConstraints = _lodash2['default'].defaults({
  showXcodeLog: {
    isBoolean: true
  },
  wdaLocalPort: {
    isNumber: true
  },
  iosInstallPause: {
    isNumber: true
  },
  xcodeConfigFile: {
    isString: true
  },
  xcodeOrgId: {
    isString: true
  },
  xcodeSigningId: {
    isString: true
  },
  keychainPath: {
    isString: true
  },
  keychainPassword: {
    isString: true
  },
  bootstrapPath: {
    isString: true
  },
  agentPath: {
    isString: true
  },
  tapWithShortPressDuration: {
    isNumber: true
  },
  scaleFactor: {
    isString: true
  },
  usePrebuiltWDA: {
    isBoolean: true
  },
  customSSLCert: {
    isString: true
  },
  preventWDAAttachments: {
    isBoolean: true
  },
  webDriverAgentUrl: {
    isString: true
  },
  derivedDataPath: {
    isString: true
  },
  useNewWDA: {
    isBoolean: true
  },
  wdaLaunchTimeout: {
    isNumber: true
  },
  wdaConnectionTimeout: {
    isNumber: true
  },
  updatedWDABundleId: {
    isString: true
  },
  resetOnSessionStartOnly: {
    isBoolean: true
  },
  commandTimeouts: {
    // recognize the cap,
    // but validate in the driver#validateDesiredCaps method
  },
  wdaStartupRetries: {
    isNumber: true
  },
  wdaStartupRetryInterval: {
    isNumber: true
  },
  prebuildWDA: {
    isBoolean: true
  },
  connectHardwareKeyboard: {
    isBoolean: true
  },
  calendarAccessAuthorized: {
    isBoolean: true
  },
  startIWDP: {
    isBoolean: true
  },
  useSimpleBuildTest: {
    isBoolean: true
  },
  waitForQuiescence: {
    isBoolean: true
  },
  maxTypingFrequency: {
    isNumber: true
  },
  nativeTyping: {
    isBoolean: true
  },
  simpleIsVisibleCheck: {
    isBoolean: true
  },
  useCarthageSsl: {
    isBoolean: true
  },
  shouldUseSingletonTestManager: {
    isBoolean: true
  },
  isHeadless: {
    isBoolean: true
  },
  webkitDebugProxyPort: {
    isNumber: true
  },
  useXctestrunFile: {
    isBoolean: true
  },
  absoluteWebLocations: {
    isBoolean: true
  },
  simulatorWindowCenter: {
    isString: true
  },
  useJSONSource: {
    isBoolean: true
  },
  shutdownOtherSimulators: {
    isBoolean: true
  },
  keychainsExcludePatterns: {
    isString: true
  },
  realDeviceScreenshotter: {
    isString: true,
    presence: false,
    inclusionCaseInsensitive: ['idevicescreenshot']
  },
  showSafariConsoleLog: {
    isBoolean: true
  },
  showSafariNetworkLog: {
    isBoolean: true
  },
  mjpegServerPort: {
    isNumber: true
  }
}, _appiumIosDriver.desiredCapConstraints);

exports.desiredCapConstraints = desiredCapConstraints;
exports['default'] = desiredCapConstraints;
//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFFLElBQUk7R0FDaEI7QUFDRCx1QkFBcUIsRUFBRTtBQUNyQixZQUFRLEVBQUUsSUFBSTtHQUNmO0FBQ0QsZUFBYSxFQUFFO0FBQ2IsYUFBUyxFQUFFLElBQUk7R0FDaEI7QUFDRCx5QkFBdUIsRUFBRTtBQUN2QixhQUFTLEVBQUUsSUFBSTtHQUNoQjtBQUNELDBCQUF3QixFQUFFO0FBQ3hCLFlBQVEsRUFBRSxJQUFJO0dBQ2Y7QUFDRCx5QkFBdUIsRUFBRTtBQUN2QixZQUFRLEVBQUUsSUFBSTtBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsNEJBQXdCLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztHQUNoRDtBQUNELHNCQUFvQixFQUFFO0FBQ3BCLGFBQVMsRUFBRSxJQUFJO0dBQ2hCO0FBQ0Qsc0JBQW9CLEVBQUU7QUFDcEIsYUFBUyxFQUFFLElBQUk7R0FDaEI7QUFDRCxpQkFBZSxFQUFFO0FBQ2YsWUFBUSxFQUFFLElBQUk7R0FDZjtDQUNGLHlDQUEyQixDQUFDOztRQUVwQixxQkFBcUIsR0FBckIscUJBQXFCO3FCQUNmLHFCQUFxQiIsImZpbGUiOiJsaWIvZGVzaXJlZC1jYXBzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGRlc2lyZWRDYXBDb25zdHJhaW50cyBhcyBpb3NEZXNpcmVkQ2FwQ29uc3RyYWludHMgfSBmcm9tICdhcHBpdW0taW9zLWRyaXZlcic7XG5cblxubGV0IGRlc2lyZWRDYXBDb25zdHJhaW50cyA9IF8uZGVmYXVsdHMoe1xuICBzaG93WGNvZGVMb2c6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgd2RhTG9jYWxQb3J0OiB7XG4gICAgaXNOdW1iZXI6IHRydWVcbiAgfSxcbiAgaW9zSW5zdGFsbFBhdXNlOiB7XG4gICAgaXNOdW1iZXI6IHRydWVcbiAgfSxcbiAgeGNvZGVDb25maWdGaWxlOiB7XG4gICAgaXNTdHJpbmc6IHRydWVcbiAgfSxcbiAgeGNvZGVPcmdJZDoge1xuICAgIGlzU3RyaW5nOiB0cnVlXG4gIH0sXG4gIHhjb2RlU2lnbmluZ0lkOiB7XG4gICAgaXNTdHJpbmc6IHRydWVcbiAgfSxcbiAga2V5Y2hhaW5QYXRoOiB7XG4gICAgaXNTdHJpbmc6IHRydWVcbiAgfSxcbiAga2V5Y2hhaW5QYXNzd29yZDoge1xuICAgIGlzU3RyaW5nOiB0cnVlXG4gIH0sXG4gIGJvb3RzdHJhcFBhdGg6IHtcbiAgICBpc1N0cmluZzogdHJ1ZVxuICB9LFxuICBhZ2VudFBhdGg6IHtcbiAgICBpc1N0cmluZzogdHJ1ZVxuICB9LFxuICB0YXBXaXRoU2hvcnRQcmVzc0R1cmF0aW9uOiB7XG4gICAgaXNOdW1iZXI6IHRydWVcbiAgfSxcbiAgc2NhbGVGYWN0b3I6IHtcbiAgICBpc1N0cmluZzogdHJ1ZVxuICB9LFxuICB1c2VQcmVidWlsdFdEQToge1xuICAgIGlzQm9vbGVhbjogdHJ1ZVxuICB9LFxuICBjdXN0b21TU0xDZXJ0OiB7XG4gICAgaXNTdHJpbmc6IHRydWVcbiAgfSxcbiAgcHJldmVudFdEQUF0dGFjaG1lbnRzOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIHdlYkRyaXZlckFnZW50VXJsOiB7XG4gICAgaXNTdHJpbmc6IHRydWVcbiAgfSxcbiAgZGVyaXZlZERhdGFQYXRoOiB7XG4gICAgaXNTdHJpbmc6IHRydWVcbiAgfSxcbiAgdXNlTmV3V0RBOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIHdkYUxhdW5jaFRpbWVvdXQ6IHtcbiAgICBpc051bWJlcjogdHJ1ZVxuICB9LFxuICB3ZGFDb25uZWN0aW9uVGltZW91dDoge1xuICAgIGlzTnVtYmVyOiB0cnVlXG4gIH0sXG4gIHVwZGF0ZWRXREFCdW5kbGVJZDoge1xuICAgIGlzU3RyaW5nOiB0cnVlXG4gIH0sXG4gIHJlc2V0T25TZXNzaW9uU3RhcnRPbmx5OiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIGNvbW1hbmRUaW1lb3V0czoge1xuICAgIC8vIHJlY29nbml6ZSB0aGUgY2FwLFxuICAgIC8vIGJ1dCB2YWxpZGF0ZSBpbiB0aGUgZHJpdmVyI3ZhbGlkYXRlRGVzaXJlZENhcHMgbWV0aG9kXG4gIH0sXG4gIHdkYVN0YXJ0dXBSZXRyaWVzOiB7XG4gICAgaXNOdW1iZXI6IHRydWVcbiAgfSxcbiAgd2RhU3RhcnR1cFJldHJ5SW50ZXJ2YWw6IHtcbiAgICBpc051bWJlcjogdHJ1ZVxuICB9LFxuICBwcmVidWlsZFdEQToge1xuICAgIGlzQm9vbGVhbjogdHJ1ZVxuICB9LFxuICBjb25uZWN0SGFyZHdhcmVLZXlib2FyZDoge1xuICAgIGlzQm9vbGVhbjogdHJ1ZVxuICB9LFxuICBjYWxlbmRhckFjY2Vzc0F1dGhvcml6ZWQ6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgc3RhcnRJV0RQOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlLFxuICB9LFxuICB1c2VTaW1wbGVCdWlsZFRlc3Q6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgd2FpdEZvclF1aWVzY2VuY2U6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgbWF4VHlwaW5nRnJlcXVlbmN5OiB7XG4gICAgaXNOdW1iZXI6IHRydWVcbiAgfSxcbiAgbmF0aXZlVHlwaW5nOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIHNpbXBsZUlzVmlzaWJsZUNoZWNrOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIHVzZUNhcnRoYWdlU3NsOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIHNob3VsZFVzZVNpbmdsZXRvblRlc3RNYW5hZ2VyOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIGlzSGVhZGxlc3M6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgd2Via2l0RGVidWdQcm94eVBvcnQ6IHtcbiAgICBpc051bWJlcjogdHJ1ZVxuICB9LFxuICB1c2VYY3Rlc3RydW5GaWxlOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIGFic29sdXRlV2ViTG9jYXRpb25zOiB7XG4gICAgaXNCb29sZWFuOiB0cnVlXG4gIH0sXG4gIHNpbXVsYXRvcldpbmRvd0NlbnRlcjoge1xuICAgIGlzU3RyaW5nOiB0cnVlXG4gIH0sXG4gIHVzZUpTT05Tb3VyY2U6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgc2h1dGRvd25PdGhlclNpbXVsYXRvcnM6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAga2V5Y2hhaW5zRXhjbHVkZVBhdHRlcm5zOiB7XG4gICAgaXNTdHJpbmc6IHRydWVcbiAgfSxcbiAgcmVhbERldmljZVNjcmVlbnNob3R0ZXI6IHtcbiAgICBpc1N0cmluZzogdHJ1ZSxcbiAgICBwcmVzZW5jZTogZmFsc2UsXG4gICAgaW5jbHVzaW9uQ2FzZUluc2Vuc2l0aXZlOiBbJ2lkZXZpY2VzY3JlZW5zaG90J11cbiAgfSxcbiAgc2hvd1NhZmFyaUNvbnNvbGVMb2c6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgc2hvd1NhZmFyaU5ldHdvcmtMb2c6IHtcbiAgICBpc0Jvb2xlYW46IHRydWVcbiAgfSxcbiAgbWpwZWdTZXJ2ZXJQb3J0OiB7XG4gICAgaXNOdW1iZXI6IHRydWUsXG4gIH1cbn0sIGlvc0Rlc2lyZWRDYXBDb25zdHJhaW50cyk7XG5cbmV4cG9ydCB7IGRlc2lyZWRDYXBDb25zdHJhaW50cyB9O1xuZXhwb3J0IGRlZmF1bHQgZGVzaXJlZENhcENvbnN0cmFpbnRzO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLiJ9
