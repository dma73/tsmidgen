import { CommonEvent } from "./common-event";

export interface MetaEventParm {
	time?: number;
	type?: number;
	data?: string|Array<number>|number;
}
export class MetaEvent extends CommonEvent {

    public static readonly SEQUENCE   = 0x00;
	public static readonly TEXT       = 0x01;
	public static readonly COPYRIGHT  = 0x02;
	public static readonly TRACK_NAME = 0x03;
	public static readonly INSTRUMENT = 0x04;
	public static readonly LYRIC      = 0x05;
	public static readonly MARKER     = 0x06;
	public static readonly CUE_POINT  = 0x07;
	public static readonly CHANNEL_PREFIX = 0x20;
	public static readonly END_OF_TRACK   = 0x2f;
	public static readonly TEMPO      = 0x51;
	public static readonly SMPTE      = 0x54;
	public static readonly TIME_SIG   = 0x58;
	public static readonly KEY_SIG    = 0x59;
    public static readonly SEQ_EVENT  = 0x7f;
    time: Array<number> = new Array<number>();
    type: number = MetaEvent.SEQUENCE;
    data: string|Array<number>|number|undefined;

    /* ******************************************************************
	 * MetaEvent class
	 ****************************************************************** */

	/**
	 * Construct a meta event.
	 *
	 * Parameters include:
	 *  - time [optional number] - Ticks since previous event.
	 *  - type [required number] - Type of event.
	 *  - data [optional array|string] - Event data.
	 */
	constructor(params: MetaEventParm) {
		super();
		let time = 0;
		if (params.time) time = params.time;
		this.setTime(time);
		this.setType(params.type);
		this.setData(params.data);
	};

	/**
	 * Set the type of the event. Must be one of the event codes on MetaEvent.
	 *
	 * @param {number} t - Event type.
	 */
	setType (t: number | undefined) {
		if (t) this.type = t;
	};

	/**
	 * Set the data associated with the event. May be a string or array of byte
	 * values.
	 *
	 * @param {string|Array<number>} d - Event data.
	 */
	setData (d: string|Array<number> | number | undefined) {
		this.data = d;
	};

	/**
	 * Serialize the event to an array of bytes.
	 *
	 * @returns {Array} The array of serialized bytes.
	 */
	toBytes () {
		if (!this.type) {
			throw new Error("Type for meta-event not specified.");
		}

		var byteArray: number[] = [];
		byteArray.push.apply(byteArray, this.time);
		byteArray.push(0xFF, this.type);

		// If data is an array, we assume that it contains several bytes. We
		// apend them to byteArray.
		this.pushData(byteArray);

		return byteArray;
	};


	private pushData(byteArray: number[]) {
		this.pushByteArray(byteArray);
		this.pushNumber(byteArray);
		this.pushString(byteArray);
		if (this.data === undefined){
			byteArray.push(0);
		}
	}

	private pushString(byteArray: number[]) {
		if (typeof this.data === 'string') {
			byteArray.push(this.data.length);
			var dataBytes = this.data.split('').map(function (x) { return x.charCodeAt(0); });
			byteArray.push.apply(byteArray, dataBytes);
		}
	}

	private pushNumber(byteArray: number[]) {
		if (typeof this.data === 'number') {
			byteArray.push(1, this.data);
		}
	}

	private pushByteArray(byteArray: number[]) {
		if (Array.isArray(this.data)) {
			byteArray.push(this.data.length);
			byteArray.push.apply(byteArray, this.data);
		}
	}
}

