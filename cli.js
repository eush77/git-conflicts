#!/usr/bin/env node
'use strict';

var resolveFile = require('./lib/resolve-file');

var help = require('help-version')(usage()).help,
    byline = require('byline'),
    Queue = require('push-queue'),
    sliceArgs = require('impartial'),
    chalk = require('chalk'),
    debug = require('debug')('git-conflicts'),
    edit = require('string-editor'),
    hat = require('hat'),
    prompt = require('inquirer').prompt;

var spawn = require('child_process').spawn;


function usage() {
  return [
    'Usage:  git conflicts [file]...',
    '',
    'Run conflict resolution for each file in order.',
    'With no arguments, run conflict resolution for each unmerged path.'
  ].join('\n');
}


// Handle error.
function error (err) {
  if (debug.enabled) {
    throw err;
  }

  console.error(chalk.red(err.name) + ': ' + err.message);
  process.exit(1);
}


(function main (argv) {
  // Set up resolution callbacks.
  resolveFile = resolveFile.bind(null, {
    resolve: function (filename, conflict, cb) {
      edit(prepareConflictForEditing(filename, conflict),
           hat() + '.diff', cb);
    },
    onResolutionError: onResolutionError
  });

  // Create resolution queue.
  var enqueue = Queue(function (filename, cb) {
    resolveFile(filename, function (err) {
      if (err) return error(err);
      cb();
    });
  });

  if (argv.length) {
    // Get list of files from the command line.
    argv.forEach(sliceArgs(enqueue, 0, 1));
  }
  else {
    // Get list of files from Git.
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
        return process.exit();

      default: throw Error('unreachable');
    }
  });
}
