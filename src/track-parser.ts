import { MidiTime } from "./midi-time";
import { CommonEvent } from "./common-event";
import { MetaEvent } from "./meta-event";
import { MidiEvent } from "./midi-event";
import { MidiTrack } from "./midi-track";

export class TrackParser {
    private offset = 0;
    private buffer: Buffer;
    private eventTypes: Map<number,number> = new Map<number,number>();
    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.eventTypes.set(MidiEvent.PROGRAM_CHANGE,1);
        this.eventTypes.set(MidiEvent.CHANNEL_AFTERTOUCH,1);
        this.eventTypes.set(MidiEvent.NOTE_ON,2);
        this.eventTypes.set(MidiEvent.NOTE_OFF,2);
        this.eventTypes.set(MidiEvent.CONTROLLER,2);
        this.eventTypes.set(MidiEvent.AFTER_TOUCH,2);
        this.eventTypes.set(MidiEvent.PROGRAM_CHANGE,1);
        this.eventTypes.set(MidiEvent.PITCH_BEND,2);
    } 
    public readUInt8(): number{
        const int8 = this.buffer.readUInt8(this.offset);
        this.offset ++;
        return int8;       
    }
    public getBuffer(): Buffer {
        return this.buffer;
    }
    public getOffset(): number{
        return this.offset;
    }
    public peekUInt8(pos: number): number{
        const int8 = this.buffer.readUInt8(this.offset + pos);
        return int8;       
    }
    public readUInt32(): number{
        const int32 = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return int32;       
    }
    extractRawTime(): number[]{
		let rawTime: number[] = [];
		let byte = this.readUInt8();
        rawTime.push(byte);
        let i = 0;
		while (byte > 127 && i < 10){
			byte = this.readUInt8();
			rawTime.push(byte);
        }
        return rawTime;
	}
	extractEvent(): CommonEvent|undefined{
        try{
        let event: CommonEvent;
        let seqNum: number = this.extractSeqNum(this.buffer); 
        let rawTime = this.extractRawTime();
        let time = new MidiTime(rawTime);
        const firstByte = this.readUInt8();
        if (firstByte === 0xFF) {
            event = this.extractMetaEvent(time.getTicks());
        } else {
            event = this.extractMidiEvent(firstByte, time.getTicks());
        }
        return event;
    } catch {
        return undefined;
    }
    }
    extractMetaEvent(time: number): MetaEvent{
        const type = this.readUInt8();
        const data: number[] = [];
        if ((type > 0 && type < 8) || type === 33){
            let size = this.readUInt8();
            for (let i = 0;i < size; i++){
                data.push(this.readUInt8());
            } 
        }

        return new MetaEvent({time:time, type:type, data:data })

    }
    extractMidiEventData(type: number): number[]{
        let rv = [];
        let size = this.eventTypes.get(type);
        if (!size) size = 0;
        while (size > 0){
            rv.push(this.readUInt8());
            size --;
        }
        while (rv.length < 2){
            rv.push(0);
        }
        return rv;
    }
    extractMidiEvent(firstByte: number, time: number): MidiEvent{
        let type = (firstByte & 0xf0);
        const channel = firstByte & 0x0f;
        const data = this.extractMidiEventData(type);
        if (data[0] === 0){
            console.log('ignore type:', type);
            type = 0xF0;
        }
        return new MidiEvent(type,time,channel,data[0],data[1]);
    }
    extractSeqNum(buffer: Buffer): number{
        let rv = 0;
        if (buffer.readInt8(this.offset) === 0xFF && buffer.readInt8(this.offset + 1) === 0x00){
            rv = buffer.readUInt16LE(this.offset +3);
            this.offset+= 5;
        }
        return rv;
    }
    reset() {
        this.offset = 0;
    }
    public parse(): MidiTrack{
        let track = new MidiTrack();
		let size = this.readUInt32();
		//console.log('size', size);
		if (size > 4){
			let evt: CommonEvent|undefined = this.extractEvent();
			while (evt){
				if (evt.type !== MidiEvent.IGNORE){
					track.addEvent(evt);
					//console.log('event',evt);
				}
				evt = this.extractEvent();
			}
        }
        return track;
    }
}
