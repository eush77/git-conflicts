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


test('conflict', function (t) {
  testDir('conflicts', true);
  testDir('non-conflicts', false);
  t.end();

  function testDir (directory, verdict) {
    directory = path.resolve(__dirname, directory);
    fs.readdirSync(directory).forEach(function (basename) {
      var testPath = path.relative(process.cwd(), path.join(directory, basename));
      var testCase = fs.readFileSync(testPath, 'utf8').replace(/\n$/, '');
      t.equal(conflict.test(testCase), verdict, testPath);
    });
  }
});
