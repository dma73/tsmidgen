import { MidiFile } from "./midi-file";
import { MidiTrack } from "./midi-track";

export class FileParser {
	public static readonly ERROR_MSG = 'Invalid Midi File';
	private buffer: Buffer;
    constructor(buffer: Buffer) {
        this.buffer = buffer;
    } 
    public parseFile(): MidiFile {
		let file = new MidiFile();

		this.checkFileHeader();
		const filetype = this.buffer.readUInt16BE(8);	
		const nroftracks = this.buffer.readUInt16BE(10);
		file.ticks = this.buffer.readUInt16BE(12);
		let exit = false;
		console.log(filetype, nroftracks,file.ticks );
		let index2 : number|undefined = 0;
		while (!exit){
			let index = this.buffer.indexOf('MTrk', index2);
			index2 = this.buffer.indexOf('MTrk',index + 4);
			let index3 = this.buffer.indexOf(new Uint8Array(MidiTrack.END_BYTES),index);
			let trackData: Buffer;
            trackData = this.buffer.subarray(index + 4, index3);
            if (index2 <= index) exit = true;
			let mt = MidiTrack.fromBytes(trackData);
			if (! mt.isEmpty()){
				file.addTrack(mt);
			}
		}
		console.debug('added ',file.tracks.length,' tracks');
		return file;
    };
    
	public checkFileHeader(): boolean {
		this.checkBuffer(MidiFile.HDR_CHUNKID, 0, FileParser.ERROR_MSG )
		this.checkBuffer(MidiFile.HDR_CHUNK_SIZE, 4, FileParser.ERROR_MSG)
		return true;
	}
	private checkBuffer(str: string, pos: number, err: string){
		if (this.buffer.indexOf(str) != pos) throw new Error(err);
	}
}
