#!/usr/bin/env node
'use strict';

var stringReplace = require('./lib/string-replace');

var help = require('help-version')(usage()).help,
    edit = require('string-editor');

var fs = require('fs');


function usage() {
  return 'Usage:  git conflicts [file]...';
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
  argv.forEach(enqueue);
}(process.argv.slice(2)));
