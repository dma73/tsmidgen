import { CommonEvent } from "./common-event";

export class MidiEvent extends CommonEvent {
	// event codes
	public static readonly NOTE_OFF = 0x80;
	public static readonly NOTE_ON = 0x90;
	public static readonly AFTER_TOUCH = 0xA0;
	public static readonly CONTROLLER = 0xB0;
	public static readonly PROGRAM_CHANGE = 0xC0;
	public static readonly CHANNEL_AFTERTOUCH = 0xD0;
	public static readonly PITCH_BEND = 0xE0;

	channel: number = 1;
	param1: number | undefined;
	param2: number | undefined;
	// Stores the number of parameters per event
	private eventTypes: Map<number, number> = new Map<number, number>();
	constructor(type: number, time: number, channel: number, param1: number, param2: number) {
		super();
		this.populateEventTypes();
		this.setTime(time);
		this.setType(type);
		this.setChannel(channel);
		this.setParam1(param1);
		this.setParam2(param2);

	};

	private populateEventTypes() {
		this.eventTypes.set(MidiEvent.PROGRAM_CHANGE, 1);
		this.eventTypes.set(MidiEvent.CHANNEL_AFTERTOUCH, 1);
		this.eventTypes.set(MidiEvent.NOTE_ON, 2);
		this.eventTypes.set(MidiEvent.NOTE_OFF, 2);
		this.eventTypes.set(MidiEvent.CONTROLLER, 2);
		this.eventTypes.set(MidiEvent.AFTER_TOUCH, 2);
		this.eventTypes.set(MidiEvent.PITCH_BEND, 2);
	}

	/**
	 * Set the type of the event. Must be one of the event codes on MidiEvent.
	 *
	 * @param {number} type - Event type.
	 */
	setType(type: number) {

		if (!this.isValidType(type)) {
			throw new Error("Trying to set an unknown event: " + type);
		}
		this.type = type;
	};
	isValidType(type: number): boolean {
		return this.eventTypes.get(type) !== undefined;
	}
	/**
	 * Set the channel for the event. Must be between 0 and 15, inclusive.
	 *
	 * @param {number} channel - The event channel.
	 */
	setChannel(channel: number) {
		if (channel < 0 || channel > 15) {
			throw new Error("Channel is out of bounds.");
		}
		this.channel = channel;
	};

	/**
	 * Set the first parameter for the event. Must be between 0 and 255,
	 * inclusive.
	 *
	 * @param {number} p - The first event parameter value.
	 */
	setParam1(p: number) {
		this.param1 = p;
	};

	/**
	 * Set the second parameter for the event. Must be between 0 and 255,
	 * inclusive.
	 *
	 * @param {number} p - The second event parameter value.
	 */
	setParam2(p: number) {
		this.param2 = p;
	};

	/**
	 * Serialize the event to an array of bytes.
	 *
	 * @returns {Array} The array of serialized bytes.
	 */
	toBytes(): number[] {
		var byteArray: number[] = [];
		var typeChannelByte = this.getTypeChannelByte();
		byteArray.push.apply(byteArray, this.time);
		byteArray.push(typeChannelByte);
		MidiEvent.pushIfNotNullOrUndefined(this.param1, byteArray);
		MidiEvent.pushIfNotNullOrUndefined(this.param2, byteArray);

		return byteArray;
	};
	static pushIfNotNullOrUndefined(arg: number | undefined | null, byteArray: number[]) {
		if (arg !== undefined && arg !== null) {
			byteArray.push(arg);
		}
	}

	private getTypeChannelByte() {
		// first 4 bits contain the type
		// next 4 bits contain the channel coded as follows: channels 1 to 15 are 1 to 15, channel 16 is 0
		return this.type | (this.channel & 0xF);
	}
}
