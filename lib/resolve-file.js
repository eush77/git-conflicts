'use strict';

var conflictRegExp = require('./conflict'),
    getResolution = require('./resolution'),
    ResolutionError = require('./resolution-error');

var cloneRegExp = require('clone-regexp');

var fs = require('fs');


// Read the file and resolve the conflicts one by one.
//
// - `resolutionInfo` { Object } resolution process hooks, set by caller:
//
//   - `.resolve` { function(filename, conflict, cb) }
//     function to resolve a single conflict in a file, calls `cb(err, result)`.
//
//   - `.onResolutionError` { function(filename, conflict, err, cb) }
//     function to take action when a resolution does not apply, calls
//     `cb(err, result, retry)`.
//
module.exports = function resolveFile (resolutionInfo, filename, cb) {
  var diff = fs.readFileSync(filename, { encoding: 'utf8' });
  var regexp = cloneRegExp(conflictRegExp, { multiline: true });

  var resolveOne = resolutionInfo.resolve;
  var onResolutionError = resolutionInfo.onResolutionError;

  (function resolve (diff, merged) {
    var match = diff.match(regexp);
    if (!match) return cb();

    var conflict = match[0];

    resolveOne(filename, conflict, function (err, result) {
      if (err) return cb(err);

      getResolution(result, function (err, result) {
        return (err instanceof ResolutionError)
          ? onResolutionError(filename, conflict, err, resolveNext)
          : resolveNext(err, result);
      });
    });

    function resolveNext (err, result, retry) {
      if (err) return cb(err);

      if (retry) {
        return resolve(diff, merged);
      }

      merged += diff.slice(0, match.index) + result;
      diff = diff.slice(match.index + match[0].length);

      fs.writeFileSync(filename, merged + diff);
      resolve(diff, merged);
    }
  }(diff, ''));
};
