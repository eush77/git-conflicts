'use strict';

module.exports = /^<<<<<<< (.|\n)*?=======(.|\n)*?>>>>>>> .*$/gm;
module.exports.start = /^<<<<<<</;
module.exports.end = /^>>>>>>>/;
