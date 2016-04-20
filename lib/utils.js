'use strict';

var utils = {}, toString = Object.prototype.toString;

function isType(type) {
  return function(arg) {
    return toString.call(arg) === "[object " + type + "]";
  }
}

utils.isFunction = isType('Function');
utils.isArray = Array.isArray || isType('Array');
utils.isString = isType('String');
utils.isObject = isType('Object');
utils.isNumber = isType('Number');
utils.isBoolean = isType('Boolean');
utils.isRegExp = isType('RegExp');

module.exports = utils;