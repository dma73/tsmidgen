import { MidiTime } from "./midi-time";
import { CommonEvent } from "./common-event";
import { MetaEvent } from "./meta-event";
import { MidiEvent } from "./midi-event";
import { MidiTrack } from "./midi-track";

export class TrackParser {
    private offset = 0;
    private buffer: Buffer;
    private eventTypes: Map<number, number> = new Map<number, number>();
    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.eventTypes.set(MidiEvent.PROGRAM_CHANGE, 1);
        this.eventTypes.set(MidiEvent.CHANNEL_AFTERTOUCH, 1);
        this.eventTypes.set(MidiEvent.NOTE_ON, 2);
        this.eventTypes.set(MidiEvent.NOTE_OFF, 2);
        this.eventTypes.set(MidiEvent.CONTROLLER, 2);
        this.eventTypes.set(MidiEvent.AFTER_TOUCH, 2);
        this.eventTypes.set(MidiEvent.PITCH_BEND, 2);
    }
    public readUInt8(): number {
        const int8 = this.buffer.readUInt8(this.offset);
        this.offset++;
        return int8;
    }
    public getBuffer(): Buffer {
        return this.buffer;
    }
    public getOffset(): number {
        return this.offset;
    }
    public peekUInt8(pos: number): number {
        const int8 = this.buffer.readUInt8(this.offset + pos);
        return int8;
    }
    public readUInt32(): number {
        const int32 = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return int32;
    }
    extractRawTime(): number[] {
        let rawTime: number[] = [];
        let byte = this.readUInt8();
        rawTime.push(byte);
        while (byte > 127) {
            byte = this.readUInt8();
            rawTime.push(byte);
        }
        return rawTime;
    }
    private extractEvent() {
        let event: CommonEvent | undefined;
        let rawTime = this.extractRawTime();
        let time = new MidiTime(rawTime);
        const firstByte = this.readUInt8();
        if (firstByte === 0xFF) {
            event = this.extractMetaEvent(time.getTicks());
        }
        else {
            event = this.extractMidiEvent(firstByte, time.getTicks());
        }
        return event;
    }

    extractMetaEvent(time: number): MetaEvent | undefined {
        const type = this.readUInt8();
        let rv: MetaEvent | undefined = undefined;
        const data: number[] = [];
        let size = this.extractSize();
        for (let i = 0; i < size; i++) {
            data.push(this.readUInt8());
        }
        rv = new MetaEvent({ time: time, type: type, data: data });
        return rv;

    }
    extractSize(): number {
        let value = this.readUInt8();
        let byte = 0;
        if (value > 127) {
            value &= 0x7f;
            do {
                byte = this.readUInt8();
                value = (value << 7) + (byte & 0x7f);
            }
            while (byte > 127);
        }
        return (value);
    }
    extractMidiEventData(type: number): number[] {
        let rv = [];
        let size = this.eventTypes.get(type);
        if (!size) size = 0;
        while (size > 0) {
            rv.push(this.readUInt8());
            size--;
        }
        while (rv.length < 2) {
            rv.push(0);
        }
        return rv;
    }
    extractMidiEvent(firstByte: number, time: number): MidiEvent | undefined {
        let rv: MidiEvent | undefined = undefined;
        let type = this.getMidiEventType(firstByte);
        const channel = this.getMidiEventChannel(firstByte);
        const data = this.extractMidiEventData(type);
        if (data[0] === 0) {
            console.log('ignore type:', type);
            this.backOff();
        } else {
            rv = new MidiEvent(type, time, channel, data[0], data[1]);
        }
        return rv;
    }
    private getMidiEventChannel(firstByte: number) {
        return firstByte & 0x0f;
    }

    private getMidiEventType(firstByte: number) {
        return (firstByte & 0xf0);
    }

    reset() {
        this.offset = 0;
    }
    backOff(){
        this.offset = this.offset - 1;
    }
    public parse(): MidiTrack {
        let track = new MidiTrack();
        let size = this.readUInt32();
        if (size > 4) {
            this.parseTrackData(track);
        }
        return track;
    }

    private parseTrackData(track: MidiTrack) {
        let trackComplete = false;
        while (!trackComplete) {
            let evt: CommonEvent | undefined = this.extractEvent();
            if (evt) {
                if (evt.type === MetaEvent.END_OF_TRACK){
                    trackComplete = true;
                } else {
                    track.addEvent(evt);
                }
            }
        }
    }
}
