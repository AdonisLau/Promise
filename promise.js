/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	"use strict";

	if (window.Promise) {
	  return;
	}

	var utils = __webpack_require__(1)
	  , callback = __webpack_require__(2)
	  , slice = Array.prototype.slice;

	__webpack_require__(3);

	//原型函数
	var Promise = function(fn) {
	  if (!utils.isFunction(fn)) {
	    throw new Error("Promise resolver undefined is not a function");
	  }

	  var status = "pending"
	    , callbacks = [callback(), callback()];

	  //毛主席曾说过，一个的触发必定导致另一个的毁灭  
	  callbacks.forEach(function(item, key, arr) {
	    item.add(arr[key ^ 1].destroy);
	  });

	  function resolve(data) {
	    status = "fulfilled";

	    callbacks[0].fire(data);
	  }

	  function reject(err) {
	    status = "rejected";

	    callbacks[1].fire(err);
	  }

	  //支持串行
	  this.then = function(/*resolveCallback, rejectCallback*/) {
	    var methods = slice.call(arguments, 0, 2);

	    return new Promise(function(/*resolve, reject*/) {
	      var i = 0, args = slice.call(arguments), len = args.length;

	      for (; i < len; i++) {

	        (function(k, func, method) {
	          callbacks[k].add(function(data) {
	            var returnValue = (utils.isFunction(method) || null) && method(data);

	            if (returnValue && utils.isFunction(returnValue.then)) {
	              //绑定resolve和reject到返回的promise中
	              returnValue.then.apply(returnValue, args);
	            } else {
	              returnValue == null ? func(data) : func(returnValue);
	            }
	          });
	        })(i, args[i], methods[i]);

	      }

	    });
	  };

	  this["catch"] = function(func) {
	    return this.then(null, func);
	  };

	  fn.call(this, resolve, reject);
	}

	Promise.resolve = function(data) {
	  return new Promise(function(resolve, reject) {
	    setTimeout(function() {
	      resolve(data);
	    }, 0);
	  });
	};

	Promise.reject = function(err) {
	  return new Promise(function(resolve, reject) {
	    setTimeout(function() {
	      reject(err);
	    }, 0);
	  });
	};

	Promise.all = function(promises) {
	  if (!utils.isArray(promises)) {
	    throw new Error('argument must be an array.');
	  }

	  return new Promise(function(resolve, reject) {
	    var waitCount = promises.length
	      , result = new Array(waitCount);    

	    function done(k, data) {
	      if (!result) {
	        return;
	      }
	      
	      result[k] = data;

	      if (!(--waitCount)) {
	        resolve(result);
	        result = null;
	      }
	    }

	    function fail(err) {
	      reject(err);
	      result = null;
	    }

	    promises.forEach(function(promise, k) {
	      promise.then(function(data) {
	        done(k, data)
	      }, fail);      
	    });

	  });
	};

	Promise.race = function(promises) {
	  if (!utils.isArray(promises)) {
	    throw new Error('argument must be an array.');
	  }

	  return new Promise(function(resolve, reject) {
	    promises.forEach(function(promise) {
	      promise.then(resolve, reject);
	    });
	  });
	};

	window.Promise = Promise;  
	})();

/***/ },
/* 1 */
/***/ function(module, exports) {

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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(1);
	//callback 事件订阅/发布模式 触发后再添加会直接触发
	function callback() {
	  var list = []
	    , fired = false
	    , result, obj;

	  obj = {
	    add: function(fn) {
	      if (!utils.isFunction(fn)) {
	        return this;
	      }

	      if (fired) {
	        fn(result);
	      } else if (list) {
	        list.push(fn);
	      }
	    },

	    fire: function(data) {
	      if (!list) {
	        return this;
	      }

	      list.forEach(function(fn) {
	        fn(data);
	      });

	      result = data;
	      fired = true;

	      this.destroy();
	      return this;
	    },

	    destroy: function() {
	      list = null;
	    }
	  };

	  return obj;
	}

	module.exports = callback;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(1);

	if (!utils.isFunction(Array.prototype.forEach)) {
	  Array.prototype.forEach = function(fn) {
	    for (var i = 0, len = this.length; i < len; i++) {
	      fn(this[i], i, this);
	    }
	  };
	} 

/***/ }
/******/ ]);