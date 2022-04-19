const unicodeToString = (...unicode) => {
  return String.fromCodePoint(...unicode)
}

let original = '🐴'
//  \ud83d\udc34
//  \u1f434
console.log(unicodeToString(0x1f434))
console.log(unicodeToString(0xd83d, 0xdc34))
