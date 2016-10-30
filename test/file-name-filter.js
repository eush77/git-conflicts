'use strict';

var fileNameFilter = require('../lib/file-name-filter');

var test = require('tape'),
    toArray = require('stream-to-array'),
    toStream = require('array-to-stream');


test('file-name-filter', function (t) {
  var files = ['foo', 'bar', 'foobar', 'sub/foo', 'sub/bar', 'sub/foobar'];

  var filter = function (patterns, result) {
    toArray(toStream(files).pipe(fileNameFilter(patterns)))
      .then(function (filtered) {
        t.deepEqual(filtered.map(String), result,
                    'filtered by ' + JSON.stringify(patterns));
      });
  };

  t.plan(9);
  filter(null, []);
  filter([], []);
  filter(['foo'], ['foo']);
  filter(['foo', 'baz', 'foobar'], ['foo', 'foobar']);
  filter(['foo/', 'foobar'], ['foobar']);
  filter(['sub'], ['sub/foo', 'sub/bar', 'sub/foobar']);
  filter(['sub/'], ['sub/foo', 'sub/bar', 'sub/foobar']);
  filter(['sub/foo', 'sub/bar/'], ['sub/foo']);
  filter(['sub/foo', 'sub'], ['sub/foo', 'sub/bar', 'sub/foobar']);
});
