import fs from 'fs'

let a = fs.readFileSync('./utf-16le.md')
let b = fs.readFileSync('./utf-16be.md')
console.log(a) // fffe 4100 3dd8 34dc
console.log(b) // feff 0041 d83d dc34
