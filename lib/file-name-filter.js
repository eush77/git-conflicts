'use strict';

var through = require('through2');

var path = require('path');


// Test if filename is matched by a pattern.
function isMatchedBy (filename, pattern) {
  var isDirectoryPattern = pattern.slice(-1) == path.sep;

  filename = path.normalize(filename).split(path.sep);
  pattern = path
    .normalize(pattern)
    .replace(RegExp(path.sep + '$'), '')
    .split(path.sep);

  return ((pattern.length < filename.length ||
           (pattern.length == filename.length && !isDirectoryPattern)) &&
          (filename
           .slice(0, pattern.length)
           .every(function (part, index) { return part == pattern[index] })));
}


module.exports = function fileNameFilter (patterns) {
  patterns = patterns || [];

  return through(function (chunk, enc, next) {
    if (patterns.some(isMatchedBy.bind(null, chunk.toString()))) {
      this.push(chunk);
    }
    next();
  });
};
