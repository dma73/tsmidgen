import { expect } from 'chai';
import {describe, it} from 'mocha'
import { MetaEvent } from '../src/meta-event';

describe('MetaEvent: toBytes()', () => {
    it('data type : number array', () => {
        let metaEvent = new MetaEvent({time:0,type:MetaEvent.COPYRIGHT,data:[10,20,30,40,50,60]});
        let hex = toHexString(metaEvent.toBytes());
        expect(hex).to.equal('00 ff 02 06 0a 14 1e 28 32 3c ');
    });
    it('data type : number', () => {
        let metaEvent = new MetaEvent({time:0,type:MetaEvent.COPYRIGHT,data:10030});
        let hex = toHexString(metaEvent.toBytes());
        expect(hex).to.equal('00 ff 02 01 272e ');
    });
    it('data type : number[]', () => {
        let metaEvent = new MetaEvent({time:0,type:MetaEvent.COPYRIGHT,data:[10030]});
        let hex = toHexString(metaEvent.toBytes());
        expect(hex).to.equal('00 ff 02 01 272e ');
    });
    it('data type : string', () => {
        let metaEvent = new MetaEvent({time:0,type:MetaEvent.COPYRIGHT,data:'zdiugd'});
        let hex = toHexString(metaEvent.toBytes());
        expect(hex).to.equal('00 ff 02 06 7a 64 69 75 67 64 ');
    });
    it('data type: undefined', () => {
        let metaEvent = new MetaEvent({time:0,type:MetaEvent.COPYRIGHT});
        let hex = toHexString(metaEvent.toBytes());
        expect(hex).to.equal('00 ff 02 00 ');
    });
});

describe('MetaEvent: Constructor()', () => {
    it('time : should be zero if not specified', () => {
        let metaEvent = new MetaEvent({});
        const result = toHexString(metaEvent.time);
        expect(result).to.equal('00 ');
    });
    it('time : should be a variable size midi time', () => {
        let metaEvent = new MetaEvent({time:127});
        const result = toHexString(metaEvent.time);
        expect(result).to.equal('7f ');
    });
});
describe('MetaEvent: toBytes()', () => {
    it('type : should be specified', () => {
        let metaEvent = new MetaEvent({time:0});
        expect(() => metaEvent.toBytes()).to.throw('Type for meta-event not specified.');
    });
});



function toHexString(input: number[]):string{
    let hex = '';
    input.forEach((value) => {
        hex += (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16)) + ' ';
    });
    return hex;
} 