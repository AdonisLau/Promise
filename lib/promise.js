!(function(global) {
"use strict";

if (global.Promise) {
  return;
}

function isType(type) {
  return function(arg) {
    return Object.prototype.toString.call(arg) === "[object " + type + "]";
  }
}

var slice = Array.prototype.slice
  , isFunction = isType("Function")
  , isArray = isType("Array");

if (!isFunction(Array.prototype.forEach)) {
  Array.prototype.forEach = function(fn) {
    for (var i = 0, len = this.length; i < len; i++) {
      fn(this[i], i, this);
    }
  };
}  

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

//原型函数
function Promise(fn) {
  if (!isFunction(fn)) {
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
  if (!isArray(promises)) {
    throw new Error('argument must be an array.');
  }

  return new Promise(function(resolve, reject) {
    promises.forEach(function(promise) {
      promise.then(resolve, reject);
    });
  });
};

global.Promise = Promise;
})(this);