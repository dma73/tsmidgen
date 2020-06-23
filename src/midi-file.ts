import { MidiTrack } from './midi-track';
import { MidiUtil } from './midi-util';
import { TrackParser } from './track-parser';
import { FileParser } from './file-parser';

/* ******************************************************************
 * MidiFile class
 ****************************************************************** */
export class MidiFile {
	public static readonly HDR_CHUNKID = 'MThd';             // File magic cookie
	public static readonly HDR_CHUNK_SIZE = '\x00\x00\x00\x06'; // Header length for SMF
	public static readonly HDR_TYPE0 = '\x00\x00';         // Midi Type 0 id
	public static readonly HDR_TYPE1 = '\x00\x01';         // Midi Type 1 id
	public static readonly TICK_ERROR = 'Ticks per beat must be an integer between 1 and 32767!';
	public static readonly DEFAULT_TICKS = 128;
	private ticks: number = MidiFile.DEFAULT_TICKS;
	private tracks: MidiTrack[] = [];

	/**
	 * Construct a file object.
	 *
	 * Parameters include:
	 *  - ticks [optional number] - Number of ticks per beat, defaults to 128.
	 *    Must be 1-32767.
	 *  - tracks [optional array] - Track data.
	 */
	constructor(config?: MidiFile) {
		if (config) {
			this.setTicks(config.ticks);
			this.setTracks (config.tracks);
		}
	}
	checkTicks(ticks: number): boolean {
		this.checkAbove(ticks, 0, MidiFile.TICK_ERROR);
		this.checkBelow(ticks, 32768, MidiFile.TICK_ERROR);
		this.checkInteger(ticks, MidiFile.TICK_ERROR);
		return true;
	}
	checkAbove(value: number, limit: number, err: string): boolean {
		if (value <= limit)	throw new Error(err);
		return true;
	}
	checkBelow(value: number, limit: number, err: string): boolean{
		if (value >= limit)	throw new Error(err);
		return true;
	}
	checkInteger(value: number, err: string): boolean{
		if (value % 1 !== 0) throw new Error(err);
		return true;
	}
	/**
	 * Add a track to the file.
	 *
	 * @param {Track} track - The track to add.
	 */
	addTrack(track?: MidiTrack): MidiTrack {
		if (track) {
			this.tracks.push(track);
		} else {
			track = new MidiTrack();
			this.tracks.push(track);
		}
		return track;
	};

	/**
	 * Serialize the MIDI file to an array of bytes converted to string.
	 *
	 * @returns {string} String conversion of bytes.
	 */
	toBytes(): string {
		let trackCount = this.getTrackCount();
		// prepare the file header
		let bytes = MidiFile.HDR_CHUNKID + MidiFile.HDR_CHUNK_SIZE;
		let fileType = MidiFile.HDR_TYPE0;
		// set Midi type based on number of tracks
		if (parseInt(trackCount, 16) > 1) fileType = MidiFile.HDR_TYPE1;
		bytes += fileType;
		// add the number of tracks (2 bytes)
		bytes += MidiUtil.codes2Str(MidiUtil.str2Bytes(trackCount, 2));
		// add the number of ticks per beat (currently hardcoded)
		bytes += String.fromCharCode((this.ticks / 256), this.ticks % 256);
		// iterate over the tracks, converting to bytes too
		this.tracks.forEach((track) => {
			bytes += MidiUtil.codes2Str(track.toBytes());
		});

		return bytes;
	};
	public getTrackCount(): string {
		let trackCount = 0;
		this.tracks.forEach((track) => {
			if (track.isNotEmpty()) trackCount++;
		});
		return trackCount.toString();
	}

	public setTicks(ticks: number){
		this.checkTicks(ticks);
		this.ticks = ticks; 
	}
	public setTracks(tracks: MidiTrack[]|undefined) :boolean{
		let rv = false;
		if (tracks){
			this.tracks = tracks;
			rv = true;
		}
		return rv;
	}
	public getTicks(): number {
		return this.ticks;
	}
	public getTracks(): MidiTrack[]{
		return this.tracks;
	}
	static fromBytes(bytes: Buffer): MidiFile {
		const fileParser = new FileParser(bytes);
		let file = fileParser.parseFile();
		return file;
	};

}