import { expect } from 'chai';
import { MidiUtil } from '../src/midi-util';
import {describe, it} from 'mocha'

const midi_letter_pitches = { a: 21, b: 23, c: 12, d: 14, e: 16, f: 17, g: 19 } as {
    [key: string]: number
};
const midi_pitches_letter = { 12: 'c', 13: 'c#', 14: 'd', 15: 'd#', 16: 'e', 17: 'f', 18: 'f#', 19: 'g', 20: 'g#', 21: 'a', 22: 'a#', 23: 'b' } as {
    [key: string]: string
};
const midi_flattened_notes = { 'a#': 'bb', 'c#': 'db', 'd#': 'eb', 'f#': 'gb', 'g#': 'ab' } as {
    [key: string]: string
};
describe('MidiUtil: constants', () => {
    it('default channel should be zero', () => {
        const result = MidiUtil.DEFAULT_CHANNEL;
        expect(result).to.equal(0);
    });
    it('default duration should be 128', () => {
        const result = MidiUtil.DEFAULT_DURATION;
        expect(result).to.equal(128);
    });
    it('default volume should be 90', () => {
        const result = MidiUtil.DEFAULT_VOLUME;
        expect(result).to.equal(90);
    });
});
describe('MidiUtil: constant arrays', () => {
    it('midi_letter_pitches', () => {
        const result = JSON.stringify(MidiUtil.midi_letter_pitches);
        expect(result).to.equal(JSON.stringify(midi_letter_pitches));
    });
    it('midi_pitches_letter', () => {
        const result = JSON.stringify(MidiUtil.midi_pitches_letter);
        expect(result).to.equal(JSON.stringify(midi_pitches_letter));
    });
    it('midi_flattened_notes', () => {
        const result = JSON.stringify(MidiUtil.midi_flattened_notes);
        expect(result).to.equal(JSON.stringify(midi_flattened_notes));
    });
});
describe('MidiUtil padBytes', () => {
    it('when input < number of bytes, padBytes function should return Hex String left padded with Zeroes to the correct number of bytes', () => {
        let result = MidiUtil.padBytes(6,'AABBCC');
        expect(result).to.equal('000000AABBCC');
        result = MidiUtil.padBytes(6,'');
        expect(result).to.equal('000000000000');
        result = MidiUtil.padBytes(6,'AABBCCDDEEFF');
        expect(result).to.equal('AABBCCDDEEFF');
    });
    it('when input is empty, padBytes function should return Hex String filled with Zeroes to the correct number of bytes', () => {
        const result = MidiUtil.padBytes(6,'');
        expect(result).to.equal('000000000000');
    });
    it('when input = number of bytes, padBytes function should return original Hex String', () => {
        const result = MidiUtil.padBytes(6,'AABBCCDDEEFF');
        expect(result).to.equal('AABBCCDDEEFF');
    });
});
describe('MidiUtil translateTickTime returns a variable size array of 7 significant bits, first bit being 1 if another byte follows and 0 if not', () => {
    it('if input smaller than 128 return a one byte array with the same value', () => {
        const result = MidiUtil.translateTickTime(127);
        expect(result[0]).to.equal(127);
        expect(result.length).to.equal(1);
    });
    it('if equal to 128 return a two byte array with first byte=129 and second byte=0', () => {
        const result = MidiUtil.translateTickTime(128);
        expect(result[0]).to.equal(129);
        expect(result[1]).to.equal(0);
        expect(result.length).to.equal(2);
    });
    it('if equal to 10,000 return a two byte array with first byte=206, second byte=16', () => {
        const result = MidiUtil.translateTickTime(10000);
        expect(result[0]).to.equal(206);
        expect(result[1]).to.equal(16);
        expect(result.length).to.equal(2);
    });
    it('if equal to 1,000,000 return a three byte array with first byte=189, second byte=132 and third byte=64', () => {
        const result = MidiUtil.translateTickTime(1000000);
        expect(result[0]).to.equal(189);
        expect(result[1]).to.equal(132);
        expect(result[2]).to.equal(64);
        expect(result.length).to.equal(3);
    });
});

describe('MidiUtil str2Bytes returns a byte array from a hex string, padded to the required number of bytes', () => {
    it('number of bytes should be equal to expected number of bytes and left padded with zeroes', () => {
        const result = MidiUtil.str2Bytes('FFFFFF', 4);
        expect(result.length).to.equal(4);
        expect(result[0]).to.equal(0);
    });
    it('Bytes should be correct', () => {
        const result = MidiUtil.str2Bytes('0088FF', 3);
        expect(result[0]).to.equal(0);
        expect(result[1]).to.equal(136);
        expect(result[2]).to.equal(255);
    });
});
describe('MidiUtil codes2Str returns utf 16 string from a byte array', () => {
    it('string size should be equal to array size', () => {
        const bytes = [0,136,255,255];
        const result = MidiUtil.codes2Str(bytes);
        expect(result.length).to.equal(bytes.length);
    });
    it('values should be correct', () => {
        const bytes = [0,136,255,255];
        const expected = String.fromCharCode(0,136,255,255)
        let result = MidiUtil.codes2Str(bytes);
        expect(result).to.equal(expected);
    });
});

