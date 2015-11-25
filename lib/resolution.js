'use strict';

var conflict = require('./conflict');


exports.extract = function (result, cb) {
  var lines = result.trim().split('\n');
  if (lines.length < 2 ||
      !conflict.start.test(lines[0]) ||
      !conflict.end.test(lines[lines.length - 1])) {
    return cb(Error('Conflict markers not found.'));
  }
  cb(null, lines.slice(1, -1).join('\n'));
};
