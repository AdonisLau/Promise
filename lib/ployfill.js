'use strict';

var utils = require('./utils');

if (!utils.isFunction(Array.prototype.forEach)) {
  Array.prototype.forEach = function(fn) {
    for (var i = 0, len = this.length; i < len; i++) {
      fn(this[i], i, this);
    }
  };
} 