# build-your-own-unicode-encoder

本文的目的：
  - 通过编写unicode编码器，学习和了解utf-8和utf-16编码
  - 整理，归纳unicode在javascript中的应用和特性

## 前陈

web 开发离不开和字符，编码打交道，业务中经常会接触 utf-8,utf-16 和 unicode 等内容。比如前端同学在校验 input 字段时，如果只支持汉字，校验的正则规则是`[\u4e00-\u9fa5]`，比如 html 中声明 html 编码的 meta 标签`<meta charset="utf-8">`。

本文会介绍 utf-8,utf-16 和 unicode 的关系，通过实现一个简单的 unicode 码点转换成 utf-8 和 utf-16 的函数，加深对unicode字符编码的理解。最后简述一下unicode在javascript里面的一些有趣的case和应用

## unicode

unicode 的背景大家网上的搜的到，或者 wiki 百科都搜得到，就不重复了。可以理解 unicode 就是一个巨大的字符集，基本包含了人类常见的各种语言的文字和符号，完成了码点到字符的映射。可以简单的想像，unicode 就是一张哈希表，一个码点（数字）对应一个字符。比如
```js
let unicode: {
  '0x306E': 'の', // 日文
  '0x6211': '我', // 中文
  '0x41': 'A', // 英文
  '0x222B': '∫', // 数学符号，积分
  '0x1f434': '🐴', // 颜文字
}
```
计算机解析一段文字的过程如下：计算机先读取一段二进制数据（可以是本地的文件或者网络上请求来的），然后通过内置的软硬件，通过这张表将数字映射成字符。

听起来是不是很简单？但是这个过程中还差了一个过程，就是编码。想想看当计算机收到了一段8字节的二进制数据
```js
FE FF 00 41 D8 3D DC 34
```
计算机想把它转化成对应的字符串，拿着unicode的对应表犯了难：怎么拆分呢？编码标准就是干这个事的。

## utf-8和uft-16

编码本质指的是如何把字符（串）转换成对应的二进制数据，和返过来解析。

unicode最常见的编码标准就是utf-8和utf-16，其中utf-8在web使用的最为广泛，先来关注一下它。

### utf-8

先看一下编码规则

Char. number range (hexadecimal) | UTF-8 octet sequence(binary)
--------------------+---------------------------------------------
0000 0000-0000 007F | 0xxxxxxx
0000 0080-0000 07FF | 110xxxxx 10xxxxxx
0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx

表的左边是unicode码点，表的右边是码点对应的utf-8编码后的数据，这个表其实不太直观，把表的左边换成二进制更直观，先看第一行。

0000 0000 0000 0000 - 0000 0000 0111 1111 | 0xxxxxxx

x代表可以是0或1，是不是一下子就看明白了？把码点在`0x0-0x007F`之间的128个unicode字符编码成utf-8，直接把对应码点填入一个字节的后七位即可，正好一一对应，因为0xxxxxxx最多也只能编码2的7次方=128个不同的字符。比如字符A的码点是`0x41`,对应二进制是`0100 0001`,啥都不用干，直接就是现成的。

马上来试试，打开一个文本编辑器，输入`ABC`,选择保存为`utf-8`编码（vscode在右下角），然后找一个hex editor打开这个文件，可以看到以下内容
```js
41 42 43
```
字符A的码点是`0x41`,对应utf-8的编码也是`0x41`，占一个字节，
字符B的码点是`0x42`,对应utf-8的编码也是`0x42`，占一个字节，
字符C的码点是`0x43`,对应utf-8的编码也是`0x43`，占一个字节。

也就是说我们输入的ABC这个字符串，通过utf-8编码成了3个字节的数据，保存到了这个文本文件里。

是不是非常眼熟？这不就是ascii编码吗？所以utf-8一个比较重要的特性就是**utf-8编码兼容ascii**，并且**对英文友好**。用utf-8只编码ascii范围的字符，产生的二进制数据，对于一些只懂ascii编码的机器来说，这段数据是完全可读的，就是这个道理。

**对英文友好**指的是除了兼容性外，这个设计，使得对大量使用英文的utf-8编码的文档来说，每个英文字符和标点，都只占1个字节，文档的体积自然就大大减小。相反，大量的汉字在utf-8下都需要三个字节。而如果使用utf-16编码的话，汉字和英文字符都是2个字节，就众生平等了。

接下来看看utf-8的第二个转换部分

0000 0080-0000 07FF | 110xxxxx 10xxxxxx 对应的二进制是
0000 0000 1000 0000 - 0000 0000 0000 0111 1111 1111 | 110xxxxx 10xxxxxx

直接将unicde码点的二进制的后11位，映射，填充到110xxxxx 10xxxxxx中11位的x即可，比如：
0x80 = 1000 0000 = 000 1000 0000 =  000 10||00 0000 = 110|00010 10|000000

