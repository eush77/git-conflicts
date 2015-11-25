'use strict';

module.exports = /^<<<<<<<( .*)?\n((.|\n)*?\n)?=======\n((.|\n)*?\n)?>>>>>>>( .*)?$/;
module.exports.start = /^<<<<<<<( .*)?$/;
module.exports.end = /^>>>>>>>( .*)?$/;
