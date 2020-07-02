import { expect } from 'chai';
import { MidiUtil } from '../src/midi-util';
import {describe, it} from 'mocha'
import { MidiTime } from '../src/midi-time';

describe('MidiTime getTicks should do the opposite of translate tick time', () => {
    it('if input smaller than 128 should return the same value', () => {
        const result = MidiUtil.translateTickTime(127);
        let mt = new MidiTime(result);
        expect(mt.getTicks()).to.equal(127);
    });
    it('if greater than 127 should return the same value', () => {
        const result = MidiUtil.translateTickTime(140);
        let mt = new MidiTime(result);
        expect(mt.getTicks()).to.equal(140);
    });
    it('if equal to 10,000 should return the same value', () => {
        const result = MidiUtil.translateTickTime(10000);
        let mt = new MidiTime(result);
        expect(mt.getTicks()).to.equal(10000);
    });
});
