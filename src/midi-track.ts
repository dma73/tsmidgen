import { MetaEvent } from "./meta-event";
import { MidiEvent } from "./midi-event";
import { MidiUtil } from "./midi-util";
import { TrackParser } from "./track-parser";
import { CommonEvent } from "./common-event";

export class MidiTrack {
    	/* ******************************************************************
	 * Track class
	 ****************************************************************** */
	public static readonly START_BYTES = [0x4d, 0x54, 0x72, 0x6b];
    public static readonly END_BYTES   = [0x00, 0xFF, 0x2F, 0x00];
    private events: Array<CommonEvent> = [];
	/**
	 * Construct a MIDI track.
	 *
	 * Parameters include:
	 *  - events [optional array] - Array of events for the track.
	 */
	constructor(config?: MidiTrack ) {
		if (config){
            if (config.events){
                this.events = config.events;
            }
        }
	}

	/**
	 * Add an event to the track.
	 *
	 * @param {CommonEvent} event - The event to add.
	 * @returns {Track} The current track.
	 */
	addEvent(event: CommonEvent) {
		this.events.push(event);
		return this;
	};

	/**
	 * Add a note-on event to the track.
	 *
	 * @param {number} channel - The channel to add the event to.
	 * @param {number|string} pitch - The pitch of the note, either numeric or
	 * symbolic.
	 * @param {number} [time=0] - The number of ticks since the previous event,
	 * defaults to 0.
	 * @param {number} [velocity=90] - The volume for the note, defaults to
	 * DEFAULT_VOLUME.
	 * @returns {Track} The current track.
	 */
    noteOn(channel: number, pitch: string | number, time?: number, velocity?: number) {
        return this.addNoteOn(channel, pitch, time, velocity);
    }
	addNoteOn(channel: number, pitch: string | number, time?: number, velocity?: number) {
		let p = MidiUtil.ensureMidiPitch(pitch);
		if (p===undefined){
			p = 60;
			velocity = 0;
		}
		this.events.push(new MidiEvent(MidiEvent.NOTE_ON, time || 0,
			channel, p, velocity || MidiUtil.DEFAULT_VOLUME));
		return this;
	};

	/**
	 * Add a note-off event to the track.
	 *
	 * @param {number} channel - The channel to add the event to.
	 * @param {number|string} pitch - The pitch of the note, either numeric or
	 * symbolic.
	 * @param {number} [time=0] - The number of ticks since the previous event,
	 * defaults to 0.
	 * @param {number} [velocity=90] - The velocity the note was released,
	 * defaults to DEFAULT_VOLUME.
	 * @returns {Track} The current track.
	 */
    noteOff(channel: number, pitch: string | number, time?: number, velocity?: number){
        return this.addNoteOff(channel, pitch, time, velocity);
    }
	addNoteOff(channel: number, pitch: string | number, time?: number, velocity?: number) {
		this.events.push(new MidiEvent(MidiEvent.NOTE_OFF,time || 0,channel,
			MidiUtil.ensureMidiPitch(pitch),velocity || MidiUtil.DEFAULT_VOLUME,));
		return this;
	};

	/**
	 * Add a note-on and -off event to the track.
	 *
	 * @param {number} channel - The channel to add the event to.
	 * @param {number|string} pitch - The pitch of the note, either numeric or
	 * symbolic.
	 * @param {number} dur - The duration of the note, in ticks.
	 * @param {number} [time=0] - The number of ticks since the previous event,
	 * defaults to 0.
	 * @param {number} [velocity=90] - The velocity the note was released,
	 * defaults to DEFAULT_VOLUME.
	 * @returns {Track} The current track.
	 */
	addNote(channel: number, pitch: string | number, dur?: number, time?: number, velocity?: number) {
		this.noteOn(channel, pitch, time, velocity);
		if (dur) {
			this.noteOff(channel, pitch, (time || 0) + (dur || 0), velocity);
		}
		return this;
    };
    note(channel: number, pitch: string | number, dur?: number, time?: number, velocity?: number) {
		return this.addNote(channel,pitch, dur, time, velocity);
	};

