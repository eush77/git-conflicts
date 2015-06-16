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


test('next-tick business', function (t) {
  var count = 0;

  stringReplace(' ', /\s/g, inc, function () {
    t.equal(count, 1);
    t.end();
  });

  t.equal(count, 0);

  function inc(cb) {
    count += 1;
    cb();
  }
});


test('sequence rule', function (t) {
  var count = 0;

  stringReplace('. . . .', /\s/g, next, function (result) {
    t.equal(count, 3, 3);
    t.end();
  });

  function next(cb) {
    var state = count;
    process.nextTick(function () {
      t.equal(count, state, String(state));
      setImmediate(function () {
        t.equal(count, state, (state * 3 + 1) + '/3');
        setTimeout(function () {
          t.equal(count, state, (state * 3 + 2) + '/3');
          count += 1;
          cb();
        }, 0x20);
      });
    });
  }
});
