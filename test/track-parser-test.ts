import { expect } from 'chai';
import { describe, it } from 'mocha'
import { MidiTrack } from '../src/midi-track';
import { TrackParser } from '../src/track-parser';
import { MetaEvent, MetaEventParm } from '../src/meta-event';
import { MidiEvent } from '../src/midi-event';

describe('TrackParser: constructor', () => {

    it('buffer should not be empty', () => {
        let tp = new TrackParser(createTestBuffer());
        const result = tp.getBuffer !== undefined;
        expect(result).to.equal(true);
    });
    it('offset should start at 0', () => {
        let tp = new TrackParser(createTestBuffer());
        const result = tp.getOffset();
        expect(result).to.equal(0);
    });
    it('track should contain events', () => {
        let tp = new TrackParser(createTestBuffer());
        let track = tp.parse();
        const result = track.isEmpty();
        expect(result).to.equal(false);
    });
});

describe('TrackParser: low level functions', () => {
    it('getBuffer should not be empty', () => {
        let tp = new TrackParser(createTestBuffer());
        const result = tp.getBuffer() !== undefined;
        expect(result).to.equal(true);
    });
    it('getOffset should start at 0', () => {
        let tp = new TrackParser(createTestBuffer());
        const result = tp.getOffset() === 0;
        expect(result).to.equal(true);
    });
    it('peekUInt8(pos) should read 1 Byte at offset + pos without changing the offset', () => {
        let tp = new TrackParser(createTestBuffer());
        let result = tp.peekUInt8(0);
        expect(result).to.equal(0);
        result = tp.getOffset();
        expect(result).to.equal(0);
    });
    it('readUInt32(pos) should read 4 Bytes at current offset and add 4 to offset', () => {
        let tp = new TrackParser(createTestBuffer());
        let result = tp.readUInt32();
        expect(result).to.equal(37);
        result = tp.getOffset();
        expect(result).to.equal(4);
    });
    it('extractRawTime() should read variable size bytes', () => {
        let tp = new TrackParser(Buffer.from([189,132,64]));
        let result = tp.extractRawTime();
        expect(result[0]).to.equal(189);
        expect(result[1]).to.equal(132);
        expect(result[2]).to.equal(64);
        expect(result.length).to.equal(3);
    });
    it('extractSize() should read variable size number', () => {
        let tp = new TrackParser(Buffer.from([189,132,64]));
        let result = tp.extractSize();
        expect(result).to.equal(1000000);
    });
    it('reset() should reset the buffer offset to zero', () => {
        let tp = new TrackParser(Buffer.from([189,132,64]));
        tp.extractSize();
        expect(tp.getOffset() > 0).to.equal(true);
        tp.reset();
        expect(tp.getOffset()).to.equal(0);
    });
});

describe('TrackParser: mid level functions', () => {
    it('extractMetaEvent should return correct MetaEvent', () => {
        let tp = new TrackParser(Buffer.from([10,1,127]));
        const result = tp.extractMetaEvent(0);
        expect(result!== undefined).to.equal(true);
        if (result!== undefined){
            expect(result.type).to.equal(10);
            expect(result.time[0]).to.equal(0);
            expect(Array.isArray(result.data)).to.equal(true);
            if (Array.isArray(result.data)){
                expect(result.data[0]).to.equal(127);
            } else {
                expect(result!== undefined).to.equal(true);
            }
        }
    });
    it('extractMidiEventData should return correct array (filled with zeroes if less than 2 bytes)', () => {
        let tp = new TrackParser(Buffer.from([127]));
        const result = tp.extractMidiEventData(MidiEvent.PROGRAM_CHANGE);
        expect(result!== undefined).to.equal(true);
        if (result!== undefined){
            expect(result[0]).to.equal(127);
        }
    });
        it('extractMidiEvent should not create events for unsupported events', () => {
        let tp = new TrackParser(Buffer.from([12,13]));
        const result = tp.extractMidiEvent(0x71,10);
        expect(result=== undefined).to.equal(true);
    });

});


function createTestBuffer(): Buffer {
    let mt: MidiTrack = new MidiTrack();
    mt.addArpeggiatedChord(1, ['c4', 'e4', 'a4', 'c5'], 200, 5, 10, 90);
    let buffer = Buffer.from(mt.toBytes().slice(4));
    return buffer
}
function createMetaEventsTestBuffer(): Buffer {
    let mt: MidiTrack = new MidiTrack();
    mt.addEvent(new MetaEvent({time:0,type:MetaEvent.SEQUENCE,data:1}));
    mt.addEvent(new MetaEvent({time:0,type:MetaEvent.COPYRIGHT,data:'(c) tsmidgen 2020'}));
    mt.addArpeggiatedChord(1, ['c4', 'e4', 'a4', 'c5'], 200, 5, 10, 90);
    let buffer = Buffer.from(mt.toBytes().slice(4));
    return buffer
}