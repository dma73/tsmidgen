import { MidiUtil } from "./midi-util";

export abstract class CommonEvent {
    time: Array<number> = new Array<number>();
    type: number = 0;
    	/**
	 * Set the time for the event in ticks since the previous event.
	 *
	 * @param {number} ticks - The number of ticks since the previous event. May
	 * be zero.
	 */
	setTime(ticks: number) {
		this.time = MidiUtil.translateTickTime(ticks || 0);
    };
    abstract setType(type: number): void;
    abstract toBytes () : number[];
}