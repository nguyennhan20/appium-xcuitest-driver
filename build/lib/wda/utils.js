'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _appiumSupport = require('appium-support');

var _teen_process = require('teen_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var WDA_RUNNER_BUNDLE_ID = 'com.facebook.WebDriverAgentRunner';
var PROJECT_FILE = 'project.pbxproj';
var XCUICOORDINATE_FILE = 'PrivateHeaders/XCTest/XCUICoordinate.h';
var FBMACROS_FILE = 'WebDriverAgentLib/Utilities/FBMacros.h';
var XCUIAPPLICATION_FILE = 'PrivateHeaders/XCTest/XCUIApplication.h';
var FBSESSION_FILE = 'WebDriverAgentLib/Routing/FBSession.m';
var CARTHAGE_ROOT = 'Carthage';

function replaceInFile(file, find, replace) {
  var contents, newContents;
  return _regeneratorRuntime.async(function replaceInFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.readFile(file, 'utf8'));

      case 2:
        contents = context$1$0.sent;
        newContents = contents.replace(find, replace);

        if (!(newContents !== contents)) {
          context$1$0.next = 7;
          break;
        }

        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.writeFile(file, newContents, 'utf8'));

      case 7:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

/**
 * Update WebDriverAgentRunner project bundle ID with newBundleId.
 * This method assumes project file is in the correct state.
 * @param {string} agentPath - Path to the .xcodeproj directory.
 * @param {string} newBundleId the new bundle ID used to update.
 */
function updateProjectFile(agentPath, newBundleId) {
  var projectFilePath;
  return _regeneratorRuntime.async(function updateProjectFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        projectFilePath = agentPath + '/' + PROJECT_FILE;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.copyFile(projectFilePath, projectFilePath + '.old'));

      case 4:
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(replaceInFile(projectFilePath, new RegExp(WDA_RUNNER_BUNDLE_ID.replace('.', '\.'), 'g'), newBundleId));

      case 6:
        _logger2['default'].debug('Successfully updated \'' + projectFilePath + '\' with bundle id \'' + newBundleId + '\'');
        context$1$0.next = 13;
        break;

      case 9:
        context$1$0.prev = 9;
        context$1$0.t0 = context$1$0['catch'](1);

        _logger2['default'].debug('Error updating project file: ' + context$1$0.t0.message);
        _logger2['default'].warn('Unable to update project file \'' + projectFilePath + '\' with ' + ('bundle id \'' + newBundleId + '\'. WebDriverAgent may not start'));

      case 13:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 9]]);
}

/**
 * Reset WebDriverAgentRunner project bundle ID to correct state.
 * @param {string} agentPath - Path to the .xcodeproj directory.
 */
function resetProjectFile(agentPath) {
  var projectFilePath;
  return _regeneratorRuntime.async(function resetProjectFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        projectFilePath = agentPath + '/' + PROJECT_FILE;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(projectFilePath + '.old'));

      case 4:
        if (context$1$0.sent) {
          context$1$0.next = 6;
          break;
        }

        return context$1$0.abrupt('return');

      case 6:
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.mv(projectFilePath + '.old', projectFilePath));

      case 8:
        _logger2['default'].debug('Successfully reset \'' + projectFilePath + '\' with bundle id \'' + WDA_RUNNER_BUNDLE_ID + '\'');
        context$1$0.next = 15;
        break;

      case 11:
        context$1$0.prev = 11;
        context$1$0.t0 = context$1$0['catch'](1);

        _logger2['default'].debug('Error resetting project file: ' + context$1$0.t0.message);
        _logger2['default'].warn('Unable to reset project file \'' + projectFilePath + '\' with ' + ('bundle id \'' + WDA_RUNNER_BUNDLE_ID + '\'. WebDriverAgent has been ') + 'modified and not returned to the original state.');

      case 15:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 11]]);
}

function checkForDependencies(bootstrapPath) {
  var useSsl = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var carthagePath, carthageRoot, areDependenciesUpdated, args, _arr, _i, std, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, line;

  return _regeneratorRuntime.async(function checkForDependencies$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.which('carthage'));

      case 3:
        carthagePath = context$1$0.sent;

        _logger2['default'].debug('Carthage found: \'' + carthagePath + '\'');
        context$1$0.next = 10;
        break;

      case 7:
        context$1$0.prev = 7;
        context$1$0.t0 = context$1$0['catch'](0);

        _logger2['default'].errorAndThrow('Carthage binary is not found. Install using `brew install carthage` if it is not installed ' + 'and make sure the root folder, where carthage binary is installed, is present in PATH environment variable. ' + ('The current PATH value: \'' + (process.env.PATH ? process.env.PATH : "<not defined for the Appium process>") + '\''));

      case 10:
        carthageRoot = _path2['default'].resolve(bootstrapPath, CARTHAGE_ROOT);
        areDependenciesUpdated = false;
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.hasAccess(carthageRoot));

      case 14:
        if (context$1$0.sent) {
          context$1$0.next = 62;
          break;
        }

        _logger2['default'].debug('Running WebDriverAgent bootstrap script to install dependencies');
        context$1$0.prev = 16;
        args = useSsl ? ['-d', '-D'] : ['-d'];
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('Scripts/bootstrap.sh', args, { cwd: bootstrapPath }));

      case 20:
        areDependenciesUpdated = true;
        context$1$0.next = 62;
        break;

      case 23:
        context$1$0.prev = 23;
        context$1$0.t1 = context$1$0['catch'](16);
        _arr = ['stdout', 'stderr'];
        _i = 0;

      case 27:
        if (!(_i < _arr.length)) {
          context$1$0.next = 59;
          break;
        }

        std = _arr[_i];
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 32;
        _iterator = _getIterator((context$1$0.t1[std] || '').split('\n'));

      case 34:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 42;
          break;
        }

        line = _step.value;

        if (line.length) {
          context$1$0.next = 38;
          break;
        }

        return context$1$0.abrupt('continue', 39);

      case 38:
        _logger2['default'].error(line);

      case 39:
        _iteratorNormalCompletion = true;
        context$1$0.next = 34;
        break;

      case 42:
        context$1$0.next = 48;
        break;

      case 44:
        context$1$0.prev = 44;
        context$1$0.t2 = context$1$0['catch'](32);
        _didIteratorError = true;
        _iteratorError = context$1$0.t2;

      case 48:
        context$1$0.prev = 48;
        context$1$0.prev = 49;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 51:
        context$1$0.prev = 51;

        if (!_didIteratorError) {
          context$1$0.next = 54;
          break;
        }

        throw _iteratorError;

      case 54:
        return context$1$0.finish(51);

      case 55:
        return context$1$0.finish(48);

      case 56:
        _i++;
        context$1$0.next = 27;
        break;

      case 59:
        context$1$0.next = 61;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(carthageRoot));

      case 61:
        throw context$1$0.t1;

      case 62:
        context$1$0.next = 64;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.hasAccess(bootstrapPath + '/Resources'));

      case 64:
        if (context$1$0.sent) {
          context$1$0.next = 69;
          break;
        }

        _logger2['default'].debug('Creating WebDriverAgent resources directory');
        context$1$0.next = 68;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.mkdir(bootstrapPath + '/Resources'));

      case 68:
        areDependenciesUpdated = true;

      case 69:
        context$1$0.next = 71;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.hasAccess(bootstrapPath + '/Resources/WebDriverAgent.bundle'));

      case 71:
        if (context$1$0.sent) {
          context$1$0.next = 76;
          break;
        }

        _logger2['default'].debug('Creating WebDriverAgent resource bundle directory');
        context$1$0.next = 75;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.mkdir(bootstrapPath + '/Resources/WebDriverAgent.bundle'));

      case 75:
        areDependenciesUpdated = true;

      case 76:
        return context$1$0.abrupt('return', areDependenciesUpdated);

      case 77:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 7], [16, 23], [32, 44, 48, 56], [49,, 51, 55]]);
}

