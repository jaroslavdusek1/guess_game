import * as net from 'net'; // Import the net module
import * as readline from 'readline'; // Import the readline module for reading input
import { CONDITIONS, ERROR_CODES, MESSAGES, SEPARATORS } from './constants'; // Import constants for handling messages, errors, and conditions
import { CommandHandler } from './CommandHandler'; // Import the CommandHandler class for handling server responses and client commands
import { Utils } from './Utils'; // Import utils

/**
 * Client class to handle the connection and communication with the server.
 * 
 * @class
 */
export class Client {
    private client: net.Socket; // Encapsulates the client socket for communication with the server
    private rlInterface: readline.Interface; // Encapsulates the readline interface for user input
    private commandHandler: CommandHandler; // Handles server responses and client commands
    private address: string; // Stores the server address to connect to
    private isUnixSocket: boolean; // Indicates whether to use a Unix socket for connection

    /**
     * Creates an instance of the Client class.
     * 
     * @constructor
     * @memberof Client
     * @param {string} address - The server address to connect to
     * @param {boolean} [isUnixSocket=false] - Whether to use a Unix socket for connection
     */
    constructor(address: string, isUnixSocket: boolean = false) {
        this.client = new net.Socket(); // Create a new socket instance for the client
        this.rlInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }); // Initialize the readline interface for reading user input from the terminal

        // Initialize a new instance of CommandHandler with the client socket and readline interface
        this.commandHandler = new CommandHandler(this.client, this.rlInterface);
        this.address = address; // Store the server address
        this.isUnixSocket = isUnixSocket; // Store whether the connection is using a Unix socket | bool true or false

        // Setup initial event handlers for the client socket
        this.setupEventHandlers();
    }

    /**
     * Sets up event handlers for the client socket.
     * 
     * @memberof Client
     * @method
     */
    private setupEventHandlers() {
        this.client.on('error', (error) => this.handleConnectionError(error)); // Listen for error events and connection errors
        this.client.on('data', (data: Buffer) => {
            this.commandHandler.handleServerData(data); // Listen for data events and handle incoming data
        }); 
        this.client.on('close', () => {
            Utils.print(MESSAGES.CONNECTION_CLOSED); // Listen for close events
        });
    }

    /**
     * Connects to the server and sets up event handlers.
     * 
     * @memberof Client
     * @method
     */
    public connectToServer() {
        if (this.client.destroyed) {
            this.client = new net.Socket(); // Create a new client socket for each connection attempt
            this.setupEventHandlers(); // Re-setup event handlers for the new socket
        }

        if (this.isUnixSocket) { // Check if the connection is using a Unix socket (true or false)
            this.client.connect(this.address, () => {
                Utils.print(MESSAGES.CONNECTED_UNIX_SOCKET); // Print a message indicating connection to Unix socket
                this.showWelcomeMessage(); // Display a welcome message
            });
        } else {
            const [ip, port] = this.address.split(SEPARATORS.IP_PORT_SEPARATOR); // Split the address into IP and port e.g. 127.0.0.1 (local) and port 9999
            this.client.connect(parseInt(port), ip, () => {
                Utils.print(MESSAGES.CONNECTED_SERVER); // Print a message indicating connection to the server
                this.showWelcomeMessage();
            });
        }
    }

    // Encapsulated private method to show a welcome message, accesible only within this class instance
    private showWelcomeMessage() {
        Utils.print(MESSAGES.WELCOME_MESSAGE); // Print a welcome message to the user
    }

    /**
     * Handles connection errors and prompts for reconnection.
     * Encapsulates error handling and user prompt logic.
     * 
     * @memberof Client
     * @method
     * @param {Error} error - The error object
     */
    private handleConnectionError(error: Error) {
        Utils.print(MESSAGES.ERROR_PREFIX, error.message); // Print the error message

        if (error.message.includes(ERROR_CODES.ECONNREFUSED) || error.message.includes(ERROR_CODES.ENOENT)) {
            Utils.print(MESSAGES.CANNOT_CONNECT); // Print a message indicating the inability to connect to the server
            this.rlInterface.question(MESSAGES.RECONNECT_PROMPT, (answer: string) => {
                if (answer.toUpperCase() === CONDITIONS.YES) { // Check if user wants to reconnect
                    this.client.destroy(); // Destroy the current client socket
                    this.connectToServer(); // Try to reconnect to the server
                } else {
                    Utils.print(MESSAGES.PROGRAM_TERMINATED);
                    process.exit(1); // Exit the program
                }
            });
        } else {
            Utils.print(MESSAGES.UNKNOWN_ERROR); // Print a message indicating an unknown error occurred
            process.exit(1);
        }
    }
}
