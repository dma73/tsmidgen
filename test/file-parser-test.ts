import { expect } from 'chai';
import { describe, it} from 'mocha'
import { MidiTrack } from '../src/midi-track';
import { FileParser } from '../src/file-parser';
import { MidiFile } from '../src/midi-file';
import { MidiUtil } from '../src/midi-util';

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
    it('check that empty tracks are removed', () => {
        const EmptyTrack = [0x4d, 0x54, 0x72, 0x6b, 0x00, 0x00, 0x00, 0x04, 0x00, 0xFF, 0x2F, 0x00];
        let originalBuffer = createTestBuffer(EmptyTrack);
        let fp = new FileParser(originalBuffer);
        let mf = fp.parseFile();
        let buffer = Buffer.from(mf.toBytes() ,'binary');
        expect(buffer.toString()).to.equal(createTestBuffer().toString());
    });
    it('unexpected bytes are ignored', () => {
        const emptyTrack = [0x4d, 0x54, 0x72, 0x6b, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0xFF, 0x2F, 0x00];
        let originalBuffer = createTestBuffer(emptyTrack);
        let fp = new FileParser(originalBuffer);
        let mf = fp.parseFile();
        let buffer = Buffer.from(mf.toBytes() ,'binary');
        expect(buffer.toString()).to.equal(createTestBuffer().toString());
    });
});

function createTestBuffer(additionalData?: number[]): Buffer{
    let mf = new MidiFile();
    let mt = new MidiTrack();
    let ad = '';
    if(additionalData){
        ad = MidiUtil.codes2Str(additionalData);
    }
    mt.addNote(1,60,127,0,80);
    mf.addTrack(mt);
    mf.addTrack(mt);
    let file: string = mf.toBytes();
    file += ad;
    let buffer = Buffer.from(file,'binary');
    return buffer
}
function createIncorrectBuffer1(): Buffer{
    return Buffer.from(MidiFile.HDR_CHUNKID);
}
function createIncorrectBuffer2(): Buffer{
    return Buffer.from('invalid');
}

function toHexString(input: string):string{
    let hex = '';
    Buffer.from(input, 'binary').forEach((value) => {
        hex += (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16)) + ' ';
    });
    return hex;
}