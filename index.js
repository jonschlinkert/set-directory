'use strict';

var os = require('os');
var path = require('path');
var exists = require('fs-exists-sync');

/**
 * Expose plugins on the constructor to allow other `base`
 * apps to use the plugins before instantiating.
 */

module.exports = function(dir, options) {
  if (typeof dir !== 'string') {
    throw new TypeError('expected directory to be a string');
  }

  if (!options) options = {};
  var paths = {dir: path.resolve(dir)};

  /**
   * Function that calculates an absolute path to the given filepath,
   * based on the directory passed to `setDirectory`.
   *
   * ```js
   * var paths = setDirectory('foo');
   * console.log(paths.base('bar'));
   * //=> '/User/dev/set-directory/foo/bar'
   * ```
   * @name .base
   * @param {String} `filepath`
   * @api public
   */

  define(paths, 'base', function() {
    return path.resolve.bind(path, dir);
  });

  /**
   * Function that calculates an absolute path to the given `filepath`
   * in the user's home directory. (uses node.js `os.homedir()`)
   *
   * ```js
   * var paths = setDirectory('foo');
   * console.log(paths.home('bar'));
   * //=> '/User/jonschlinkert/bar'
   * ```
   * @name .home
   * @param {String} `filepath`
   * @api public
   */

  define(paths, 'home', function() {
    return path.resolve.bind(path, os.homedir());
  });

  /**
   * Function that calculates an absolute `dest` path, relative to `options.dest`
   * or `process.cwd()`.
   *
   * ```js
   * var paths = setDirectory('foo', {dest: 'whatever'});
   * console.log(paths.dest('bar'));
   * //=> '/User/dev/set-directory/whatever/bar'
   * ```
   * @name .dest
   * @param {String} `filepath`
   * @api public
   */

  define(paths, 'dest', function() {
    var dest = options.dest || process.cwd();
    return path.resolve.bind(path, dest);
  });

  /**
   * Function that calculates an absolute path from the `templates`
   * directory, relative to the directory passed to `setDirectory`.
   *
   * ```js
   * var paths = setDirectory('foo');
   * console.log(paths.tmpl('post.md'));
   * //=> '/User/dev/set-directory/templates/post.md'
   * ```
   * @name .tmpl
   * @param {String} `filepath`
   * @api public
   */

  define(paths, 'tmpl', function() {
    return path.resolve.bind(path, paths.base('templates'));
  });

  /**
   * This function makes it simple to allow users to override built-in templates or other
   * source files. Similar to `.tmpl`, but looks for the given `filename` in
   * `paths.home('templates')`, and if the file does not exist, it returns an absolute path
   * to `filename` in the templates directory relative to the directory passed to `setDirectory`.
   *
   * ```js
   * var paths = setDirectory('foo');
   *
   * // if the path does not exist in user home "templates"
   * console.log(paths.file('post.md'));
   * //=> '/User/dev/set-directory/templates/post.md'
   *
   * // if the path DOES exist in user home "templates"
   * console.log(paths.file('post.md'));
   * //=> '/User/jonschlinkert/templates/post.md'
   * ```
   * @name .file
   * @param {String} `filename`
   * @api public
   */

  paths.file = function(filename) {
    if (typeof filename !== 'string') {
      throw new TypeError('expected filename to be a string');
    }
    var templates = options.templates || 'templates';
    var file = paths.home(templates, filename);
    if (exists(file)) {
      return file;
    }
    return paths.tmpl(filename);
  };

  return paths;
};

/**
 * Create getters/setters for path properties
 */

function define(paths, prop, val) {
  var cache;
  Object.defineProperty(paths, prop, {
    set: function() {
      cache = val;
    },
    get: function() {
      if (typeof cache !== 'undefined') {
        return cache;
      }
      if (typeof val === 'function') {
        return val.call(paths);
      }
      return val;
    }
  });
}