是不是发现有什么不对？110xxxxx 10xxxxxx 理论上可以承载2的11次方，共2048个字符，但是如果按上述的编码方式，只能承载
0x80 - 0x7FF, 1920个字符。为什么不充分利用这个空间呢？这里笔者暂时没有了解到相关专业的解答，但是可以猜测一下：
  - utf-8编码空间相对unicode现有的17个平面是绰绰有余的，不像utf-16，编码空间最大极限是16号平面
  - 在这基础之上上述的非紧凑的编码，unicode码点转换成utf-8的过程或者逆过程，非常适合直接位运算。如果要是紧凑填充，就必须计算位移了

后续的第三和第四部分就不详细表述了，了解了编码方式，写一个简单的转换函数，也就轻轻松松了。读者可以自己根据规范写一个转换函数，可以加深对utf-8编码的理解

```js
// code point 输入，utf-8 编码的 Uint8Array 输出
const unicodeToUtf8 = (value) => {
  // 如果value是number，按code point处理
  if (
    typeof value === 'number' &&
    value >= 0 &&
    value % 1 === 0 &&
    (value < 0xd800 || value > 0xdfff)
  ) {
    if (value < 0x80) {
      // 码点小于2^7,utf-8 长度为1字节
      // 0XXX XXXX，0000 0000-0111 1111共128个，对应ascii码
      return Uint8Array.from([value])
    } else if (value < 0x800) {
      // 码点对齐0x7ff结尾, 实际码点范围是 0x81 - 0x7ff
      // 110X XXXX 10XX XXXX 理论可以承载字符2^11，2048个字符,字符较少，还不能囊括汉字
      // & 0000 0111 1100 0000，取高5位
      let high = value >> 6
      // & 0000 0000 0011 1111
      let low = value & 0x3f
      high += 0xc0
      // + 1100 0000
      low += 0x80
      // + 1000 0000
      return Uint8Array.from([high, low])
    } else if (value < 0x10000) {
      // 码点对齐0xffff结尾, 实际码点范围是 0x800 - 0xffff
      // 1110 XXXX 10XX XXXX 10XX XXXX 理论可以承载字符2^16，65536个字符，囊括了大部分汉字, 码点尚未超出0号平面
      let first = value >> 12
      // (value & 0x3f000) >> 12
      // & 0000 0000 1111 0000 0000 0000
      let second = (value & 0xfc0) >> 6
      // & 0000 0000 0000 1111 1100 0000
      let third = value & 0x3f
      // & 0000 0000 0000 0000 0011 1111
      first += 0xe0
      // + 1110 0000
      second += 0x80
      // + 1000 0000
      third += 0x80
      // + 1000 0000
      return Uint8Array.from([first, second, third])
    } else if (value < 0x110000) {
      // 码点对齐0x10000开头, 实际码点范围是 0x10000 - 0x10ffff
      // 1111 0XXX 10XX XXXX 10XX XXXX 10XX XXXX 理论可以承载字符2^21，2097152个字符，完全足够覆盖了0-16号平面了
      let first = value >> 18
      // & 0001 1100 0000 0000 0000 0000
      let second = (value & 0x3f000) >> 12
      // & 0000 0011 1111 0000 0000 0000
      let third = (value & 0xfc0) >> 6
      // & 0000 0000 0000 1111 1100 0000
      let four = value & 0x3f
      // & 0000 0000 0000 0000 0011 1111
      first += 0xf0
      // + 1111 0000
      second += 0x80
      // + 1000 0000
      third += 0x80
      // + 1000 0000
      four += 0x80
      return Uint8Array.from([first, second, third, four])
    } else {
      throw new Error('unicode point larger than 0x10ffff')
    }
  } else {
    throw new Error('unicode point is illegal')
  }
}
```

utf-8的另一个特点，可以通过写一个utf-8解码函数来体会，就是**变长编码和易读性**。

Char. number range (hexadecimal) | UTF-8 octet sequence(binary)
--------------------+---------------------------------------------
0000 0000-0000 007F | 0xxxxxxx
0000 0080-0000 07FF | 110xxxxx 10xxxxxx
0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx

还是观察这张表，可以发现utf-8编码是变长的，长度可以是1-4个字节，同时每个字节被单独读到，可以根据字节的头部，立刻知道这个字节是数据还是一个字符的开头。

比如计算机读到`00010001`,马上就能匹配上0xxxxxxx这个pattern，直接解析出字符，又或者计算机读到`11011111`，马上就能知道这是一个字符的头，并且这是一个2字节的字符。10开头的字节是数据块，110开头的字节是2字节字符的头，每一个字节的范围都是独立而不冲突的。换句话说，如果一段二进制数据，读到`11111xxx`,立刻就能知道，这段数据不可能是合法的utf-8编码。

这对解码带来了极大的便捷

## utf-16
unicode如果只有一种编码，肯定是不够用的，utf-16就是另一种unicode的编码方式，utf-16编码相对来说就简单多了

