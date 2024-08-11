import * as net from 'net'; // Import networking module
import * as readline from 'readline'; // Import readline module for handling input
import { BinaryHelper } from './BinaryHelper'; // Import binary helper functions
import { COMMANDS, CONSTRAINTS, INPUTS, MESSAGES, OFFSETS } from './constants'; // Import constants
import { Utils } from './Utils'; // Import utility functions 

/**
 * CommandHandler class to handle server responses and client commands.
 * 
 * @class
 */
export class CommandHandler {
    private client: net.Socket; // Encapsulated client socket for communicating with the server
    private rlInterface: readline.Interface; // Encapsulated readline interface for user input

    /**
     * Creates an instance of CommandHandler.
     * 
     * @constructor
     * @param {net.Socket} client - The client socket
     * @param {readline.Interface} rlInterface - The readline interface for user input
     * @memberof CommandHandler
     */
    constructor(client: net.Socket, rlInterface: readline.Interface) {
        this.client = client; // Assign the client socket to the instance
        this.rlInterface = rlInterface; // Assign the readline interface to the instance
    }

    /**
     * Handles data received from the server.
     * 
     * @method
     * @param {Buffer} data - The data received from the server
     * @memberof CommandHandler
     */
    public handleServerData(data: Buffer) {
        if (data[0] === COMMANDS.WELCOME) { // Check if the command is a welcome message
            const welcomeMessage = BinaryHelper.bufferToString(data.slice(OFFSETS.COMMAND_OFFSET)); // Convert the data to a string, skipping the first (control) byte
            Utils.print(welcomeMessage); // Print the welcome message

            this.rlInterface.question(MESSAGES.AUTH_PROMPT, (command: string) => { // Prompt the user to enter the authorization pw
                const passwordBuffer = Buffer.concat([Buffer.from([COMMANDS.PASSWORD_SUBMIT]), BinaryHelper.stringToBuffer(command.trim())]); // Create a buffer with the command and the password

                if (this.client.destroyed) { // Check if the client socket is closed
                    Utils.print(MESSAGES.ERROR_NO_GUESS); // Print the error message if the socket is closed
                    return;
                }

                this.client.write(passwordBuffer, () => { // Send the password buffer to the server
                    Utils.print(MESSAGES.PASSWORD_SENT); // Print a confirmation message that the password was sent
                });
            });
        } else if (data[0] === COMMANDS.CLIENT_ID) { // Check if the command is for receiving the client ID
            const clientId: number = BinaryHelper.bufferToNumber(data.slice(OFFSETS.COMMAND_OFFSET, OFFSETS.LENGTH_4_BYTES)); // var clientId = buffer(5 bytes) -> slice out 1 (control) byte and convert (the rest) remaining 4 bytes ==> clientId
            Utils.print(MESSAGES.AUTH_SUCCESS + clientId); // Print a success message with the client ID
            Utils.print(MESSAGES.USE_HELP); // Print a message suggesting to use the help command
            this.promptForCommand(); // Prompt the user for the next command
        } else if (data[0] === COMMANDS.WRONG_PASSWORD) { // Check if the command indicates a pw
            Utils.print(MESSAGES.WRONG_PASSWORD); // Print an error message for the wrong pw
            this.client.destroy(); // Close the connection
        } else if (data[0] === COMMANDS.OPPONENTS_LIST) { // Check if the command is to list opponents
            const numberOfOpponents = BinaryHelper.bufferToNumber(data.slice(OFFSETS.COMMAND_OFFSET, OFFSETS.LENGTH_4_BYTES)); // buffer(5 bytes) -> slice out 1 (control) byte and convert the rest
            Utils.print(MESSAGES.NUMBER_OF_OPPONENTS(numberOfOpponents)); // Print the number of opponents
            for (let i = 0; i < numberOfOpponents; i++) { // Loop through all opponents
                /**
                 * Explanation hint
                 * 
                 * Byte 0 = command
                 * Byte 1–4 = opponents count (int => 4 bytes)
                 * Byte 5–8 = first opponents ID (int => 4 bytes)
                 * Byte 9–12 = second opponents ID (if exist, again 4 bytes), a so on...
                 */
                const opponentId = BinaryHelper.bufferToNumber(data.slice(5 + i * 4, 9 + i * 4)); // Extract the opponents IDs
                Utils.print(MESSAGES.OPPONENT_ID(opponentId)); // Print IDs
            }
            this.promptForCommand();
        } else if (data[0] === COMMANDS.MATCH_CONFIRM) { // Check if the command is to confirm a match request
            Utils.print(MESSAGES.MATCH_CONFIRMED); // Print a confirmation message
            this.promptForCommand();
        } else if (data[0] === COMMANDS.OPPONENT_UNAVAILABLE) { // Check if the command indicates that an opponent is unavailable
            Utils.print(MESSAGES.OPPONENT_UNAVAILABLE);
            this.promptForCommand();
        } else if (data[0] === COMMANDS.NEW_GAME) { // Check if the command is to start a new game
            const wordToGuess = BinaryHelper.bufferToString(data.slice(OFFSETS.COMMAND_OFFSET)); // Extract the word, again slice out 1 byte and (convert) the rest is word to guess
            const hiddenWord = CONSTRAINTS.UNDERLINE.repeat(wordToGuess.length).trim(); // Create a hidden word with underscores
            Utils.print(MESSAGES.NEW_GAME + hiddenWord); // Print the new game message with the hidden word e.g. _ _ _ _
            this.promptForCommand();
        } else if (data[0] === COMMANDS.SUCCESS) { // Check if the command indicates correct guess
            const message = BinaryHelper.bufferToString(data.slice(OFFSETS.COMMAND_OFFSET)); // Extract and convert the success message, the same slice out 1 (control) byte and convert
            Utils.print(message);
            this.promptForCommand();
        } else if (data[0] === COMMANDS.INCORRECT_GUESS) { // Check if the command indicates an incorrect guess
            const message = BinaryHelper.bufferToString(data.slice(OFFSETS.COMMAND_OFFSET)); // Extract and convert the incorrect guess message
            Utils.print(message);
            this.promptForCommand();
        } else if (data[0] === COMMANDS.HINT) { // Check if the command is to receive a hint
            const hint = BinaryHelper.bufferToString(data.slice(OFFSETS.COMMAND_OFFSET)); // Extract and convert the hint message
            Utils.print(MESSAGES.HINT_RECEIVED(hint)); // Print the hint
            this.promptForCommand();
        } else if (data[0] === COMMANDS.INFO || data[0] === COMMANDS.ERROR) { // Check if the command is informational or an error
            const message = BinaryHelper.bufferToString(data.slice(OFFSETS.COMMAND_OFFSET)); // Extract and convert
            Utils.print(message); // Print the info or error message
            this.promptForCommand();
        }
    }

