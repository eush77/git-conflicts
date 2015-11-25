'use strict';

var conflict = require('./conflict');


exports.extract = function (body, cb) {
  body = body.replace(/\n*$/, '');
  if (!conflict.resolution.test(body)) {
    return cb(Error('Resolution format violation.'));
  }
  cb(null, body.replace(/^.*\n/, '').replace(/\n.*$/, ''));
};
