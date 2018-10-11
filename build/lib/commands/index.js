'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _execute = require('./execute');

var _execute2 = _interopRequireDefault(_execute);

var _gesture = require('./gesture');

var _gesture2 = _interopRequireDefault(_gesture);

var _find = require('./find');

var _find2 = _interopRequireDefault(_find);

var _proxyHelper = require('./proxy-helper');

var _proxyHelper2 = _interopRequireDefault(_proxyHelper);

var _alert = require('./alert');

var _alert2 = _interopRequireDefault(_alert);

var _source = require('./source');

var _source2 = _interopRequireDefault(_source);

var _general = require('./general');

var _general2 = _interopRequireDefault(_general);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _web = require('./web');

var _web2 = _interopRequireDefault(_web);

var _timeouts = require('./timeouts');

var _timeouts2 = _interopRequireDefault(_timeouts);

var _navigation = require('./navigation');

var _navigation2 = _interopRequireDefault(_navigation);

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var _fileMovement = require('./file-movement');

var _fileMovement2 = _interopRequireDefault(_fileMovement);

var _screenshots = require('./screenshots');

var _screenshots2 = _interopRequireDefault(_screenshots);

var _pasteboard = require('./pasteboard');

var _pasteboard2 = _interopRequireDefault(_pasteboard);

var _location = require('./location');

var _location2 = _interopRequireDefault(_location);

var _recordscreen = require('./recordscreen');

var _recordscreen2 = _interopRequireDefault(_recordscreen);

var _lock = require('./lock');

var _lock2 = _interopRequireDefault(_lock);

var _appManagement = require('./app-management');

var _appManagement2 = _interopRequireDefault(_appManagement);

var _performance = require('./performance');

var _performance2 = _interopRequireDefault(_performance);

