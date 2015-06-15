#!/usr/bin/env node
'use strict';

var stringReplace = require('./lib/string-replace');

var help = require('help-version')(usage()).help,
    edit = require('string-editor');

var fs = require('fs');


function usage() {
  return 'Usage:  git conflicts [file]...';
}


(function (argv) {
  var diff = fs.readFileSync(argv[0], { encoding: 'utf8' });
  var re = /^<<<<<<< (.|\n)*?=======(.|\n)*?>>>>>>> .*$/gm;

  stringReplace(diff, re, replace, function (result) {
    process.stdout.write(result);
  });

  function replace(cb, conflict) {
    edit(conflict, function (err, result) {
      if (err) throw err;
      cb(result);
    });
  }
}(process.argv.slice(2)));
