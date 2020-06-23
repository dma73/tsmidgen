import { expect } from 'chai';
import {describe, it} from 'mocha'
import { MetaEvent } from '../src/meta-event';
import { MidiEvent } from '../src/midi-event';

describe('MetaEvent: setType()', () => {
    it('type : invalid type', () => {
       
       let midiEvent = new MidiEvent(MidiEvent.NOTE_ON,0,1,60,80);
        expect(() => midiEvent.setType(50)).to.throw('Trying to set an unknown event: 50');
    });
});
describe('MetaEvent: setChannel()', () => {
    it('channel: check lower bound', () => {
       let midiEvent = new MidiEvent(MidiEvent.NOTE_ON,0,1,60,80);
        expect(() => midiEvent.setChannel(-1)).to.throw('Channel is out of bounds.');
    });
    it('channel : check upper bound', () => {
        let midiEvent = new MidiEvent(MidiEvent.NOTE_ON,0,1,60,80);
        expect(() => midiEvent.setChannel(16)).to.throw('Channel is out of bounds.');
     });
});

describe('MetaEvent: toBytes()', () => {
    it('toBytes : MidiEvent.IGNORE Events should not be exported', () => {
       let midiEvent = new MidiEvent(MidiEvent.IGNORE,0,0,0,0);
        expect(midiEvent.toBytes().length).to.equal(0);
    });
    it('toBytes : Other valid events should be exported', () => {
        let midiEvent = new MidiEvent(MidiEvent.NOTE_ON,0,1,60,80);
         expect(midiEvent.toBytes().length).to.equal(4);
     });
});



describe('MetaEvent: pushIfNotNullOrUndefined()', () => {
    it('pushIfNotNullOrUndefined : undefined should not be pushed', () => {
        let array: number[] = [];
        let arg = undefined;
        MidiEvent.pushIfNotNullOrUndefined(arg, array);
        expect(array.length).to.equal(0);
    });
    it('pushIfNotNullOrUndefined : null should not be pushed', () => {
        let array: number[] = [];
        let arg = null;
        MidiEvent.pushIfNotNullOrUndefined(arg, array);
        expect(array.length).to.equal(0);
    });
    it('pushIfNotNullOrUndefined : correct value should be pushed', () => {
        let array: number[] = [];
        let arg = 20;
        MidiEvent.pushIfNotNullOrUndefined(arg, array);
        expect(array.length).to.equal(1);
        expect(array[0]).to.equal(arg);
    });
});



function toHexString(input: number[]):string{
    let hex = '';
    input.forEach((value) => {
        hex += (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16)) + ' ';
    });
    return hex;
} 