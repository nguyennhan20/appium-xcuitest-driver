'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _appiumSupport = require('appium-support');

var _rotatingLog = require('./rotating-log');

var SafariNetworkLog = (function (_RotatingLog) {
  _inherits(SafariNetworkLog, _RotatingLog);

  function SafariNetworkLog(showLogs) {
    _classCallCheck(this, SafariNetworkLog);

    _get(Object.getPrototypeOf(SafariNetworkLog.prototype), 'constructor', this).call(this, showLogs, 'SafariNetwork');
  }

  _createClass(SafariNetworkLog, [{
    key: 'getEntry',
    value: function getEntry(requestId) {
      var outputEntry = undefined;
      while (this.logs.length >= _rotatingLog.MAX_LOG_ENTRIES_COUNT) {
        // pull the first entry, which is the oldest
        var entry = this.logs.shift();
        if (entry && entry.requestId === requestId) {
          // we are adding to an existing entry, and it was almost removed
          // add to the end of the list and try again
          outputEntry = entry;
          this.logs.push(outputEntry);
          continue;
        }
        // we've removed an element, so the count is down one
        if (this.logIdxSinceLastRequest > 0) {
          this.logIdxSinceLastRequest--;
        }
      }

      if (!outputEntry) {
        // we do not yes have an entry to associate this bit of output with
        // most likely the entry will be at the end of the list, so start there
        for (var i = this.logs.length - 1; i >= 0; i--) {
          if (this.logs[i].requestId === requestId) {
            // found it!
            outputEntry = this.logs[i];
            // this is now the most current entry, so remove it from the list
            // to be added to the end below
            this.logs.splice(i, 1);
            break;
          }
        }

        // nothing has been found, so create a new entry
        if (!outputEntry) {
          outputEntry = {
            requestId: requestId,
            logs: []
          };
        }

        // finally, add the entry to the end of the list
        this.logs.push(outputEntry);
      }

      return outputEntry;
    }
  }, {
    key: 'addLogLine',
    value: function addLogLine(method, out) {
      if (!this.isCapturing && !this.showLogs) {
        // neither capturing nor displaying, so do nothing
        return;
      }

      if (['Network.dataReceived'].includes(method)) {
        // status update, no need to handle
        return;
      }

      // events we care about:
      //   Network.requestWillBeSent
      //   Network.responseReceived
      //   Network.loadingFinished
      //   Network.loadingFailed

      var outputEntry = this.getEntry(out.requestId);
      if (this.isCapturing) {
        // now add the output we just received to the logs for this particular entry
        outputEntry.logs = outputEntry.logs || [];

        outputEntry.logs.push(out);
      }

      // if we are not displaying the logs,
      // or we are not finished getting events for this network call,
      // we are done
      if (!this.showLogs) {
        return;
      }

      if (method === 'Network.loadingFinished' || method === 'Network.loadingFailed') {
        this.printLogLine(outputEntry);
      }
    }
  }, {
    key: 'getLogDetails',
    value: function getLogDetails(outputEntry) {
      // extract the data
      var record = outputEntry.logs.reduce(function (record, entry) {
        record.requestId = entry.requestId;
        if (entry.response) {
          var url = _url2['default'].parse(entry.response.url);
          // get the last part of the url, along with the query string, if possible
          record.name = '' + _lodash2['default'].last(url.pathname.split('/')) + (url.search ? '?' + url.search : '') || url.host;
          record.status = entry.response.status;
          if (entry.response.timing) {
            record.time = entry.response.timing.receiveHeadersEnd || entry.response.timing.responseStart || 0;
          }
          record.source = entry.response.source;
        }
        if (entry.type) {
          record.type = entry.type;
        }
        if (entry.initiator) {
          record.initiator = entry.initiator;
        }
        if (entry.metrics) {
          // Safari has a `metrics` object on it's `Network.loadingFinished` event
          record.size = entry.metrics.responseBodyBytesReceived || 0;
        }
        if (entry.errorText) {
          record.errorText = entry.errorText;
          // When a network call is cancelled, Safari returns `cancelled` as error text
          // but has a boolean `canceled`. Normalize the two spellings in favor of
          // the text, which will also be displayed
          record.cancelled = entry.canceled;
        }
        return record;
      }, {});

      return record;
    }
  }, {
    key: 'printLogLine',
    value: function printLogLine(outputEntry) {
      var _getLogDetails = this.getLogDetails(outputEntry);

      var requestId = _getLogDetails.requestId;
      var name = _getLogDetails.name;
      var status = _getLogDetails.status;
      var type = _getLogDetails.type;
      var _getLogDetails$initiator = _getLogDetails.initiator;
      var initiator = _getLogDetails$initiator === undefined ? {} : _getLogDetails$initiator;
      var _getLogDetails$size = _getLogDetails.size;
      var size = _getLogDetails$size === undefined ? 0 : _getLogDetails$size;
      var _getLogDetails$time = _getLogDetails.time;
      var time = _getLogDetails$time === undefined ? 0 : _getLogDetails$time;
      var source = _getLogDetails.source;
      var errorText = _getLogDetails.errorText;
      var _getLogDetails$cancelled = _getLogDetails.cancelled;
      var cancelled = _getLogDetails$cancelled === undefined ? false : _getLogDetails$cancelled;

      // print out the record, formatted appropriately
      this.log.debug('Network event:');
      this.log.debug('  Id: ' + requestId);
      this.log.debug('  Name: ' + name);
      this.log.debug('  Status: ' + status);
      this.log.debug('  Type: ' + type);
      this.log.debug('  Initiator: ' + initiator.type);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _getIterator(initiator.stackTrace || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var line = _step.value;

          var functionName = line.functionName || '(anonymous)';

          var url = !line.url || line.url === '[native code]' ? '' : '@' + _lodash2['default'].last((_url2['default'].parse(line.url).pathname || '').split('/')) + ':' + line.lineNumber;
          this.log.debug('    ' + _lodash2['default'].truncate(functionName, { length: 20 }).padEnd(21) + ' ' + url);
        }
        // get `memory-cache` or `disk-cache`, etc., right
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

      var sizeStr = source.includes('cache') ? ' (from ' + source.replace('-', ' ') + ')' : size + 'B';
      this.log.debug('  Size: ' + sizeStr);
      this.log.debug('  Time: ' + Math.round(time) + 'ms');
      if (errorText) {
        this.log.debug('  Error: ' + errorText);
      }
      if (_appiumSupport.util.hasValue(cancelled)) {
        this.log.debug('  Cancelled: ' + cancelled);
      }
    }
  }, {
    key: 'getLogs',
    value: function getLogs() {
      var logs;
      return _regeneratorRuntime.async(function getLogs$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(SafariNetworkLog.prototype), 'getLogs', this).call(this));

          case 2:
            logs = context$2$0.sent;
            return context$2$0.abrupt('return', logs.map(function (entry) {
              return _Object$assign({}, entry, {
                level: 'INFO',
                timestamp: Date.now(),
                message: JSON.stringify(entry)
              });
            }));

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return SafariNetworkLog;
})(_rotatingLog.RotatingLog);

exports.SafariNetworkLog = SafariNetworkLog;
exports['default'] = SafariNetworkLog;

// in order to satisfy certain clients, we need to have a basic structure
// to the results, with `level`, `timestamp`, and `message`, which is
// all the information stringified
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kZXZpY2UtbG9nL3NhZmFyaS1uZXR3b3JrLWxvZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQUFjLFFBQVE7Ozs7bUJBQ04sS0FBSzs7Ozs2QkFDQSxnQkFBZ0I7OzJCQUNjLGdCQUFnQjs7SUFHN0QsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7QUFDUixXQURSLGdCQUFnQixDQUNQLFFBQVEsRUFBRTswQkFEbkIsZ0JBQWdCOztBQUVsQiwrQkFGRSxnQkFBZ0IsNkNBRVosUUFBUSxFQUFFLGVBQWUsRUFBRTtHQUNsQzs7ZUFIRyxnQkFBZ0I7O1dBS1gsa0JBQUMsU0FBUyxFQUFFO0FBQ25CLFVBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sc0NBQXlCLEVBQUU7O0FBRWhELFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEMsWUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7OztBQUcxQyxxQkFBVyxHQUFHLEtBQUssQ0FBQztBQUNwQixjQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM1QixtQkFBUztTQUNWOztBQUVELFlBQUksSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsRUFBRTtBQUNuQyxjQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUMvQjtPQUNGOztBQUdELFVBQUksQ0FBQyxXQUFXLEVBQUU7OztBQUdoQixhQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlDLGNBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFOztBQUV4Qyx1QkFBVyxH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Q0FBRyxDQUFDO09BQzdDO0tBQ0Y7OztXQUVhO1VBQ04sSUFBSTs7Ozs7d0VBM0tSLGdCQUFnQjs7O0FBMktaLGdCQUFJO2dEQUlILElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLEVBQUU7QUFDL0IscUJBQU8sZUFBYyxFQUFFLEVBQUUsS0FBSyxFQUFFO0FBQzlCLHFCQUFLLEVBQUUsTUFBTTtBQUNiLHlCQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNyQix1QkFBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2VBQy9CLENBQUMsQ0FBQzthQUNKLENBQUM7Ozs7Ozs7S0FDSDs7O1NBdExHLGdCQUFnQjs7O1FBeUxiLGdCQUFnQixHQUFoQixnQkFBZ0I7cUJBQ1YsZ0JBQWdCIiwiZmlsZSI6ImxpYi9kZXZpY2UtbG9nL3NhZmFyaS1uZXR3b3JrLWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgVVJMIGZyb20gJ3VybCc7XG5pbXBvcnQgeyB1dGlsIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHsgUm90YXRpbmdMb2csIE1BWF9MT0dfRU5UUklFU19DT1VOVCB9IGZyb20gJy4vcm90YXRpbmctbG9nJztcblxuXG5jbGFzcyBTYWZhcmlOZXR3b3JrTG9nIGV4dGVuZHMgUm90YXRpbmdMb2cge1xuICBjb25zdHJ1Y3RvciAoc2hvd0xvZ3MpIHtcbiAgICBzdXBlcihzaG93TG9ncywgJ1NhZmFyaU5ldHdvcmsnKTtcbiAgfVxuXG4gIGdldEVudHJ5IChyZXF1ZXN0SWQpIHtcbiAgICBsZXQgb3V0cHV0RW50cnk7XG4gICAgd2hpbGUgKHRoaXMubG9ncy5sZW5ndGggPj0gTUFYX0xPR19FTlRSSUVTX0NPVU5UKSB7XG4gICAgICAvLyBwdWxsIHRoZSBmaXJzdCBlbnRyeSwgd2hpY2ggaXMgdGhlIG9sZGVzdFxuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmxvZ3Muc2hpZnQoKTtcbiAgICAgIGlmIChlbnRyeSAmJiBlbnRyeS5yZXF1ZXN0SWQgPT09IHJlcXVlc3RJZCkge1xuICAgICAgICAvLyB3ZSBhcmUgYWRkaW5nIHRvIGFuIGV4aXN0aW5nIGVudHJ5LCBhbmQgaXQgd2FzIGFsbW9zdCByZW1vdmVkXG4gICAgICAgIC8vIGFkZCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0IGFuZCB0cnkgYWdhaW5cbiAgICAgICAgb3V0cHV0RW50cnkgPSBlbnRyeTtcbiAgICAgICAgdGhpcy5sb2dzLnB1c2gob3V0cHV0RW50cnkpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIC8vIHdlJ3ZlIHJlbW92ZWQgYW4gZWxlbWVudCwgc28gdGhlIGNvdW50IGlzIGRvd24gb25lXG4gICAgICBpZiAodGhpcy5sb2dJZHhTaW5jZUxhc3RSZXF1ZXN0ID4gMCkge1xuICAgICAgICB0aGlzLmxvZ0lkeFNpbmNlTGFzdFJlcXVlc3QtLTtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIGlmICghb3V0cHV0RW50cnkpIHtcbiAgICAgIC8vIHdlIGRvIG5vdCB5ZXMgaGF2ZSBhbiBlbnRyeSB0byBhc3NvY2lhdGUgdGhpcyBiaXQgb2Ygb3V0cHV0IHdpdGhcbiAgICAgIC8vIG1vc3QgbGlrZWx5IHRoZSBlbnRyeSB3aWxsIGJlIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QsIHNvIHN0YXJ0IHRoZXJlXG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5sb2dzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmICh0aGlzLmxvZ3NbaV0ucmVxdWVzdElkID09PSByZXF1ZXN0SWQpIHtcbiAgICAgICAgICAvLyBmb3VuZCBpdCFcbiAgICAgICAgICBvdXRwdXRFbnRyeSA9IHRoaXMubG9nc1tpXTtcbiAgICAgICAgICAvLyB0aGlzIGlzIG5vdyB0aGUgbW9zdCBjdXJyZW50IGVudHJ5LCBzbyByZW1vdmUgaXQgZnJvbSB0aGUgbGlzdFxuICAgICAgICAgIC8vIHRvIGJlIGFkZGVkIHRvIHRoZSBlbmQgYmVsb3dcbiAgICAgICAgICB0aGlzLmxvZ3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG5vdGhpbmcgaGFzIGJlZW4gZm91bmQsIHNvIGNyZWF0ZSBhIG5ldyBlbnRyeVxuICAgICAgaWYgKCFvdXRwdXRFbnRyeSkge1xuICAgICAgICBvdXRwdXRFbnRyeSA9IHtcbiAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgbG9nczogW10sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbmFsbHksIGFkZCB0aGUgZW50cnkgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdFxuICAgICAgdGhpcy5sb2dzLnB1c2gob3V0cHV0RW50cnkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXRFbnRyeTtcbiAgfVxuXG4gIGFkZExvZ0xpbmUgKG1ldGhvZCwgb3V0KSB7XG4gICAgaWYgKCF0aGlzLmlzQ2FwdHVyaW5nICYmICF0aGlzLnNob3dMb2dzKSB7XG4gICAgICAvLyBuZWl0aGVyIGNhcHR1cmluZyBub3IgZGlzcGxheWluZywgc28gZG8gbm90aGluZ1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChbJ05ldHdvcmsuZGF0YVJlY2VpdmVkJ10uaW5jbHVkZXMobWV0aG9kKSkge1xuICAgICAgLy8gc3RhdHVzIHVwZGF0ZSwgbm8gbmVlZCB0byBoYW5kbGVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBldmVudHMgd2UgY2FyZSBhYm91dDpcbiAgICAvLyAgIE5ldHdvcmsucmVxdWVzdFdpbGxCZVNlbnRcbiAgICAvLyAgIE5ldHdvcmsucmVzcG9uc2VSZWNlaXZlZFxuICAgIC8vICAgTmV0d29yay5sb2FkaW5nRmluaXNoZWRcbiAgICAvLyAgIE5ldHdvcmsubG9hZGluZ0ZhaWxlZFxuXG4gICAgY29uc3Qgb3V0cHV0RW50cnkgPSB0aGlzLmdldEVudHJ5KG91dC5yZXF1ZXN0SWQpO1xuICAgIGlmICh0aGlzLmlzQ2FwdHVyaW5nKSB7XG4gICAgICAvLyBub3cgYWRkIHRoZSBvdXRwdXQgd2UganVzdCByZWNlaXZlZCB0byB0aGUgbG9ncyBmb3IgdGhpcyBwYXJ0aWN1bGFyIGVudHJ5XG4gICAgICBvdXRwdXRFbnRyeS5sb2dzID0gb3V0cHV0RW50cnkubG9ncyB8fCBbXTtcblxuICAgICAgb3V0cHV0RW50cnkubG9ncy5wdXNoKG91dCk7XG4gICAgfVxuXG4gICAgLy8gaWYgd2UgYXJlIG5vdCBkaXNwbGF5aW5nIHRoZSBsb2dzLFxuICAgIC8vIG9yIHdlIGFyZSBub3QgZmluaXNoZWQgZ2V0dGluZyBldmVudHMgZm9yIHRoaXMgbmV0d29yayBjYWxsLFxuICAgIC8vIHdlIGFyZSBkb25lXG4gICAgaWYgKCF0aGlzLnNob3dMb2dzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1ldGhvZCA9PT0gJ05ldHdvcmsubG9hZGluZ0ZpbmlzaGVkJyB8fCBtZXRob2QgPT09ICdOZXR3b3JrLmxvYWRpbmdGYWlsZWQnKSB7XG4gICAgICB0aGlzLnByaW50TG9nTGluZShvdXRwdXRFbnRyeSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TG9nRGV0YWlscyAob3V0cHV0RW50cnkpIHtcbiAgICAvLyBleHRyYWN0IHRoZSBkYXRhXG4gICAgY29uc3QgcmVjb3JkID0gb3V0cHV0RW50cnkubG9ncy5yZWR1Y2UoZnVuY3Rpb24gKHJlY29yZCwgZW50cnkpIHtcbiAgICAgIHJlY29yZC5yZXF1ZXN0SWQgPSBlbnRyeS5yZXF1ZXN0SWQ7XG4gICAgICBpZiAoZW50cnkucmVzcG9uc2UpIHtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLnBhcnNlKGVudHJ5LnJlc3BvbnNlLnVybCk7XG4gICAgICAgIC8vIGdldCB0aGUgbGFzdCBwYXJ0IG9mIHRoZSB1cmwsIGFsb25nIHdpdGggdGhlIHF1ZXJ5IHN0cmluZywgaWYgcG9zc2libGVcbiAgICAgICAgcmVjb3JkLm5hbWUgPSBgJHtfLmxhc3QodXJsLnBhdGhuYW1lLnNwbGl0KCcvJykpfSR7dXJsLnNlYXJjaCA/IGA/JHt1cmwuc2VhcmNofWAgOiAnJ31gIHx8IHVybC5ob3N0O1xuICAgICAgICByZWNvcmQuc3RhdHVzID0gZW50cnkucmVzcG9uc2Uuc3RhdHVzO1xuICAgICAgICBpZiAoZW50cnkucmVzcG9uc2UudGltaW5nKSB7XG4gICAgICAgICAgcmVjb3JkLnRpbWUgPSBlbnRyeS5yZXNwb25zZS50aW1pbmcucmVjZWl2ZUhlYWRlcnNFbmRcbiAgICAgICAgICAgIHx8IGVudHJ5LnJlc3BvbnNlLnRpbWluZy5yZXNwb25zZVN0YXJ0XG4gICAgICAgICAgICB8fCAwO1xuICAgICAgICB9XG4gICAgICAgIHJlY29yZC5zb3VyY2UgPSBlbnRyeS5yZXNwb25zZS5zb3VyY2U7XG4gICAgICB9XG4gICAgICBpZiAoZW50cnkudHlwZSkge1xuICAgICAgICByZWNvcmQudHlwZSA9IGVudHJ5LnR5cGU7XG4gICAgICB9XG4gICAgICBpZiAoZW50cnkuaW5pdGlhdG9yKSB7XG4gICAgICAgIHJlY29yZC5pbml0aWF0b3IgPSBlbnRyeS5pbml0aWF0b3I7XG4gICAgICB9XG4gICAgICBpZiAoZW50cnkubWV0cmljcykge1xuICAgICAgICAvLyBTYWZhcmkgaGFzIGEgYG1ldHJpY3NgIG9iamVjdCBvbiBpdCdzIGBOZXR3b3JrLmxvYWRpbmdGaW5pc2hlZGAgZXZlbnRcbiAgICAgICAgcmVjb3JkLnNpemUgPSBlbnRyeS5tZXRyaWNzLnJlc3BvbnNlQm9keUJ5dGVzUmVjZWl2ZWQgfHwgMDtcbiAgICAgIH1cbiAgICAgIGlmIChlbnRyeS5lcnJvclRleHQpIHtcbiAgICAgICAgcmVjb3JkLmVycm9yVGV4dCA9IGVudHJ5LmVycm9yVGV4dDtcbiAgICAgICAgLy8gV2hlbiBhIG5ldHdvcmsgY2FsbCBpcyBjYW5jZWxsZWQsIFNhZmFyaSByZXR1cm5zIGBjYW5jZWxsZWRgIGFzIGVycm9yIHRleHRcbiAgICAgICAgLy8gYnV0IGhhcyBhIGJvb2xlYW4gYGNhbmNlbGVkYC4gTm9ybWFsaXplIHRoZSB0d28gc3BlbGxpbmdzIGluIGZhdm9yIG9mXG4gICAgICAgIC8vIHRoZSB0ZXh0LCB3aGljaCB3aWxsIGFsc28gYmUgZGlzcGxheWVkXG4gICAgICAgIHJlY29yZC5jYW5jZWxsZWQgPSBlbnRyeS5jYW5jZWxlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfSwge30pO1xuXG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIHByaW50TG9nTGluZSAob3V0cHV0RW50cnkpIHtcbiAgICBjb25zdCB7XG4gICAgICByZXF1ZXN0SWQsXG4gICAgICBuYW1lLFxuICAgICAgc3RhdHVzLFxuICAgICAgdHlwZSxcbiAgICAgIGluaXRpYXRvciA9IHt9LFxuICAgICAgc2l6ZSA9IDAsXG4gICAgICB0aW1lID0gMCxcbiAgICAgIHNvdXJjZSxcbiAgICAgIGVycm9yVGV4dCxcbiAgICAgIGNhbmNlbGxlZCA9IGZhbHNlLFxuICAgIH0gPSB0aGlzLmdldExvZ0RldGFpbHMob3V0cHV0RW50cnkpO1xuXG4gICAgLy8gcHJpbnQgb3V0IHRoZSByZWNvcmQsIGZvcm1hdHRlZCBhcHByb3ByaWF0ZWx5XG4gICAgdGhpcy5sb2cuZGVidWcoYE5ldHdvcmsgZXZlbnQ6YCk7XG4gICAgdGhpcy5sb2cuZGVidWcoYCAgSWQ6ICR7cmVxdWVzdElkfWApO1xuICAgIHRoaXMubG9nLmRlYnVnKGAgIE5hbWU6ICR7bmFtZX1gKTtcbiAgICB0aGlzLmxvZy5kZWJ1ZyhgICBTdGF0dXM6ICR7c3RhdHVzfWApO1xuICAgIHRoaXMubG9nLmRlYnVnKGAgIFR5cGU6ICR7dHlwZX1gKTtcbiAgICB0aGlzLmxvZy5kZWJ1ZyhgICBJbml0aWF0b3I6ICR7aW5pdGlhdG9yLnR5cGV9YCk7XG4gICAgZm9yIChjb25zdCBsaW5lIG9mIChpbml0aWF0b3Iuc3RhY2tUcmFjZSB8fCBbXSkpIHtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGxpbmUuZnVuY3Rpb25OYW1lIHx8ICcoYW5vbnltb3VzKSc7XG5cbiAgICAgIGNvbnN0IHVybCA9ICghbGluZS51cmwgfHwgbGluZS51cmwgPT09ICdbbmF0aXZlIGNvZGVdJylcbiAgICAgICAgPyAnJ1xuICAgICAgICA6IGBAJHtfLmxhc3QoKFVSTC5wYXJzZShsaW5lLnVybCkucGF0aG5hbWUgfHwgJycpLnNwbGl0KCcvJykpfToke2xpbmUubGluZU51bWJlcn1gO1xuICAgICAgdGhpcy5sb2cuZGVidWcoYCAgICAke18udHJ1bmNhdGUoZnVuY3Rpb25OYW1lLCB7bGVuZ3RoOiAyMH0pLnBhZEVuZCgyMSl9ICR7dXJsfWApO1xuICAgIH1cbiAgICAvLyBnZXQgYG1lbW9yeS1jYWNoZWAgb3IgYGRpc2stY2FjaGVgLCBldGMuLCByaWdodFxuICAgIGNvbnN0IHNpemVTdHIgPSBzb3VyY2UuaW5jbHVkZXMoJ2NhY2hlJykgPyBgIChmcm9tICR7c291cmNlLnJlcGxhY2UoJy0nLCAnICcpfSlgIDogYCR7c2l6ZX1CYDtcbiAgICB0aGlzLmxvZy5kZWJ1ZyhgICBTaXplOiAke3NpemVTdHJ9YCk7XG4gICAgdGhpcy5sb2cuZGVidWcoYCAgVGltZTogJHtNYXRoLnJvdW5kKHRpbWUpfW1zYCk7XG4gICAgaWYgKGVycm9yVGV4dCkge1xuICAgICAgdGhpcy5sb2cuZGVidWcoYCAgRXJyb3I6ICR7ZXJyb3JUZXh0fWApO1xuICAgIH1cbiAgICBpZiAodXRpbC5oYXNWYWx1ZShjYW5jZWxsZWQpKSB7XG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhgICBDYW5jZWxsZWQ6ICR7Y2FuY2VsbGVkfWApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldExvZ3MgKCkge1xuICAgIGNvbnN0IGxvZ3MgPSBhd2FpdCBzdXBlci5nZXRMb2dzKCk7XG4gICAgLy8gaW4gb3JkZXIgdG8gc2F0aXNmeSBjZXJ0YWluIGNsaWVudHMsIHdlIG5lZWQgdG8gaGF2ZSBhIGJhc2ljIHN0cnVjdHVyZVxuICAgIC8vIHRvIHRoZSByZXN1bHRzLCB3aXRoIGBsZXZlbGAsIGB0aW1lc3RhbXBgLCBhbmQgYG1lc3NhZ2VgLCB3aGljaCBpc1xuICAgIC8vIGFsbCB0aGUgaW5mb3JtYXRpb24gc3RyaW5naWZpZWRcbiAgICByZXR1cm4gbG9ncy5tYXAoZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZW50cnksIHtcbiAgICAgICAgbGV2ZWw6ICdJTkZPJyxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBtZXNzYWdlOiBKU09OLnN0cmluZ2lmeShlbnRyeSksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgeyBTYWZhcmlOZXR3b3JrTG9nIH07XG5leHBvcnQgZGVmYXVsdCBTYWZhcmlOZXR3b3JrTG9nO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
