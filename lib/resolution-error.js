'use strict';


module.exports = ResolutionError;

function ResolutionError () {
  if (!(this instanceof ResolutionError)) {
    return new ResolutionError;
  }

  this.name = 'ResolutionError';
  this.message = 'Resolution format violation';
  this.stack = Error().stack;
}

ResolutionError.prototype = Object.create(Error.prototype);
