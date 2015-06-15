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


var resolveConflicts = function (filename) {
  var diff = fs.readFileSync(filename, { encoding: 'utf8' });

  stringReplace(diff, conflictRegExp, replace, function (result) {
    fs.writeFileSync(filename, result);
  });

  function replace(cb, conflict) {
    edit(conflict, function (err, result) {
      if (err) throw err;
      cb(result);
    });
  }
};


(function (argv) {
  argv.forEach(resolveConflicts);
}(process.argv.slice(2)));
