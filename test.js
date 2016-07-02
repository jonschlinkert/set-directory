'use strict';

require('mocha');
var os = require('os');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var mkdirp = require('mkdirp');
var del = require('delete');
var setDirectory = require('./');

function writeFile(fp, contents, cb) {
  mkdirp(path.dirname(fp), function(err) {
    if (err) return cb(err);
    fs.writeFile(fp, contents, cb);
  });
}

describe('set-directory', function() {
  describe('lib', function() {
    it('should export a function', function() {
      assert.equal(typeof setDirectory, 'function');
    });

    it('should throw an error when invalid args are passed', function(cb) {
      try {
        setDirectory();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected directory to be a string');
        cb();
      }
    });

    it('should return an object', function() {
      var paths = setDirectory('.');
      assert(paths);
      assert.equal(typeof paths, 'object');
    });
  });

  describe('.dir', function() {
    it('should expose a dir property', function() {
      var paths = setDirectory('foo');
      assert(paths.hasOwnProperty('dir'));
    });

    it('should set the value as the given directory', function() {
      var paths = setDirectory('foo');
      assert.equal(paths.dir, path.resolve(process.cwd(), 'foo'));
    });
  });

  describe('.base', function() {
    it('should expose a base function', function() {
      var paths = setDirectory('foo');
      assert.equal(typeof paths.base, 'function');
    });

    it('should resolve a path relative to the given cwd', function() {
      var paths = setDirectory('foo');
      var base = paths.base('bar');
      assert.equal(base, path.resolve(process.cwd(), 'foo/bar'));
    });
  });

  describe('.home', function() {
    it('should expose a home function', function() {
      var paths = setDirectory('foo');
      assert.equal(typeof paths.home, 'function');
    });

    it('should return user home', function() {
      var paths = setDirectory('foo');
      var home = paths.home();
      assert.equal(home, os.homedir());
    });

    it('should calculate a path relative to user home', function() {
      var paths = setDirectory('foo');
      var home = paths.home('bar');
      assert.equal(home, path.resolve(os.homedir(), 'bar'));
    });
  });

  describe('.dest', function() {
    it('should expose a dest function', function() {
      var paths = setDirectory('foo');
      assert.equal(typeof paths.dest, 'function');
    });

    it('should calculate paths based on the value given on options.dest', function() {
      var paths = setDirectory('foo', {dest: 'whatever'});
      assert.equal(paths.dest('.'), path.resolve(process.cwd(), 'whatever'));
    });
  });

  describe('.tmpl', function() {
    it('should expose a tmpl function', function() {
      var paths = setDirectory('foo');
      assert.equal(typeof paths.tmpl, 'function');
    });

    it('should calculate the path to the templates directory relative to `paths.dir`', function() {
      var paths = setDirectory('foo');
      assert.equal(paths.tmpl('.'), path.resolve(process.cwd(), 'foo/templates'));
    });
  });

  describe('.file', function() {
    it('should expose a file function', function() {
      var paths = setDirectory('foo');
      assert.equal(typeof paths.file, 'function');
    });

    if (!process.env.CI) {
      it('should calculate the path to the templates directory relative to user home', function() {
        var paths = setDirectory('foo');
        assert.equal(paths.file('.'), path.resolve(os.homedir(), 'templates'));
      });
    }

    it('should return a path relative to user home if the file exists', function(cb) {
      var paths = setDirectory('.');
      writeFile(path.resolve(os.homedir(), 'templates/abc.txt'), 'aaa', function(err) {
        if (err) return cb(err);
        var expected = path.resolve(os.homedir(), 'templates/abc.txt');
        assert.equal(paths.file('abc.txt'), expected);
        del(expected, {force: true}, cb);
      });
    });

    it('should return a path relative to templates if file does not exist in user home', function() {
      var paths = setDirectory('.');
      var expected = path.resolve(os.homedir(), 'templates/whatever.txt');
      assert.equal(paths.file('whatever.txt'), paths.tmpl('whatever.txt'));
    });
  });
});
