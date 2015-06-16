#!/usr/bin/env node
'use strict';

var stringReplace = require('./lib/string-replace');

var help = require('help-version')(usage()).help,
    edit = require('string-editor'),
    split = require('transform-split');

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


var conflictRegExp = /^<<<<<<< (.|\n)*?=======(.|\n)*?>>>>>>> .*$/gm;


var resolveConflicts = function (filename, cb) {
  var diff = fs.readFileSync(filename, { encoding: 'utf8' });

  stringReplace(diff, conflictRegExp, replace, function (result) {
    fs.writeFileSync(filename, result);
    cb();
  });

  function replace(cb, conflict) {
    edit(conflict, function (err, result) {
      if (err) throw err;
      cb(result);
    });
  }
};


var enqueue = (function () {
  var queue = [];

  var check = function () {
    if (queue.length) {
      resolveConflicts(queue[0], function () {
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

    git.stdout
      .pipe(split())
      .on('data', function (chunk) {
        var filename = chunk.toString().split(/\s+/)[3];
        enqueue(filename);
      });

    git.on('exit', function (code, signal) {
      if (code !== 0) {
        throw Error('git terminated with error');
      }
    });
  }
}(process.argv.slice(2)));
