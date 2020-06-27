import { expect } from 'chai';
import { describe, it } from 'mocha'
import { MidiTrack } from '../src/midi-track';
import { MidiEvent } from '../src/midi-event';
import { MidiUtil } from '../src/midi-util';
import { TestUtils } from './test-utils';
import { MetaEvent } from '../src/meta-event';
import { isArray } from 'util';

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
        mt.addNote(1, 60, 128, 20, 80);
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
        expect(mt.isNotEmpty()).to.be.true;
    });
    it('track should be empty if no events have been added be empty', () => {
        let mt = new MidiTrack();
        const result = mt.isEmpty();
        expect(result).to.be.true;
        expect(mt.isNotEmpty()).to.be.false;
    });
    it('fluid syntax should supported', () => {
        let mt = new MidiTrack();
        mt.addEvent(new MidiEvent(MidiEvent.NOTE_ON, 0, 1, 60, 80))
            .addEvent(new MidiEvent(MidiEvent.NOTE_OFF, 0, 1, 60, 80));
        const result = mt.isEmpty();
        expect(result).to.be.false;
        expect(mt.isNotEmpty()).to.be.true;
    });
});

describe('MidiTrack:addNote/note', () => {

    it('addNote: addNote', () => {
        let mt = new MidiTrack();
        mt.addNote(1, 30, 128, 20, 80);
        const result = mt.isNotEmpty();
        expect(result).to.be.true;
        const result2 = mt.getEvents()[0] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_ON);
        expect(result2.param1).to.equal(30);
        expect(result2.time[0]).to.equal(MidiUtil.translateTickTime(20)[0]);
        expect(result2.param2).to.equal(80);
        const result3 = mt.getEvents()[1] as MidiEvent;
        expect(result3.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result3.param1).to.equal(30);
        expect(result3.time[0]).to.equal(MidiUtil.translateTickTime(128)[0]);
        expect(result3.param2).to.equal(80);
    });
    it('addNote: addNote default values', () => {
        let mt = new MidiTrack();
        mt.addNote(1, 30);
        const result = mt.isNotEmpty();
        expect(result).to.be.true;
        const result2 = mt.getEvents()[0] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_ON);
        expect(result2.param1).to.equal(30);
        expect(result2.channel).to.equal(1);
        expect(result2.time[0]).to.equal(MidiUtil.translateTickTime(0)[0]);
        expect(result2.param2).to.equal(MidiUtil.DEFAULT_VOLUME);
        const result3 = mt.getEvents()[1] as MidiEvent;
        expect(result3.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result3.param1).to.equal(30);
        expect(result3.time[0]).to.equal(MidiUtil.translateTickTime(0)[0]);
        expect(result3.param2).to.equal(MidiUtil.DEFAULT_VOLUME);
        expect(result3.channel).to.equal(1);
    });
    it('note should do the exact thing as addNote', () => {
        const mt = new MidiTrack();
        const mt2 = new MidiTrack();
        mt.addNote(1, 30, 128, 20, 80);
        mt2.note(1, 30, 128, 20, 80);
        let expected = JSON.stringify(mt.getEvents()[0] as MidiEvent);
        let value = JSON.stringify(mt2.getEvents()[0] as MidiEvent);
        expect(value).to.equal(expected);
        expected = JSON.stringify(mt.getEvents()[1] as MidiEvent);
        value = JSON.stringify(mt2.getEvents()[1] as MidiEvent);
        expect(value).to.equal(expected);
    });
});
describe('MidiTrack:addChord', () => {

    it('addChord: addChord a three note chord should create 6 events, 3 note on and 3 note off each with correct pitch', () => {
        let mt = new MidiTrack();
        mt.addChord(1, [30, 37, 40], 128, 20, 80);
        const result = mt.isNotEmpty();
        expect(result).to.be.true;
        let result2 = mt.getEvents()[0] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_ON);
        expect(result2.param1).to.equal(30);
        expect(result2.time[0]).to.equal(MidiUtil.translateTickTime(20)[0]);
        expect(result2.param2).to.equal(80);

        result2 = mt.getEvents()[1] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_ON);
        expect(result2.param1).to.equal(37);

        result2 = mt.getEvents()[2] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_ON);
        expect(result2.param1).to.equal(40);

        result2 = mt.getEvents()[3] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result2.param1).to.equal(30);
        expect(result2.time[0]).to.equal(MidiUtil.translateTickTime(128)[0]);
        expect(result2.time[1]).to.equal(MidiUtil.translateTickTime(128)[1]);
        expect(result2.param2).to.equal(80);

        result2 = mt.getEvents()[4] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result2.param1).to.equal(37);

        result2 = mt.getEvents()[5] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result2.param1).to.equal(40);
    });
    it('addChord: should be an array of notes, empty array should throw error', () => {
        const mt = new MidiTrack();
        expect(() => mt.addChord(1, [], 128, 20, 80)).to.throw('Chord must be an array of pitches');
    });
});

