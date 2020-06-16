import { MidiTrack } from './midi-track';
import { MidiUtil } from './midi-util';

/* ******************************************************************
 * MidiFile class
 ****************************************************************** */
export class MidiFile {
	public static readonly HDR_CHUNKID = 'MThd';             // File magic cookie
	public static readonly HDR_CHUNK_SIZE = '\x00\x00\x00\x06'; // Header length for SMF
	public static readonly HDR_TYPE0 = '\x00\x00';         // Midi Type 0 id
	public static readonly HDR_TYPE1 = '\x00\x01';         // Midi Type 1 id
	ticks: number = 128;
	tracks: MidiTrack[] = [];

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
			if (config.ticks) {
				this.checkTicks(config.ticks);
				this.ticks = config.ticks;
			}
			if (config.tracks) {
				this.tracks = config.tracks;
			}
		}
	}
	checkTicks(ticks: number): boolean {
		if (ticks <= 0 || ticks >= (1 << 15) || ticks % 1 !== 0) {
			throw new Error('Ticks per beat must be an integer between 1 and 32767!');
		}
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
		var trackCount = this.tracks.length.toString(16);

		// prepare the file header
		var bytes = MidiFile.HDR_CHUNKID + MidiFile.HDR_CHUNK_SIZE;

		// set Midi type based on number of tracks
		if (parseInt(trackCount, 16) > 1) {
			bytes += MidiFile.HDR_TYPE1;
		} else {
			bytes += MidiFile.HDR_TYPE0;
		}

		// add the number of tracks (2 bytes)
		bytes += MidiUtil.codes2Str(MidiUtil.str2Bytes(trackCount, 2));
		// add the number of ticks per beat (currently hardcoded)
		bytes += String.fromCharCode((this.ticks / 256), this.ticks % 256);;

		// iterate over the tracks, converting to bytes too
		this.tracks.forEach(function (track) {
			bytes += MidiUtil.codes2Str(track.toBytes());
		});

		return bytes;
	};
	static fromBytes(bytes: Buffer): MidiFile {
		let file = new MidiFile();

		if (bytes.indexOf(MidiFile.HDR_CHUNKID)!=0){
			throw new Error('Invalid Midi File');
		}
		if (bytes.indexOf(MidiFile.HDR_CHUNK_SIZE)!=4){
			throw new Error('Invalid Midi File');
		}
		const filetype = bytes.readUInt16BE(8);	
		const nroftracks = bytes.readUInt16BE(10);
		file.ticks = bytes.readUInt16BE(12);
		let exit = false;
		console.log(filetype, nroftracks,file.ticks );
		let index2 : number|undefined = 0;
		while (!exit){
			let index = bytes.indexOf("MTrk", index2);
			index2 = bytes.indexOf("MTrk",index + 4);
			let index3 = bytes.indexOf(new Uint8Array(MidiTrack.END_BYTES),index);
			let trackData: Buffer;
			console.log('index', index, 'index2', index2, 'index3', index3 );

			if (index2 > index){
				trackData = bytes.subarray(index + 4,index3);
				console.log('not last','index', index, 'index2', index2 );
			} else {
				trackData = bytes.subarray(index + 4, index3);
				console.log('last','index', index, 'index2', index2 );
				exit = true;
			}
			console.log(trackData);
			let mt = MidiTrack.fromBytes(trackData);
			if (! mt.isEmpty()){
				file.addTrack(mt);
			}
		}
		console.log('added ',file.tracks.length,' tracks');
		return file;
	};
}