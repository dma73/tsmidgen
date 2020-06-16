export class MidiTime{
    public rawBytes: number[] = [];
    public constructor(rawBytes: number[]){
        this.rawBytes = rawBytes;
    }
    public getTicks(): number{
        let ticks = 0;
        this.rawBytes.forEach((byte) => {
            if (byte > 127){
                byte -= 128;
                byte = byte << 7;

            }
            ticks = ticks | byte; 
        })
        return ticks;
    }
}