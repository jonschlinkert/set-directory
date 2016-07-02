'use strict';

require('mocha');
var assert = require('assert');
var setDirectory = require('./');

describe('set-directory', function() {
  it('should export a function', function() {
    assert.equal(typeof setDirectory, 'function');
  });

  it('should export an object', function() {
    assert(setDirectory);
    assert.equal(typeof setDirectory, 'object');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      setDirectory();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a string');
      assert.equal(err.message, 'expected a callback function');
      cb();
    }
  });
});
