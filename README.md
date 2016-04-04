# Promise
现如今，前端框架层出不穷，mv*系列的框架更是多如繁星。这段时间一直在准备着自己的博客，前端框架估计也是众多mv*框架中的一个。
但这些框架都有一个共同的特点---没有内置的ajax模块。所以，我就想写个自己用的ajax模块。
由于ajax是异步的，为了避免更多的嵌套以及更好地组织自己的代码，所以需要配合上Promise，以同步的写法实现异步的逻辑。
谷歌、火狐等浏览器早已实现了ES6的Promise，但悲催的是IE系列并没有实现，所以便写了promise.js，自己来实现一下。

promise.js实现的Promise(简称P1)与ES6的Promise(简称P2)大致相同，之所以说大致，是因为：
```javascript
new Promise(function(resolve, reject) {
  setTimeout(reject, 1000, 'a');
})
.then(null, function() {
  console.log(1);
})
.then(function() {
  console.log(2);
});
//P1输出 1
//P2输出 1 2
```
对于这种结果，我感到非常地惊讶，我不明白为什么P2会输出 1 2，这在我看来，内部的status从pending变为rejected再变为fulfilled了。
而且，对于一开始用惯了jQuery.Deferred的我，这种结果然我很难接受。所以，我并没有修改我自己的实现。
所以，为了更好地兼容，我推荐这种写法：
```javascript
new Promise(function(resolve, reject) {
  setTimeout(reject, 1000, 'a');
})
.then(function() {
  console.log(1);
})
.then(function() {
  console.log(2);
})
.catch(function() {
  console.log(3);
});
```
#用法
引入promise.js，在promise.js中，如果window.Promise已经存在，便是直接return;
```javascript
if (window.Promise) {
  return;
}
```
