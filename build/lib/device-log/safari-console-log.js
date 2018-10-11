'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _rotatingLog = require('./rotating-log');

var SafariConsoleLog = (function (_RotatingLog) {
  _inherits(SafariConsoleLog, _RotatingLog);

  function SafariConsoleLog(showLogs) {
    _classCallCheck(this, SafariConsoleLog);

    _get(Object.getPrototypeOf(SafariConsoleLog.prototype), 'constructor', this).call(this, showLogs, 'SafariConsole');

    // js console has `warning` level, so map to `warn`
    this.log.warning = this.log.warn;
  }

  _createClass(SafariConsoleLog, [{
    key: 'addLogLine',
    value: function addLogLine(out) {
      if (this.isCapturing) {
        this.logs = this.logs || [];
        while (this.logs.length >= _rotatingLog.MAX_LOG_ENTRIES_COUNT) {
          this.logs.shift();
          if (this.logIdxSinceLastRequest > 0) {
            this.logIdxSinceLastRequest--;
          }
        }

        /*
         * The output will be like:
         *   {
         *     "source": "javascript",
         *     "level":"error",
         *     "text":"ReferenceError: Can't find variable: s_account",
         *     "type":"log",
         *     "line":2,
         *     "column":21,
         *     "url":"https://assets.adobedtm.com/b46e318d845250834eda10c5a20827c045a4d76f/scripts/satellite-57866f8b64746d53a8000104-staging.js",
         *     "repeatCount":1,
         *     "stackTrace":[{
         *       "functionName":"global code",
         *       "url":"https://assets.adobedtm.com/b46e318d845250834eda10c5a20827c045a4d76f/scripts/satellite-57866f8b64746d53a8000104-staging.js",
         *       "scriptId":"6",
         *       "lineNumber":2,
         *       "columnNumber":21
         *     }]
         *  }
         *
         * we need, at least, `level` (in accordance with Java levels
         * (https://docs.oracle.com/javase/7/docs/api/java/util/logging/Level.html)),
         * `timestamp`, and `message` to satisfy the java client. In order to
         * provide all the information to the client, `message` is the full
         * object, stringified.
         */
        var entry = {
          level: ({
            error: 'SEVERE',
            warning: 'WARNING',
            log: 'FINE'
          })[out.level] || 'INFO',
          timestamp: Date.now(),
          message: JSON.stringify(out)
        };
        this.logs.push(entry);
      }

      // format output like
      //     SafariConsole [WARNING][http://appium.io 2:13] Log something to warn
      if (this.showLogs) {
        var level = 'debug';
        if (out.level === 'warning' || out.level === 'error') {
          level = out.level;
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _getIterator(out.text.split('\n')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var line = _step.value;

            // url is optional, so get formatting here
            var url = out.url ? out.url + ' ' : '';
            this.log[level]('[' + level.toUpperCase() + '][' + url + out.line + ':' + out.column + '] ' + line);
          }
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
      }
    }
  }]);

  return SafariConsoleLog;
})(_rotatingLog.RotatingLog);

exports.SafariConsoleLog = SafariConsoleLog;
exports['default'] = SafariConsoleLog;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kZXZpY2UtbG9nL3NhZmFyaS1jb25zb2xlLWxvZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OzJCQUFtRCxnQkFBZ0I7O0lBRzdELGdCQUFnQjtZQUFoQixnQkFBZ0I7O0FBQ1IsV0FEUixnQkFBZ0IsQ0FDUCxRQUFRLEVBQUU7MEJBRG5CLGdCQUFnQjs7QUFFbEIsK0JBRkUsZ0JBQWdCLDZDQUVaLFFBQVEsRUFBRSxlQUFlLEVBQUU7OztBQUdqQyxRQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztHQUNsQzs7ZUFORyxnQkFBZ0I7O1dBUVQsb0JBQUMsR0FBRyxFQUFFO0FBQ2YsVUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3BCLFlBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDNUIsZUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sc0NBQXlCLEVBQUU7QUFDaEQsY0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsQixjQUFJLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLEVBQUU7QUFDbkMsZ0JBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1dBQy9CO1NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkQsWUFBTSxLQUFLLEdBQUc7QUFDWixlQUFLLEVBQUUsQ0FBQTtBQUNMLGlCQUFLLEVBQUUsUUFBUTtBQUNmLG1CQUFPLEVBQUUsU0FBUztBQUNsQixlQUFHLEVBQUUsTUFBTTtZQUNaLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU07QUFDdEIsbUJBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ3JCLGlCQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7U0FDN0IsQ0FBQztBQUNGLFlBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3ZCOzs7O0FBSUQsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUNwQixZQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssT0FBTyxFQUFFO0FBQ3BELGVBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1NBQ25COzs7Ozs7QUFDRCw0Q0FBbUIsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLDRHQUFFO2dCQUE5QixJQUFJOzs7QUFFYixnQkFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBTSxHQUFHLENBQUMsR0FBRyxTQUFNLEVBQUUsQ0FBQztBQUN6QyxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBSyxLQUFLLENBQUMsV0FBVyxFQUFFLFVBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFNBQUksR0FBRyxDQUFDLE1BQU0sVUFBSyxJQUFJLENBQUcsQ0FBQztXQUN0Rjs7Ozs7Ozs7Ozs7Ozs7O09BQ0Y7S0FDRjs7O1NBckVHLGdCQUFnQjs7O1FBd0ViLGdCQUFnQixHQUFoQixnQkFBZ0I7cUJBQ1YsZ0JBQWdCIiwiZmlsZSI6ImxpYi9kZXZpY2UtbG9nL3NhZmFyaS1jb25zb2xlLWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvdGF0aW5nTG9nLCBNQVhfTE9HX0VOVFJJRVNfQ09VTlQgfSBmcm9tICcuL3JvdGF0aW5nLWxvZyc7XG5cblxuY2xhc3MgU2FmYXJpQ29uc29sZUxvZyBleHRlbmRzIFJvdGF0aW5nTG9nIHtcbiAgY29uc3RydWN0b3IgKHNob3dMb2dzKSB7XG4gICAgc3VwZXIoc2hvd0xvZ3MsICdTYWZhcmlDb25zb2xlJyk7XG5cbiAgICAvLyBqcyBjb25zb2xlIGhhcyBgd2FybmluZ2AgbGV2ZWwsIHNvIG1hcCB0byBgd2FybmBcbiAgICB0aGlzLmxvZy53YXJuaW5nID0gdGhpcy5sb2cud2FybjtcbiAgfVxuXG4gIGFkZExvZ0xpbmUgKG91dCkge1xuICAgIGlmICh0aGlzLmlzQ2FwdHVyaW5nKSB7XG4gICAgICB0aGlzLmxvZ3MgPSB0aGlzLmxvZ3MgfHwgW107XG4gICAgICB3aGlsZSAodGhpcy5sb2dzLmxlbmd0aCA+PSBNQVhfTE9HX0VOVFJJRVNfQ09VTlQpIHtcbiAgICAgICAgdGhpcy5sb2dzLnNoaWZ0KCk7XG4gICAgICAgIGlmICh0aGlzLmxvZ0lkeFNpbmNlTGFzdFJlcXVlc3QgPiAwKSB7XG4gICAgICAgICAgdGhpcy5sb2dJZHhTaW5jZUxhc3RSZXF1ZXN0LS07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqIFRoZSBvdXRwdXQgd2lsbCBiZSBsaWtlOlxuICAgICAgICogICB7XG4gICAgICAgKiAgICAgXCJzb3VyY2VcIjogXCJqYXZhc2NyaXB0XCIsXG4gICAgICAgKiAgICAgXCJsZXZlbFwiOlwiZXJyb3JcIixcbiAgICAgICAqICAgICBcInRleHRcIjpcIlJlZmVyZW5jZUVycm9yOiBDYW4ndCBmaW5kIHZhcmlhYmxlOiBzX2FjY291bnRcIixcbiAgICAgICAqICAgICBcInR5cGVcIjpcImxvZ1wiLFxuICAgICAgICogICAgIFwibGluZVwiOjIsXG4gICAgICAgKiAgICAgXCJjb2x1bW5cIjoyMSxcbiAgICAgICAqICAgICBcInVybFwiOlwiaHR0cHM6Ly9hc3NldHMuYWRvYmVkdG0uY29tL2I0NmUzMThkODQ1MjUwODM0ZWRhMTBjNWEyMDgyN2MwNDVhNGQ3NmYvc2NyaXB0cy9zYXRlbGxpdGUtNTc4NjZmOGI2NDc0NmQ1M2E4MDAwMTA0LXN0YWdpbmcuanNcIixcbiAgICAgICAqICAgICBcInJlcGVhdENvdW50XCI6MSxcbiAgICAgICAqICAgICBcInN0YWNrVHJhY2VcIjpbe1xuICAgICAgICogICAgICAgXCJmdW5jdGlvbk5hbWVcIjpcImdsb2JhbCBjb2RlXCIsXG4gICAgICAgKiAgICAgICBcInVybFwiOlwiaHR0cHM6Ly9hc3NldHMuYWRvYmVkdG0uY29tL2I0NmUzMThkODQ1MjUwODM0ZWRhMTBjNWEyMDgyN2MwNDVhNGQ3NmYvc2NyaXB0cy9zYXRlbGxpdGUtNTc4NjZmOGI2NDc0NmQ1M2E4MDAwMTA0LXN0YWdpbmcuanNcIixcbiAgICAgICAqICAgICAgIFwic2NyaXB0SWRcIjpcIjZcIixcbiAgICAgICAqICAgICAgIFwibGluZU51bWJlclwiOjIsXG4gICAgICAgKiAgICAgICBcImNvbHVtbk51bWJlclwiOjIxXG4gICAgICAgKiAgICAgfV1cbiAgICAgICAqICB9XG4gICAgICAgKlxuICAgICAgICogd2UgbmVlZCwgYXQgbGVhc3QsIGBsZXZlbGAgKGluIGFjY29yZGFuY2Ugd2l0aCBKYXZhIGxldmVsc1xuICAgICAgICogKGh0dHBzOi8vZG9jcy5vcmFjbGUuY29tL2phdmFzZS83L2RvY3MvYXBpL2phdmEvdXRpbC9sb2dnaW5nL0xldmVsLmh0bWwpKSxcbiAgICAgICAqIGB0aW1lc3RhbXBgLCBhbmQgYG1lc3NhZ2VgIHRvIHNhdGlzZnkgdGhlIGphdmEgY2xpZW50LiBJbiBvcmRlciB0b1xuICAgICAgICogcHJvdmlkZSBhbGwgdGhlIGluZm9ybWF0aW9uIHRvIHRoZSBjbGllbnQsIGBtZXNzYWdlYCBpcyB0aGUgZnVsbFxuICAgICAgICogb2JqZWN0LCBzdHJpbmdpZmllZC5cbiAgICAgICAqL1xuICAgICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgIGxldmVsOiB7XG4gICAgICAgICAgZXJyb3I6ICdTRVZFUkUnLFxuICAgICAgICAgIHdhcm5pbmc6ICdXQVJOSU5HJyxcbiAgICAgICAgICBsb2c6ICdGSU5FJyxcbiAgICAgICAgfVtvdXQubGV2ZWxdIHx8ICdJTkZPJyxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBtZXNzYWdlOiBKU09OLnN0cmluZ2lmeShvdXQpLFxuICAgICAgfTtcbiAgICAgIHRoaXMubG9ncy5wdXNoKGVudHJ5KTtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXQgb3V0cHV0IGxpa2VcbiAgICAvLyAgICAgU2FmYXJpQ29uc29sZSBbV0FSTklOR11baHR0cDovL2FwcGl1bS5pbyAyOjEzXSBMb2cgc29tZXRoaW5nIHRvIHdhcm5cbiAgICBpZiAodGhpcy5zaG93TG9ncykge1xuICAgICAgbGV0IGxldmVsID0gJ2RlYnVnJztcbiAgICAgIGlmIChvdXQubGV2ZWwgPT09ICd3YXJuaW5nJyB8fCBvdXQubGV2ZWwgPT09ICdlcnJvcicpIHtcbiAgICAgICAgbGV2ZWwgPSBvdXQubGV2ZWw7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2Ygb3V0LnRleHQuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgIC8vIHVybCBpcyBvcHRpb25hbCwgc28gZ2V0IGZvcm1hdHRpbmcgaGVyZVxuICAgICAgICBjb25zdCB1cmwgPSBvdXQudXJsID8gYCR7b3V0LnVybH0gYCA6ICcnO1xuICAgICAgICB0aGlzLmxvZ1tsZXZlbF0oYFske2xldmVsLnRvVXBwZXJDYXNlKCl9XVske3VybH0ke291dC5saW5lfToke291dC5jb2x1bW59XSAke2xpbmV9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IFNhZmFyaUNvbnNvbGVMb2cgfTtcbmV4cG9ydCBkZWZhdWx0IFNhZmFyaUNvbnNvbGVMb2c7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