describe('MidiTrack:addArpeggiatedChord', () => {

    it('addArpeggiatedChord: addArpeggiatedChord a three note chord should create 6 events, 3 note on and 3 note off each with correct pitch 2nd and 3rd notes are delayed', () => {
        let mt = new MidiTrack();
        mt.addArpeggiatedChord(1, [30, 37, 40], 128, 20, 30, 80, true);
        const result = mt.isNotEmpty();
        expect(result).to.be.true;
        let result2 = mt.getEvents()[0] as MidiEvent;
        expect(result2.type, 'first note on').to.equal(MidiEvent.NOTE_ON);
        expect(result2.param1, 'first note on pitch').to.equal(40);
        expect(result2.time[0], 'first note on time').to.equal(MidiUtil.translateTickTime(20)[0]);
        expect(result2.param2, 'first note on velocity').to.equal(80);

        result2 = mt.getEvents()[1] as MidiEvent;
        expect(result2.type, 'second note on').to.equal(MidiEvent.NOTE_ON);
        expect(result2.time[0], 'second note on time').to.equal(MidiUtil.translateTickTime(30)[0]);
        expect(result2.param1, 'second note on pitch').to.equal(37);

        result2 = mt.getEvents()[2] as MidiEvent;
        expect(result2.type, 'third note on').to.equal(MidiEvent.NOTE_ON);
        expect(result2.time[0], 'third note on time').to.equal(MidiUtil.translateTickTime(30)[0]);
        expect(result2.param1, 'third note on pitch').to.equal(30);

        result2 = mt.getEvents()[3] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result2.param1).to.equal(40);
        expect(result2.time[0]).to.equal(MidiUtil.translateTickTime(128)[0]);
        expect(result2.time[1]).to.equal(MidiUtil.translateTickTime(128)[1]);
        expect(result2.param2).to.equal(80);

        result2 = mt.getEvents()[4] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result2.param1).to.equal(37);

        result2 = mt.getEvents()[5] as MidiEvent;
        expect(result2.type).to.equal(MidiEvent.NOTE_OFF);
        expect(result2.param1).to.equal(30);
    });
    it('addChord: should be an array of notes, empty array should throw error', () => {
        const mt = new MidiTrack();
        expect(() => mt.addChord(1, [], 128, 20, 80)).to.throw('Chord must be an array of pitches');
    });
});
describe('MidiTrack:bytes() alias to toBytes()', () => {

    it('toBytes: bytes should be an alias to toBytes', () => {

        let midiTrack = new MidiTrack();
        midiTrack.addChord(1, [30, 37, 40], 128, 20, 80);;
        let expected = TestUtils.bytesToHexString(midiTrack.toBytes());
        let result = TestUtils.bytesToHexString(midiTrack.bytes());
        expect(result).to.equal(expected);
    });
    it('toBytes: empty track should return empty array', () => {

        let midiTrack = new MidiTrack();
        expect(midiTrack.toBytes().length).to.equal(0);
    });
});
describe('MidiTrack:chord() alias to addChord()', () => {

    it('addChord: chord should be an alias to addChord', () => {

        let midiTrack = new MidiTrack();
        let midiTrack2 = new MidiTrack();
        midiTrack.addChord(1, [30, 37, 40], 128, 20, 80);
        midiTrack2.chord(1, [30, 37, 40], 128, 20, 80);
        let expected = TestUtils.bytesToHexString(midiTrack.toBytes());
        let result = TestUtils.bytesToHexString(midiTrack2.toBytes());
        expect(result).to.equal(expected);
    });
});

