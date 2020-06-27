export class MidiUtil {
    public static readonly midi_letter_pitches = { a: 21, b: 23, c: 12, d: 14, e: 16, f: 17, g: 19 } as {
        [key: string]: number
    };
    public static readonly midi_pitches_letter = { 12: 'c', 13: 'c#', 14: 'd', 15: 'd#', 16: 'e', 17: 'f', 18: 'f#', 19: 'g', 20: 'g#', 21: 'a', 22: 'a#', 23: 'b' } as {
        [key: string]: string
    };
    public static readonly midi_flattened_notes = { 'a#': 'bb', 'c#': 'db', 'd#': 'eb', 'f#': 'gb', 'g#': 'ab' } as {
        [key: string]: string
    };
    public static readonly DEFAULT_VOLUME = 90;
    public static readonly DEFAULT_DURATION = 128;
    public static readonly DEFAULT_CHANNEL = 0;


    /**
     * Convert a symbolic note name (e.g. "c4") to a numeric MIDI pitch (e.g.
     * 60, middle C).
     *
     * @param {string} n - The symbolic note name to parse.
     * @returns {number} The MIDI pitch that corresponds to the symbolic note
     * name.
     */
    static midiPitchFromNote(n: string): number {
        let pitch = 60;
        const matches = /([a-g])(#+|b+)?([0-9]+)$/i.exec(n);
        if (matches) {
            const note = matches[1].toLowerCase();
            const accidental = matches[2] || '';
            const octave = parseInt(matches[3], 10);
            pitch = (12 * octave) + MidiUtil.midi_letter_pitches[note] + (accidental.substr(0, 1) == '#' ? 1 : -1) * accidental.length;
        }
        return pitch;
    }

    /**
     * Ensure that the given argument is converted to a MIDI pitch. Note that
     * it may already be one (including a purely numeric string).
     *
     * @param {string|number} p - The pitch to convert.
     * @returns {number} The resulting numeric MIDI pitch.
     */
    static ensureMidiPitch(p: string | number): number {
        let rv = 60;
        if (typeof p === 'number') {
            // numeric pitch
            rv = p;
        } else {
            rv = this.getPitchNumber(p);
        }
        return rv;
    }
    static getPitchNumber(p: string): number {
        let rv = 60;
        if (/[^0-9]/.test(p)) {
            rv = this.midiPitchFromNote(p);
        } else {
            rv = parseInt(p, 10);
        }
        return rv;
    }


    /**
     * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name
     * (e.g. "c4").
     *
     * @param {number} n - The numeric MIDI pitch value to convert.
     * @param {boolean} [returnFlattened=false] - Whether to prefer flattened
     * notes to sharpened ones. Optional, default false.
     * @returns {string} The resulting symbolic note name.
     */
    static noteFromMidiPitch(n: number, returnFlattened?: boolean): string {
        let octave = 0;
        let noteNum = n;
        let noteName = '';
        returnFlattened = returnFlattened || false;
        if (n > 23) {
            // noteNum is on octave 1 or more
            octave = Math.floor(n / 12) - 1;
            // subtract number of octaves from noteNum
            noteNum = n - octave * 12;
        }
        // get note name (c#, d, f# etc)
        noteName = MidiUtil.getNoteName(noteNum, returnFlattened);
        return noteName + octave;
    }

    static getNoteName(noteNum: number, returnFlattened: boolean): string {
        let noteName = MidiUtil.midi_pitches_letter[noteNum];
        // Use flattened notes if requested (e.g. f# should be output as gb)
        if (returnFlattened && noteName.indexOf('#') > 0) {
            noteName = MidiUtil.getFlattenedName(noteName);
        }
        return noteName;
    }
    static getFlattenedName(noteName: string) {
        // Use flattened notes if requested (e.g. f# should be output as gb)
        if (noteName.indexOf('#') > 0) {
            noteName = MidiUtil.midi_flattened_notes[noteName];
        }
        return noteName;
    }

    /**
     * Convert beats per minute (BPM) to microseconds per quarter note (MPQN).
     *
     * @param {number} bpm - A number in beats per minute.
     * @returns {Array<number>} The number of microseconds per quarter note.
     */
    static mpqnFromBpm(bpm: number): Array<number> {
        let mpqn = Math.floor(60000000 / bpm);
        let ret: Array<number> = [];
        do {
            ret.unshift(mpqn & 0xFF);
            mpqn >>= 8;
        } while (mpqn);
        while (ret.length < 3) {
            ret.push(0);
        }
        return ret;
    }

    /**
     * Convert microseconds per quarter note (MPQN) to beats per minute (BPM).
     *
     * @param {number} mpqn - The number of microseconds per quarter note.
     * @returns {number} A number in beats per minute.
     */
    static bpmFromMpqn(mpqn: Array<number>): number {
    let m = 0;
    if(mpqn[mpqn.length - 1] === 0){
        mpqn.splice(mpqn.length -  1, 1 );
    }
    
    for (var i = 0; i < mpqn.length;  ++i) {
        m = m | mpqn[i] << ((mpqn.length-1-i) * 8);
    }
    return Math.floor(60000000 / m);
}


    /**
     * Converts an array of bytes to a utf16 string.
     * e.g.: [77,84,104,100] -> "MThd".
     *
     * @param {Array<number>} byteArray - Array of bytes to be converted.
     * @returns {string} String. 
     */
    static codes2Str(byteArray: Array<number>): string {
        let rv = '';
        byteArray.forEach((byte) => {
            rv += String.fromCharCode(byte);
        });
        return rv;
    }

    /**
     * Converts a string of hexadecimal values to an array of bytes. It can also
     * add remaining "0" nibbles in order to have enough bytes in the array as the
     * `finalBytes` parameter.
     *
     * @param {string} str - string of hexadecimal values e.g. "097B8A"
     * @param {number} [finalBytes] - Optional. The desired number of bytes
     * (not nibbles) that the returned array should contain.
     * @returns {Array} An array of nibbles.
     */
    static str2Bytes(str: string, finalBytes: number): Array<number> {
        let bytes = [];
        str = MidiUtil.padBytes(finalBytes, str);
        for (let i = str.length - 1; i >= 0; i = i - 2) {
            let chars = (i === 0 ? str[i] : str[i - 1] + str[i]);
            bytes.unshift(parseInt(chars, 16));
        }
        return bytes;
    }

    public static padBytes(finalBytes: number, str: string) {
        if (finalBytes) {
            while ((str.length / 2) < finalBytes) {
                str = "0" + str;
            }
        }
        return str;
    }

    /**
     * Translates number of ticks to MIDI timestamp format
     * which stores the number in a variable length byte array
     * number is split in 7 bits chunks
     * 1 is added at the beginning if there are more chunks to follow
     * 0 is added at the beginning of the chunk if it is the last chunk
     * @param {number} ticks - Number of ticks to be translated.
     * @returns {number} Array of bytes that form the MIDI time value.
     */
    static translateTickTime(ticks: number) {
        // Take last seven bits
        // First bit will remain 0 as this will be the last chunk   
        let buffer = [ticks & 0x7F];
        // Shift by 7 bits to get the next chunk
        while (ticks = ticks >> 7) {
            // First bit is 1 as there are more chunks to follow
            buffer.unshift((ticks & 0x7F) + 128);
        }
        return buffer;
    }
    

}