	/**
	 * Add a note-on and -off event to the track for each pitch in an array of pitches.
	 *
	 * @param {number} channel - The channel to add the event to.
	 * @param {array} chord - An array of pitches, either numeric or
	 * symbolic.
	 * @param {number} dur - The duration of the chord, in ticks.
	 * @param {number} [velocity=90] - The velocity of the chord,
	 * defaults to DEFAULT_VOLUME.
	 * @returns {Track} The current track.
	 */
	addChord(channel: number, chord: Array<string | number>, dur?: number, time?: number, velocity?: number) {
		if (!Array.isArray(chord) || !chord.length) {
			throw new Error('Chord must be an array of pitches');
		}
		this.chordNotesOn(chord, channel, time, velocity);
		this.chordNotesOff(chord, channel, dur, velocity);
		return this;
	};
	addArpeggiatedChord(channel: number, chord: Array<string | number>, dur: number, time: number, delay: number, up: boolean, velocity: number) {
		if (!Array.isArray(chord) || !chord.length) {
			throw new Error('Chord must be an array of pitches');
		}
		this.arpeggiatedChordNotesOn(chord, channel, time, delay, up, velocity);
		this.chordNotesOff(chord, channel, dur, velocity);
		return this;
	};

	private chordNotesOff(chord: (string | number)[], channel: number, dur: number | undefined, velocity: number | undefined) {
		chord.forEach((note, index) => {
			if (index === 0) {
				this.noteOff(channel, note, dur, velocity);
			}
			else {
				this.noteOff(channel, note, 0, velocity);
			}
		}, this);
	}

	private chordNotesOn(chord: (string | number)[], channel: number, time: number | undefined, velocity: number | undefined) {
		chord.forEach((note, index) => {
			if (index === 0) {
				this.noteOn(channel, note, time, velocity);
			}
			else {
				this.noteOn(channel, note, 0, velocity);
			}
		});
	}
	private arpeggiatedChordNotesOn(chord: (string | number)[], channel: number, time: number | undefined, delay: number | undefined, up: boolean | undefined, velocity: number | undefined) {
		if ( up ){
			chord = chord.reverse()
		}
		chord.forEach((note, index) => {
			if (index === 0) {
				this.noteOn(channel, note, time, velocity);
			}
			else {
				this.noteOn(channel, note, delay, velocity);
			}
		});
	}

    chord(channel: number, chord: Array<string | number>, dur?: number, time?: number, velocity?: number) {
    return this.addChord(channel, chord, dur, time, velocity);
    }
	/**
	 * Set instrument for the track.
	 *
	 * @param {number} channel - The channel to set the instrument on.
	 * @param {number} instrument - The instrument to set it to.
	 * @param {number} [time=0] - The number of ticks since the previous event,
	 * defaults to 0.
	 * @returns {Track} The current track.
	 */
	setInstrument(channel: number, instrument: number, time?: number) {
		this.events.push(new MidiEvent(MidiEvent.PROGRAM_CHANGE,
			time || 0, channel, instrument, 0));
		return this;
    };
    instrument(channel: number, instrument: number, time: number){
        this.setInstrument(channel, instrument, time);
    }

	/**
	 * Set the tempo for the track.
	 *
	 * @param {number} bpm - The new number of beats per minute.
	 * @param {number} [time=0] - The number of ticks since the previous event,
	 * defaults to 0.
	 * @returns {Track} The current track.
	 */
	setTempo(bpm: number, time?: number) {
		this.events.push(new MetaEvent({
			type: MetaEvent.TEMPO,
			data: MidiUtil.mpqnFromBpm(bpm),
			time: time || 0,
		}));
		return this;
    };
    tempo(bpm: number, time: number){
        return this.setTempo(bpm, time);
    }

	/**
	 * Serialize the track to an array of bytes.
	 *
	 * @returns {Array} The array of serialized bytes.
	 */
	toBytes() :number[] {
		var trackLength = 0;
		var eventBytes: number[] = [];
		var startBytes = MidiTrack.START_BYTES;
		var endBytes   = MidiTrack.END_BYTES;

		this.events.forEach((event) => {
            trackLength += this.addEventBytes(event, eventBytes);
        });

		// Add the end-of-track bytes to the sum of bytes for the track, since
		// they are counted (unlike the start-of-track ones).
		trackLength += endBytes.length;

		// Makes sure that track length will fill up 4 bytes with 0s in case
		// the length is less than that (the usual case).
		var lengthBytes = MidiUtil.str2Bytes(trackLength.toString(16), 4);

		return startBytes.concat(lengthBytes, eventBytes, endBytes);
    };
    addEventBytes(event: CommonEvent, eventBytes: number[]) :number {
        var bytes = event.toBytes();
        eventBytes.push.apply(eventBytes, bytes);
        return bytes.length;
    };
    bytes(): number[]{
        return this.toBytes();
	}
	static fromBytes(buffer: Buffer): MidiTrack{
		const tp = new TrackParser();
		let rv = new MidiTrack();
		let evt: CommonEvent = tp.extractEvent(buffer);
		rv.addEvent(evt);
		while (evt){
			rv.addEvent(evt);
			evt = tp.extractEvent(buffer);
		};
		return rv;
	}
}


