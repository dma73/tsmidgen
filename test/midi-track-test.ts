import { expect } from 'chai';
import { MidiFile } from '../src/midi-file';
import {describe, it} from 'mocha'
import { MidiTrack } from '../src/midi-track';
import { MidiEvent } from '../src/midi-event';

describe('MidiTrack: constants', () => {
    it('START_BYTES should be MTrk', () => {
        const result = MidiTrack.START_BYTES
        expect(result.toString()).to.equal([0x4d, 0x54, 0x72, 0x6b].toString());
    });
    it('END_BYTES should be 00 FF 2F 00', () => {
        const result = MidiTrack.END_BYTES;
        expect(result.toString()).to.equal([0x00, 0xFF, 0x2F, 0x00].toString());
    });
});

describe('MidiTrack:constructor', () => {
    
    it('no args: track should be empty', () => {
        let mt = new MidiTrack();
        const result = mt.isEmpty();
        expect(result).to.be.true;
    });
    it('non empty track as arg, events should be copied', () => {
        let mt = new MidiTrack();
        mt.addNote(1,60,128,20, 80);
        const mt2 = new MidiTrack(mt);
        const result = mt2.isEmpty();
        expect(result).to.be.false;
    });
});
describe('MidiTrack:addEvent', () => {
    it('track should not be empty', () => {
        let mt = new MidiTrack();
        mt.addEvent(new MidiEvent(MidiEvent.NOTE_ON, 0, 1, 60, 80));
        const result = mt.isEmpty();
        expect(result).to.be.false;
    });
    it('fluid syntax should supported', () => {
        let mt = new MidiTrack();
        mt.addEvent(new MidiEvent(MidiEvent.NOTE_ON, 0, 1, 60, 80))
            .addEvent(new MidiEvent(MidiEvent.NOTE_OFF, 0, 1, 60, 80));
        const result = mt.isEmpty();
        expect(result).to.be.false;
    });
});
