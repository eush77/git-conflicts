'use strict';

var resolution = require('../lib/resolution');

var test = require('tape'),
    afterAll = require('after-all');


test('resolution', function (t) {
  var next = afterAll(t.end.bind(t, null));

  resolution.extract([
    '<<<<<<< 2b0b56a7b74d4f5a0a7ef042c34eb27981ab9859\n',
    'Final version.\n',
    'All conflicts fixed.\n',
    '>>>>>>> Refactor'
  ].join(''), next(function (err, data) {
    t.error(err);
    t.equal(data, 'Final version.\nAll conflicts fixed.',
            'successful resolution');
  }));

  resolution.extract([
    '<<<<<<< 2b0b56a7b74d4f5a0a7ef042c34eb27981ab9859\n',
    'Can optionally be newline-terminated.\n',
    '>>>>>>> Refactor\n'
  ].join(''), next(function (err, data) {
    t.error(err);
    t.equal(data, 'Can optionally be newline-terminated.',
            'trailing newline');
  }));

  resolution.extract([
    'Conflicts markers are required.\n'
  ].join(''), next(function (err) {
    t.true(err, 'no conflict markers');
  }));

  resolution.extract([
    '<<<<<<< HEAD\n',
    'Both markers, actually.\n'
  ].join(''), next(function (err) {
    t.true(err, 'no conflict markers');
  }));

  resolution.extract([
    '<<<<<<< 2b0b56a7b74d4f5a0a7ef042c34eb27981ab9859\n',
    'Version before.\n',
    '=======\n',
    'Version after.\n',
    '>>>>>>> Refactor\n'
  ].join(''), next(function (err) {
    t.true(err, 'unresolved conflict');
  }));
});
