'use strict';

var conflict = /^<<<<<<<(?: .*)?\n(?:(?:.|\n)*?\n)?=======\n(?:(?:.|\n)*?\n)?>>>>>>>(?: .*)?$/;
conflict.resolution = /^<<<<<<<(?: .*)?\n(?!=======\n)(?:(?:.|\n(?!=======\n))*?\n)?>>>>>>>(?: .*)?$/;
conflict.start = /^<<<<<<<(?: .*)?$/;
conflict.end = /^>>>>>>>(?: .*)?$/;

module.exports = conflict;
