import { expect } from 'chai';
import { MidiFile } from '../src/midi-file';
import {describe, it} from 'mocha'
import { MidiTrack } from '../src/midi-track';

describe('MidiFile: constants', () => {
    it('HDR_CHUNKID should be MThd', () => {
        const result = MidiFile.HDR_CHUNKID;
        expect(result).to.equal('MThd');
    });
    it('HDR_CHUNK_SIZE should be \0\0\0\u0006', () => {
        const result = MidiFile.HDR_CHUNK_SIZE;
        expect(result).to.equal('\0\0\0\u0006');
    });
    it('HDR_TYPE0 should be \0\0', () => {
        const result = MidiFile.HDR_TYPE0;
        expect(result).to.equal('\0\0');
    });
    it('HDR_TYPE1 should be \0\u0001', () => {
        const result = MidiFile.HDR_TYPE1;
        expect(result).to.equal('\0\u0001');
    });
});

describe('MidiFile: empty constructor', () => {
    let midiFile = new MidiFile();
    it('tracks should be empty', () => {
        const result = midiFile.tracks;
        expect(result.length).to.equal(0);
    });
    it('ticks should be defaulted to 128', () => {
        const result = midiFile.ticks;
        expect(result).to.equal(128);
    });
    it('should be able to add an empty track', () => {
        midiFile.addTrack();
        const result = midiFile.tracks.length;
        expect(result).to.equal(1);
    });
    it('should be able to add an exisiting track', () => {
        const track = new MidiTrack();
        midiFile.addTrack(track);
        expect(midiFile.tracks.length).to.equal(2);
        expect(midiFile.tracks[1]).to.equal(track);
    });
});
describe('MidiFile: constructor', () => {
    let midiFile = new MidiFile();
    midiFile.ticks = 200;
    const track = new MidiTrack();
    midiFile.addTrack(track);
    let midiFile2 = new MidiFile(midiFile);
    it('tracks should not be empty', () => {
        expect(midiFile2.tracks.length).to.equal(midiFile.tracks.length);
    });
    it('ticks should be the same value as passed midifile', () => {
        expect(midiFile2.ticks).to.equal(midiFile.ticks);
        expect(midiFile2.ticks).to.equal(200);
    });
});
describe('MidiFile: checkTicks - Ticks per beat must be an integer between 1 and 32767', () => {
    let midiFile = new MidiFile();
    it('Lower than 1 must throw exception', () => {
        expect(() => midiFile.checkTicks(0)).to.throw('Ticks per beat must be an integer between 1 and 32767!');
    })
    it('Non integer must throw exception', () => {
        expect(() => midiFile.checkTicks(10.554)).to.throw('Ticks per beat must be an integer between 1 and 32767!');
    })
    it('Greater than 32767  must throw exception', () => {
        expect(() => midiFile.checkTicks(32768)).to.throw('Ticks per beat must be an integer between 1 and 32767!');
    })
    it('Valid should not throw exception', () => {
        expect(midiFile.checkTicks(10000)).to.be.true;
    })
})