当码点<0x10000，也就是在0号平面上，unicode码点直接映射到编码的两个字节上。

比如字符'A',码点0x41,对应的utf-16编码就是0x0041, 0000 0000 0100 0001，占2个字节
比如字符'我',码点0x6211,对应的utf-16编码就是0x6211, 0110 0010 0001 0001，占2个字节

当码点>=0x10000,utf-16会使用一个代理对的方式，表示这个字符，占4个字节

### 代理对
unicode有一个区域，是不映射任何字符的，范围是\d800-\dfff，一共2048个字符，把这个范围拆成2份，其中
high surrogate 范围 0xd800 - 0xdbff 一共 0x400, 1024个
low surrogate 范围 0xdc00 - 0xdfff 一共 0x400, 1024个
两两组合起来，就能表示1024*1024 = 2^20，大概100万左右个状态

一个合法的unicode字符码点的最大值是`0x10ffff`，那么位于0x10000到0x10ffff之间一共有0x10ffff - 0x10000 + 1 = 2^20个字符。

是不是有种对上的感觉？其实这也是unicode字符码点为啥不能更大的原因了（16号平面为止），按现行的标准，utf-16承载不了更多的字符了。当然以后真有需要，也不是不能加。

那具体怎么映射呢？

首先0x10000到0x10ffff先统一减去0x10000，得到一个范围0x0 - 0xfffff, 正好就是20位，然后前10位和后10位分别组合到高代理和低代理上。如下图所示：

// U' = yyyy yyyy yy|xx xxxx xxxx  // U - 0xf0000
// W1 = 110110yyyyyyyyyy      // 0xD800 + yyyyyyyyyy
// W2 = 110111xxxxxxxxxx      // 0xDC00 + xxxxxxxxxx

utf-16的特点和utf-8相比也就比较明显了
 - 一个是大部分字符都是2个字节，包括英文和汉字，因为常用字符的码点基本都在0-0xffff直接，很少会遇到需要4字节表示的字符。另一方面所有的数字和英文，都被编程了2个字节，体积变大了很多，并且也无法兼容ascii码了
 - utf-16的编码还有一个字节序的问题

附一个简单的unicode转utf-16的实现
```js
const unicodeToUtf16 = (value, tag) => {
  // 如果value是number，按code point处理
  if (
    typeof value === 'number' &&
    value >= 0 &&
    value % 1 === 0 &&
    value < 0x110000
  ) {
    if (value < 0x10000) {
      let low = value & 0xff
      let high = value >> 8
      if (tag?.match(/be/)) {
        return [high, low]
      }
      return [low, high]
    } else {
      // high surrogate 范围 0xd800 - 0xdbff 一共 0x400, 1024个
      // low surrogate 范围 0xdc00 - 0xdfff 一共 0x400, 1024个
      // 正好只能匹配上 0x10000 - 0x10ffff 共 2^20 个
      // U' = yyyy yyyy yyxx xxxx xxxx  // U - 0xf0000
      // W1 = 110110yyyyyyyyyy      // 0xD800 + yyyyyyyyyy
      // W2 = 110111xxxxxxxxxx      // 0xDC00 + xxxxxxxxxx
      let u = value - 0x10000
      let high = (u >> 10) + 0xd800
      let low = (u & 0x3ff) + 0xdc00
      let high1 = high >> 8
      let high2 = high & 0xff
      let low1 = low >> 8
      let low2 = low & 0xff
      if (tag?.match(/be/)) {
        return [high1, high2, low1, low2]
      }
      return [high2, high1, low2, low1]
    }
  } else {
    throw new Error('unicode point is illegal')
  }
}
```

## JavaScript和utf-16的缘分

### 不准的length
根据ECMAScript规范，JavaScript底层的字符串是按照utf-16储存的，并且规定0-16位是一个码元，也就是说2字节，是一个字符，所以js会有一个非常奇葩的问题是：
```js
'😂'.length // 2
```
因为'😂'的码点是0x1F602,>0x10000,所以该字符在js里面是用2个2字节的代理对表示的，即'\uD83D\uDE02'

可能是考虑到向后兼容，或者认为没必要改动，这个length的行为在ES6里面，依然是维持原样。只是新增了2原生个api来解决这种大码点字符的问题`String.prototype.codePointAt()`和`String.fromCodePoint()`

https://mathiasbynens.be/notes/javascript-encoding 的blog里面多篇讲述了很多js和unicode的相关的内容，包括编码，unicode正则相关等，有很多技术细节，笔者就不展开了

## 参考：
1. RFC3629 utf-8 https://www.rfc-editor.org/rfc/rfc3629.txt
2. UTF-8 wiki https://zh.wikipedia.org/zh/UTF-8
3. rfc2781 utf-16 https://www.ietf.org/rfc/rfc2781.txt
4. UTF-16 wiki https://zh.wikipedia.org/zh/UTF-16
5. mathiasbynens blog https://mathiasbynens.be/notes/javascript-encoding