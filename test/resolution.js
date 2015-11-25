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
    '# Comments are meant to be used by us, to embed some help on how\n',
    '# to use the tool in the tool\'s control document. At the moment of\n',
    '# writing, we just dump one conflict after another and shell out\n',
    '# to user\'s editor, and all user is expected to know he or she is\n',
    '# expected to do.\n',
    '\n',
    '# We could devise some special syntax just for that, such as YAML\n',
    '# frontmatter or some other type of header, but it is better and\n',
    '# simpler to design a general purpose mechanism instead.\n',
    '# Orthogonality law, applied.\n',
    '\n',
    '# This also follows the Rule of Least Surprise, because Git and other\n',
    '# tools do something like that, too.\n',
    '\n',
    '<<<<<<< 2b0b56a7b74d4f5a0a7ef042c34eb27981ab9859\n',
    'Resolved.\n',
    '# This is not a comment, but rather part of the diff.\n',
    '# Host languages have comments, too!\n',
    '>>>>>>> Refactor\n',
    '\n',
    '# Nice!\n'
  ].join(''), next(function (err, data) {
    t.error(err);
    t.equal(data, [
      'Resolved.',
      '# This is not a comment, but rather part of the diff.',
      '# Host languages have comments, too!'
    ].join('\n'), 'comments');
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
