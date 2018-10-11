'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumSupport = require('appium-support');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _appiumIosDriver = require('appium-ios-driver');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _teen_process = require('teen_process');

var _nodeSimctl = require('node-simctl');

var CONTAINER_PATH_MARKER = '@';
// https://regex101.com/r/PLdB0G/2
var CONTAINER_PATH_PATTERN = new RegExp('^' + CONTAINER_PATH_MARKER + '([^/]+)/(.+)');
var CONTAINER_TYPE_SEPARATOR = ':';

var commands = _appiumIosDriver.iosCommands.file;

function verifyIFusePresence() {
  return _regeneratorRuntime.async(function verifyIFusePresence$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.which('ifuse'));

      case 2:
        if (context$1$0.sent) {
          context$1$0.next = 4;
          break;
        }

        _logger2['default'].errorAndThrow('\'ifuse\' tool is required to be installed on the machine. ' + 'Install it using \'brew cask install osxfuse && brew install ifuse\' or check ' + 'if it is available in PATH environment variable if the tool is already installed. ' + ('Current PATH value: ' + process.env.PATH));

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function mountDevice(device, iFuseArgs) {
  return _regeneratorRuntime.async(function mountDevice$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Starting ifuse with args \'' + iFuseArgs + '\'...');
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('ifuse', iFuseArgs));

      case 4:
        context$1$0.next = 9;
        break;

      case 6:
        context$1$0.prev = 6;
        context$1$0.t0 = context$1$0['catch'](1);

        _logger2['default'].errorAndThrow('Cannot mount the media folder of the device with UDID ' + device.udid + '. ' + 'Make sure osxfuse plugin has necessary permissions in System Preferences->Security & Privacy. ' + ('Error code: ' + context$1$0.t0.code + '; stderr output: ' + context$1$0.t0.stderr));

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 6]]);
}

function verifyIsSubPath(originalPath, root) {
  var normalizedRoot = _path2['default'].normalize(root);
  var normalizedPath = _path2['default'].normalize(_path2['default'].dirname(originalPath));
  if (!normalizedPath.startsWith(normalizedRoot)) {
    _logger2['default'].errorAndThrow('\'' + normalizedPath + '\' is expected to be a subpath of \'' + normalizedRoot + '\'');
  }
}

/**
 * Parses the actual path and the bundle identifier from the given path string
 *
 * @param {string} remotePath - The given path string. The string should
 * match `CONTAINER_PATH_PATTERN` regexp, otherwise an error is going
 * to be thrown. A valid string example: `@bundle.identifier:container_type/relative_path_in_container`
 * @param {Function|string} containerRootSupplier - Either a string, that contains
 * full path to the mount root for real devices or a function, which accepts two parameters
 * (bundle identifier and optional container type) and returns full path to container
 * root folder on the local file system, for Simulator
 * @returns {Array<string>} - An array where the first item is the parsed bundle
 * identifier and the second one is the absolute full path of the item on the local
 * file system
 */
function parseContainerPath(remotePath, containerRootSupplier) {
  var match, _match, bundleId, relativePath, containerType, typeSeparatorPos, containerRoot, resultPath;

  return _regeneratorRuntime.async(function parseContainerPath$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        match = CONTAINER_PATH_PATTERN.exec(remotePath);

        if (!match) {
          _logger2['default'].errorAndThrow('It is expected that package identifier ' + ('starts with \'' + CONTAINER_PATH_MARKER + '\' and is separated from the ') + ('relative path with a single slash. \'' + remotePath + '\' is given instead'));
        }
        _match = _slicedToArray(match, 3);
        bundleId = _match[1];
        relativePath = _match[2];
        containerType = null;
        typeSeparatorPos = bundleId.indexOf(CONTAINER_TYPE_SEPARATOR);

        // We only consider container type exists if its length is greater than zero
        // not counting the colon
        if (typeSeparatorPos > 0 && typeSeparatorPos < bundleId.length - 1) {
          containerType = bundleId.substring(typeSeparatorPos + 1);
          _logger2['default'].debug('Parsed container type: ' + containerType);
          bundleId = bundleId.substring(0, typeSeparatorPos);
        }

        if (!_lodash2['default'].isFunction(containerRootSupplier)) {
          context$1$0.next = 14;
          break;
        }

        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(containerRootSupplier(bundleId, containerType));

      case 11:
        context$1$0.t0 = context$1$0.sent;
        context$1$0.next = 15;
        break;

      case 14:
        context$1$0.t0 = containerRootSupplier;

      case 15:
        containerRoot = context$1$0.t0;
        resultPath = _path2['default'].posix.resolve(containerRoot, relativePath);

        verifyIsSubPath(resultPath, containerRoot);
        return context$1$0.abrupt('return', [bundleId, resultPath]);

      case 19:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

/**
 * Save the given base64 data chunk as a binary file on the Simulator under test.
 *
 * @param {Object} device - The device object, which represents the device under test.
 *                          This object is expected to have the `udid` property containing the
 *                          valid device ID.
 * @param {string} remotePath - The remote path on the device. This variable can be prefixed with
 *                              bundle id, so then the file will be uploaded to the corresponding
 *                              application container instead of the default media folder, for example
 *                              '@com.myapp.bla:data/RelativePathInContainer/111.png'. The '@' character at the
 *                              beginning of the argument is mandatory in such case. The colon at the end of bundle identifier
 *                              is optional and is used to distinguish the container type.
 *                              Possible values there are 'app', 'data', 'groups', '<A specific App Group container>'.
 *                              The default value is 'app'.
 *                              The relative folder path is ignored if the file is going to be uploaded
 *                              to the default media folder and only the file name is considered important.
 * @param {string} base64Data - Base-64 encoded content of the file to be uploaded.
 */
function pushFileToSimulator(device, remotePath, base64Data) {
  var buffer, _ref, _ref2, bundleId, _dstPath, dstFolder, dstPath;

  return _regeneratorRuntime.async(function pushFileToSimulator$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        buffer = Buffer.from(base64Data, 'base64');

        if (!CONTAINER_PATH_PATTERN.test(remotePath)) {
          context$1$0.next = 18;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(parseContainerPath(remotePath, function callee$1$0(appBundle, containerType) {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap((0, _nodeSimctl.getAppContainer)(device.udid, appBundle, null, containerType));

              case 2:
                return context$2$0.abrupt('return', context$2$0.sent);

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        }));

      case 4:
        _ref = context$1$0.sent;
        _ref2 = _slicedToArray(_ref, 2);
        bundleId = _ref2[0];
        _dstPath = _ref2[1];

        _logger2['default'].info('Parsed bundle identifier \'' + bundleId + '\' from \'' + remotePath + '\'. ' + ('Will put the data into \'' + _dstPath + '\''));
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(_path2['default'].dirname(_dstPath)));

      case 11:
        if (context$1$0.sent) {
          context$1$0.next = 15;
          break;
        }

        _logger2['default'].debug('The destination folder \'' + _path2['default'].dirname(_dstPath) + '\' does not exist. Creating...');
        context$1$0.next = 15;
        return _regeneratorRuntime.awrap((0, _appiumSupport.mkdirp)(_path2['default'].dirname(_dstPath)));

      case 15:
        context$1$0.next = 17;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.writeFile(_dstPath, buffer));

      case 17:
        return context$1$0.abrupt('return');

      case 18:
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.openDir());

      case 20:
        dstFolder = context$1$0.sent;
        dstPath = _path2['default'].resolve(dstFolder, _path2['default'].basename(remotePath));
        context$1$0.prev = 22;
        context$1$0.next = 25;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.writeFile(dstPath, buffer));

      case 25:
        context$1$0.next = 27;
        return _regeneratorRuntime.awrap((0, _nodeSimctl.addMedia)(device.udid, dstPath));

      case 27:
        context$1$0.prev = 27;
        context$1$0.next = 30;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(dstFolder));

      case 30:
        return context$1$0.finish(27);

      case 31:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[22,, 27, 31]]);
}

/**
 * Save the given base64 data chunk as a binary file on the device under test.
 * ifuse/osxfuse should be installed and configured on the target machine in order
 * for this function to work properly. Read https://github.com/libimobiledevice/ifuse
 * and https://github.com/osxfuse/osxfuse/wiki/FAQ for more details.
 *
 * @param {Object} device - The device object, which represents the device under test.
 *                          This object is expected to have the `udid` property containing the
 *                          valid device ID.
 * @param {string} remotePath - The remote path on the device. This variable can be prefixed with
 *                              bundle id, so then the file will be uploaded to the corresponding
 *                              application container instead of the default media folder, for example
 *                              '@com.myapp.bla/RelativePathInContainer/111.png'. The '@' character at the
 *                              beginning of the argument is mandatory in such case.
 * @param {string} base64Data - Base-64 encoded content of the file to be uploaded.
 */
