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
    through = require('through2');

var execSync = require('child_process').execSync;


function usage() {
  return [
    'Usage: git conflicts',
    '       git conflicts .',
    '       git conflicts [filename]...',
    '',
    'Run conflict resolution, optionally filtering each unmerged path',
    'to match one of the file or directory names passed as arguments.',
    'With no arguments, search in the root Git directory.',
    'With arguments, search in the current working directory.'
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


(function main () {
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

  unmergedFileNameStream()
    .on('error', error)
    .pipe(through(function (chunk, enc, next) {
      var filename = chunk.toString();

      resolveFile(filename, function (err) {
        if (err) return error(err);
        next();
      });
    }));
}());


// Create stream of unmerged file names.
//
// Handle command-line arguments: if patterns are supplied on the command
// line, search for unmerged files in the current working directory and
// filter each one by these patterns. Otherwise, search in the root directory.
function unmergedFileNameStream () {
  if (process.argv.length > 2) {
    return gitUnmergedFiles().pipe(fileNameFilter(process.argv.slice(2)));
  }
  else {
    try {
      var workdir = gitRootDirectory();
    }
    catch (err) {
      var result = through();

      process.nextTick(result.emit.bind(result, 'error', err));
      return result;
    }

    if (workdir != process.cwd()) {
      debug('chdir: ' + workdir);
    }

    process.chdir(workdir);

    return gitUnmergedFiles();
  }
}


function gitRootDirectory () {
  var cmd = 'git rev-parse --show-toplevel';

  debug('running `' + cmd + '`');
  return execSync(cmd, { stdio: 'pipe' }).toString().trim();
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
