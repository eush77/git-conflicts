#!/usr/bin/env node
'use strict';

var conflictRegExp = require('./lib/conflict'),
    resolution = require('./lib/resolution');

var help = require('help-version')(usage()).help,
    edit = require('string-editor'),
    byline = require('byline'),
    stringReplace = require('string-replace'),
    cloneRegExp = require('clone-regexp');

var fs = require('fs'),
    spawn = require('child_process').spawn;


function usage() {
  return [
    'Usage:  git conflicts [file]...',
    '',
    'Run conflict resolution for each file in order.',
    'With no arguments, run conflict resolution for each unmerged path.'
  ].join('\n');
}


(function main (argv) {
  var enqueue = newQueue();

  if (argv.length) {
    argv.forEach(enqueue);
  }
  else {
    var git = spawn('git', ['ls-files', '--unmerged'], {
      stdio: ['ignore', 'pipe', process.stderr]
    });

    var resolved = Object.create(null);

    git.stdout
      .pipe(byline())
      .on('data', function (line) {
        var filename = line.toString().split(/\s+/)[3];
        if (resolved[filename]) {
          return;
        }

        resolved[filename] = true;
        enqueue(filename);
      });

    git.on('exit', function (code, signal) {
      if (code !== 0) {
        throw Error('git terminated with error');
      }
    });
  }
}(process.argv.slice(2)));


function newQueue () {
  var queue = [];

  var check = function () {
    if (queue.length) {
      resolveConflicts(queue[0], function (err) {
        if (err) throw err;
        queue.shift();
        check();
      });
    }
  };

  return function (entry) {
    queue.push(entry);
    if (queue.length == 1) {
      check();
    }
  };
}


function resolveConflicts (filename, cb) {
  var diff = fs.readFileSync(filename, { encoding: 'utf8' });
  var conflictsRegExp = cloneRegExp(conflictRegExp,
                                    { global: true, multiline: true });
  stringReplace(diff, conflictsRegExp, replace, function (err, result) {
    if (err) return cb(err);
    fs.writeFileSync(filename, result);
    cb();
  });

  function replace (cb, conflict) {
    var tempFileName = Date.now() + '.diff';
    edit(prepareConflictForEditing(conflict), tempFileName, function (err, result) {
      if (err) return cb(err);
      resolution(result, cb);
    });
  }
}


function prepareConflictForEditing (conflict) {
  return conflict + [
    '\n\n',
    '# Resolve the conflict by changing lines between conflict markers\n',
    '# (`<<<<<<<` and `>>>>>>>`) to the final unified version.\n',
    '#\n',
    '# Empty lines and lines starting with \'#\' will be ignored, unless\n',
    '# they are between conflict markers.\n'
  ].join('');
}
