#!/usr/bin/env node
'use strict';

var conflictRegExp = require('./lib/conflict'),
    resolution = require('./lib/resolution'),
    ResolutionError = require('./lib/resolution-error');

var help = require('help-version')(usage()).help,
    edit = require('string-editor'),
    byline = require('byline'),
    cloneRegExp = require('clone-regexp'),
    prompt = require('inquirer').prompt,
    chalk = require('chalk');

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
        error(Error('Git terminated abruptly'));
      }
    });
  }
}(process.argv.slice(2)));


// Handle error.
function error (err) {
  console.error(chalk.red(err.name) + ': ' + err.message);
  process.exit(1);
}


// Create new queue for conflicted filenames.
// Calls `resolveConflicts` in sequence on these files.
function newQueue () {
  var queue = [];

  var check = function () {
    if (queue.length) {
      resolveConflicts(queue[0], function (err) {
        if (err) return error(err);
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


// Read the file and resolve the conflicts one by one.
function resolveConflicts (filename, cb) {
  var diff = fs.readFileSync(filename, { encoding: 'utf8' });
  var regexp = cloneRegExp(conflictRegExp, { multiline: true });

  (function resolve (diff, merged) {
    var match = diff.match(regexp);
    if (!match) return cb();

    resolveOne(match[0], function (err, result, retry) {
      if (err) return cb(err);

      if (retry) {
        return resolve(diff, merged);
      }

      merged += diff.slice(0, match.index) + result;
      diff = diff.slice(match.index + match[0].length);

      fs.writeFileSync(filename, merged + diff);
      resolve(diff, merged);
    });
  }(diff, ''));

  function resolveOne (conflict, cb) {
    var tempFileName = Date.now() + '.diff';
    edit(prepareConflictForEditing(filename, conflict), tempFileName,
         function (err, result) {
           if (err) return cb(err);

           resolution(result, function (err, result) {
             return (err instanceof ResolutionError)
               ? onResolutionError(filename, conflict, err, cb)
               : cb(err, result);
           });
         });
  }
}


// Add some comments explaining to user how to proceed with the conflict.
function prepareConflictForEditing (filename, conflict) {
  return conflict + [
    '\n\n',
    '# Conflict in `' + filename + '`.\n',
    '#\n',
    '# Resolve this conflict by changing lines between conflict markers\n',
    '# (`<<<<<<<` and `>>>>>>>`) to the final unified version.\n',
    '#\n',
    '# Empty lines and lines starting with \'#\' will be ignored, unless\n',
    '# they are between conflict markers.\n'
  ].join('');
}


// Ask the user whether we should skip the conflict or abort.
function onResolutionError (filename, conflict, err, cb) {
  prompt({
    type: 'expand',
    name: 'answer',
    message: 'Resolution on `' + filename + '` does not apply',
    choices: [
      { name: 'retry', key: 'r' },
      { name: 'skip', key: 's' },
      { name: 'quit', key: 'q' }
    ]
  }, function (a) {
    switch (a.answer) {
      case 'retry':
        return cb(null, conflict, true);

      case 'skip':
        return cb(null, conflict);

      case 'quit':
        return cb(err);

      default: throw Error('unreachable');
    }
  });
}
