'use strict';

module.exports = /^<<<<<<< (.|\n)*?\n=======\n((.|\n)*?\n)?>>>>>>> .*$/;
module.exports.start = /^<<<<<<<(\s.*)?$/;
module.exports.end = /^>>>>>>>(\s.*)?$/;
