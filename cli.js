#!/usr/bin/env node
'use strict';

var help = require('help-version')(usage()).help,
    edit = require('string-editor'),
    byline = require('byline'),
    stringReplace = require('string-replace');

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


var conflictRegExp = /^<<<<<<< (.|\n)*?=======(.|\n)*?>>>>>>> .*$/gm,
    conflictStartRegExp = /^<<<<<<</,
    conflictEndRegExp = /^>>>>>>>/;


var extractResolutionBody = function (result, cb) {
  var lines = result.trim().split('\n');
  if (lines.length < 2 ||
      !conflictStartRegExp.test(lines[0]) ||
      !conflictEndRegExp.test(lines[lines.length - 1])) {
    return cb(Error('Could not parse resolution result. Header and footer lines not found.'));
  }
  cb(null, lines.slice(1, -1).join('\n'));
};


var resolveConflicts = function (filename, cb) {
  var diff = fs.readFileSync(filename, { encoding: 'utf8' });

  stringReplace(diff, conflictRegExp, replace, function (err, result) {
    if (err) return cb(err);
    fs.writeFileSync(filename, result);
    cb();
  });

  function replace(cb, conflict) {
    edit(conflict, function (err, result) {
      if (err) return cb(err);
      extractResolutionBody(result, cb);
    });
  }
};


var enqueue = (function () {
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
}());


(function (argv) {
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
