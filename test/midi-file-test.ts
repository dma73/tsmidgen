import { expect } from 'chai';
import { MidiFile } from '../src/midi-file';
import { describe, it } from 'mocha'
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
    it('DEFAULT_TICKS should be 128', () => {
        const result = MidiFile.DEFAULT_TICKS;
        expect(result).to.equal(128);
    });
});

describe('MidiFile: empty constructor', () => {
    let midiFile = new MidiFile();
    it('tracks should be empty', () => {
        const result = midiFile.getTracks();
        expect(result.length).to.equal(0);
    });
    it('ticks should be defaulted to MidiFile.DEFAULT_TICKS', () => {
        const result = midiFile.getTicks();
        expect(result).to.equal(MidiFile.DEFAULT_TICKS);
    });
    it('should be able to add an empty track', () => {
        midiFile.addTrack();
        const result = midiFile.getTracks().length;
        expect(result).to.equal(1);
    });
    it('should be able to add an exisiting track', () => {
        const track = new MidiTrack();
        midiFile.addTrack(track);
        expect(midiFile.getTracks().length).to.equal(2);
        expect(midiFile.getTracks()[1]).to.equal(track);
    });
});
describe('MidiFile: constructor', () => {
    let midiFile = new MidiFile();
    midiFile.setTicks(200);
    const track = new MidiTrack();
    midiFile.addTrack(track);
    let midiFile2 = new MidiFile(midiFile);
    it('tracks should not be empty', () => {
        expect(midiFile2.getTracks().length).to.equal(midiFile.getTracks().length);
    });
    it('ticks should be the same value as passed midifile', () => {
        expect(midiFile2.getTicks()).to.equal(midiFile.getTicks());
        expect(midiFile2.getTicks()).to.equal(200);
    });

    it('tracks should not be copied if', () => {
        let midiFile = new MidiFile();
        midiFile.setTicks(200);
        const track = new MidiTrack();
        midiFile.addTrack(track);
        let midiFile2 = new MidiFile(midiFile);
        expect(midiFile2.getTracks().length).to.equal(midiFile.getTracks().length);
    });
});
describe('MidiFile: checkTicks - Ticks per beat must be an integer between 1 and 32767', () => {
    let midiFile = new MidiFile();
    it('Valid should not throw exception', () => {
        expect(midiFile.checkTicks(10000)).to.be.true;
    })
})
describe('MidiFile: checkAbove - Value should be above limit', () => {
    let midiFile = new MidiFile();
    it('Lower than 1 must throw exception', () => {
        expect(() => midiFile.checkAbove(0, 0, MidiFile.TICK_ERROR)).to.throw(MidiFile.TICK_ERROR);
    })
    it('Valid should not throw exception', () => {
        expect(midiFile.checkAbove(10000, 0, MidiFile.TICK_ERROR)).to.be.true;
    })
})
describe('MidiFile: checkBelow - value must be below limit, otherwise throw error', () => {
    let midiFile = new MidiFile();
    it('Greater than 32767  must throw exception', () => {
        expect(() => midiFile.checkBelow(32768, 32768, MidiFile.TICK_ERROR)).to.throw(MidiFile.TICK_ERROR);
    })
    it('Valid should not throw exception', () => {
        expect(midiFile.checkBelow(10000, 32768, MidiFile.TICK_ERROR)).to.be.true;
    })
})
describe('MidiFile: checkInteger - value should be an integer otherwise throw error', () => {
    let midiFile = new MidiFile();
    it('Non integer must throw exception', () => {
        expect(() => midiFile.checkInteger(10.554, MidiFile.TICK_ERROR)).to.throw(MidiFile.TICK_ERROR);
    })
    it('Valid should not throw exception', () => {
        expect(midiFile.checkTicks(10000)).to.be.true;
    })
})
describe('MidiFile: setTicks - should only change the value if valid', () => {
    it('Invalid value should not be accepted', () => {
        let midiFile = new MidiFile();
        try {
            midiFile.setTicks(-2);
        } catch { }
        expect(midiFile.getTicks()).to.equal(MidiFile.DEFAULT_TICKS);
    })
    it('Valid value should be accepted', () => {
        let midiFile = new MidiFile();
        midiFile.setTicks(256);
        expect(midiFile.getTicks()).to.equal(256);
    })
})

describe('MidiFile: toBytes - should only change the value if valid', () => {
    it('single track', () => {
        let midiFile = getSampleFile(1);
        let hex = toHexString(midiFile.toBytes());
        expect(hex).to.equal('4d 54 68 64 00 00 00 06 00 00 00 01 00 80 4d' +
            ' 54 72 6b 00 00 00 0d 00 91 3c 50 81 00 81 3c 50 00 ff 2f 00 ');
    })
    it('two tracks', () => {
        let midiFile = getSampleFile(2);
        let hex = toHexString(midiFile.toBytes());
        expect(hex).to.equal('4d 54 68 64 00 00 00 06 00 01 00 02 00 80 4d' +
            ' 54 72 6b 00 00 00 0d 00 91 3c 50 81 00 81 3c 50 00 ff 2f 00 4d 54' +
            ' 72 6b 00 00 00 0d 00 91 3c 50 81 00 81 3c 50 00 ff 2f 00 ');
    })
})
describe('MidiFile: fromBytes - reimporting exported file should return the same midi file', () => {
    it('single track file', () => {
        let midiFile = getSampleFile(1);
        let bytes = midiFile.toBytes();
        let hex = toHexString(bytes);
        let midiFile2 = MidiFile.fromBytes(Buffer.from(bytes, 'binary'));
        let hex2 = toHexString(midiFile2.toBytes());
        expect(hex2).to.equal(hex);
    })
})
describe('MidiFile: getTrackCount() - Empty tracks should not be taken into account', () => {

    it('2 Filled tracks and Two Empty tracks should return 2', () => {
        let midiFile = getSampleFileWithEmptyTracks(2, 2);
        expect(midiFile.getTrackCount()).to.equal('2');
    })
})
describe('MidiFile: setTracks() - Should copy tracks if there are tracks', () => {

    it('Undefined, should not do anything', () => {
        let midiFile = getSampleFileWithEmptyTracks(2, 2);
        midiFile.setTracks(undefined);
        expect(midiFile.getTrackCount()).to.equal('2');
    })
    it('Empty Array, should clear the tracks', () => {
        let midiFile = getSampleFileWithEmptyTracks(2, 2);
        midiFile.setTracks([]);
        expect(midiFile.getTrackCount()).to.equal('0');
    })
})
function getSampleFile(tracks: number): MidiFile {
    return getSampleFileWithEmptyTracks(tracks, 0);
}
function getSampleFileWithEmptyTracks(tracks: number, emptyTracks: number): MidiFile {
    let midiFile = new MidiFile();
    let track = new MidiTrack();
    track.addNote(1, 60, 128, 0, 80);
    while (tracks > 0) {
        midiFile.addTrack(track);
        tracks--;
    }
    while (emptyTracks > 0) {
        midiFile.addTrack(new MidiTrack());
        emptyTracks--;
    }
    return midiFile;
}
function toHexString(input: string): string {
    let hex = '';
    Buffer.from(input, 'binary').forEach((value) => {
        hex += (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16)) + ' ';
    });
    return hex;
} 