describe('MidiUtil mpqnFromBpm returns a byte array of the result of conversion from bpm to microseconds per quarter note', () => {
    it('array size should be 3', () => {
        const result = MidiUtil.mpqnFromBpm(120);
        expect(result.length).to.equal(3);
    });
    it('values should be correct', () => {
        const result = MidiUtil.mpqnFromBpm(120);
        expect(result[0]).to.equal(7);
        expect(result[1]).to.equal(161);
        expect(result[2]).to.equal(32);
    });
    it('array should be padded with zeroes', () => {
        const result = MidiUtil.mpqnFromBpm(60000);
        expect(result[0]).to.equal(3);
        expect(result[1]).to.equal(232);
        expect(result[2]).to.equal(0);
    });
});
describe('MidiUtil getNoteName returns a string with the note name or the flattened note name if the flag is set', () => {
        it('12 without flag should be c', () => {
            const result = MidiUtil.getNoteName(12, false );
            expect(result).to.equal('c');
        });
        it('12 with flag should be c', () => {
            const result = MidiUtil.getNoteName(12, true );
            expect(result).to.equal('c');
        });
        it('18 without flag should be f#', () => {
            const result = MidiUtil.getNoteName(18, false );
        });
        it('18 with flag should be gb', () => {
            const result = MidiUtil.getNoteName(18, true );
        });
});

describe('MidiUtil getFlattened note returns a string with the flattened note name', () => {
    it('f# should be gb', () => {
        const result = MidiUtil.getFlattenedName('f#');
        expect(result).to.equal('gb');
    });
    it('gb should be gb', () => {
        const result = MidiUtil.getFlattenedName('gb');
        expect(result).to.equal('gb');
    });
});

describe('MidiUtil midiPitchFromNote note returns a midi pitch from the note name', () => {
    it('invalid note should return the default 60', () => {
        const result = MidiUtil.midiPitchFromNote('f#');
        expect(result).to.equal(60);
    });
    it('d4 should be 62', () => {
        const result = MidiUtil.midiPitchFromNote('d4');
        expect(result).to.equal(62);
    });
    it('d#4 should be 63', () => {
        const result = MidiUtil.midiPitchFromNote('d#4');
        expect(result).to.equal(63);
    });
    it('db4 should be 61', () => {
        const result = MidiUtil.midiPitchFromNote('db4');
        expect(result).to.equal(61);
    });
});

describe('MidiUtil ensureMidiPitch note returns a midi pitch from the note name or number', () => {
    it('invalid note should return the default 60', () => {
        const result = MidiUtil.ensureMidiPitch('zz3');
        expect(result).to.equal(60);
    });
    it('d4 should be 62', () => {
        const result = MidiUtil.ensureMidiPitch('d4');
        expect(result).to.equal(62);
    });
    it('d#4 should be 63', () => {
        const result = MidiUtil.ensureMidiPitch('d#4');
        expect(result).to.equal(63);
    });
    it('db4 should be 61', () => {
        const result = MidiUtil.ensureMidiPitch('db4');
        expect(result).to.equal(61);
    });
    it('"65" should be 65', () => {
        const result = MidiUtil.ensureMidiPitch('65');
        expect(result).to.equal(65);
    });
    it('65 should be 65', () => {
        const result = MidiUtil.ensureMidiPitch(65);
        expect(result).to.equal(65);
    });
});
describe('MidiUtil noteFromMidiPitch returns a node from a midi pitch, flattened or not', () => {
    it('60 should return c4', () => {
        const result = MidiUtil.noteFromMidiPitch(60,false);
        expect(result).to.equal('c4');
    });
    it('60 should return c4 even with flattened flag', () => {
        const result = MidiUtil.noteFromMidiPitch(60,true);
        expect(result).to.equal('c4');
    });
    it('61 should be c#4', () => {
        const result = MidiUtil.noteFromMidiPitch(61, false);
        expect(result).to.equal('c#4');
    });
    it('61 should be db4 if flattened', () => {
        const result = MidiUtil.noteFromMidiPitch(61, true);
        expect(result).to.equal('db4');
    });
});

describe('MidiUtil bpmFromMpqn returns the tempo in bpm from a number array', () => {
    let mnpq120 = [7,161,32];
    let mnpq60000 = [3,232,0];
    it('should reverse what mpqnFromBpm does (3 significant bytes)', () => {
        const result = MidiUtil.bpmFromMpqn(mnpq120);
        expect(result).to.equal(120);
    });
    it('should reverse what mpqnFromBpm does (2 significant bytes)', () => {
        const result = MidiUtil.bpmFromMpqn(mnpq60000);
        expect(result).to.equal(60000);
    });
});
