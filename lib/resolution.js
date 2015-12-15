'use strict';

var conflict = require('./conflict'),
    ResolutionError = require('./resolution-error');


module.exports = function resolution (body, cb) {
  var mode = 'top';

  var lines = body.split('\n').filter(function (line) {
    switch (mode) {
      case 'top':
        if (/^\s*$/.test(line) || /^#/.test(line)) {
          return false;
        }
        else if (conflict.start.test(line)) {
          mode = 'raw';
          return true;
        }
        else {
          cb(Error('Unexpected line: ' + JSON.stringify(line)));
          mode = 'error';
          return;
        }

      case 'raw':
        if (conflict.end.test(line)) {
          mode = 'top';
        }
        return true;

      case 'error':
        return;

      default: throw Error('unreachable');
    }
  });
  if (mode == 'error') {
    return;
  }

  if (!conflict.resolution.test(lines.join('\n'))) {
    return cb(ResolutionError());
  }

  cb(null, lines.slice(1, -1).join('\n'));
};
