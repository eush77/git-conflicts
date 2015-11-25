'use strict';

var resolution = require('../lib/resolution');

var test = require('tape'),
    afterAll = require('after-all'),
    groupBy = require('group-by');

var fs = require('fs'),
    path = require('path');


test('resolution', function (t) {
  var next = afterAll(t.end.bind(t, null));

  testCases('resolutions', function (files, message) {
    resolution(files.diff, next(function (err, resolved) {
      t.error(err);
      t.equal(resolved, files.out, message);
    }));
  });

  testCases('non-resolutions', function (files, message) {
    resolution(files.diff, next(function (err) {
      t.true(err, message);
    }));
  });
});


function testCases (directory, iterator) {
  directory = path.resolve(__dirname, 'data/resolution', directory);

  var tests = groupBy(fs.readdirSync(directory), function (basename) {
    return basename.slice(0, -path.extname(basename).length);
  });

  Object.keys(tests).forEach(function (testId) {
    var testName = testId.replace(/^\d+-/, '').replace(/-/g, ' ');

    var testFiles = tests[testId].reduce(function (testFiles, basename) {
      var testPath = path.join(directory, basename);
      var testCase = fs.readFileSync(testPath, 'utf8');
      testFiles[path.extname(basename).slice(1)] = testCase;
      return testFiles;
    }, {});

    iterator(testFiles, testName);
  });
}
