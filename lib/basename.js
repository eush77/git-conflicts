'use strict';

var toSlugCase = require('to-slug-case');


// Generate randomized basename.
//
// - [filename] optional filename.
// - [conflictNumber] optional conflictNumber.
//
module.exports = function (filename, conflictNumber) {
  return [
    Math.random().toString(36).slice(2),
    filename && toSlugCase(filename),
    conflictNumber
  ].filter(Boolean).join('-') + '.diff';
};
