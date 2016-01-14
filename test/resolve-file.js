'use strict';

var resolveFile = require('../lib/resolve-file'),
    ResolutionError = require('../lib/resolution-error');

var test = require('tape'),
    hat = require('hat');

var fs = require('fs'),
    path = require('path'),
    os = require('os');


test('resolve-file', function (t) {
  var firstDiff = read(0);
  var conflicts = [
    readConflict(1),
    readConflict(2),
    readConflict(3)
  ];
  var lastDiff = read(4);

  var conflictNumber = 0;
  var workingFile = tempPath();
  fs.writeFileSync(workingFile, firstDiff);

  var resolutionInfo = {
    resolve: function (position, conflict, cb) {
      var c = conflicts[conflictNumber++];
      t.true(c);

      t.equal(position.filename, workingFile, 'filename');
      t.equal(position.conflictNumber, conflictNumber, 'conflictNumber');
      t.equal(conflict, c.conflict, 'conflict');
      cb(null, c.resolution);
    },
    onResolutionError: function (position, conflict, err, cb) {
      t.fail(err.message);
    }
  };

  resolveFile(resolutionInfo, workingFile, function (err) {
    t.ifErr(err);

    var merged = fs.readFileSync(workingFile, 'utf8');
    t.equal(merged, lastDiff, 'merged state');
    t.end();

    fs.unlinkSync(workingFile);
  });
});


test('resolve-file interactive', function (t) {
  var firstDiff = read(0);
  var conflicts = [
    readConflict(1),
    readConflict(2)
  ];
  var lastDiff = read(2);

  var lastConflict;
  var error;
  var conflictNumber = 0;
  var workingFile = tempPath();
  fs.writeFileSync(workingFile, firstDiff);

  var resolutionInfo = {
    resolve: function (position, conflict, cb) {
      var c = conflicts[conflictNumber++];

      t.true(c);
      t.equal(position.filename, workingFile, 'resolve - filename');
      t.equal(position.conflictNumber, conflictNumber, 'resolve - conflictNumber');
      t.equal(conflict, c.conflict, 'resolve - conflict');

      if (conflictNumber < conflicts.length) {
        cb(null, c.resolution);
      }
      else if (!lastConflict) {
        // Last conflict - trigger ResolutionError.
        lastConflict = c.conflict;
        cb(null, conflict);
      }
      else {
        // Last conflict - trigger ResolutionError (retry).
        t.equal(conflictNumber, conflicts.length, 'no more conflicts');
        cb(null, conflict);
      }
    },
    onResolutionError: function (position, conflict, err, cb) {
      t.equal(position.filename, workingFile, 'onResolutionError - filename');
      t.equal(position.conflictNumber, conflictNumber--,
              'onResolutionError - conflictNumber');
      t.equal(conflict, lastConflict, 'onResolutionError - conflict');
      t.ok(err instanceof ResolutionError, 'onResolutionError - err');

      if (!error) {
        // Retry once.
        error = Error();
        cb(null, conflict, true);
      }
      else {
        // Then abort.
        cb(error);
      }
    }
  };

  resolveFile(resolutionInfo, workingFile, function (err) {
    t.true(err);
    t.equal(err, error, 'resulting error');

    var merged = fs.readFileSync(workingFile, 'utf8');
    t.equal(merged, lastDiff, 'first fix committed');
    t.end();

    fs.unlinkSync(workingFile);
  });
});


test('resolve-file error', function (t) {
  var firstDiff = read(0);
  var conflicts = [
    readConflict(1),
    readConflict(2)
  ];
  var lastDiff = read(2);

  var error;
  var conflictNumber = 0;
  var workingFile = tempPath();
  fs.writeFileSync(workingFile, firstDiff);

  var resolutionInfo = {
    resolve: function (position, conflict, cb) {
      var c = conflicts[conflictNumber++];

      t.true(c);
      t.equal(position.filename, workingFile, 'resolve - filename');
      t.equal(position.conflictNumber, conflictNumber,
              'resolve - conflictNumber');
      t.equal(conflict, c.conflict, 'resolve - conflict');

      if (conflictNumber < conflicts.length) {
        cb(null, c.resolution);
      }
      else {
        // Last conflict - throw error.
        cb(error = Error());
      }
    },
    onResolutionError: function (position, conflict, err, cb) {
      t.fail(err.message);
    }
  };

  resolveFile(resolutionInfo, workingFile, function (err) {
    t.true(err);
    t.equal(err, error, 'resulting error');

    var merged = fs.readFileSync(workingFile, 'utf8');
    t.equal(merged, lastDiff, 'first fix committed');
    t.end();

    fs.unlinkSync(workingFile);
  });
});


function readConflict (name) {
  return {
    conflict: read(name + '-conflict').trim(),
    resolution: read(name + '-resolution').trim()
  };
}


function read (name) {
  var filepath = path.resolve(__dirname, 'data/resolve-file', name + '.diff');
  return fs.readFileSync(filepath, 'utf8');
}


function tempPath () {
  return path.join(os.tmpdir(), hat() + '.diff');
}