describe('MidiTrack:setTempo()', () => {
    it('setTempo: should create a MetaEvent of type MetaEvent.TEMPO with the data set ' + 
    'the bpm value converted to mpqn', () => {
        let mpqn120 = [7,161,32];
        let mt = new MidiTrack();
        mt.setTempo(120,30);
        const result = mt.isNotEmpty();
        expect(result, 'event should be added').to.be.true;
        let result2 = mt.getEvents()[0] as MetaEvent;
        expect(result2.type, 'MetaEvent type should be TEMPO').to.equal(MetaEvent.TEMPO);
        let data: number[] = (result2.data && isArray(result2.data) ? result2.data : [] );
        let value = TestUtils.bytesToHexString(data);
        let expected = TestUtils.bytesToHexString(mpqn120);
        expect(value, 'Mpqn value should be correct').to.equal(expected);
        expect(result2.time[0], 'Time Should be correct').to.equal(MidiUtil.translateTickTime(30)[0]);
       
    });

     it('setTempo: default time should be zero', () => {
        let mpqn120 = [7,161,32];
        let mt = new MidiTrack();
        mt.setTempo(120);
        const result = mt.isNotEmpty();
        expect(result, 'event should be added').to.be.true;
        let result2 = mt.getEvents()[0] as MetaEvent;
        expect(result2.type, 'MetaEvent type should be TEMPO').to.equal(MetaEvent.TEMPO);
        let data: number[] = (result2.data && isArray(result2.data) ? result2.data : [] );
        let value = TestUtils.bytesToHexString(data);
        let expected = TestUtils.bytesToHexString(mpqn120);
        expect(value, 'Mpqn value should be correct').to.equal(expected);
        expect(result2.time[0], 'Time Should be 0').to.equal(MidiUtil.translateTickTime(0)[0]);
       
    });
    it('setTempo: tempo should be an alias to setTempo', () => {

        let midiTrack = new MidiTrack();
        let midiTrack2 = new MidiTrack();
        midiTrack.setTempo(120, 120);
        midiTrack2.tempo(120, 120);
        let expected = TestUtils.bytesToHexString(midiTrack.toBytes());
        let result = TestUtils.bytesToHexString(midiTrack2.toBytes());
        expect(result).to.equal(expected);
    });
    it('setTempo: default time should be zero', () => {
        let mpqn120 = [7,161,32];
        let mt = new MidiTrack();
        mt.setTempo(120);
        const result = mt.isNotEmpty();
        expect(result, 'event should be added').to.be.true;
        let result2 = mt.getEvents()[0] as MetaEvent;
        expect(result2.type, 'MetaEvent type should be TEMPO').to.equal(MetaEvent.TEMPO);
        let data: number[] = (result2.data && isArray(result2.data) ? result2.data : [] );
        let value = TestUtils.bytesToHexString(data);
        let expected = TestUtils.bytesToHexString(mpqn120);
        expect(value, 'Mpqn value should be correct').to.equal(expected);
        expect(result2.time[0], 'Time Should be 0').to.equal(MidiUtil.translateTickTime(0)[0]);
    });
});

describe('MidiTrack:setInstrument()', () => {
    it('setInstrument: should create a MidiEvent of type MidiEvent.PROGRAM_CHANGE with the param1 set to patch value' , () => {
        let mt = new MidiTrack();
        mt.setInstrument(1,55,30);
        const result = mt.isNotEmpty();
        expect(result, 'event should be added').to.be.true;
        let result2 = mt.getEvents()[0] as MidiEvent;
        expect(result2.type, 'MidiEvent type should be PROGRAM_CHANGE').to.equal(MidiEvent.PROGRAM_CHANGE);
        expect(result2.param1, 'Instrument value should be correct').to.equal(55);
        expect(result2.param2, 'Second parameter shoud be 0').to.equal(0);
        expect(result2.channel, 'Channel value should be correct').to.equal(1);
        expect(result2.time[0], 'Time Should be correct').to.equal(MidiUtil.translateTickTime(30)[0]);
    });
    it('setInstrument: default values default time = 0' , () => {
        let mt = new MidiTrack();
        mt.setInstrument(1,55);
        const result = mt.isNotEmpty();
        expect(result, 'event should be added').to.be.true;
        let result2 = mt.getEvents()[0] as MidiEvent;
        expect(result2.type, 'MidiEvent type should be PROGRAM_CHANGE').to.equal(MidiEvent.PROGRAM_CHANGE);
        expect(result2.param1, 'Instrument value should be correct').to.equal(55);
        expect(result2.param2, 'Second parameter shoud be 0').to.equal(0);
        expect(result2.channel, 'Channel value should be correct').to.equal(1);
        expect(result2.time[0], 'Time Should be correct').to.equal(MidiUtil.translateTickTime(0)[0]);
    });

    it('setInstrument: instrument should be an alias to setInstrument', () => {
        let midiTrack = new MidiTrack();
        let midiTrack2 = new MidiTrack();
        midiTrack.setInstrument(1,55,30);
        midiTrack2.instrument(1,55,30);
        let expected = TestUtils.bytesToHexString(midiTrack.toBytes());
        let result = TestUtils.bytesToHexString(midiTrack2.toBytes());
        expect(result).to.equal(expected);
    });
});

describe('MidiTrack:addNoteOn()', () => {
    it('addNoteOn: default values should be properly handled' , () => {
        let mt = new MidiTrack();
        mt.addNoteOn(1,55);
        const result = mt.isNotEmpty();
        expect(result).to.be.true;
        let result2 = mt.getEvents()[0] as MidiEvent;
        expect(result2.type, 'note on').to.equal(MidiEvent.NOTE_ON);
        expect(result2.channel, 'incorrect channel').to.equal(1);
        expect(result2.param1, 'incorrect pitch').to.equal(55);
        expect(result2.time[0], 'incorrect time').to.equal(MidiUtil.translateTickTime(0)[0]);
        expect(result2.param2, 'incorrect velocity').to.equal(MidiUtil.DEFAULT_VOLUME);
    });
});