var _clipboard = require('./clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _certificate = require('./certificate');

var _certificate2 = _interopRequireDefault(_certificate);

var _battery = require('./battery');

var _battery2 = _interopRequireDefault(_battery);

var _cookies = require('./cookies');

var _cookies2 = _interopRequireDefault(_cookies);

var commands = {};

_Object$assign(commands, _context2['default'], _execute2['default'], _gesture2['default'], _find2['default'], _proxyHelper2['default'], _source2['default'], _general2['default'], _log2['default'], _web2['default'], _timeouts2['default'], _navigation2['default'], _element2['default'], _fileMovement2['default'], _alert2['default'], _screenshots2['default'], _pasteboard2['default'], _location2['default'], _lock2['default'], _recordscreen2['default'], _appManagement2['default'], _performance2['default'], _clipboard2['default'], _certificate2['default'], _battery2['default'], _cookies2['default']);

exports['default'] = commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3VCQUE0QixXQUFXOzs7O3VCQUNULFdBQVc7Ozs7dUJBQ1gsV0FBVzs7OztvQkFDZCxRQUFROzs7OzJCQUNELGdCQUFnQjs7OztxQkFDdEIsU0FBUzs7OztzQkFDUixVQUFVOzs7O3VCQUNULFdBQVc7Ozs7bUJBQ2YsT0FBTzs7OzttQkFDUCxPQUFPOzs7O3dCQUNILFlBQVk7Ozs7MEJBQ1QsY0FBYzs7Ozt1QkFDakIsV0FBVzs7Ozs0QkFDTixpQkFBaUI7Ozs7MkJBQ25CLGVBQWU7Ozs7MEJBQ2YsY0FBYzs7Ozt3QkFDaEIsWUFBWTs7Ozs0QkFDUixnQkFBZ0I7Ozs7b0JBQ3hCLFFBQVE7Ozs7NkJBQ0Msa0JBQWtCOzs7OzJCQUNwQixlQUFlOzs7O3lCQUNqQixhQUFhOzs7OzJCQUNYLGVBQWU7Ozs7dUJBQ25CLFdBQVc7Ozs7dUJBQ1gsV0FBVzs7OztBQUd6QyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRWxCLGVBQWMsUUFBUSxna0JBT3JCLENBQUM7O3FCQUVhLFFBQVEiLCJmaWxlIjoibGliL2NvbW1hbmRzL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNvbnRleHRDb21tYW5kcyBmcm9tICcuL2NvbnRleHQnO1xuaW1wb3J0IGV4ZWN1dGVFeHRlbnNpb25zIGZyb20gJy4vZXhlY3V0ZSc7XG5pbXBvcnQgZ2VzdHVyZUV4dGVuc2lvbnMgZnJvbSAnLi9nZXN0dXJlJztcbmltcG9ydCBmaW5kRXh0ZW5zaW9ucyBmcm9tICcuL2ZpbmQnO1xuaW1wb3J0IHByb3h5SGVscGVyRXh0ZW5zaW9ucyBmcm9tICcuL3Byb3h5LWhlbHBlcic7XG5pbXBvcnQgYWxlcnRFeHRlbnNpb25zIGZyb20gJy4vYWxlcnQnO1xuaW1wb3J0IHNvdXJjZUV4dGVuc2lvbnMgZnJvbSAnLi9zb3VyY2UnO1xuaW1wb3J0IGdlbmVyYWxFeHRlbnNpb25zIGZyb20gJy4vZ2VuZXJhbCc7XG5pbXBvcnQgbG9nRXh0ZW5zaW9ucyBmcm9tICcuL2xvZyc7XG5pbXBvcnQgd2ViRXh0ZW5zaW9ucyBmcm9tICcuL3dlYic7XG5pbXBvcnQgdGltZW91dEV4dGVuc2lvbnMgZnJvbSAnLi90aW1lb3V0cyc7XG5pbXBvcnQgbmF2aWdhdGlvbkV4dGVuc2lvbnMgZnJvbSAnLi9uYXZpZ2F0aW9uJztcbmltcG9ydCBlbGVtZW50RXh0ZW5zaW9ucyBmcm9tICcuL2VsZW1lbnQnO1xuaW1wb3J0IGZpbGVNb3ZlbWVudEV4dGVuc2lvbnMgZnJvbSAnLi9maWxlLW1vdmVtZW50JztcbmltcG9ydCBzY3JlZW5zaG90RXh0ZW5zaW9ucyBmcm9tICcuL3NjcmVlbnNob3RzJztcbmltcG9ydCBwYXN0ZWJvYXJkRXh0ZW5zaW9ucyBmcm9tICcuL3Bhc3RlYm9hcmQnO1xuaW1wb3J0IGxvY2F0aW9uRXh0ZW5zaW9ucyBmcm9tICcuL2xvY2F0aW9uJztcbmltcG9ydCByZWNvcmRTY3JlZW5FeHRlbnNpb25zIGZyb20gJy4vcmVjb3Jkc2NyZWVuJztcbmltcG9ydCBsb2NrRXh0ZW5zaW9ucyBmcm9tICcuL2xvY2snO1xuaW1wb3J0IGFwcE1hbmFnZW1lbnRFeHRlbnNpb25zIGZyb20gJy4vYXBwLW1hbmFnZW1lbnQnO1xuaW1wb3J0IHBlcmZvcm1hbmNlRXh0ZW5zaW9ucyBmcm9tICcuL3BlcmZvcm1hbmNlJztcbmltcG9ydCBjbGlwYm9hcmRFeHRlbnNpb25zIGZyb20gJy4vY2xpcGJvYXJkJztcbmltcG9ydCBjZXJ0aWZpY2F0ZUV4dGVuc2lvbnMgZnJvbSAnLi9jZXJ0aWZpY2F0ZSc7XG5pbXBvcnQgYmF0dGVyeUV4dGVuc2lvbnMgZnJvbSAnLi9iYXR0ZXJ5JztcbmltcG9ydCBjb29raWVzRXh0ZW5zaW9ucyBmcm9tICcuL2Nvb2tpZXMnO1xuXG5cbmxldCBjb21tYW5kcyA9IHt9O1xuXG5PYmplY3QuYXNzaWduKGNvbW1hbmRzLCBjb250ZXh0Q29tbWFuZHMsIGV4ZWN1dGVFeHRlbnNpb25zLFxuICBnZXN0dXJlRXh0ZW5zaW9ucywgZmluZEV4dGVuc2lvbnMsIHByb3h5SGVscGVyRXh0ZW5zaW9ucywgc291cmNlRXh0ZW5zaW9ucyxcbiAgZ2VuZXJhbEV4dGVuc2lvbnMsIGxvZ0V4dGVuc2lvbnMsIHdlYkV4dGVuc2lvbnMsIHRpbWVvdXRFeHRlbnNpb25zLFxuICBuYXZpZ2F0aW9uRXh0ZW5zaW9ucywgZWxlbWVudEV4dGVuc2lvbnMsIGZpbGVNb3ZlbWVudEV4dGVuc2lvbnMsXG4gIGFsZXJ0RXh0ZW5zaW9ucywgc2NyZWVuc2hvdEV4dGVuc2lvbnMsIHBhc3RlYm9hcmRFeHRlbnNpb25zLCBsb2NhdGlvbkV4dGVuc2lvbnMsXG4gIGxvY2tFeHRlbnNpb25zLCByZWNvcmRTY3JlZW5FeHRlbnNpb25zLCBhcHBNYW5hZ2VtZW50RXh0ZW5zaW9ucywgcGVyZm9ybWFuY2VFeHRlbnNpb25zLFxuICBjbGlwYm9hcmRFeHRlbnNpb25zLCBjZXJ0aWZpY2F0ZUV4dGVuc2lvbnMsIGJhdHRlcnlFeHRlbnNpb25zLCBjb29raWVzRXh0ZW5zaW9uc1xuKTtcblxuZXhwb3J0IGRlZmF1bHQgY29tbWFuZHM7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
