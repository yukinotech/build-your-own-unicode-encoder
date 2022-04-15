# String.prototype.codePointAt

```js
console.log('🐴'.codePointAt(0).toString(16)) // 1f434
console.log('🐴'.codePointAt(1).toString(16)) // dc34
console.log('🐴'.codePointAt(2)) // undefined
console.log('🐴'.length) // 2
```

```codePointAt```为es6新增方法，它解决了一个问题,当unicode码点>0xffff时，js没有一个便捷的api直接读取当前字符的unicode码点。

比如在