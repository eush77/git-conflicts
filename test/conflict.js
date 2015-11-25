'use strict';

var conflict = require('../lib/conflict');

var test = require('tape');

var fs = require('fs'),
    path = require('path');


test('conflict markers', function (t) {
  testMarker(conflict.start, '<', true, [
    '>>>>>>>',
    '>>>>>>> HEAD',
    '>>>>>>> 123 whatever',
  ]);

  testMarker(conflict.start, '<', false, [
    '>>> 123',
    '>>>>>>>HEAD',
    '  >>>>>>>',
  ]);

  testMarker(conflict.end, '>', true, [
    '>>>>>>>',
    '>>>>>>> HEAD',
    '>>>>>>> 123 whatever',
  ]);

  testMarker(conflict.end, '>', false, [
    '>>> 123',
    '>>>>>>>HEAD',
    '  >>>>>>>',
  ]);

  t.end();

  function testMarker (re, marker, verdict, testCases) {
    testCases.forEach(function (testCase) {
      testCase = testCase.replace(/>/g, marker);
      t[verdict](re.test(testCase), JSON.stringify(testCase));
    });
  }
});


test('conflicts', function (t) {
  var testDir = makeDirTester(t, conflict);
  testDir('conflicts', true);
  testDir('non-conflicts', false);
  t.end();
});


test('resolutions', function (t) {
  var testDir = makeDirTester(t, conflict.resolution);
  testDir('resolutions', true);
  testDir('non-resolutions', false);
  t.end();
});


function makeDirTester (t, regexp) {
  return function testDir (directory, verdict) {
    directory = path.resolve(__dirname, 'data/conflict', directory);
    fs.readdirSync(directory).forEach(function (basename) {
      var testPath = path.relative(process.cwd(), path.join(directory, basename));
      var testCase = fs.readFileSync(testPath, 'utf8').replace(/\n$/, '');
      t.equal(regexp.test(testCase), verdict, testPath);
    });
  };
}
