import { MidiTime } from "./midi-time";
import { CommonEvent } from "./common-event";
import { MetaEvent } from "./meta-event";
import { MidiEvent } from "./midi-event";

export class TrackParser {
    extractRawTime(buffer: Buffer): number[]{
		let rawTime: number[] = [];
		let byte = buffer.readInt8();
		rawTime.push(byte);
		while (byte > 127){
			byte = buffer.readInt8(rawTime.length);
			rawTime.push(byte);
		}
		buffer.slice(rawTime.length);
		return rawTime;
	}
	extractEvent(buffer: Buffer): CommonEvent{
        let event: CommonEvent;
        let seqNum: number = this.extractSeqNum(buffer); 
		let rawTime = this.extractRawTime(buffer);
        let time = new MidiTime(rawTime);
        if (buffer.readInt8() === 0xFF) {
            event = this.extractMetaEvent(buffer, time.getTicks());
        } else {
            event = this.extractMidiEvent(buffer, time.getTicks());
        }
		return event;
    }
    extractMetaEvent(buffer: Buffer, time: number): MetaEvent{
        const type = buffer.readInt8(1);
        const data: number[] = [];
        if (type > 0 && type < 8){
            let size = buffer.readInt32BE(2);
            for (let i = 0;i < size; i++){
                data.push(buffer.readInt8(6 + i));
                buffer.slice(6+i);
            } 
        }

        return new MetaEvent({time:time, type:type, data:data })

    }
    extractMidiEvent(buffer: Buffer, time: number): MidiEvent{
        return new MidiEvent(MidiEvent.NOTE_ON,0,1,60, 60);
    }
    extractSeqNum(buffer: Buffer): number{
        let rv = 0;
        if (buffer.readInt8() === 0xFF && buffer.readInt8(1) === 0x00){
            rv = buffer.readUInt16LE(3);
            buffer.slice(5);
        }
        return rv;
    }

}
