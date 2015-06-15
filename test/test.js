'use strict';

var stringReplace = require('../lib/string-replace');

var test = require('tape');


var spinner = (function () {
  var states = '/-\\|';
  return function (state) {
    var i = states.indexOf(state);
    var di = 1;
    return function (cb, m) {
      if (/[^ ]/.test(m)) {
        di = -di;
      }
      var char = states[(i + states.length) % states.length];
      i += di;
      cb(char);
    };
  };
}());


test('global replace', function (t) {
  stringReplace('....  ... ...   ...  ..', /\s+/g, spinner('/'), function (result) {
    t.equal(result, '..../...-...\\...|..');
    t.end();
  });
});


test('non-global replace', function (t) {
  stringReplace('....  ... ...  ....', ' ', spinner('|'), function (result) {
    t.equal(result, '....| ... ...  ....');
    t.end();
  });
});


test('groups', function (t) {
  stringReplace('. . .\t. .\t. . . .', /\s/g, spinner('/'), function (result) {
    t.equal(result, './.-.\\.-./.-.\\.|.');
    t.end();
  });
});
