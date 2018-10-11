'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumSupport = require('appium-support');

var MAX_LOG_ENTRIES_COUNT = 10000;

var RotatingLog = (function () {
  function RotatingLog() {
    var showLogs = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
    var label = arguments.length <= 1 || arguments[1] === undefined ? 'Log Label' : arguments[1];

    _classCallCheck(this, RotatingLog);

    this.log = _appiumSupport.logger.getLogger(label);

    this.showLogs = showLogs;
    this.logs = [];
    this.logIdxSinceLastRequest = 0;

    this.isCapturing = false;
  }

  _createClass(RotatingLog, [{
    key: 'startCapture',
    value: function startCapture() {
      return _regeneratorRuntime.async(function startCapture$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.isCapturing = true;

          case 1:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'stopCapture',
    value: function stopCapture() {
      return _regeneratorRuntime.async(function stopCapture$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.isCapturing = false;

          case 1:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /*
     * @override
     */
  }, {
    key: 'addLogLine',
    value: function addLogLine() {}
  }, {
    key: 'getLogs',
    value: function getLogs() {
      var result;
      return _regeneratorRuntime.async(function getLogs$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(this.logs.length && this.logIdxSinceLastRequest < this.logs.length)) {
              context$2$0.next = 5;
              break;
            }

            result = this.logs;

            if (this.logIdxSinceLastRequest > 0) {
              result = result.slice(this.logIdxSinceLastRequest);
            }
            this.logIdxSinceLastRequest = this.logs.length;
            return context$2$0.abrupt('return', result);

          case 5:
            return context$2$0.abrupt('return', []);

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getAllLogs',
    value: function getAllLogs() {
      return _regeneratorRuntime.async(function getAllLogs$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            return context$2$0.abrupt('return', _lodash2['default'].clone(this.logs));

          case 1:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'logs',
    get: function get() {
      if (!this._logs) {
        this.logs = [];
      }
      return this._logs;
    },
    set: function set(logs) {
      this._logs = logs;
    }
  }]);

  return RotatingLog;
})();

exports.RotatingLog = RotatingLog;
exports.MAX_LOG_ENTRIES_COUNT = MAX_LOG_ENTRIES_COUNT;
exports['default'] = RotatingLog;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kZXZpY2UtbG9nL3JvdGF0aW5nLWxvZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFBYyxRQUFROzs7OzZCQUNDLGdCQUFnQjs7QUFHdkMsSUFBTSxxQkFBcUIsR0FBRyxLQUFLLENBQUM7O0lBRTlCLFdBQVc7QUFDSCxXQURSLFdBQVcsR0FDcUM7UUFBdkMsUUFBUSx5REFBRyxLQUFLO1FBQUUsS0FBSyx5REFBRyxXQUFXOzswQkFEOUMsV0FBVzs7QUFFYixRQUFJLENBQUMsR0FBRyxHQUFHLHNCQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixRQUFJLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDOztBQUVoQyxRQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztHQUMxQjs7ZUFURyxXQUFXOztXQVdJOzs7O0FBQ2pCLGdCQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzs7Ozs7OztLQUN6Qjs7O1dBRWlCOzs7O0FBQ2hCLGdCQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQzs7Ozs7OztLQUMxQjs7Ozs7OztXQUtVLHNCQUFHLEVBQ2I7OztXQUVhO1VBRU4sTUFBTTs7OztrQkFEUixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7Ozs7O0FBQ2hFLGtCQUFNLEdBQUcsSUFBSSxDQUFDLElBQUk7O0FBQ3RCLGdCQUFJLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLEVBQUU7QUFDbkMsb0JBQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2FBQ3BEO0FBQ0QsZ0JBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnREFDeEMsTUFBTTs7O2dEQUVSLEVBQUU7Ozs7Ozs7S0FDVjs7O1dBRWdCOzs7O2dEQUNSLG9CQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7O0tBQzFCOzs7U0FFUSxlQUFHO0FBQ1YsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZixZQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztPQUNoQjtBQUNELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztLQUNuQjtTQUVRLGFBQUMsSUFBSSxFQUFFO0FBQ2QsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7S0FDbkI7OztTQWxERyxXQUFXOzs7UUFxRFIsV0FBVyxHQUFYLFdBQVc7UUFBRSxxQkFBcUIsR0FBckIscUJBQXFCO3FCQUM1QixXQUFXIiwiZmlsZSI6ImxpYi9kZXZpY2UtbG9nL3JvdGF0aW5nLWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5cblxuY29uc3QgTUFYX0xPR19FTlRSSUVTX0NPVU5UID0gMTAwMDA7XG5cbmNsYXNzIFJvdGF0aW5nTG9nIHtcbiAgY29uc3RydWN0b3IgKHNob3dMb2dzID0gZmFsc2UsIGxhYmVsID0gJ0xvZyBMYWJlbCcpIHtcbiAgICB0aGlzLmxvZyA9IGxvZ2dlci5nZXRMb2dnZXIobGFiZWwpO1xuXG4gICAgdGhpcy5zaG93TG9ncyA9IHNob3dMb2dzO1xuICAgIHRoaXMubG9ncyA9IFtdO1xuICAgIHRoaXMubG9nSWR4U2luY2VMYXN0UmVxdWVzdCA9IDA7XG5cbiAgICB0aGlzLmlzQ2FwdHVyaW5nID0gZmFsc2U7XG4gIH1cblxuICBhc3luYyBzdGFydENhcHR1cmUgKCkge1xuICAgIHRoaXMuaXNDYXB0dXJpbmcgPSB0cnVlO1xuICB9XG5cbiAgYXN5bmMgc3RvcENhcHR1cmUgKCkge1xuICAgIHRoaXMuaXNDYXB0dXJpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgYWRkTG9nTGluZSAoKSB7XG4gIH1cblxuICBhc3luYyBnZXRMb2dzICgpIHtcbiAgICBpZiAodGhpcy5sb2dzLmxlbmd0aCAmJiB0aGlzLmxvZ0lkeFNpbmNlTGFzdFJlcXVlc3QgPCB0aGlzLmxvZ3MubGVuZ3RoKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gdGhpcy5sb2dzO1xuICAgICAgaWYgKHRoaXMubG9nSWR4U2luY2VMYXN0UmVxdWVzdCA+IDApIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnNsaWNlKHRoaXMubG9nSWR4U2luY2VMYXN0UmVxdWVzdCk7XG4gICAgICB9XG4gICAgICB0aGlzLmxvZ0lkeFNpbmNlTGFzdFJlcXVlc3QgPSB0aGlzLmxvZ3MubGVuZ3RoO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWxsTG9ncyAoKSB7XG4gICAgcmV0dXJuIF8uY2xvbmUodGhpcy5sb2dzKTtcbiAgfVxuXG4gIGdldCBsb2dzICgpIHtcbiAgICBpZiAoIXRoaXMuX2xvZ3MpIHtcbiAgICAgIHRoaXMubG9ncyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9ncztcbiAgfVxuXG4gIHNldCBsb2dzIChsb2dzKSB7XG4gICAgdGhpcy5fbG9ncyA9IGxvZ3M7XG4gIH1cbn1cblxuZXhwb3J0IHsgUm90YXRpbmdMb2csIE1BWF9MT0dfRU5UUklFU19DT1VOVCB9O1xuZXhwb3J0IGRlZmF1bHQgUm90YXRpbmdMb2c7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
