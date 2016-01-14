'use strict';

var basename = require('../lib/basename');

var test = require('tape');


test('basename', function (t) {
  var check = function (/* [basename args]..., regexp */) {
    var args = [].slice.call(arguments);
    var regexp = args.pop();
    var name = basename.apply(null, args);
    t.ok(regexp.test(name), name);
  };

  check(/^[0-9a-z]+\.diff$/);
  check('filename', /^[0-9a-z]+-filename\.diff$/);
  check('file-name.js', /^[0-9a-z]+-file-name-js\.diff$/);
  check('file-name.min.js', /^[0-9a-z]+-file-name-min-js\.diff$/);
  check('filename.js', 1, /^[0-9a-z]+-filename-js-1\.diff$/);
  t.end();
});
