'use strict';

var utils = require('./utils');
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

new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve(10)
  }, 2000);
})
.then(function(a) {
  return new Promise(function(resolve, reject) {
    console.log('a');
    resolve('1');
  }, 2000);
})
.then(function() {
  console.log('b');
  return 20;
})
.then(function(d) {
  console.log('c');
  alert(d);
})