    /**
     * Prompts the user for a command and handles it.
     * 
     * @method
     * @private
     * @memberof CommandHandler
     */
    private promptForCommand() {
        Utils.print(MESSAGES.PRINT_SEPARATOR.repeat(5)); // Print a separator line '*****'
        this.rlInterface.question(MESSAGES.PROMPT_COMMAND, (command: string) => { // Prompt the user to enter a command
            const trimmedCommand = command.trim().replace(CONSTRAINTS.SPACE_REGEX, CONSTRAINTS.SPACE); // Trim function
            const parts = trimmedCommand.split(CONSTRAINTS.SPACE); // Split the command string into parts based on spaces
            const mainCommand = parts[0]; // Extract the main command (first part)

            if (mainCommand === INPUTS.LIST && parts[1] === INPUTS.OPPONENTS) { // Check if the command is to list opponents
                this.client.write(Buffer.from([COMMANDS.LIST_OPPONENTS])); // Send a request
                this.promptForCommand(); // Prompt the user for the next command.

            } else if (mainCommand === INPUTS.MATCH) { // Check if the command is to start a match

                if (parts.length < 3) { // Check if the command has enough parts (one ID and one word)
                    Utils.print(MESSAGES.ERROR_PROVIDE_OPPONENT); // Print an error if opponent ID or word is missing
                    this.promptForCommand();
                    return;
                }

                const opponentId = parseInt(parts[1], 10); // Parse the opponent ID from the command
                const wordToGuess = parts.slice(2).join(CONSTRAINTS.SPACE); // Extract and join the word to guess from the remaining parts.

                if (wordToGuess.length > CONSTRAINTS.MAX_LENGTH) { // Check if the length
                    Utils.print(MESSAGES.ERROR_WORD_TOO_LONG(CONSTRAINTS.MAX_LENGTH)); // Print an error if the word is too long
                    this.promptForCommand();
                    return;
                }

                /**
                 * Create a buffer for the match request
                 * 1 byte = Control byte with information about a match request
                 * 4 bytes = Opponent ID (int = 4 bytes)
                 * Variable length = Up to 24 characters (which can be up to 96 bytes, depending on char encoding)
                 */
                const buffer = Buffer.concat([
                    Buffer.from([COMMANDS.MATCH_REQUEST]),
                    BinaryHelper.numberToBuffer(opponentId),
                    BinaryHelper.stringToBuffer(wordToGuess)
                ]);
                this.client.write(buffer);
                this.promptForCommand();

            } else if (mainCommand === INPUTS.GUESS) { // Check if the cmnd is to make a guess
                const guess = parts[1]; // Extract the guess from the cmnd

                if (!guess) { // Check if the guess is missing.
                    Utils.print(MESSAGES.ERROR_NO_GUESS); // Print an error if no guess is provided
                    this.promptForCommand();
                    return;
                }

                if (guess.length > CONSTRAINTS.MAX_LENGTH) { // Check if the length
                    Utils.print(MESSAGES.ERROR_GUESS_TOO_LONG(CONSTRAINTS.MAX_LENGTH)); // Print an error
                    this.promptForCommand();
                    return;
                }

                this.client.write(Buffer.concat([Buffer.from([COMMANDS.GUESS]), BinaryHelper.stringToBuffer(guess)])); // Send the guess buffer to the server
                this.promptForCommand();

            } else if (mainCommand === INPUTS.HINT) { // Check if the cmnd is to send a hint
                // e.g. cmnd -> hint test, slice out hint 
                const hint = parts.slice(1).join(CONSTRAINTS.SPACE);

                if (!hint) { // Check if the hint is missing
                    Utils.print(MESSAGES.ERROR_NO_HINT); // Print an error
                    this.promptForCommand();
                    return;
                }

                if (hint.length > CONSTRAINTS.MAX_LENGTH) { // Check if the length
                    Utils.print(MESSAGES.ERROR_HINT_TOO_LONG(CONSTRAINTS.MAX_LENGTH)); // Print an error if the hint is too long
                    this.promptForCommand();
                    return;
                }

                /**
                 * Buffer concatenation and sending
                 * 
                 * 1 (control) byte buffer that contains the command code for a hint
                 * The remaining bytes contain the UTF-8 encoded buffer of the hint string
                 */
                this.client.write(Buffer.concat([Buffer.from([COMMANDS.HINT]), BinaryHelper.stringToBuffer(hint)])); // Send the buffer
                this.promptForCommand();

            } else if (mainCommand === INPUTS.GIVE && parts[1] === INPUTS.UP) { // Check if the command is to give up
                this.client.write(Buffer.from([COMMANDS.GIVE_UP])); // Send a 'give up' cmnd
                this.promptForCommand(); // Prompt the user for the next command.

            } else if (mainCommand === INPUTS.HELP || mainCommand === INPUTS.HELP_SHORT) { // Check if the command is to show help
                Utils.print(MESSAGES.AVAILABLE_COMMANDS); // Print the list of available cmnds.
                this.promptForCommand();
            }
            else { // If the command is UNKNOWN
                Utils.print(MESSAGES.UNKNOWN_COMMAND); // Print an unknown command error
                this.promptForCommand();
            }
        });
    }
}