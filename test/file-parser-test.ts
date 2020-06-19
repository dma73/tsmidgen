import { expect } from 'chai';
import { describe, it} from 'mocha'
import { MidiTrack } from '../src/midi-track';
import { FileParser } from '../src/file-parser';
import { MidiFile } from '../src/midi-file';

describe('FileParser: checkFileHeader', () => {
    it('correct file header should return true', () => {
        let fp = new FileParser(createTestBuffer());
        expect(fp.checkFileHeader()).to.equal(true);
    });
    it('incorrect file header should throw exception (first 4 bytes)', () => {
        let fp = new FileParser(createIncorrectBuffer1());
        expect(() => fp.checkFileHeader()).to.throw(FileParser.ERROR_MSG);
    });
    it('incorrect file header should throw exception (next 4 bytes)', () => {
        let fp = new FileParser(createIncorrectBuffer2());
        expect(() => fp.checkFileHeader()).to.throw(FileParser.ERROR_MSG);
    });
});

describe('FileParser: parse', () => {
    it('check that parsing works fine', () => {
        let originalBuffer = createTestBuffer();
        let fp = new FileParser(originalBuffer);
        let mf = fp.parseFile();
        let buffer = Buffer.from(mf.toBytes(),'binary');
        expect(buffer.toString()).to.equal(originalBuffer.toString());
    });
});

function createTestBuffer(): Buffer{
    let mf = new MidiFile();
    let mt = new MidiTrack();
    mt.addNote(1,60,128,0,80);
    mf.addTrack(mt);
    mf.addTrack(mt);
    let buffer = Buffer.from(mf.toBytes(),'binary');
    return buffer
}
function createIncorrectBuffer1(): Buffer{
    return Buffer.from(MidiFile.HDR_CHUNKID);
}
function createIncorrectBuffer2(): Buffer{
    return Buffer.from('invalid');
}