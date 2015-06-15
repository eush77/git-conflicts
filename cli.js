#!/usr/bin/env node
'use strict';

var help = require('help-version')(usage()).help,
    edit = require('string-editor');

var fs = require('fs');


function usage() {
  return 'Usage:  git conflicts [file]...';
}


(function (argv) {
  var diff = fs.readFileSync(argv[0], { encoding: 'utf8' });
  var re = /^<<<<<<< (.|\n)*?=======(.|\n)*?>>>>>>> .*$/gm;
  var output = [];
  var match;
  var end = 0;
  var jobs = [];
  while (match = re.exec(diff)) {
    var conflict = match[0];
    output.push(diff.slice(end, match.index));
    jobs.push({
      index: output.length,
      data: conflict
    });
    output.push(null);
    end = match.index + conflict.length;
  }
  (function resolve() {
    if (!jobs.length) {
      output.push(diff.slice(end));
      process.stdout.write(output.join(''));
      //fs.writeFileSync('res', output.join(''));
      return;
    }

    var job = jobs.shift();

    edit(job.data, function (err, resolution) {
      if (err) throw err;
      if (output[job.index] !== null) throw Error('wtf');
      output[job.index] = resolution;
      resolve();
    });
  }());
}(process.argv.slice(2)));
