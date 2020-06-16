import { expect } from 'chai';
import { MidiFile } from '../../app/music/midi-file';
import {describe, it} from 'mocha'
import { MidiTrack } from '../../app/music/midi-track';

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

describe('Type script bitwise tests:', () => {
    let midiFile = new MidiFile();
    it('first 4 bits', () => {
        const a: number = 0xb3;
        const b: number = 0xf0;
        expect(a & b).to.equal(176);
    });
    it('last 4 bits', () => {
        const a: number = 0xb3;
        const b: number = 0x0f;
        expect(a & b).to.equal(3);
    });
});