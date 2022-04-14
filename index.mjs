// unicode point to utf-8

// code point 输入，utf-8 编码的 buffer 输出
const unicodeToUtf8 = (value) => {
  // 如果value是number，按code point处理
  if (typeof value === 'number' && value >= 0) {
    if (value < 0x80) {
      // 码点小于2^7,utf-8 长度为1字节
      // 0XXX XXXX，0000 0000-0111 1111共128个，对应ascii码
      return Buffer.from([value])
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
      return Buffer.from([high, low])
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
      return Buffer.from([first, second, third])
    } else if (value < 0x200000) {
      // 码点对齐0xffff结尾, 实际码点范围是 0x10000 - 0x1fffff
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
      return Buffer.from([first, second, third, four])
    } else {
      throw new Error('unicode point is illegal')
    }
  }
}

// console.log(String.fromCodePoint(0x00a9))
// console.log(unicodeToUtf8(0x00a9).toString())

// console.log(String.fromCodePoint(0x41))
// console.log(unicodeToUtf8(0x41).toString())

// console.log(String.fromCodePoint(0x7f))
// console.log(unicodeToUtf8(0x7f).toString())

// console.log(String.fromCodePoint(0x80))
// console.log(unicodeToUtf8(0x80).toString())

// console.log(
//   String.fromCodePoint(0x81),
//   String.fromCodePoint(0x81) === unicodeToUtf8(0x81).toString()
// )

// let point1 = '我'.codePointAt(0)
// console.log(String.fromCodePoint(point1))
// console.log(unicodeToUtf8(point1).toString())

// let point2 = '😁'.codePointAt(0)
// console.log(String.fromCodePoint(point2))
// console.log(unicodeToUtf8(point2).toString())

// for (let i = 0; i < 0x100000; i++) {
//   // console.log(i)
//   if (String.fromCodePoint(i) !== unicodeToUtf8(i).toString()) {
//     console.log(i.toString(16), String.fromCodePoint(i))
//     // break
//   }
// }

// let point1 = 0xd890
// console.log(point1)
// console.log(String.fromCodePoint(point1).codePointAt(0))
// console.log(unicodeToUtf8(point1).toString('utf-8').codePointAt(0).toString(16))
// console.log(String.fromCodePoint(point1) === unicodeToUtf8(point1).toString())
