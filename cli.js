#!/usr/bin/env node
'use strict';

var basename = require('./lib/basename'),
    debug = require('./lib/debug'),
    fileNameFilter = require('./lib/file-name-filter'),
    gitUnmergedFiles = require('./lib/git-unmerged-files'),
    resolveFile = require('./lib/resolve-file');

var chalk = require('chalk'),
    edit = require('string-editor'),
    help = require('help-version')(usage()).help,
    prompt = require('inquirer').prompt,
    Queue = require('push-queue');


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
    resolve: function (position, conflict, cb) {
        edit(prepareConflictForEditing(position.filename, conflict), {
          filename: basename(position.filename, position.conflictNumber),
          editor: process.env.GIT_EDITOR
        }, cb);
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

  var fileNameStream = gitUnmergedFiles().on('error', error);

  // Filter file names by patterns supplied in the command line.
  if (argv.length) {
    fileNameStream = fileNameStream.pipe(fileNameFilter(argv));
  }

  fileNameStream.on('data', function (filename) {
    enqueue(filename.toString());
  });
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
function onResolutionError (position, conflict, err, cb) {
  prompt({
    type: 'expand',
    name: 'answer',
    message: 'Resolution on `' + position.filename + '` does not apply',
    choices: [
      { name: 'retry', key: 'r' },
      { name: 'skip', key: 's' },
      { name: 'quit', key: 'q' }
    ]
  }).then(function (a) {
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
