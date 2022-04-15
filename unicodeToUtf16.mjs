// unicode point to utf-16

// code point 输入，utf-16 编码的 uint8[] 输出

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

console.log(
  unicodeToUtf16(0x1f434).map((i) => {
    return i.toString(16)
  }),
  Buffer.from(unicodeToUtf16(0x1f434)).toString('utf16le')
)

for (let i = 0; i < 0x110000; i++) {
  if (
    String.fromCodePoint(i) !==
    Buffer.from(unicodeToUtf16(i)).toString('utf16le')
  ) {
    console.log(i.toString(16), String.fromCodePoint(i))
  }
}
