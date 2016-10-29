'use strict';

var conflictRegExp = require('./conflict'),
    debug = require('./debug'),
    getResolution = require('./resolution'),
    ResolutionError = require('./resolution-error');

var cloneRegExp = require('clone-regexp');

var fs = require('fs');


// Read the file and resolve the conflicts one by one.
//
// - `resolutionInfo` { Object } resolution process hooks, set by caller:
//
//   - `.resolve` { function(position, conflict, cb) }
//     function to resolve a single conflict in a file, calls `cb(err, result)`.
//
//     - `position` { filename: String, conflictNumber: Number } position info.
//
//   - `.onResolutionError` { function(position, conflict, err, cb) }
//     function to take action when a resolution does not apply, calls
//     `cb(err, result, retry)`.
//
//     - `position` { filename: String, conflictNumber: Number } position info.
//
module.exports = function resolveFile (resolutionInfo, filename, cb) {
  var diff = fs.readFileSync(filename, { encoding: 'utf8' });
  var regexp = cloneRegExp(conflictRegExp, { multiline: true });
  var position = { filename: filename, conflictNumber: 0 };

  var resolveOne = resolutionInfo.resolve;
  var onResolutionError = resolutionInfo.onResolutionError;

  debug('resolving conflicts: ' + filename);

  (function resolve (diff, merged, conflictNumber) {
    var match = diff.match(regexp);
    if (!match) return cb();

    var conflict = match[0];
    position.conflictNumber = conflictNumber;

    debug('next conflict: ' + JSON.stringify(position));

    resolveOne(position, conflict, function (err, result) {
      if (err) return cb(err);

      getResolution(result, function (err, result) {
        return (err instanceof ResolutionError)
          ? onResolutionError(position, conflict, err, resolveNext)
          : resolveNext(err, result);
      });
    });

    function resolveNext (err, result, retry) {
      if (err) return cb(err);

      if (retry) {
        return resolve(diff, merged, conflictNumber);
      }

      merged += diff.slice(0, match.index) + result;
      diff = diff.slice(match.index + match[0].length);

      fs.writeFileSync(filename, merged + diff);
      resolve(diff, merged, conflictNumber + 1);
    }
  }(diff, '', 1));
};
