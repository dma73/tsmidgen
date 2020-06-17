import { expect } from 'chai';
import { describe, it} from 'mocha'
import { MidiTrack } from '../src/midi-track';
import { TrackParser } from '../src/track-parser';

describe('TrackParser: constructor', () => {
    let tp = new TrackParser(createTestBuffer());
    it('buffer should not be empty', () => {
        const result = tp.getBuffer !== undefined;
        expect(result).to.equal(true);
    });
    it('offset should start at 0', () => {
        const result = tp.getBuffer !== undefined;
        expect(result).to.equal(true);
    });
    let track = tp.parse();
    it('track should contain events', () => {
        const result = track.isEmpty();
        expect(result).to.equal(false);
    });
});

function createTestBuffer(): Buffer{
    let mt: MidiTrack = new MidiTrack();
    mt.addArpeggiatedChord(1, ['c4','e4', 'a4','c5'], 200, 5, 10, false, 90);
    let buffer = new Buffer(mt.toBytes().slice(4));
    return buffer
}