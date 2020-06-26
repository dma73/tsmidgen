export class TestUtils {
    public static toHexString(input: string): string {
        let hex = '';
        Buffer.from(input, 'binary').forEach((value,index,array) => {
            hex += (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16)) 
            + (index === array.length - 1 ? '' : ' ');
        });
        return hex;
    }
    public static bytesToHexString(input: number[]): string {
        let hex = '';
        input.forEach((value,index,array) => {
            hex += (value.toString(16).length === 1 ? 0 + value.toString(16) : value.toString(16)) 
            + (index === array.length - 1 ? '' : ' ');
        });
        return hex;
    }  
}
