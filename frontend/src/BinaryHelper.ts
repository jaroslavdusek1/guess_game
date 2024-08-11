/**
 * BinaryHelper class to handle conversion between numbers and binary data.
 * 
 * @class
 * @memberof module:utilities
 */
export class BinaryHelper {
    /**
     * Converts a number to a 4-byte buffer in big-endian format.
     * 
     * @example
     * BinaryHelper.numberToBuffer(42);
     * Output: <Buffer 00 00 00 2a>
     * 
     * @memberof module:utilities.BinaryHelper
     * @param {number} num - The number to convert.
     * @returns {Buffer} - The buffer containing the binary representation of the number
     */
    public static numberToBuffer(num: number): Buffer {
        const buffer = Buffer.alloc(4); // Create a 4-byte buffer
        // Write the number to the buffer in big-endian format
        // Big endian means the most signigicant byte (big end)
        // is stored at the smallest memory address e.g. the number 0x12345678 stored as
        // [0x12, 0x34, 0x56, 0x78] in the buffer
        buffer.writeUInt32BE(num);
        return buffer; // Return the buffer containing the binary representation of the number
    }

    /**
     * Converts a buffer in big-endian format to a number.
     * 
     * @example
     * BinaryHelper.bufferToNumber(Buffer.from([0x00, 0x00, 0x00, 0x2a]));
     * Output: 42
     * 
     * @memberof module:utilities.BinaryHelper
     * @param {Buffer} buffer - The buffer containing the binary data.
     * @returns {number} - The number represented by the binary data.
     */
    public static bufferToNumber(buffer: Buffer): number {
        return buffer.readUInt32BE(0); // Read the number from the buffer in big-endian format starting at position 0
    }

    /**
     * Converts a string to a buffer.
     * 
     * @example
     * BinaryHelper.stringToBuffer("Hello");
     * Output: <Buffer 48 65 6c 6c 6f>
     * 
     * @memberof module:utilities.BinaryHelper
     * @param {string} str - The string to convert.
     * @returns {Buffer} - The buffer containing the binary representation of the string.
     */
    public static stringToBuffer(str: string): Buffer {
        return Buffer.from(str, 'utf8'); // Convert the string to a buffer with UTF-8 encoding
    }

    /**
     * Converts a buffer to a string.
     * 
     * @example
     * BinaryHelper.bufferToString(Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
     * Output: "Hello"
     * 
     * @memberof module:utilities.BinaryHelper
     * @param {Buffer} buffer - The buffer containing the binary data.
     * @returns {string} - The string represented by the binary data.
     */
    public static bufferToString(buffer: Buffer): string {
        return buffer.toString('utf8'); // Convert the buffer to a string with UTF-8 encoding
    }
}
