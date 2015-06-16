'use strict';


module.exports = function (string, pattern, replacer, cb) {
  var matches = [];
  var end = 0;

  string.replace(pattern, function (substring) {
    var offset = arguments[arguments.length - 2];
    matches.push(string.slice(end, offset), [].slice.call(arguments));
    end = offset + substring.length;
  });

  matches.push(string.slice(end));

  var loop = function loop(i) {
    if (matches.length <= i) {
      return cb(matches.join(''));
    }

    replacer.apply(null, [next].concat(matches[i]));

    function next(replacement) {
      matches[i] = replacement;
      loop(i + 2);
    }
  };

  process.nextTick(loop.bind(null, 1));
};
