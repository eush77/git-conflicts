'use strict';


// Generate randomized basename.
//
// - [filename] optional filename.
// - [conflictNumber] optional conflictNumber.
//
module.exports = function (filename, conflictNumber) {
  return [
    Math.random().toString(36).slice(2),
    filename && filename.replace(/\./g, '-'),
    conflictNumber
  ].filter(Boolean).join('-') + '.diff';
};