function setRealDeviceSecurity(keychainPath, keychainPassword) {
  return _regeneratorRuntime.async(function setRealDeviceSecurity$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Setting security for iOS device');
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('security', ['-v', 'list-keychains', '-s', keychainPath]));

      case 3:
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('security', ['-v', 'unlock-keychain', '-p', keychainPassword, keychainPath]));

      case 5:
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('security', ['set-keychain-settings', '-t', '3600', '-l', keychainPath]));

      case 7:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function fixXCUICoordinateFile(bootstrapPath) {
  var initial = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  var file, oldDef, newDef, _ref;

  return _regeneratorRuntime.async(function fixXCUICoordinateFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        file = _path2['default'].resolve(bootstrapPath, XCUICOORDINATE_FILE);
        oldDef = '- (void)pressForDuration:(double)arg1 thenDragToCoordinate:(id)arg2;';
        newDef = '- (void)pressForDuration:(NSTimeInterval)duration thenDragToCoordinate:(XCUICoordinate *)otherCoordinate;';

        if (!initial) {
          _ref = [newDef, oldDef];
          oldDef = _ref[0];
          newDef = _ref[1];
        }
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(replaceInFile(file, oldDef, newDef));

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function fixFBSessionFile(bootstrapPath) {
  var initial = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  var file, oldLine, newLine, _ref2;

  return _regeneratorRuntime.async(function fixFBSessionFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        file = _path2['default'].resolve(bootstrapPath, FBSESSION_FILE);
        oldLine = 'return [FBApplication fb_activeApplication] ?: self.testedApplication;';
        newLine = 'FBApplication *application = [FBApplication fb_activeApplication] ?: self.testedApplication;\n' + '  return application;';

        if (!initial) {
          _ref2 = [newLine, oldLine];
          oldLine = _ref2[0];
          newLine = _ref2[1];
        }
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(replaceInFile(file, oldLine, newLine));

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function fixForXcode7(bootstrapPath) {
  var initial = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  var fixXcode9 = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
  return _regeneratorRuntime.async(function fixForXcode7$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!fixXcode9) {
          context$1$0.next = 3;
          break;
        }

        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(fixForXcode9(bootstrapPath, !initial, false));

      case 3:
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(fixXCUICoordinateFile(bootstrapPath, initial));

      case 5:
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(fixFBSessionFile(bootstrapPath, initial));

      case 7:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function fixFBMacrosFile(bootstrapPath) {
  var initial = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  var file, oldDef, newDef, _ref3;

  return _regeneratorRuntime.async(function fixFBMacrosFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        file = _path2['default'].resolve(bootstrapPath, FBMACROS_FILE);
        oldDef = '#define FBStringify(class, property) ({if(NO){[class.new property];} @#property;})';
        newDef = '#define FBStringify(class, property) ({@#property;})';

        if (!initial) {
          _ref3 = [newDef, oldDef];
          oldDef = _ref3[0];
          newDef = _ref3[1];
        }
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(replaceInFile(file, oldDef, newDef));

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function fixXCUIApplicationFile(bootstrapPath) {
  var initial = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  var file, oldDef, newDef, _ref4;

  return _regeneratorRuntime.async(function fixXCUIApplicationFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        file = _path2['default'].resolve(bootstrapPath, XCUIAPPLICATION_FILE);
        oldDef = '@property(nonatomic, readonly) NSUInteger state; // @synthesize state=_state;';
        newDef = '@property XCUIApplicationState state;';

        if (!initial) {
          _ref4 = [newDef, oldDef];
          oldDef = _ref4[0];
          newDef = _ref4[1];
        }
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(replaceInFile(file, oldDef, newDef));

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function fixForXcode9(bootstrapPath) {
  var initial = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  var fixXcode7 = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
  return _regeneratorRuntime.async(function fixForXcode9$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!fixXcode7) {
          context$1$0.next = 3;
          break;
        }

        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(fixForXcode7(bootstrapPath, !initial, false));

      case 3:
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(fixFBMacrosFile(bootstrapPath, initial));

      case 5:
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(fixXCUIApplicationFile(bootstrapPath, initial));

      case 7:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function generateXcodeConfigFile(orgId, signingId) {
  var contents, xcconfigPath;
  return _regeneratorRuntime.async(function generateXcodeConfigFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Generating xcode config file for orgId \'' + orgId + '\' and signingId ' + ('\'' + signingId + '\''));
        contents = 'DEVELOPMENT_TEAM = ' + orgId + '\nCODE_SIGN_IDENTITY = ' + signingId + '\n';
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.path('appium-temp.xcconfig'));

      case 4:
        xcconfigPath = context$1$0.sent;

        _logger2['default'].debug('Writing xcode config file to ' + xcconfigPath);
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.writeFile(xcconfigPath, contents, "utf8"));

      case 8:
        return context$1$0.abrupt('return', xcconfigPath);

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

/**
 * Creates xctestrun file per device & platform version.
 * We expects to have WebDriverAgentRunner_iphoneos${platformVersion}-arm64.xctestrun for real device
 * and WebDriverAgentRunner_iphonesimulator${platformVersion}-x86_64.xctestrun for simulator located @bootstrapPath
 *
 * @param {boolean} isRealDevice - Equals to true if the current device is a real device
 * @param {string} udid - The device UDID.
 * @param {string} platformVersion - The platform version of OS.
 * @param {string} bootstrapPath - The folder path containing xctestrun file.
 * @param {string} wdaRemotePort - The remote port WDA is listening on.
 * @return {string} returns xctestrunFilePath for given device
 * @throws if WebDriverAgentRunner_iphoneos${platformVersion}-arm64.xctestrun for real device
 * or WebDriverAgentRunner_iphonesimulator${platformVersion}-x86_64.xctestrun for simulator is not found @bootstrapPath,
 * then it will throw file not found exception
 */
function setXctestrunFile(isRealDevice, udid, platformVersion, bootstrapPath, wdaRemotePort) {
  var xctestrunDeviceFileName, xctestrunFilePath, xctestBaseFileName, originalXctestrunFile, xctestRunContent, updateWDAPort, newXctestRunContent;
  return _regeneratorRuntime.async(function setXctestrunFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        xctestrunDeviceFileName = udid + '_' + platformVersion + '.xctestrun';
        xctestrunFilePath = _path2['default'].resolve(bootstrapPath, xctestrunDeviceFileName);
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(xctestrunFilePath));

      case 4:
        if (context$1$0.sent) {
          context$1$0.next = 13;
          break;
        }

        xctestBaseFileName = isRealDevice ? 'WebDriverAgentRunner_iphoneos' + platformVersion + '-arm64.xctestrun' : 'WebDriverAgentRunner_iphonesimulator' + platformVersion + '-x86_64.xctestrun';
        originalXctestrunFile = _path2['default'].resolve(bootstrapPath, xctestBaseFileName);
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(originalXctestrunFile));

      case 9:
        if (context$1$0.sent) {
          context$1$0.next = 11;
          break;
        }

        _logger2['default'].errorAndThrow('if you are using useXctestrunFile capability then you need to have ' + originalXctestrunFile + ' file');

      case 11:
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.copyFile(originalXctestrunFile, xctestrunFilePath));

      case 13:
        context$1$0.next = 15;
        return _regeneratorRuntime.awrap(_appiumSupport.plist.parsePlistFile(xctestrunFilePath));

      case 15:
        xctestRunContent = context$1$0.sent;
        updateWDAPort = {
          WebDriverAgentRunner: {
            EnvironmentVariables: {
              USE_PORT: wdaRemotePort
            }
          }
        };
        newXctestRunContent = _lodash2['default'].merge(xctestRunContent, updateWDAPort);
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap(_appiumSupport.plist.updatePlistFile(xctestrunFilePath, newXctestRunContent, true));

      case 20:
        return context$1$0.abrupt('return', xctestrunFilePath);

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function killProcess(name, proc) {
  return _regeneratorRuntime.async(function killProcess$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!(proc && proc.proc)) {
          context$1$0.next = 22;
          break;
        }

        _logger2['default'].info('Shutting down ' + name + ' process (pid ' + proc.proc.pid + ')');
        context$1$0.prev = 2;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(proc.stop('SIGTERM', 1000));

      case 5:
        context$1$0.next = 22;
        break;

      case 7:
        context$1$0.prev = 7;
        context$1$0.t0 = context$1$0['catch'](2);

        if (!(context$1$0.t0.message.indexOf('Process didn\'t end after') === -1)) {
          context$1$0.next = 11;
          break;
        }

        throw context$1$0.t0;

      case 11:
        _logger2['default'].debug(name + ' process did not end in a timely fashion: \'' + context$1$0.t0.message + '\'. ' + 'Sending \'SIGKILL\'...');
        context$1$0.prev = 12;
        context$1$0.next = 15;
        return _regeneratorRuntime.awrap(proc.stop('SIGKILL'));

      case 15:
        context$1$0.next = 22;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t1 = context$1$0['catch'](12);

        if (!(context$1$0.t1.message.indexOf('not currently running') !== -1)) {
          context$1$0.next = 21;
          break;
        }

        return context$1$0.abrupt('return');

      case 21:
        throw context$1$0.t1;

      case 22:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[2, 7], [12, 17]]);
}

/**
 * Generate a random integer.
 *
 * @return {number} A random integer number in range [low, hight). `low`` is inclusive and `high` is exclusive.
 */
function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

/**
 * Retrieves WDA upgrade timestamp
 *
 * @param {string} bootstrapPath The full path to the folder where WDA source is located
 * @return {?number} The UNIX timestamp of the carthage root folder, where dependencies are downloaded.
 * This folder is created only once on module upgrade/first install.
 */
function getWDAUpgradeTimestamp(bootstrapPath) {
  var carthageRootPath, _ref5, mtime;

  return _regeneratorRuntime.async(function getWDAUpgradeTimestamp$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        carthageRootPath = _path2['default'].resolve(bootstrapPath, CARTHAGE_ROOT);
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(carthageRootPath));

      case 3:
        if (!context$1$0.sent) {
          context$1$0.next = 9;
          break;
        }

        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.stat(carthageRootPath));

      case 6:
        _ref5 = context$1$0.sent;
        mtime = _ref5.mtime;
        return context$1$0.abrupt('return', mtime.getTime());

      case 9:
        return context$1$0.abrupt('return', null);

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

exports.updateProjectFile = updateProjectFile;
exports.resetProjectFile = resetProjectFile;
exports.checkForDependencies = checkForDependencies;
exports.setRealDeviceSecurity = setRealDeviceSecurity;
exports.fixForXcode7 = fixForXcode7;
exports.fixForXcode9 = fixForXcode9;
exports.generateXcodeConfigFile = generateXcodeConfigFile;
exports.setXctestrunFile = setXctestrunFile;
exports.killProcess = killProcess;
exports.randomInt = randomInt;
exports.WDA_RUNNER_BUNDLE_ID = WDA_RUNNER_BUNDLE_ID;
exports.getWDAUpgradeTimestamp = getWDAUpgradeTimestamp;

// Assuming projectFilePath is in the correct state, create .old from projectFilePath

// restore projectFilePath from .old file
// no need to reset

// print out the stdout and stderr reports

// remove the carthage directory, or else subsequent runs will see it and
// assume the dependencies are already downloaded

// the way the updated XCTest headers are in the WDA project, building in
// Xcode 8.0 causes a duplicate declaration of method
// so fix the offending line in the local headers

// If this is first time run for given device, then first generate xctestrun file for device.
// We need to have a xctestrun file per device because we cant not have same wda port for all devices.

// the process ended but for some reason we were not informed
//# sourceMappingURL=data:application/json;charset=utf8;base64,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QkFBc0IsR0FBdEIsc0JBQXNCIiwiZmlsZSI6ImxpYi93ZGEvdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcywgdGVtcERpciwgcGxpc3QgfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuY29uc3QgV0RBX1JVTk5FUl9CVU5ETEVfSUQgPSAnY29tLmZhY2Vib29rLldlYkRyaXZlckFnZW50UnVubmVyJztcbmNvbnN0IFBST0pFQ1RfRklMRSA9ICdwcm9qZWN0LnBieHByb2onO1xuY29uc3QgWENVSUNPT1JESU5BVEVfRklMRSA9ICdQcml2YXRlSGVhZGVycy9YQ1Rlc3QvWENVSUNvb3JkaW5hdGUuaCc7XG5jb25zdCBGQk1BQ1JPU19GSUxFID0gJ1dlYkRyaXZlckFnZW50TGliL1V0aWxpdGllcy9GQk1hY3Jvcy5oJztcbmNvbnN0IFhDVUlBUFBMSUNBVElPTl9GSUxFID0gJ1ByaXZhdGVIZWFkZXJzL1hDVGVzdC9YQ1VJQXBwbGljYXRpb24uaCc7XG5jb25zdCBGQlNFU1NJT05fRklMRSA9ICdXZWJEcml2ZXJBZ2VudExpYi9Sb3V0aW5nL0ZCU2Vzc2lvbi5tJztcbmNvbnN0IENBUlRIQUdFX1JPT1QgPSAnQ2FydGhhZ2UnO1xuXG5hc3luYyBmdW5jdGlvbiByZXBsYWNlSW5GaWxlIChmaWxlLCBmaW5kLCByZXBsYWNlKSB7XG4gIGxldCBjb250ZW50cyA9IGF3YWl0IGZzLnJlYWRGaWxlKGZpbGUsICd1dGY4Jyk7XG5cbiAgbGV0IG5ld0NvbnRlbnRzID0gY29udGVudHMucmVwbGFjZShmaW5kLCByZXBsYWNlKTtcbiAgaWYgKG5ld0NvbnRlbnRzICE9PSBjb250ZW50cykge1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShmaWxlLCBuZXdDb250ZW50cywgJ3V0ZjgnKTtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZSBXZWJEcml2ZXJBZ2VudFJ1bm5lciBwcm9qZWN0IGJ1bmRsZSBJRCB3aXRoIG5ld0J1bmRsZUlkLlxuICogVGhpcyBtZXRob2QgYXNzdW1lcyBwcm9qZWN0IGZpbGUgaXMgaW4gdGhlIGNvcnJlY3Qgc3RhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gYWdlbnRQYXRoIC0gUGF0aCB0byB0aGUgLnhjb2RlcHJvaiBkaXJlY3RvcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV3QnVuZGxlSWQgdGhlIG5ldyBidW5kbGUgSUQgdXNlZCB0byB1cGRhdGUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVByb2plY3RGaWxlIChhZ2VudFBhdGgsIG5ld0J1bmRsZUlkKSB7XG4gIGxldCBwcm9qZWN0RmlsZVBhdGggPSBgJHthZ2VudFBhdGh9LyR7UFJPSkVDVF9GSUxFfWA7XG4gIHRyeSB7XG4gICAgLy8gQXNzdW1pbmcgcHJvamVjdEZpbGVQYXRoIGlzIGluIHRoZSBjb3JyZWN0IHN0YXRlLCBjcmVhdGUgLm9sZCBmcm9tIHByb2plY3RGaWxlUGF0aFxuICAgIGF3YWl0IGZzLmNvcHlGaWxlKHByb2plY3RGaWxlUGF0aCwgYCR7cHJvamVjdEZpbGVQYXRofS5vbGRgKTtcbiAgICBhd2FpdCByZXBsYWNlSW5GaWxlKHByb2plY3RGaWxlUGF0aCwgbmV3IFJlZ0V4cChXREFfUlVOTkVSX0JVTkRMRV9JRC5yZXBsYWNlKCcuJywgJ1xcLicpLCAnZycpLCBuZXdCdW5kbGVJZCk7XG4gICAgbG9nLmRlYnVnKGBTdWNjZXNzZnVsbHkgdXBkYXRlZCAnJHtwcm9qZWN0RmlsZVBhdGh9JyB3aXRoIGJ1bmRsZSBpZCAnJHtuZXdCdW5kbGVJZH0nYCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy5kZWJ1ZyhgRXJyb3IgdXBkYXRpbmcgcHJvamVjdCBmaWxlOiAke2Vyci5tZXNzYWdlfWApO1xuICAgIGxvZy53YXJuKGBVbmFibGUgdG8gdXBkYXRlIHByb2plY3QgZmlsZSAnJHtwcm9qZWN0RmlsZVBhdGh9JyB3aXRoIGAgK1xuICAgICAgICAgICAgIGBidW5kbGUgaWQgJyR7bmV3QnVuZGxlSWR9Jy4gV2ViRHJpdmVyQWdlbnQgbWF5IG5vdCBzdGFydGApO1xuICB9XG59XG5cbi8qKlxuICogUmVzZXQgV2ViRHJpdmVyQWdlbnRSdW5uZXIgcHJvamVjdCBidW5kbGUgSUQgdG8gY29ycmVjdCBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhZ2VudFBhdGggLSBQYXRoIHRvIHRoZSAueGNvZGVwcm9qIGRpcmVjdG9yeS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVzZXRQcm9qZWN0RmlsZSAoYWdlbnRQYXRoKSB7XG4gIGxldCBwcm9qZWN0RmlsZVBhdGggPSBgJHthZ2VudFBhdGh9LyR7UFJPSkVDVF9GSUxFfWA7XG4gIHRyeSB7XG4gICAgLy8gcmVzdG9yZSBwcm9qZWN0RmlsZVBhdGggZnJvbSAub2xkIGZpbGVcbiAgICBpZiAoIWF3YWl0IGZzLmV4aXN0cyhgJHtwcm9qZWN0RmlsZVBhdGh9Lm9sZGApKSB7XG4gICAgICByZXR1cm47ICAvLyBubyBuZWVkIHRvIHJlc2V0XG4gICAgfVxuICAgIGF3YWl0IGZzLm12KGAke3Byb2plY3RGaWxlUGF0aH0ub2xkYCwgcHJvamVjdEZpbGVQYXRoKTtcbiAgICBsb2cuZGVidWcoYFN1Y2Nlc3NmdWxseSByZXNldCAnJHtwcm9qZWN0RmlsZVBhdGh9JyB3aXRoIGJ1bmRsZSBpZCAnJHtXREFfUlVOTkVSX0JVTkRMRV9JRH0nYCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy5kZWJ1ZyhgRXJyb3IgcmVzZXR0aW5nIHByb2plY3QgZmlsZTogJHtlcnIubWVzc2FnZX1gKTtcbiAgICBsb2cud2FybihgVW5hYmxlIHRvIHJlc2V0IHByb2plY3QgZmlsZSAnJHtwcm9qZWN0RmlsZVBhdGh9JyB3aXRoIGAgK1xuICAgICAgICAgICAgIGBidW5kbGUgaWQgJyR7V0RBX1JVTk5FUl9CVU5ETEVfSUR9Jy4gV2ViRHJpdmVyQWdlbnQgaGFzIGJlZW4gYCArXG4gICAgICAgICAgICAgYG1vZGlmaWVkIGFuZCBub3QgcmV0dXJuZWQgdG8gdGhlIG9yaWdpbmFsIHN0YXRlLmApO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrRm9yRGVwZW5kZW5jaWVzIChib290c3RyYXBQYXRoLCB1c2VTc2wgPSBmYWxzZSkge1xuICB0cnkge1xuICAgIGxldCBjYXJ0aGFnZVBhdGggPSBhd2FpdCBmcy53aGljaCgnY2FydGhhZ2UnKTtcbiAgICBsb2cuZGVidWcoYENhcnRoYWdlIGZvdW5kOiAnJHtjYXJ0aGFnZVBhdGh9J2ApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdygnQ2FydGhhZ2UgYmluYXJ5IGlzIG5vdCBmb3VuZC4gSW5zdGFsbCB1c2luZyBgYnJldyBpbnN0YWxsIGNhcnRoYWdlYCBpZiBpdCBpcyBub3QgaW5zdGFsbGVkICcgK1xuICAgICAgJ2FuZCBtYWtlIHN1cmUgdGhlIHJvb3QgZm9sZGVyLCB3aGVyZSBjYXJ0aGFnZSBiaW5hcnkgaXMgaW5zdGFsbGVkLCBpcyBwcmVzZW50IGluIFBBVEggZW52aXJvbm1lbnQgdmFyaWFibGUuICcgK1xuICAgICAgYFRoZSBjdXJyZW50IFBBVEggdmFsdWU6ICcke3Byb2Nlc3MuZW52LlBBVEggPyBwcm9jZXNzLmVudi5QQVRIIDogXCI8bm90IGRlZmluZWQgZm9yIHRoZSBBcHBpdW0gcHJvY2Vzcz5cIn0nYCk7XG4gIH1cbiAgY29uc3QgY2FydGhhZ2VSb290ID0gcGF0aC5yZXNvbHZlKGJvb3RzdHJhcFBhdGgsIENBUlRIQUdFX1JPT1QpO1xuICBsZXQgYXJlRGVwZW5kZW5jaWVzVXBkYXRlZCA9IGZhbHNlO1xuICBpZiAoIWF3YWl0IGZzLmhhc0FjY2VzcyhjYXJ0aGFnZVJvb3QpKSB7XG4gICAgbG9nLmRlYnVnKCdSdW5uaW5nIFdlYkRyaXZlckFnZW50IGJvb3RzdHJhcCBzY3JpcHQgdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMnKTtcbiAgICB0cnkge1xuICAgICAgbGV0IGFyZ3MgPSB1c2VTc2wgPyBbJy1kJywgJy1EJ10gOiBbJy1kJ107XG4gICAgICBhd2FpdCBleGVjKCdTY3JpcHRzL2Jvb3RzdHJhcC5zaCcsIGFyZ3MsIHtjd2Q6IGJvb3RzdHJhcFBhdGh9KTtcbiAgICAgIGFyZURlcGVuZGVuY2llc1VwZGF0ZWQgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gcHJpbnQgb3V0IHRoZSBzdGRvdXQgYW5kIHN0ZGVyciByZXBvcnRzXG4gICAgICBmb3IgKGxldCBzdGQgb2YgWydzdGRvdXQnLCAnc3RkZXJyJ10pIHtcbiAgICAgICAgZm9yIChsZXQgbGluZSBvZiAoZXJyW3N0ZF0gfHwgJycpLnNwbGl0KCdcXG4nKSkge1xuICAgICAgICAgIGlmICghbGluZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsb2cuZXJyb3IobGluZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSB0aGUgY2FydGhhZ2UgZGlyZWN0b3J5LCBvciBlbHNlIHN1YnNlcXVlbnQgcnVucyB3aWxsIHNlZSBpdCBhbmRcbiAgICAgIC8vIGFzc3VtZSB0aGUgZGVwZW5kZW5jaWVzIGFyZSBhbHJlYWR5IGRvd25sb2FkZWRcbiAgICAgIGF3YWl0IGZzLnJpbXJhZihjYXJ0aGFnZVJvb3QpO1xuXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG4gIGlmICghYXdhaXQgZnMuaGFzQWNjZXNzKGAke2Jvb3RzdHJhcFBhdGh9L1Jlc291cmNlc2ApKSB7XG4gICAgbG9nLmRlYnVnKCdDcmVhdGluZyBXZWJEcml2ZXJBZ2VudCByZXNvdXJjZXMgZGlyZWN0b3J5Jyk7XG4gICAgYXdhaXQgZnMubWtkaXIoYCR7Ym9vdHN0cmFwUGF0aH0vUmVzb3VyY2VzYCk7XG4gICAgYXJlRGVwZW5kZW5jaWVzVXBkYXRlZCA9IHRydWU7XG4gIH1cbiAgaWYgKCFhd2FpdCBmcy5oYXNBY2Nlc3MoYCR7Ym9vdHN0cmFwUGF0aH0vUmVzb3VyY2VzL1dlYkRyaXZlckFnZW50LmJ1bmRsZWApKSB7XG4gICAgbG9nLmRlYnVnKCdDcmVhdGluZyBXZWJEcml2ZXJBZ2VudCByZXNvdXJjZSBidW5kbGUgZGlyZWN0b3J5Jyk7XG4gICAgYXdhaXQgZnMubWtkaXIoYCR7Ym9vdHN0cmFwUGF0aH0vUmVzb3VyY2VzL1dlYkRyaXZlckFnZW50LmJ1bmRsZWApO1xuICAgIGFyZURlcGVuZGVuY2llc1VwZGF0ZWQgPSB0cnVlO1xuICB9XG4gIHJldHVybiBhcmVEZXBlbmRlbmNpZXNVcGRhdGVkO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRSZWFsRGV2aWNlU2VjdXJpdHkgKGtleWNoYWluUGF0aCwga2V5Y2hhaW5QYXNzd29yZCkge1xuICBsb2cuZGVidWcoJ1NldHRpbmcgc2VjdXJpdHkgZm9yIGlPUyBkZXZpY2UnKTtcbiAgYXdhaXQgZXhlYygnc2VjdXJpdHknLCBbJy12JywgJ2xpc3Qta2V5Y2hhaW5zJywgJy1zJywga2V5Y2hhaW5QYXRoXSk7XG4gIGF3YWl0IGV4ZWMoJ3NlY3VyaXR5JywgWyctdicsICd1bmxvY2sta2V5Y2hhaW4nLCAnLXAnLCBrZXljaGFpblBhc3N3b3JkLCBrZXljaGFpblBhdGhdKTtcbiAgYXdhaXQgZXhlYygnc2VjdXJpdHknLCBbJ3NldC1rZXljaGFpbi1zZXR0aW5ncycsICctdCcsICczNjAwJywgJy1sJywga2V5Y2hhaW5QYXRoXSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpeFhDVUlDb29yZGluYXRlRmlsZSAoYm9vdHN0cmFwUGF0aCwgaW5pdGlhbCA9IHRydWUpIHtcbiAgLy8gdGhlIHdheSB0aGUgdXBkYXRlZCBYQ1Rlc3QgaGVhZGVycyBhcmUgaW4gdGhlIFdEQSBwcm9qZWN0LCBidWlsZGluZyBpblxuICAvLyBYY29kZSA4LjAgY2F1c2VzIGEgZHVwbGljYXRlIGRlY2xhcmF0aW9uIG9mIG1ldGhvZFxuICAvLyBzbyBmaXggdGhlIG9mZmVuZGluZyBsaW5lIGluIHRoZSBsb2NhbCBoZWFkZXJzXG4gIGNvbnN0IGZpbGUgPSBwYXRoLnJlc29sdmUoYm9vdHN0cmFwUGF0aCwgWENVSUNPT1JESU5BVEVfRklMRSk7XG5cbiAgbGV0IG9sZERlZiA9ICctICh2b2lkKXByZXNzRm9yRHVyYXRpb246KGRvdWJsZSlhcmcxIHRoZW5EcmFnVG9Db29yZGluYXRlOihpZClhcmcyOyc7XG4gIGxldCBuZXdEZWYgPSAnLSAodm9pZClwcmVzc0ZvckR1cmF0aW9uOihOU1RpbWVJbnRlcnZhbClkdXJhdGlvbiB0aGVuRHJhZ1RvQ29vcmRpbmF0ZTooWENVSUNvb3JkaW5hdGUgKilvdGhlckNvb3JkaW5hdGU7JztcbiAgaWYgKCFpbml0aWFsKSB7XG4gICAgW29sZERlZiwgbmV3RGVmXSA9IFtuZXdEZWYsIG9sZERlZl07XG4gIH1cbiAgYXdhaXQgcmVwbGFjZUluRmlsZShmaWxlLCBvbGREZWYsIG5ld0RlZik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpeEZCU2Vzc2lvbkZpbGUgKGJvb3RzdHJhcFBhdGgsIGluaXRpYWwgPSB0cnVlKSB7XG4gIGNvbnN0IGZpbGUgPSBwYXRoLnJlc29sdmUoYm9vdHN0cmFwUGF0aCwgRkJTRVNTSU9OX0ZJTEUpO1xuXG4gIGxldCBvbGRMaW5lID0gJ3JldHVybiBbRkJBcHBsaWNhdGlvbiBmYl9hY3RpdmVBcHBsaWNhdGlvbl0gPzogc2VsZi50ZXN0ZWRBcHBsaWNhdGlvbjsnO1xuICBsZXQgbmV3TGluZSA9ICdGQkFwcGxpY2F0aW9uICphcHBsaWNhdGlvbiA9IFtGQkFwcGxpY2F0aW9uIGZiX2FjdGl2ZUFwcGxpY2F0aW9uXSA/OiBzZWxmLnRlc3RlZEFwcGxpY2F0aW9uO1xcbicgK1xuICAgICAgICAgICAgICAgICcgIHJldHVybiBhcHBsaWNhdGlvbjsnO1xuICBpZiAoIWluaXRpYWwpIHtcbiAgICBbb2xkTGluZSwgbmV3TGluZV0gPSBbbmV3TGluZSwgb2xkTGluZV07XG4gIH1cbiAgYXdhaXQgcmVwbGFjZUluRmlsZShmaWxlLCBvbGRMaW5lLCBuZXdMaW5lKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZml4Rm9yWGNvZGU3IChib290c3RyYXBQYXRoLCBpbml0aWFsID0gdHJ1ZSwgZml4WGNvZGU5ID0gdHJ1ZSkge1xuICBpZiAoZml4WGNvZGU5KSB7XG4gICAgYXdhaXQgZml4Rm9yWGNvZGU5KGJvb3RzdHJhcFBhdGgsICFpbml0aWFsLCBmYWxzZSk7XG4gIH1cbiAgYXdhaXQgZml4WENVSUNvb3JkaW5hdGVGaWxlKGJvb3RzdHJhcFBhdGgsIGluaXRpYWwpO1xuICBhd2FpdCBmaXhGQlNlc3Npb25GaWxlKGJvb3RzdHJhcFBhdGgsIGluaXRpYWwpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmaXhGQk1hY3Jvc0ZpbGUgKGJvb3RzdHJhcFBhdGgsIGluaXRpYWwgPSB0cnVlKSB7XG4gIGNvbnN0IGZpbGUgPSBwYXRoLnJlc29sdmUoYm9vdHN0cmFwUGF0aCwgRkJNQUNST1NfRklMRSk7XG5cbiAgbGV0IG9sZERlZiA9ICcjZGVmaW5lIEZCU3RyaW5naWZ5KGNsYXNzLCBwcm9wZXJ0eSkgKHtpZihOTyl7W2NsYXNzLm5ldyBwcm9wZXJ0eV07fSBAI3Byb3BlcnR5O30pJztcbiAgbGV0IG5ld0RlZiA9ICcjZGVmaW5lIEZCU3RyaW5naWZ5KGNsYXNzLCBwcm9wZXJ0eSkgKHtAI3Byb3BlcnR5O30pJztcbiAgaWYgKCFpbml0aWFsKSB7XG4gICAgW29sZERlZiwgbmV3RGVmXSA9IFtuZXdEZWYsIG9sZERlZl07XG4gIH1cbiAgYXdhaXQgcmVwbGFjZUluRmlsZShmaWxlLCBvbGREZWYsIG5ld0RlZik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpeFhDVUlBcHBsaWNhdGlvbkZpbGUgKGJvb3RzdHJhcFBhdGgsIGluaXRpYWwgPSB0cnVlKSB7XG4gIGNvbnN0IGZpbGUgPSBwYXRoLnJlc29sdmUoYm9vdHN0cmFwUGF0aCwgWENVSUFQUExJQ0FUSU9OX0ZJTEUpO1xuXG4gIGxldCBvbGREZWYgPSAnQHByb3BlcnR5KG5vbmF0b21pYywgcmVhZG9ubHkpIE5TVUludGVnZXIgc3RhdGU7IC8vIEBzeW50aGVzaXplIHN0YXRlPV9zdGF0ZTsnO1xuICBsZXQgbmV3RGVmID0gJ0Bwcm9wZXJ0eSBYQ1VJQXBwbGljYXRpb25TdGF0ZSBzdGF0ZTsnO1xuICBpZiAoIWluaXRpYWwpIHtcbiAgICBbb2xkRGVmLCBuZXdEZWZdID0gW25ld0RlZiwgb2xkRGVmXTtcbiAgfVxuICBhd2FpdCByZXBsYWNlSW5GaWxlKGZpbGUsIG9sZERlZiwgbmV3RGVmKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZml4Rm9yWGNvZGU5IChib290c3RyYXBQYXRoLCBpbml0aWFsID0gdHJ1ZSwgZml4WGNvZGU3ID0gdHJ1ZSkge1xuICBpZiAoZml4WGNvZGU3KSB7XG4gICAgYXdhaXQgZml4Rm9yWGNvZGU3KGJvb3RzdHJhcFBhdGgsICFpbml0aWFsLCBmYWxzZSk7XG4gIH1cbiAgYXdhaXQgZml4RkJNYWNyb3NGaWxlKGJvb3RzdHJhcFBhdGgsIGluaXRpYWwpO1xuICBhd2FpdCBmaXhYQ1VJQXBwbGljYXRpb25GaWxlKGJvb3RzdHJhcFBhdGgsIGluaXRpYWwpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVhjb2RlQ29uZmlnRmlsZSAob3JnSWQsIHNpZ25pbmdJZCkge1xuICBsb2cuZGVidWcoYEdlbmVyYXRpbmcgeGNvZGUgY29uZmlnIGZpbGUgZm9yIG9yZ0lkICcke29yZ0lkfScgYW5kIHNpZ25pbmdJZCBgICtcbiAgICAgICAgICAgIGAnJHtzaWduaW5nSWR9J2ApO1xuICBsZXQgY29udGVudHMgPSBgREVWRUxPUE1FTlRfVEVBTSA9ICR7b3JnSWR9XG5DT0RFX1NJR05fSURFTlRJVFkgPSAke3NpZ25pbmdJZH1cbmA7XG4gIGxldCB4Y2NvbmZpZ1BhdGggPSBhd2FpdCB0ZW1wRGlyLnBhdGgoJ2FwcGl1bS10ZW1wLnhjY29uZmlnJyk7XG4gIGxvZy5kZWJ1ZyhgV3JpdGluZyB4Y29kZSBjb25maWcgZmlsZSB0byAke3hjY29uZmlnUGF0aH1gKTtcbiAgYXdhaXQgZnMud3JpdGVGaWxlKHhjY29uZmlnUGF0aCwgY29udGVudHMsIFwidXRmOFwiKTtcbiAgcmV0dXJuIHhjY29uZmlnUGF0aDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHhjdGVzdHJ1biBmaWxlIHBlciBkZXZpY2UgJiBwbGF0Zm9ybSB2ZXJzaW9uLlxuICogV2UgZXhwZWN0cyB0byBoYXZlIFdlYkRyaXZlckFnZW50UnVubmVyX2lwaG9uZW9zJHtwbGF0Zm9ybVZlcnNpb259LWFybTY0LnhjdGVzdHJ1biBmb3IgcmVhbCBkZXZpY2VcbiAqIGFuZCBXZWJEcml2ZXJBZ2VudFJ1bm5lcl9pcGhvbmVzaW11bGF0b3Ike3BsYXRmb3JtVmVyc2lvbn0teDg2XzY0LnhjdGVzdHJ1biBmb3Igc2ltdWxhdG9yIGxvY2F0ZWQgQGJvb3RzdHJhcFBhdGhcbiAqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzUmVhbERldmljZSAtIEVxdWFscyB0byB0cnVlIGlmIHRoZSBjdXJyZW50IGRldmljZSBpcyBhIHJlYWwgZGV2aWNlXG4gKiBAcGFyYW0ge3N0cmluZ30gdWRpZCAtIFRoZSBkZXZpY2UgVURJRC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGF0Zm9ybVZlcnNpb24gLSBUaGUgcGxhdGZvcm0gdmVyc2lvbiBvZiBPUy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBib290c3RyYXBQYXRoIC0gVGhlIGZvbGRlciBwYXRoIGNvbnRhaW5pbmcgeGN0ZXN0cnVuIGZpbGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gd2RhUmVtb3RlUG9ydCAtIFRoZSByZW1vdGUgcG9ydCBXREEgaXMgbGlzdGVuaW5nIG9uLlxuICogQHJldHVybiB7c3RyaW5nfSByZXR1cm5zIHhjdGVzdHJ1bkZpbGVQYXRoIGZvciBnaXZlbiBkZXZpY2VcbiAqIEB0aHJvd3MgaWYgV2ViRHJpdmVyQWdlbnRSdW5uZXJfaXBob25lb3Mke3BsYXRmb3JtVmVyc2lvbn0tYXJtNjQueGN0ZXN0cnVuIGZvciByZWFsIGRldmljZVxuICogb3IgV2ViRHJpdmVyQWdlbnRSdW5uZXJfaXBob25lc2ltdWxhdG9yJHtwbGF0Zm9ybVZlcnNpb259LXg4Nl82NC54Y3Rlc3RydW4gZm9yIHNpbXVsYXRvciBpcyBub3QgZm91bmQgQGJvb3RzdHJhcFBhdGgsXG4gKiB0aGVuIGl0IHdpbGwgdGhyb3cgZmlsZSBub3QgZm91bmQgZXhjZXB0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNldFhjdGVzdHJ1bkZpbGUgKGlzUmVhbERldmljZSwgdWRpZCwgcGxhdGZvcm1WZXJzaW9uLCBib290c3RyYXBQYXRoLCB3ZGFSZW1vdGVQb3J0KSB7XG4gIGxldCB4Y3Rlc3RydW5EZXZpY2VGaWxlTmFtZSA9IGAke3VkaWR9XyR7cGxhdGZvcm1WZXJzaW9ufS54Y3Rlc3RydW5gO1xuICBsZXQgeGN0ZXN0cnVuRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoYm9vdHN0cmFwUGF0aCwgeGN0ZXN0cnVuRGV2aWNlRmlsZU5hbWUpO1xuXG4gIGlmICghYXdhaXQgZnMuZXhpc3RzKHhjdGVzdHJ1bkZpbGVQYXRoKSkge1xuICAgIGxldCB4Y3Rlc3RCYXNlRmlsZU5hbWUgPSBpc1JlYWxEZXZpY2UgPyBgV2ViRHJpdmVyQWdlbnRSdW5uZXJfaXBob25lb3Mke3BsYXRmb3JtVmVyc2lvbn0tYXJtNjQueGN0ZXN0cnVuYCA6XG4gICAgICBgV2ViRHJpdmVyQWdlbnRSdW5uZXJfaXBob25lc2ltdWxhdG9yJHtwbGF0Zm9ybVZlcnNpb259LXg4Nl82NC54Y3Rlc3RydW5gO1xuICAgIGxldCBvcmlnaW5hbFhjdGVzdHJ1bkZpbGUgPSBwYXRoLnJlc29sdmUoYm9vdHN0cmFwUGF0aCwgeGN0ZXN0QmFzZUZpbGVOYW1lKTtcbiAgICBpZiAoIWF3YWl0IGZzLmV4aXN0cyhvcmlnaW5hbFhjdGVzdHJ1bkZpbGUpKSB7XG4gICAgICBsb2cuZXJyb3JBbmRUaHJvdyhgaWYgeW91IGFyZSB1c2luZyB1c2VYY3Rlc3RydW5GaWxlIGNhcGFiaWxpdHkgdGhlbiB5b3UgbmVlZCB0byBoYXZlICR7b3JpZ2luYWxYY3Rlc3RydW5GaWxlfSBmaWxlYCk7XG4gICAgfVxuICAgIC8vIElmIHRoaXMgaXMgZmlyc3QgdGltZSBydW4gZm9yIGdpdmVuIGRldmljZSwgdGhlbiBmaXJzdCBnZW5lcmF0ZSB4Y3Rlc3RydW4gZmlsZSBmb3IgZGV2aWNlLlxuICAgIC8vIFdlIG5lZWQgdG8gaGF2ZSBhIHhjdGVzdHJ1biBmaWxlIHBlciBkZXZpY2UgYmVjYXVzZSB3ZSBjYW50IG5vdCBoYXZlIHNhbWUgd2RhIHBvcnQgZm9yIGFsbCBkZXZpY2VzLlxuICAgIGF3YWl0IGZzLmNvcHlGaWxlKG9yaWdpbmFsWGN0ZXN0cnVuRmlsZSwgeGN0ZXN0cnVuRmlsZVBhdGgpO1xuICB9XG5cbiAgbGV0IHhjdGVzdFJ1bkNvbnRlbnQgPSBhd2FpdCBwbGlzdC5wYXJzZVBsaXN0RmlsZSh4Y3Rlc3RydW5GaWxlUGF0aCk7XG5cbiAgbGV0IHVwZGF0ZVdEQVBvcnQgPSB7XG4gICAgV2ViRHJpdmVyQWdlbnRSdW5uZXI6IHtcbiAgICAgIEVudmlyb25tZW50VmFyaWFibGVzOiB7XG4gICAgICAgIFVTRV9QT1JUOiB3ZGFSZW1vdGVQb3J0XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxldCBuZXdYY3Rlc3RSdW5Db250ZW50ID0gXy5tZXJnZSh4Y3Rlc3RSdW5Db250ZW50LCB1cGRhdGVXREFQb3J0KTtcbiAgYXdhaXQgcGxpc3QudXBkYXRlUGxpc3RGaWxlKHhjdGVzdHJ1bkZpbGVQYXRoLCBuZXdYY3Rlc3RSdW5Db250ZW50LCB0cnVlKTtcblxuICByZXR1cm4geGN0ZXN0cnVuRmlsZVBhdGg7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGtpbGxQcm9jZXNzIChuYW1lLCBwcm9jKSB7XG4gIGlmIChwcm9jICYmIHByb2MucHJvYykge1xuICAgIGxvZy5pbmZvKGBTaHV0dGluZyBkb3duICR7bmFtZX0gcHJvY2VzcyAocGlkICR7cHJvYy5wcm9jLnBpZH0pYCk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByb2Muc3RvcCgnU0lHVEVSTScsIDEwMDApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyci5tZXNzYWdlLmluZGV4T2YoYFByb2Nlc3MgZGlkbid0IGVuZCBhZnRlcmApID09PSAtMSkge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICBsb2cuZGVidWcoYCR7bmFtZX0gcHJvY2VzcyBkaWQgbm90IGVuZCBpbiBhIHRpbWVseSBmYXNoaW9uOiAnJHtlcnIubWVzc2FnZX0nLiBgICtcbiAgICAgICAgICAgICAgICBgU2VuZGluZyAnU0lHS0lMTCcuLi5gKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHByb2Muc3RvcCgnU0lHS0lMTCcpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIubWVzc2FnZS5pbmRleE9mKCdub3QgY3VycmVudGx5IHJ1bm5pbmcnKSAhPT0gLTEpIHtcbiAgICAgICAgICAvLyB0aGUgcHJvY2VzcyBlbmRlZCBidXQgZm9yIHNvbWUgcmVhc29uIHdlIHdlcmUgbm90IGluZm9ybWVkXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHJhbmRvbSBpbnRlZ2VyLlxuICpcbiAqIEByZXR1cm4ge251bWJlcn0gQSByYW5kb20gaW50ZWdlciBudW1iZXIgaW4gcmFuZ2UgW2xvdywgaGlnaHQpLiBgbG93YGAgaXMgaW5jbHVzaXZlIGFuZCBgaGlnaGAgaXMgZXhjbHVzaXZlLlxuICovXG5mdW5jdGlvbiByYW5kb21JbnQgKGxvdywgaGlnaCkge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGhpZ2ggLSBsb3cpICsgbG93KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgV0RBIHVwZ3JhZGUgdGltZXN0YW1wXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJvb3RzdHJhcFBhdGggVGhlIGZ1bGwgcGF0aCB0byB0aGUgZm9sZGVyIHdoZXJlIFdEQSBzb3VyY2UgaXMgbG9jYXRlZFxuICogQHJldHVybiB7P251bWJlcn0gVGhlIFVOSVggdGltZXN0YW1wIG9mIHRoZSBjYXJ0aGFnZSByb290IGZvbGRlciwgd2hlcmUgZGVwZW5kZW5jaWVzIGFyZSBkb3dubG9hZGVkLlxuICogVGhpcyBmb2xkZXIgaXMgY3JlYXRlZCBvbmx5IG9uY2Ugb24gbW9kdWxlIHVwZ3JhZGUvZmlyc3QgaW5zdGFsbC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0V0RBVXBncmFkZVRpbWVzdGFtcCAoYm9vdHN0cmFwUGF0aCkge1xuICBjb25zdCBjYXJ0aGFnZVJvb3RQYXRoID0gcGF0aC5yZXNvbHZlKGJvb3RzdHJhcFBhdGgsIENBUlRIQUdFX1JPT1QpO1xuICBpZiAoYXdhaXQgZnMuZXhpc3RzKGNhcnRoYWdlUm9vdFBhdGgpKSB7XG4gICAgY29uc3Qge210aW1lfSA9IGF3YWl0IGZzLnN0YXQoY2FydGhhZ2VSb290UGF0aCk7XG4gICAgcmV0dXJuIG10aW1lLmdldFRpbWUoKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IHsgdXBkYXRlUHJvamVjdEZpbGUsIHJlc2V0UHJvamVjdEZpbGUsIGNoZWNrRm9yRGVwZW5kZW5jaWVzLFxuICAgICAgICAgc2V0UmVhbERldmljZVNlY3VyaXR5LCBmaXhGb3JYY29kZTcsIGZpeEZvclhjb2RlOSxcbiAgICAgICAgIGdlbmVyYXRlWGNvZGVDb25maWdGaWxlLCBzZXRYY3Rlc3RydW5GaWxlLCBraWxsUHJvY2VzcywgcmFuZG9tSW50LCBXREFfUlVOTkVSX0JVTkRMRV9JRCxcbiAgICAgICAgIGdldFdEQVVwZ3JhZGVUaW1lc3RhbXAgfTtcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