function pushFileToRealDevice(device, remotePath, base64Data) {
  var mntRoot, isUnmountSuccessful, dstPath, ifuseArgs, _ref3, _ref32, bundleId, pathInContainer;

  return _regeneratorRuntime.async(function pushFileToRealDevice$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(verifyIFusePresence());

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.openDir());

      case 4:
        mntRoot = context$1$0.sent;
        isUnmountSuccessful = true;
        context$1$0.prev = 6;
        dstPath = _path2['default'].resolve(mntRoot, remotePath);
        ifuseArgs = ['-u', device.udid, mntRoot];

        if (!CONTAINER_PATH_PATTERN.test(remotePath)) {
          context$1$0.next = 21;
          break;
        }

        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(parseContainerPath(remotePath, mntRoot));

      case 12:
        _ref3 = context$1$0.sent;
        _ref32 = _slicedToArray(_ref3, 2);
        bundleId = _ref32[0];
        pathInContainer = _ref32[1];

        dstPath = pathInContainer;
        _logger2['default'].info('Parsed bundle identifier \'' + bundleId + '\' from \'' + remotePath + '\'. ' + ('Will put the data into \'' + dstPath + '\''));
        ifuseArgs = ['-u', device.udid, '--container', bundleId, mntRoot];
        context$1$0.next = 22;
        break;

      case 21:
        verifyIsSubPath(dstPath, mntRoot);

      case 22:
        context$1$0.next = 24;
        return _regeneratorRuntime.awrap(mountDevice(device, ifuseArgs));

      case 24:
        isUnmountSuccessful = false;
        context$1$0.prev = 25;
        context$1$0.next = 28;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(_path2['default'].dirname(dstPath)));

      case 28:
        if (context$1$0.sent) {
          context$1$0.next = 32;
          break;
        }

        _logger2['default'].debug('The destination folder \'' + _path2['default'].dirname(dstPath) + '\' does not exist. Creating...');
        context$1$0.next = 32;
        return _regeneratorRuntime.awrap((0, _appiumSupport.mkdirp)(_path2['default'].dirname(dstPath)));

      case 32:
        context$1$0.next = 34;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.writeFile(dstPath, Buffer.from(base64Data, 'base64')));

      case 34:
        context$1$0.prev = 34;
        context$1$0.next = 37;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('umount', [mntRoot]));

      case 37:
        isUnmountSuccessful = true;
        return context$1$0.finish(34);

      case 39:
        context$1$0.prev = 39;

        if (!isUnmountSuccessful) {
          context$1$0.next = 45;
          break;
        }

        context$1$0.next = 43;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(mntRoot));

      case 43:
        context$1$0.next = 46;
        break;

      case 45:
        _logger2['default'].warn('Umount has failed, so not removing \'' + mntRoot + '\'');

      case 46:
        return context$1$0.finish(39);

      case 47:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[6,, 39, 47], [25,, 34, 39]]);
}

/**
 * Get the content of given file or folder from iOS Simulator and return it as base-64 encoded string.
 * Folder content is recursively packed into a zip archive.
 *
 * @param {Object} device - The device object, which represents the device under test.
 *                          This object is expected to have the `udid` property containing the
 *                          valid device ID.
 * @param {string} remotePath - The path to a file or a folder, which exists in the corresponding application
 *                              container on Simulator. Use
 *                              @<app_bundle_id>:<optional_container_type>/<path_to_the_file_or_folder_inside_container>
 *                              format to pull a file or a folder from an application container of the given type.
 *                              Possible container types are 'app', 'data', 'groups', '<A specific App Group container>'.
 *                              The default type is 'app'.
 * @param {boolean} isFile - Whether the destination item is a file or a folder
 * @returns {string} Base-64 encoded content of the file.
 */
function pullFromSimulator(device, remotePath, isFile) {
  var pathOnServer, _ref4, _ref42, bundleId, dstPath, simRoot, buffer;

  return _regeneratorRuntime.async(function pullFromSimulator$(context$1$0) {
    var _this2 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        pathOnServer = undefined;

        if (!CONTAINER_PATH_PATTERN.test(remotePath)) {
          context$1$0.next = 12;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(parseContainerPath(remotePath, function callee$1$0(appBundle, containerType) {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap((0, _nodeSimctl.getAppContainer)(device.udid, appBundle, null, containerType));

              case 2:
                return context$2$0.abrupt('return', context$2$0.sent);

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this2);
        }));

      case 4:
        _ref4 = context$1$0.sent;
        _ref42 = _slicedToArray(_ref4, 2);
        bundleId = _ref42[0];
        dstPath = _ref42[1];

        _logger2['default'].info('Parsed bundle identifier \'' + bundleId + '\' from \'' + remotePath + '\'. ' + ('Will get the data from \'' + dstPath + '\''));
        pathOnServer = dstPath;
        context$1$0.next = 16;
        break;

      case 12:
        simRoot = device.getDir();

        pathOnServer = _path2['default'].posix.join(simRoot, remotePath);
        verifyIsSubPath(pathOnServer, simRoot);
        _logger2['default'].info('Got the full item path: ' + pathOnServer);

      case 16:
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(pathOnServer));

      case 18:
        if (context$1$0.sent) {
          context$1$0.next = 20;
          break;
        }

        _logger2['default'].errorAndThrow('The remote ' + (isFile ? 'file' : 'folder') + ' at \'' + pathOnServer + '\' does not exist');

      case 20:
        if (!isFile) {
          context$1$0.next = 26;
          break;
        }

        context$1$0.next = 23;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.readFile(pathOnServer));

      case 23:
        context$1$0.t0 = context$1$0.sent;
        context$1$0.next = 29;
        break;

      case 26:
        context$1$0.next = 28;
        return _regeneratorRuntime.awrap(_appiumSupport.zip.toInMemoryZip(pathOnServer));

      case 28:
        context$1$0.t0 = context$1$0.sent;

      case 29:
        buffer = context$1$0.t0;
        return context$1$0.abrupt('return', Buffer.from(buffer).toString('base64'));

      case 31:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

/**
 * Get the content of given file or folder from the real device under test and return it as base-64 encoded string.
 * Folder content is recursively packed into a zip archive.
 *
 * @param {Object} device - The device object, which represents the device under test.
 *                          This object is expected to have the `udid` property containing the
 *                          valid device ID.
 * @param {string} remotePath - The path to an existing remote file on the device. This variable can be prefixed with
 *                              bundle id, so then the file will be downloaded from the corresponding
 *                              application container instead of the default media folder, for example
 *                              '@com.myapp.bla/RelativePathInContainer/111.png'. The '@' character at the
 *                              beginning of the argument is mandatory in such case.
 * @param {boolean} isFile - Whether the destination item is a file or a folder
 * @return {string} Base-64 encoded content of the remote file
 */
function pullFromRealDevice(device, remotePath, isFile) {
  var mntRoot, isUnmountSuccessful, dstPath, ifuseArgs, _ref5, _ref52, bundleId, pathInContainer, buffer;

  return _regeneratorRuntime.async(function pullFromRealDevice$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(verifyIFusePresence());

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.openDir());

      case 4:
        mntRoot = context$1$0.sent;
        isUnmountSuccessful = true;
        context$1$0.prev = 6;
        dstPath = _path2['default'].resolve(mntRoot, remotePath);
        ifuseArgs = ['-u', device.udid, mntRoot];

        if (!CONTAINER_PATH_PATTERN.test(remotePath)) {
          context$1$0.next = 21;
          break;
        }

        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(parseContainerPath(remotePath, mntRoot));

      case 12:
        _ref5 = context$1$0.sent;
        _ref52 = _slicedToArray(_ref5, 2);
        bundleId = _ref52[0];
        pathInContainer = _ref52[1];

        dstPath = pathInContainer;
        _logger2['default'].info('Parsed bundle identifier \'' + bundleId + '\' from \'' + remotePath + '\'. ' + ('Will get the data from \'' + dstPath + '\''));
        ifuseArgs = ['-u', device.udid, '--container', bundleId, mntRoot];
        context$1$0.next = 22;
        break;

      case 21:
        verifyIsSubPath(dstPath, mntRoot);

      case 22:
        context$1$0.next = 24;
        return _regeneratorRuntime.awrap(mountDevice(device, ifuseArgs));

      case 24:
        isUnmountSuccessful = false;
        context$1$0.prev = 25;
        context$1$0.next = 28;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(dstPath));

      case 28:
        if (context$1$0.sent) {
          context$1$0.next = 30;
          break;
        }

        _logger2['default'].errorAndThrow('The remote ' + (isFile ? 'file' : 'folder') + ' at \'' + dstPath + '\' does not exist');

      case 30:
        if (!isFile) {
          context$1$0.next = 36;
          break;
        }

        context$1$0.next = 33;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.readFile(dstPath));

      case 33:
        context$1$0.t0 = context$1$0.sent;
        context$1$0.next = 39;
        break;

      case 36:
        context$1$0.next = 38;
        return _regeneratorRuntime.awrap(_appiumSupport.zip.toInMemoryZip(dstPath));

      case 38:
        context$1$0.t0 = context$1$0.sent;

      case 39:
        buffer = context$1$0.t0;
        return context$1$0.abrupt('return', Buffer.from(buffer).toString('base64'));

      case 41:
        context$1$0.prev = 41;
        context$1$0.next = 44;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('umount', [mntRoot]));

      case 44:
        isUnmountSuccessful = true;
        return context$1$0.finish(41);

      case 46:
        context$1$0.prev = 46;

        if (!isUnmountSuccessful) {
          context$1$0.next = 52;
          break;
        }

        context$1$0.next = 50;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(mntRoot));

      case 50:
        context$1$0.next = 53;
        break;

      case 52:
        _logger2['default'].warn('Umount has failed, so not removing \'' + mntRoot + '\'');

      case 53:
        return context$1$0.finish(46);

      case 54:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[6,, 46, 54], [25,, 41, 46]]);
}

