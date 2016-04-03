!(function(global) {
"use strict";

if (global.Promise) {
  return;
}

function isType(type) {
  return function(arg) {
    Object.prototype.toString.call(arg) === "[object " + type + "]";
  }
}

var slice = Array.prototype.slice
  , isFunction = isType("Function")
  , isArray = isType("Array");

//callback 事件订阅/发布模式 触发后再添加会直接触发
function callback() {
  var list = []
    , fired = false
    , result, obj;

  obj = {
    add: function(fn) {
      if (!isFunction(fn)) {
        return this;
      }

      if (fired) {
        fn(result);
      } else {
        list.push(fn);
      }
    },

    fire: function(data) {
      if (!list) {
        return this;
      }

      for (var i = 0, len = list.length; i < len; i++) {
        list[i](data);
      }

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

//原型函数
function Promise(fn) {
  if (!isFunction(fn)) {
    throw new Error("Promise resolver undefined is not a function");
  }

  var status = "pending"
    , callbacks = [callback(), callback()];

  function resolve(data) {
    status = "fulfilled";

    callbacks[0].fire(data);
    callbacks[1].destroy();
  }

  function reject(err) {
    status = "rejected";

    callbacks[0].destroy();
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
            var returnValue = (isFunction(method) || null) && method(data);

            if (returnValue && isFunction(returnValue.then)) {
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
  if (!isArray(promises)) {
    throw new Error('argument must be an array.');
  }

  var length = promises.length
    , result = new Array(length);

  return new Promise(function(resolve, reject) {

    var waitCount = length, i = 0; 

    function done(k, data) {
      result[k] = data;

      if (!(--waitCount)) {
        resolve(result);
      }
    }

    function fail(err) {
      reject(err);
    }

    for ( ; i < length; i++) {
      (function(k, promise) {

        promise.then(function(data) {
          done(k, data)
        }, fail);

      })(i, promises[i]);
    }

  });
};

Promise.race = function(promises) {
  if (!isArray(promises)) {
    throw new Error('argument must be an array.');
  }

  return new Promise(function(resolve, reject) {
    for (var i = 0, len = promises.length; i < len; i++) {
      promises[i].then(resolve, reject);
    }
  });
};

global.Promise = Promise;
})(this);