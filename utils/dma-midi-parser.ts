import { MidiFile } from "../src/midi-file";
let fs = require('fs');

let binary: Buffer = fs.readFileSync('./utils/testparse.mid');
let hex = '';
binary.forEach((value) => {
    hex += ' ' + (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16));
});
fs.writeFileSync('./utils/testparse.mid.hex', hex, 'binary');

let newFile = MidiFile.fromBytes(binary);
console.log(newFile);
fs.writeFileSync('./utils/testparse.new.mid', newFile.toBytes(), 'binary');
binary = fs.readFileSync('./utils/testparse.new.mid');
hex = '';
binary.forEach((value) => {
    hex += ' ' + (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16));
});
fs.writeFileSync('./utils/testparse.new.mid.hex', hex, 'binary');