commands.pushFile = function callee$0$0(remotePath, base64Data) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (remotePath.endsWith('/')) {
          _logger2['default'].errorAndThrow('It is expected that remote path points to a file and not to a folder. ' + ('\'' + remotePath + '\' is given instead'));
        }
        if (_lodash2['default'].isArray(base64Data)) {
          // some clients (ahem) java, send a byte array encoding utf8 characters
          // instead of a string, which would be infinitely better!
          base64Data = Buffer.from(base64Data).toString('utf8');
        }

        if (!this.isSimulator()) {
          context$1$0.next = 8;
          break;
        }

        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(pushFileToSimulator(this.opts.device, remotePath, base64Data));

      case 5:
        context$1$0.t0 = context$1$0.sent;
        context$1$0.next = 11;
        break;

      case 8:
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(pushFileToRealDevice(this.opts.device, remotePath, base64Data));

      case 10:
        context$1$0.t0 = context$1$0.sent;

      case 11:
        return context$1$0.abrupt('return', context$1$0.t0);

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.pullFile = function callee$0$0(remotePath) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (remotePath.endsWith('/')) {
          _logger2['default'].errorAndThrow('It is expected that remote path points to a file and not to a folder. ' + ('\'' + remotePath + '\' is given instead'));
        }

        if (!this.isSimulator()) {
          context$1$0.next = 7;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(pullFromSimulator(this.opts.device, remotePath, true));

      case 4:
        context$1$0.t0 = context$1$0.sent;
        context$1$0.next = 10;
        break;

      case 7:
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(pullFromRealDevice(this.opts.device, remotePath, true));

      case 9:
        context$1$0.t0 = context$1$0.sent;

      case 10:
        return context$1$0.abrupt('return', context$1$0.t0);

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.getSimFileFullPath = function callee$0$0(remotePath) {
  var basePath, appName, appNameRegex, appNameMatches, findPath, _ref6, stdout, appRoot, subPath, fullPath;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        basePath = this.opts.device.getDir();
        appName = null;

        if (this.opts.app) {
          appNameRegex = new RegExp('\\' + _path2['default'].sep + '([\\w-]+\\.app)');
          appNameMatches = appNameRegex.exec(this.opts.app);

          if (appNameMatches) {
            appName = appNameMatches[1];
          }
        }
        // de-absolutize the path
        if (_appiumSupport.system.isWindows()) {
          if (remotePath.indexof('://') === 1) {
            remotePath = remotePath.slice(4);
          }
        } else {
          if (remotePath.indexOf('/') === 0) {
            remotePath = remotePath.slice(1);
          }
        }

        if (!(remotePath.indexOf(appName) === 0)) {
          context$1$0.next = 19;
          break;
        }

        findPath = basePath;

        if (this.opts.platformVersion >= 8) {
          // the .app file appears in /Containers/Data and /Containers/Bundle both. We only want /Bundle
          findPath = _path2['default'].resolve(basePath, 'Containers', 'Bundle');
        }
        findPath = findPath.replace(/\s/g, '\\ ');

        context$1$0.next = 10;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('find', [findPath, '-name', appName]));

      case 10:
        _ref6 = context$1$0.sent;
        stdout = _ref6.stdout;
        appRoot = stdout.replace(/\n$/, '');
        subPath = remotePath.substring(appName.length + 1);
        fullPath = _path2['default'].resolve(appRoot, subPath);

        _logger2['default'].debug('Finding app-relative file: \'' + fullPath + '\'');
        return context$1$0.abrupt('return', fullPath);

      case 19:
        fullPath = _path2['default'].resolve(basePath, remotePath);

        _logger2['default'].debug('Finding sim-relative file: ' + fullPath);
        return context$1$0.abrupt('return', fullPath);

      case 22:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

commands.pullFolder = function callee$0$0(remotePath) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!remotePath.endsWith('/')) {
          remotePath = remotePath + '/';
        }

        if (!this.isSimulator()) {
          context$1$0.next = 7;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(pullFromSimulator(this.opts.device, remotePath, false));

      case 4:
        context$1$0.t0 = context$1$0.sent;
        context$1$0.next = 10;
        break;

      case 7:
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(pullFromRealDevice(this.opts.device, remotePath, false));

      case 9:
        context$1$0.t0 = context$1$0.sent;

      case 10:
        return context$1$0.abrupt('return', context$1$0.t0);

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

exports.commands = commands;
exports['default'] = commands;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9maWxlLW1vdmVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztzQkFBYyxRQUFROzs7OzZCQUMyQixnQkFBZ0I7O29CQUNoRCxNQUFNOzs7OytCQUNLLG1CQUFtQjs7c0JBQy9CLFdBQVc7Ozs7NEJBQ04sY0FBYzs7MEJBQ08sYUFBYTs7QUFFdkQsSUFBTSxxQkFBcUIsR0FBRyxHQUFHLENBQUM7O0FBRWxDLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxNQUFNLE9BQUsscUJBQXFCLGtCQUFlLENBQUM7QUFDbkYsSUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUM7O0FBR3JDLElBQUksUUFBUSxHQUFHLDZCQUFZLElBQUksQ0FBQzs7QUFFaEMsU0FBZSxtQkFBbUI7Ozs7O3lDQUNyQixrQkFBRyxLQUFLLENBQUMsT0FBTyxDQUFDOzs7Ozs7OztBQUMxQiw0QkFBSSxhQUFhLENBQUMsZ0pBQzhFLHVGQUNNLDZCQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUM7Ozs7Ozs7Q0FFaEU7O0FBRUQsU0FBZSxXQUFXLENBQUUsTUFBTSxFQUFFLFNBQVM7Ozs7QUFDM0MsNEJBQUksS0FBSyxpQ0FBOEIsU0FBUyxXQUFPLENBQUM7Ozt5Q0FFaEQsd0JBQUssT0FBTyxFQUFFLFNBQVMsQ0FBQzs7Ozs7Ozs7OztBQUU5Qiw0QkFBSSxhQUFhLENBQUMsMkRBQXlELE1BQU0sQ0FBQyxJQUFJLDBHQUM0QixxQkFDakYsZUFBRSxJQUFJLHlCQUFvQixlQUFFLE1BQU0sQ0FBRSxDQUFDLENBQUM7Ozs7Ozs7Q0FFMUU7O0FBRUQsU0FBUyxlQUFlLENBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtBQUM1QyxNQUFNLGNBQWMsR0FBRyxrQkFBSyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsTUFBTSxjQUFjLEdBQUcsa0JBQUssU0FBUyxDQUFDLGtCQUFLLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FB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QUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO0FBQ25DLGVBQU8sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELGdCQUFRLEdBQUcsa0JBQUssT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7O0FBQzdDLDRCQUFJLEtBQUssbUNBQWdDLFFBQVEsUUFBSSxDQUFDOzRDQUMvQyxRQUFROzs7QUFFWCxnQkFBUSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDOztBQUNqRCw0QkFBSSxLQUFLLGlDQUErQixRQUFRLENBQUcsQ0FBQzs0Q0FDN0MsUUFBUTs7Ozs7OztDQUVsQixDQUFDOztBQUVGLFFBQVEsQ0FBQyxVQUFVLEdBQUcsb0JBQWdCLFVBQVU7Ozs7QUFDOUMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDN0Isb0JBQVUsR0FBTSxVQUFVLE1BQUcsQ0FBQztTQUMvQjs7YUFDTSxJQUFJLENBQUMsV0FBVyxFQUFFOzs7Ozs7eUNBQ2YsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQzs7Ozs7Ozs7O3lDQUN0RCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7O0NBQ2xFLENBQUM7O1FBRU8sUUFBUSxHQUFSLFFBQVE7cUJBQ0YsUUFBUSIsImZpbGUiOiJsaWIvY29tbWFuZHMvZmlsZS1tb3ZlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBzeXN0ZW0sIGZzLCB0ZW1wRGlyLCBta2RpcnAsIHppcCB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgaW9zQ29tbWFuZHMgfSBmcm9tICdhcHBpdW0taW9zLWRyaXZlcic7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCB7IGFkZE1lZGlhLCBnZXRBcHBDb250YWluZXIgfSBmcm9tICdub2RlLXNpbWN0bCc7XG5cbmNvbnN0IENPTlRBSU5FUl9QQVRIX01BUktFUiA9ICdAJztcbi8vIGh0dHBzOi8vcmVnZXgxMDEuY29tL3IvUExkQjBHLzJcbmNvbnN0IENPTlRBSU5FUl9QQVRIX1BBVFRFUk4gPSBuZXcgUmVnRXhwKGBeJHtDT05UQUlORVJfUEFUSF9NQVJLRVJ9KFteL10rKS8oLispYCk7XG5jb25zdCBDT05UQUlORVJfVFlQRV9TRVBBUkFUT1IgPSAnOic7XG5cblxubGV0IGNvbW1hbmRzID0gaW9zQ29tbWFuZHMuZmlsZTtcblxuYXN5bmMgZnVuY3Rpb24gdmVyaWZ5SUZ1c2VQcmVzZW5jZSAoKSB7XG4gIGlmICghYXdhaXQgZnMud2hpY2goJ2lmdXNlJykpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgJ2lmdXNlJyB0b29sIGlzIHJlcXVpcmVkIHRvIGJlIGluc3RhbGxlZCBvbiB0aGUgbWFjaGluZS4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgYEluc3RhbGwgaXQgdXNpbmcgJ2JyZXcgY2FzayBpbnN0YWxsIG9zeGZ1c2UgJiYgYnJldyBpbnN0YWxsIGlmdXNlJyBvciBjaGVjayBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgaWYgaXQgaXMgYXZhaWxhYmxlIGluIFBBVEggZW52aXJvbm1lbnQgdmFyaWFibGUgaWYgdGhlIHRvb2wgaXMgYWxyZWFkeSBpbnN0YWxsZWQuIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGBDdXJyZW50IFBBVEggdmFsdWU6ICR7cHJvY2Vzcy5lbnYuUEFUSH1gKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBtb3VudERldmljZSAoZGV2aWNlLCBpRnVzZUFyZ3MpIHtcbiAgbG9nLmRlYnVnKGBTdGFydGluZyBpZnVzZSB3aXRoIGFyZ3MgJyR7aUZ1c2VBcmdzfScuLi5gKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBleGVjKCdpZnVzZScsIGlGdXNlQXJncyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQ2Fubm90IG1vdW50IHRoZSBtZWRpYSBmb2xkZXIgb2YgdGhlIGRldmljZSB3aXRoIFVESUQgJHtkZXZpY2UudWRpZH0uIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGBNYWtlIHN1cmUgb3N4ZnVzZSBwbHVnaW4gaGFzIG5lY2Vzc2FyeSBwZXJtaXNzaW9ucyBpbiBTeXN0ZW0gUHJlZmVyZW5jZXMtPlNlY3VyaXR5ICYgUHJpdmFjeS4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgYEVycm9yIGNvZGU6ICR7ZS5jb2RlfTsgc3RkZXJyIG91dHB1dDogJHtlLnN0ZGVycn1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlJc1N1YlBhdGggKG9yaWdpbmFsUGF0aCwgcm9vdCkge1xuICBjb25zdCBub3JtYWxpemVkUm9vdCA9IHBhdGgubm9ybWFsaXplKHJvb3QpO1xuICBjb25zdCBub3JtYWxpemVkUGF0aCA9IHBhdGgubm9ybWFsaXplKHBhdGguZGlybmFtZShvcmlnaW5hbFBhdGgpKTtcbiAgaWYgKCFub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKG5vcm1hbGl6ZWRSb290KSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGAnJHtub3JtYWxpemVkUGF0aH0nIGlzIGV4cGVjdGVkIHRvIGJlIGEgc3VicGF0aCBvZiAnJHtub3JtYWxpemVkUm9vdH0nYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGFjdHVhbCBwYXRoIGFuZCB0aGUgYnVuZGxlIGlkZW50aWZpZXIgZnJvbSB0aGUgZ2l2ZW4gcGF0aCBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVtb3RlUGF0aCAtIFRoZSBnaXZlbiBwYXRoIHN0cmluZy4gVGhlIHN0cmluZyBzaG91bGRcbiAqIG1hdGNoIGBDT05UQUlORVJfUEFUSF9QQVRURVJOYCByZWdleHAsIG90aGVyd2lzZSBhbiBlcnJvciBpcyBnb2luZ1xuICogdG8gYmUgdGhyb3duLiBBIHZhbGlkIHN0cmluZyBleGFtcGxlOiBgQGJ1bmRsZS5pZGVudGlmaWVyOmNvbnRhaW5lcl90eXBlL3JlbGF0aXZlX3BhdGhfaW5fY29udGFpbmVyYFxuICogQHBhcmFtIHtGdW5jdGlvbnxzdHJpbmd9IGNvbnRhaW5lclJvb3RTdXBwbGllciAtIEVpdGhlciBhIHN0cmluZywgdGhhdCBjb250YWluc1xuICogZnVsbCBwYXRoIHRvIHRoZSBtb3VudCByb290IGZvciByZWFsIGRldmljZXMgb3IgYSBmdW5jdGlvbiwgd2hpY2ggYWNjZXB0cyB0d28gcGFyYW1ldGVyc1xuICogKGJ1bmRsZSBpZGVudGlmaWVyIGFuZCBvcHRpb25hbCBjb250YWluZXIgdHlwZSkgYW5kIHJldHVybnMgZnVsbCBwYXRoIHRvIGNvbnRhaW5lclxuICogcm9vdCBmb2xkZXIgb24gdGhlIGxvY2FsIGZpbGUgc3lzdGVtLCBmb3IgU2ltdWxhdG9yXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nPn0gLSBBbiBhcnJheSB3aGVyZSB0aGUgZmlyc3QgaXRlbSBpcyB0aGUgcGFyc2VkIGJ1bmRsZVxuICogaWRlbnRpZmllciBhbmQgdGhlIHNlY29uZCBvbmUgaXMgdGhlIGFic29sdXRlIGZ1bGwgcGF0aCBvZiB0aGUgaXRlbSBvbiB0aGUgbG9jYWxcbiAqIGZpbGUgc3lzdGVtXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHBhcnNlQ29udGFpbmVyUGF0aCAocmVtb3RlUGF0aCwgY29udGFpbmVyUm9vdFN1cHBsaWVyKSB7XG4gIGNvbnN0IG1hdGNoID0gQ09OVEFJTkVSX1BBVEhfUEFUVEVSTi5leGVjKHJlbW90ZVBhdGgpO1xuICBpZiAoIW1hdGNoKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYEl0IGlzIGV4cGVjdGVkIHRoYXQgcGFja2FnZSBpZGVudGlmaWVyIGAgK1xuICAgICAgYHN0YXJ0cyB3aXRoICcke0NPTlRBSU5FUl9QQVRIX01BUktFUn0nIGFuZCBpcyBzZXBhcmF0ZWQgZnJvbSB0aGUgYCArXG4gICAgICBgcmVsYXRpdmUgcGF0aCB3aXRoIGEgc2luZ2xlIHNsYXNoLiAnJHtyZW1vdGVQYXRofScgaXMgZ2l2ZW4gaW5zdGVhZGApO1xuICB9XG4gIGxldCBbLCBidW5kbGVJZCwgcmVsYXRpdmVQYXRoXSA9IG1hdGNoO1xuICBsZXQgY29udGFpbmVyVHlwZSA9IG51bGw7XG4gIGNvbnN0IHR5cGVTZXBhcmF0b3JQb3MgPSBidW5kbGVJZC5pbmRleE9mKENPTlRBSU5FUl9UWVBFX1NFUEFSQVRPUik7XG4gIC8vIFdlIG9ubHkgY29uc2lkZXIgY29udGFpbmVyIHR5cGUgZXhpc3RzIGlmIGl0cyBsZW5ndGggaXMgZ3JlYXRlciB0aGFuIHplcm9cbiAgLy8gbm90IGNvdW50aW5nIHRoZSBjb2xvblxuICBpZiAodHlwZVNlcGFyYXRvclBvcyA+IDAgJiYgdHlwZVNlcGFyYXRvclBvcyA8IGJ1bmRsZUlkLmxlbmd0aCAtIDEpIHtcbiAgICBjb250YWluZXJUeXBlID0gYnVuZGxlSWQuc3Vic3RyaW5nKHR5cGVTZXBhcmF0b3JQb3MgKyAxKTtcbiAgICBsb2cuZGVidWcoYFBhcnNlZCBjb250YWluZXIgdHlwZTogJHtjb250YWluZXJUeXBlfWApO1xuICAgIGJ1bmRsZUlkID0gYnVuZGxlSWQuc3Vic3RyaW5nKDAsIHR5cGVTZXBhcmF0b3JQb3MpO1xuICB9XG4gIGNvbnN0IGNvbnRhaW5lclJvb3QgPSBfLmlzRnVuY3Rpb24oY29udGFpbmVyUm9vdFN1cHBsaWVyKVxuICAgID8gYXdhaXQgY29udGFpbmVyUm9vdFN1cHBsaWVyKGJ1bmRsZUlkLCBjb250YWluZXJUeXBlKVxuICAgIDogY29udGFpbmVyUm9vdFN1cHBsaWVyO1xuICBjb25zdCByZXN1bHRQYXRoID0gcGF0aC5wb3NpeC5yZXNvbHZlKGNvbnRhaW5lclJvb3QsIHJlbGF0aXZlUGF0aCk7XG4gIHZlcmlmeUlzU3ViUGF0aChyZXN1bHRQYXRoLCBjb250YWluZXJSb290KTtcbiAgcmV0dXJuIFtidW5kbGVJZCwgcmVzdWx0UGF0aF07XG59XG5cbi8qKlxuICogU2F2ZSB0aGUgZ2l2ZW4gYmFzZTY0IGRhdGEgY2h1bmsgYXMgYSBiaW5hcnkgZmlsZSBvbiB0aGUgU2ltdWxhdG9yIHVuZGVyIHRlc3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRldmljZSAtIFRoZSBkZXZpY2Ugb2JqZWN0LCB3aGljaCByZXByZXNlbnRzIHRoZSBkZXZpY2UgdW5kZXIgdGVzdC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBUaGlzIG9iamVjdCBpcyBleHBlY3RlZCB0byBoYXZlIHRoZSBgdWRpZGAgcHJvcGVydHkgY29udGFpbmluZyB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZCBkZXZpY2UgSUQuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVtb3RlUGF0aCAtIFRoZSByZW1vdGUgcGF0aCBvbiB0aGUgZGV2aWNlLiBUaGlzIHZhcmlhYmxlIGNhbiBiZSBwcmVmaXhlZCB3aXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZSBpZCwgc28gdGhlbiB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkIHRvIHRoZSBjb3JyZXNwb25kaW5nXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uIGNvbnRhaW5lciBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IG1lZGlhIGZvbGRlciwgZm9yIGV4YW1wbGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Bjb20ubXlhcHAuYmxhOmRhdGEvUmVsYXRpdmVQYXRoSW5Db250YWluZXIvMTExLnBuZycuIFRoZSAnQCcgY2hhcmFjdGVyIGF0IHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWdpbm5pbmcgb2YgdGhlIGFyZ3VtZW50IGlzIG1hbmRhdG9yeSBpbiBzdWNoIGNhc2UuIFRoZSBjb2xvbiBhdCB0aGUgZW5kIG9mIGJ1bmRsZSBpZGVudGlmaWVyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIG9wdGlvbmFsIGFuZCBpcyB1c2VkIHRvIGRpc3Rpbmd1aXNoIHRoZSBjb250YWluZXIgdHlwZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zc2libGUgdmFsdWVzIHRoZXJlIGFyZSAnYXBwJywgJ2RhdGEnLCAnZ3JvdXBzJywgJzxBIHNwZWNpZmljIEFwcCBHcm91cCBjb250YWluZXI+Jy5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGRlZmF1bHQgdmFsdWUgaXMgJ2FwcCcuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSByZWxhdGl2ZSBmb2xkZXIgcGF0aCBpcyBpZ25vcmVkIGlmIHRoZSBmaWxlIGlzIGdvaW5nIHRvIGJlIHVwbG9hZGVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSBkZWZhdWx0IG1lZGlhIGZvbGRlciBhbmQgb25seSB0aGUgZmlsZSBuYW1lIGlzIGNvbnNpZGVyZWQgaW1wb3J0YW50LlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NERhdGEgLSBCYXNlLTY0IGVuY29kZWQgY29udGVudCBvZiB0aGUgZmlsZSB0byBiZSB1cGxvYWRlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHVzaEZpbGVUb1NpbXVsYXRvciAoZGV2aWNlLCByZW1vdGVQYXRoLCBiYXNlNjREYXRhKSB7XG4gIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGJhc2U2NERhdGEsICdiYXNlNjQnKTtcbiAgaWYgKENPTlRBSU5FUl9QQVRIX1BBVFRFUk4udGVzdChyZW1vdGVQYXRoKSkge1xuICAgIGNvbnN0IFtidW5kbGVJZCwgZHN0UGF0aF0gPSBhd2FpdCBwYXJzZUNvbnRhaW5lclBhdGgocmVtb3RlUGF0aCxcbiAgICAgIGFzeW5jIChhcHBCdW5kbGUsIGNvbnRhaW5lclR5cGUpID0+IGF3YWl0IGdldEFwcENvbnRhaW5lcihkZXZpY2UudWRpZCwgYXBwQnVuZGxlLCBudWxsLCBjb250YWluZXJUeXBlKSk7XG4gICAgbG9nLmluZm8oYFBhcnNlZCBidW5kbGUgaWRlbnRpZmllciAnJHtidW5kbGVJZH0nIGZyb20gJyR7cmVtb3RlUGF0aH0nLiBgICtcbiAgICAgIGBXaWxsIHB1dCB0aGUgZGF0YSBpbnRvICcke2RzdFBhdGh9J2ApO1xuICAgIGlmICghYXdhaXQgZnMuZXhpc3RzKHBhdGguZGlybmFtZShkc3RQYXRoKSkpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgVGhlIGRlc3RpbmF0aW9uIGZvbGRlciAnJHtwYXRoLmRpcm5hbWUoZHN0UGF0aCl9JyBkb2VzIG5vdCBleGlzdC4gQ3JlYXRpbmcuLi5gKTtcbiAgICAgIGF3YWl0IG1rZGlycChwYXRoLmRpcm5hbWUoZHN0UGF0aCkpO1xuICAgIH1cbiAgICBhd2FpdCBmcy53cml0ZUZpbGUoZHN0UGF0aCwgYnVmZmVyKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZHN0Rm9sZGVyID0gYXdhaXQgdGVtcERpci5vcGVuRGlyKCk7XG4gIGNvbnN0IGRzdFBhdGggPSBwYXRoLnJlc29sdmUoZHN0Rm9sZGVyLCBwYXRoLmJhc2VuYW1lKHJlbW90ZVBhdGgpKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUoZHN0UGF0aCwgYnVmZmVyKTtcbiAgICBhd2FpdCBhZGRNZWRpYShkZXZpY2UudWRpZCwgZHN0UGF0aCk7XG4gIH0gZmluYWxseSB7XG4gICAgYXdhaXQgZnMucmltcmFmKGRzdEZvbGRlcik7XG4gIH1cbn1cblxuLyoqXG4gKiBTYXZlIHRoZSBnaXZlbiBiYXNlNjQgZGF0YSBjaHVuayBhcyBhIGJpbmFyeSBmaWxlIG9uIHRoZSBkZXZpY2UgdW5kZXIgdGVzdC5cbiAqIGlmdXNlL29zeGZ1c2Ugc2hvdWxkIGJlIGluc3RhbGxlZCBhbmQgY29uZmlndXJlZCBvbiB0aGUgdGFyZ2V0IG1hY2hpbmUgaW4gb3JkZXJcbiAqIGZvciB0aGlzIGZ1bmN0aW9uIHRvIHdvcmsgcHJvcGVybHkuIFJlYWQgaHR0cHM6Ly9naXRodWIuY29tL2xpYmltb2JpbGVkZXZpY2UvaWZ1c2VcbiAqIGFuZCBodHRwczovL2dpdGh1Yi5jb20vb3N4ZnVzZS9vc3hmdXNlL3dpa2kvRkFRIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRldmljZSAtIFRoZSBkZXZpY2Ugb2JqZWN0LCB3aGljaCByZXByZXNlbnRzIHRoZSBkZXZpY2UgdW5kZXIgdGVzdC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBUaGlzIG9iamVjdCBpcyBleHBlY3RlZCB0byBoYXZlIHRoZSBgdWRpZGAgcHJvcGVydHkgY29udGFpbmluZyB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZCBkZXZpY2UgSUQuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVtb3RlUGF0aCAtIFRoZSByZW1vdGUgcGF0aCBvbiB0aGUgZGV2aWNlLiBUaGlzIHZhcmlhYmxlIGNhbiBiZSBwcmVmaXhlZCB3aXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZSBpZCwgc28gdGhlbiB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkIHRvIHRoZSBjb3JyZXNwb25kaW5nXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uIGNvbnRhaW5lciBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IG1lZGlhIGZvbGRlciwgZm9yIGV4YW1wbGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Bjb20ubXlhcHAuYmxhL1JlbGF0aXZlUGF0aEluQ29udGFpbmVyLzExMS5wbmcnLiBUaGUgJ0AnIGNoYXJhY3RlciBhdCB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW5uaW5nIG9mIHRoZSBhcmd1bWVudCBpcyBtYW5kYXRvcnkgaW4gc3VjaCBjYXNlLlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NERhdGEgLSBCYXNlLTY0IGVuY29kZWQgY29udGVudCBvZiB0aGUgZmlsZSB0byBiZSB1cGxvYWRlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHVzaEZpbGVUb1JlYWxEZXZpY2UgKGRldmljZSwgcmVtb3RlUGF0aCwgYmFzZTY0RGF0YSkge1xuICBhd2FpdCB2ZXJpZnlJRnVzZVByZXNlbmNlKCk7XG4gIGNvbnN0IG1udFJvb3QgPSBhd2FpdCB0ZW1wRGlyLm9wZW5EaXIoKTtcbiAgbGV0IGlzVW5tb3VudFN1Y2Nlc3NmdWwgPSB0cnVlO1xuICB0cnkge1xuICAgIGxldCBkc3RQYXRoID0gcGF0aC5yZXNvbHZlKG1udFJvb3QsIHJlbW90ZVBhdGgpO1xuICAgIGxldCBpZnVzZUFyZ3MgPSBbJy11JywgZGV2aWNlLnVkaWQsIG1udFJvb3RdO1xuICAgIGlmIChDT05UQUlORVJfUEFUSF9QQVRURVJOLnRlc3QocmVtb3RlUGF0aCkpIHtcbiAgICAgIGNvbnN0IFtidW5kbGVJZCwgcGF0aEluQ29udGFpbmVyXSA9IGF3YWl0IHBhcnNlQ29udGFpbmVyUGF0aChyZW1vdGVQYXRoLCBtbnRSb290KTtcbiAgICAgIGRzdFBhdGggPSBwYXRoSW5Db250YWluZXI7XG4gICAgICBsb2cuaW5mbyhgUGFyc2VkIGJ1bmRsZSBpZGVudGlmaWVyICcke2J1bmRsZUlkfScgZnJvbSAnJHtyZW1vdGVQYXRofScuIGAgK1xuICAgICAgICBgV2lsbCBwdXQgdGhlIGRhdGEgaW50byAnJHtkc3RQYXRofSdgKTtcbiAgICAgIGlmdXNlQXJncyA9IFsnLXUnLCBkZXZpY2UudWRpZCwgJy0tY29udGFpbmVyJywgYnVuZGxlSWQsIG1udFJvb3RdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2ZXJpZnlJc1N1YlBhdGgoZHN0UGF0aCwgbW50Um9vdCk7XG4gICAgfVxuICAgIGF3YWl0IG1vdW50RGV2aWNlKGRldmljZSwgaWZ1c2VBcmdzKTtcbiAgICBpc1VubW91bnRTdWNjZXNzZnVsID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghYXdhaXQgZnMuZXhpc3RzKHBhdGguZGlybmFtZShkc3RQYXRoKSkpIHtcbiAgICAgICAgbG9nLmRlYnVnKGBUaGUgZGVzdGluYXRpb24gZm9sZGVyICcke3BhdGguZGlybmFtZShkc3RQYXRoKX0nIGRvZXMgbm90IGV4aXN0LiBDcmVhdGluZy4uLmApO1xuICAgICAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGRzdFBhdGgpKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShkc3RQYXRoLCBCdWZmZXIuZnJvbShiYXNlNjREYXRhLCAnYmFzZTY0JykpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCBleGVjKCd1bW91bnQnLCBbbW50Um9vdF0pO1xuICAgICAgaXNVbm1vdW50U3VjY2Vzc2Z1bCA9IHRydWU7XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIGlmIChpc1VubW91bnRTdWNjZXNzZnVsKSB7XG4gICAgICBhd2FpdCBmcy5yaW1yYWYobW50Um9vdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZy53YXJuKGBVbW91bnQgaGFzIGZhaWxlZCwgc28gbm90IHJlbW92aW5nICcke21udFJvb3R9J2ApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgY29udGVudCBvZiBnaXZlbiBmaWxlIG9yIGZvbGRlciBmcm9tIGlPUyBTaW11bGF0b3IgYW5kIHJldHVybiBpdCBhcyBiYXNlLTY0IGVuY29kZWQgc3RyaW5nLlxuICogRm9sZGVyIGNvbnRlbnQgaXMgcmVjdXJzaXZlbHkgcGFja2VkIGludG8gYSB6aXAgYXJjaGl2ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGV2aWNlIC0gVGhlIGRldmljZSBvYmplY3QsIHdoaWNoIHJlcHJlc2VudHMgdGhlIGRldmljZSB1bmRlciB0ZXN0LlxuICogICAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMgb2JqZWN0IGlzIGV4cGVjdGVkIHRvIGhhdmUgdGhlIGB1ZGlkYCBwcm9wZXJ0eSBjb250YWluaW5nIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkIGRldmljZSBJRC5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZW1vdGVQYXRoIC0gVGhlIHBhdGggdG8gYSBmaWxlIG9yIGEgZm9sZGVyLCB3aGljaCBleGlzdHMgaW4gdGhlIGNvcnJlc3BvbmRpbmcgYXBwbGljYXRpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyIG9uIFNpbXVsYXRvci4gVXNlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEA8YXBwX2J1bmRsZV9pZD46PG9wdGlvbmFsX2NvbnRhaW5lcl90eXBlPi88cGF0aF90b190aGVfZmlsZV9vcl9mb2xkZXJfaW5zaWRlX2NvbnRhaW5lcj5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0IHRvIHB1bGwgYSBmaWxlIG9yIGEgZm9sZGVyIGZyb20gYW4gYXBwbGljYXRpb24gY29udGFpbmVyIG9mIHRoZSBnaXZlbiB0eXBlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQb3NzaWJsZSBjb250YWluZXIgdHlwZXMgYXJlICdhcHAnLCAnZGF0YScsICdncm91cHMnLCAnPEEgc3BlY2lmaWMgQXBwIEdyb3VwIGNvbnRhaW5lcj4nLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaGUgZGVmYXVsdCB0eXBlIGlzICdhcHAnLlxuICogQHBhcmFtIHtib29sZWFufSBpc0ZpbGUgLSBXaGV0aGVyIHRoZSBkZXN0aW5hdGlvbiBpdGVtIGlzIGEgZmlsZSBvciBhIGZvbGRlclxuICogQHJldHVybnMge3N0cmluZ30gQmFzZS02NCBlbmNvZGVkIGNvbnRlbnQgb2YgdGhlIGZpbGUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHB1bGxGcm9tU2ltdWxhdG9yIChkZXZpY2UsIHJlbW90ZVBhdGgsIGlzRmlsZSkge1xuICBsZXQgcGF0aE9uU2VydmVyO1xuICBpZiAoQ09OVEFJTkVSX1BBVEhfUEFUVEVSTi50ZXN0KHJlbW90ZVBhdGgpKSB7XG4gICAgY29uc3QgW2J1bmRsZUlkLCBkc3RQYXRoXSA9IGF3YWl0IHBhcnNlQ29udGFpbmVyUGF0aChyZW1vdGVQYXRoLFxuICAgICAgYXN5bmMgKGFwcEJ1bmRsZSwgY29udGFpbmVyVHlwZSkgPT4gYXdhaXQgZ2V0QXBwQ29udGFpbmVyKGRldmljZS51ZGlkLCBhcHBCdW5kbGUsIG51bGwsIGNvbnRhaW5lclR5cGUpKTtcbiAgICBsb2cuaW5mbyhgUGFyc2VkIGJ1bmRsZSBpZGVudGlmaWVyICcke2J1bmRsZUlkfScgZnJvbSAnJHtyZW1vdGVQYXRofScuIGAgK1xuICAgICAgYFdpbGwgZ2V0IHRoZSBkYXRhIGZyb20gJyR7ZHN0UGF0aH0nYCk7XG4gICAgcGF0aE9uU2VydmVyID0gZHN0UGF0aDtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzaW1Sb290ID0gZGV2aWNlLmdldERpcigpO1xuICAgIHBhdGhPblNlcnZlciA9IHBhdGgucG9zaXguam9pbihzaW1Sb290LCByZW1vdGVQYXRoKTtcbiAgICB2ZXJpZnlJc1N1YlBhdGgocGF0aE9uU2VydmVyLCBzaW1Sb290KTtcbiAgICBsb2cuaW5mbyhgR290IHRoZSBmdWxsIGl0ZW0gcGF0aDogJHtwYXRoT25TZXJ2ZXJ9YCk7XG4gIH1cbiAgaWYgKCFhd2FpdCBmcy5leGlzdHMocGF0aE9uU2VydmVyKSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBUaGUgcmVtb3RlICR7aXNGaWxlID8gJ2ZpbGUnIDogJ2ZvbGRlcid9IGF0ICcke3BhdGhPblNlcnZlcn0nIGRvZXMgbm90IGV4aXN0YCk7XG4gIH1cbiAgY29uc3QgYnVmZmVyID0gaXNGaWxlXG4gICAgPyBhd2FpdCBmcy5yZWFkRmlsZShwYXRoT25TZXJ2ZXIpXG4gICAgOiBhd2FpdCB6aXAudG9Jbk1lbW9yeVppcChwYXRoT25TZXJ2ZXIpO1xuICByZXR1cm4gQnVmZmVyLmZyb20oYnVmZmVyKS50b1N0cmluZygnYmFzZTY0Jyk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBjb250ZW50IG9mIGdpdmVuIGZpbGUgb3IgZm9sZGVyIGZyb20gdGhlIHJlYWwgZGV2aWNlIHVuZGVyIHRlc3QgYW5kIHJldHVybiBpdCBhcyBiYXNlLTY0IGVuY29kZWQgc3RyaW5nLlxuICogRm9sZGVyIGNvbnRlbnQgaXMgcmVjdXJzaXZlbHkgcGFja2VkIGludG8gYSB6aXAgYXJjaGl2ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGV2aWNlIC0gVGhlIGRldmljZSBvYmplY3QsIHdoaWNoIHJlcHJlc2VudHMgdGhlIGRldmljZSB1bmRlciB0ZXN0LlxuICogICAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMgb2JqZWN0IGlzIGV4cGVjdGVkIHRvIGhhdmUgdGhlIGB1ZGlkYCBwcm9wZXJ0eSBjb250YWluaW5nIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkIGRldmljZSBJRC5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZW1vdGVQYXRoIC0gVGhlIHBhdGggdG8gYW4gZXhpc3RpbmcgcmVtb3RlIGZpbGUgb24gdGhlIGRldmljZS4gVGhpcyB2YXJpYWJsZSBjYW4gYmUgcHJlZml4ZWQgd2l0aFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidW5kbGUgaWQsIHNvIHRoZW4gdGhlIGZpbGUgd2lsbCBiZSBkb3dubG9hZGVkIGZyb20gdGhlIGNvcnJlc3BvbmRpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb24gY29udGFpbmVyIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgbWVkaWEgZm9sZGVyLCBmb3IgZXhhbXBsZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGNvbS5teWFwcC5ibGEvUmVsYXRpdmVQYXRoSW5Db250YWluZXIvMTExLnBuZycuIFRoZSAnQCcgY2hhcmFjdGVyIGF0IHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWdpbm5pbmcgb2YgdGhlIGFyZ3VtZW50IGlzIG1hbmRhdG9yeSBpbiBzdWNoIGNhc2UuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzRmlsZSAtIFdoZXRoZXIgdGhlIGRlc3RpbmF0aW9uIGl0ZW0gaXMgYSBmaWxlIG9yIGEgZm9sZGVyXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEJhc2UtNjQgZW5jb2RlZCBjb250ZW50IG9mIHRoZSByZW1vdGUgZmlsZVxuICovXG5hc3luYyBmdW5jdGlvbiBwdWxsRnJvbVJlYWxEZXZpY2UgKGRldmljZSwgcmVtb3RlUGF0aCwgaXNGaWxlKSB7XG4gIGF3YWl0IHZlcmlmeUlGdXNlUHJlc2VuY2UoKTtcbiAgY29uc3QgbW50Um9vdCA9IGF3YWl0IHRlbXBEaXIub3BlbkRpcigpO1xuICBsZXQgaXNVbm1vdW50U3VjY2Vzc2Z1bCA9IHRydWU7XG4gIHRyeSB7XG4gICAgbGV0IGRzdFBhdGggPSBwYXRoLnJlc29sdmUobW50Um9vdCwgcmVtb3RlUGF0aCk7XG4gICAgbGV0IGlmdXNlQXJncyA9IFsnLXUnLCBkZXZpY2UudWRpZCwgbW50Um9vdF07XG4gICAgaWYgKENPTlRBSU5FUl9QQVRIX1BBVFRFUk4udGVzdChyZW1vdGVQYXRoKSkge1xuICAgICAgY29uc3QgW2J1bmRsZUlkLCBwYXRoSW5Db250YWluZXJdID0gYXdhaXQgcGFyc2VDb250YWluZXJQYXRoKHJlbW90ZVBhdGgsIG1udFJvb3QpO1xuICAgICAgZHN0UGF0aCA9IHBhdGhJbkNvbnRhaW5lcjtcbiAgICAgIGxvZy5pbmZvKGBQYXJzZWQgYnVuZGxlIGlkZW50aWZpZXIgJyR7YnVuZGxlSWR9JyBmcm9tICcke3JlbW90ZVBhdGh9Jy4gYCArXG4gICAgICAgIGBXaWxsIGdldCB0aGUgZGF0YSBmcm9tICcke2RzdFBhdGh9J2ApO1xuICAgICAgaWZ1c2VBcmdzID0gWyctdScsIGRldmljZS51ZGlkLCAnLS1jb250YWluZXInLCBidW5kbGVJZCwgbW50Um9vdF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlcmlmeUlzU3ViUGF0aChkc3RQYXRoLCBtbnRSb290KTtcbiAgICB9XG4gICAgYXdhaXQgbW91bnREZXZpY2UoZGV2aWNlLCBpZnVzZUFyZ3MpO1xuICAgIGlzVW5tb3VudFN1Y2Nlc3NmdWwgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaWYgKCFhd2FpdCBmcy5leGlzdHMoZHN0UGF0aCkpIHtcbiAgICAgICAgbG9nLmVycm9yQW5kVGhyb3coYFRoZSByZW1vdGUgJHtpc0ZpbGUgPyAnZmlsZScgOiAnZm9sZGVyJ30gYXQgJyR7ZHN0UGF0aH0nIGRvZXMgbm90IGV4aXN0YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBidWZmZXIgPSBpc0ZpbGVcbiAgICAgICAgPyBhd2FpdCBmcy5yZWFkRmlsZShkc3RQYXRoKVxuICAgICAgICA6IGF3YWl0IHppcC50b0luTWVtb3J5WmlwKGRzdFBhdGgpO1xuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKGJ1ZmZlcikudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCBleGVjKCd1bW91bnQnLCBbbW50Um9vdF0pO1xuICAgICAgaXNVbm1vdW50U3VjY2Vzc2Z1bCA9IHRydWU7XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIGlmIChpc1VubW91bnRTdWNjZXNzZnVsKSB7XG4gICAgICBhd2FpdCBmcy5yaW1yYWYobW50Um9vdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZy53YXJuKGBVbW91bnQgaGFzIGZhaWxlZCwgc28gbm90IHJlbW92aW5nICcke21udFJvb3R9J2ApO1xuICAgIH1cbiAgfVxufVxuXG5cbmNvbW1hbmRzLnB1c2hGaWxlID0gYXN5bmMgZnVuY3Rpb24gKHJlbW90ZVBhdGgsIGJhc2U2NERhdGEpIHtcbiAgaWYgKHJlbW90ZVBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBJdCBpcyBleHBlY3RlZCB0aGF0IHJlbW90ZSBwYXRoIHBvaW50cyB0byBhIGZpbGUgYW5kIG5vdCB0byBhIGZvbGRlci4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgYCcke3JlbW90ZVBhdGh9JyBpcyBnaXZlbiBpbnN0ZWFkYCk7XG4gIH1cbiAgaWYgKF8uaXNBcnJheShiYXNlNjREYXRhKSkge1xuICAgIC8vIHNvbWUgY2xpZW50cyAoYWhlbSkgamF2YSwgc2VuZCBhIGJ5dGUgYXJyYXkgZW5jb2RpbmcgdXRmOCBjaGFyYWN0ZXJzXG4gICAgLy8gaW5zdGVhZCBvZiBhIHN0cmluZywgd2hpY2ggd291bGQgYmUgaW5maW5pdGVseSBiZXR0ZXIhXG4gICAgYmFzZTY0RGF0YSA9IEJ1ZmZlci5mcm9tKGJhc2U2NERhdGEpLnRvU3RyaW5nKCd1dGY4Jyk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuaXNTaW11bGF0b3IoKVxuICAgID8gYXdhaXQgcHVzaEZpbGVUb1NpbXVsYXRvcih0aGlzLm9wdHMuZGV2aWNlLCByZW1vdGVQYXRoLCBiYXNlNjREYXRhKVxuICAgIDogYXdhaXQgcHVzaEZpbGVUb1JlYWxEZXZpY2UodGhpcy5vcHRzLmRldmljZSwgcmVtb3RlUGF0aCwgYmFzZTY0RGF0YSk7XG59O1xuXG5jb21tYW5kcy5wdWxsRmlsZSA9IGFzeW5jIGZ1bmN0aW9uIChyZW1vdGVQYXRoKSB7XG4gIGlmIChyZW1vdGVQYXRoLmVuZHNXaXRoKCcvJykpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgSXQgaXMgZXhwZWN0ZWQgdGhhdCByZW1vdGUgcGF0aCBwb2ludHMgdG8gYSBmaWxlIGFuZCBub3QgdG8gYSBmb2xkZXIuIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGAnJHtyZW1vdGVQYXRofScgaXMgZ2l2ZW4gaW5zdGVhZGApO1xuICB9XG4gIHJldHVybiB0aGlzLmlzU2ltdWxhdG9yKClcbiAgICA/IGF3YWl0IHB1bGxGcm9tU2ltdWxhdG9yKHRoaXMub3B0cy5kZXZpY2UsIHJlbW90ZVBhdGgsIHRydWUpXG4gICAgOiBhd2FpdCBwdWxsRnJvbVJlYWxEZXZpY2UodGhpcy5vcHRzLmRldmljZSwgcmVtb3RlUGF0aCwgdHJ1ZSk7XG59O1xuXG5jb21tYW5kcy5nZXRTaW1GaWxlRnVsbFBhdGggPSBhc3luYyBmdW5jdGlvbiAocmVtb3RlUGF0aCkge1xuICBsZXQgYmFzZVBhdGggPSB0aGlzLm9wdHMuZGV2aWNlLmdldERpcigpO1xuICBsZXQgYXBwTmFtZSA9IG51bGw7XG5cbiAgaWYgKHRoaXMub3B0cy5hcHApIHtcbiAgICBsZXQgYXBwTmFtZVJlZ2V4ID0gbmV3IFJlZ0V4cChgXFxcXCR7cGF0aC5zZXB9KFtcXFxcdy1dK1xcXFwuYXBwKWApO1xuICAgIGxldCBhcHBOYW1lTWF0Y2hlcyA9IGFwcE5hbWVSZWdleC5leGVjKHRoaXMub3B0cy5hcHApO1xuICAgIGlmIChhcHBOYW1lTWF0Y2hlcykge1xuICAgICAgYXBwTmFtZSA9IGFwcE5hbWVNYXRjaGVzWzFdO1xuICAgIH1cbiAgfVxuICAvLyBkZS1hYnNvbHV0aXplIHRoZSBwYXRoXG4gIGlmIChzeXN0ZW0uaXNXaW5kb3dzKCkpIHtcbiAgICBpZiAocmVtb3RlUGF0aC5pbmRleG9mKCc6Ly8nKSA9PT0gMSkge1xuICAgICAgcmVtb3RlUGF0aCA9IHJlbW90ZVBhdGguc2xpY2UoNCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChyZW1vdGVQYXRoLmluZGV4T2YoJy8nKSA9PT0gMCkge1xuICAgICAgcmVtb3RlUGF0aCA9IHJlbW90ZVBhdGguc2xpY2UoMSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJlbW90ZVBhdGguaW5kZXhPZihhcHBOYW1lKSA9PT0gMCkge1xuICAgIGxldCBmaW5kUGF0aCA9IGJhc2VQYXRoO1xuICAgIGlmICh0aGlzLm9wdHMucGxhdGZvcm1WZXJzaW9uID49IDgpIHtcbiAgICAgIC8vIHRoZSAuYXBwIGZpbGUgYXBwZWFycyBpbiAvQ29udGFpbmVycy9EYXRhIGFuZCAvQ29udGFpbmVycy9CdW5kbGUgYm90aC4gV2Ugb25seSB3YW50IC9CdW5kbGVcbiAgICAgIGZpbmRQYXRoID0gcGF0aC5yZXNvbHZlKGJhc2VQYXRoLCAnQ29udGFpbmVycycsICdCdW5kbGUnKTtcbiAgICB9XG4gICAgZmluZFBhdGggPSAgZmluZFBhdGgucmVwbGFjZSgvXFxzL2csICdcXFxcICcpO1xuXG4gICAgbGV0IHsgc3Rkb3V0IH0gPSBhd2FpdCBleGVjKCdmaW5kJywgW2ZpbmRQYXRoLCAnLW5hbWUnLCBhcHBOYW1lXSk7XG4gICAgbGV0IGFwcFJvb3QgPSBzdGRvdXQucmVwbGFjZSgvXFxuJC8sICcnKTtcbiAgICBsZXQgc3ViUGF0aCA9IHJlbW90ZVBhdGguc3Vic3RyaW5nKGFwcE5hbWUubGVuZ3RoICsgMSk7XG4gICAgbGV0IGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGFwcFJvb3QsIHN1YlBhdGgpO1xuICAgIGxvZy5kZWJ1ZyhgRmluZGluZyBhcHAtcmVsYXRpdmUgZmlsZTogJyR7ZnVsbFBhdGh9J2ApO1xuICAgIHJldHVybiBmdWxsUGF0aDtcbiAgfSBlbHNlIHtcbiAgICBsZXQgZnVsbFBhdGggPSBwYXRoLnJlc29sdmUoYmFzZVBhdGgsIHJlbW90ZVBhdGgpO1xuICAgIGxvZy5kZWJ1ZyhgRmluZGluZyBzaW0tcmVsYXRpdmUgZmlsZTogJHtmdWxsUGF0aH1gKTtcbiAgICByZXR1cm4gZnVsbFBhdGg7XG4gIH1cbn07XG5cbmNvbW1hbmRzLnB1bGxGb2xkZXIgPSBhc3luYyBmdW5jdGlvbiAocmVtb3RlUGF0aCkge1xuICBpZiAoIXJlbW90ZVBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgIHJlbW90ZVBhdGggPSBgJHtyZW1vdGVQYXRofS9gO1xuICB9XG4gIHJldHVybiB0aGlzLmlzU2ltdWxhdG9yKClcbiAgICA/IGF3YWl0IHB1bGxGcm9tU2ltdWxhdG9yKHRoaXMub3B0cy5kZXZpY2UsIHJlbW90ZVBhdGgsIGZhbHNlKVxuICAgIDogYXdhaXQgcHVsbEZyb21SZWFsRGV2aWNlKHRoaXMub3B0cy5kZXZpY2UsIHJlbW90ZVBhdGgsIGZhbHNlKTtcbn07XG5cbmV4cG9ydCB7IGNvbW1hbmRzIH07XG5leHBvcnQgZGVmYXVsdCBjb21tYW5kcztcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
