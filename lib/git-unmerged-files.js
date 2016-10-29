'use strict';

var debug = require('./debug');

var byline = require('byline'),
    through = require('through2');

var exec = require('child_process').exec;


// Get stream of unmerged files from Git.
module.exports = function gitUnmergedFiles () {
  var cmd = 'git ls-files --unmerged';
  var resolved = Object.create(null);

  debug('running `' + cmd + '`');

  var git = exec(cmd, {
    stdio: ['ignore', 'pipe', process.stderr]
  });

  var result = git.stdout
        .pipe(byline())
        .pipe(through(function (chunk, enc, next) {
          var line = chunk.toString();
          debug(line);

          var filename = line.split(/\s+/)[3];

          // Don't emit the same file multiple times.
          if (!resolved[filename]) {
            resolved[filename] = true;
            debug('unmerged file: ' + filename);
            this.push(filename);
          }

          next();
        }));

  git.on('exit', function (code, signal) {
    if (code !== 0) {
      var message = 'Git terminated abruptly (code=' + code + ')';
      result.emit('error', Error(message));
    }
  });

  return result;
};
