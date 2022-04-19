# build-your-own-unicode-encoder

本文的目的：
  - 通过编写unicode编码器，学习和了解utf-8和utf-16编码
  - 整理，归纳unicode在javascript中的应用和特性

## unicode
js提供的unicode相关的api
## String.fromCharCode和String.fromCodePoint
这两个方法都是将unicode码点转换成字符串的方法，其中fromCharCode是较老的方法,而fromCodePoint是es6新增的，可以理解为对旧方法的补充。这种通过新增方法，同时不改写旧方法的行为，体现了js的兼容性。

utf-16在两字节的部分，和unicode的码点是一一对应的，而对于码点>0xffff的unicode
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode
```js
String.fromCharCode
```