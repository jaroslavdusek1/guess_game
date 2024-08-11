import minimist from 'minimist';
import { ARGUMENTS, ERRORS } from './constants'; // Import constants
import { Client } from "./Client"; // Import the Client class
import { Utils } from "./Utils"; // Import the Utils

// Parse command line arguments using minimist
const args = minimist(process.argv.slice(2)); // Parses command-line arguments

// Extract mode and address from the arguments
const mode = args[ARGUMENTS.MODE] || args[ARGUMENTS.SHORT_MODE];
const address = args[ARGUMENTS.ADDRESS] || args[ARGUMENTS.SHORT_ADDRESS];

// Check if both mode and address are provided; if not, print an error and exit
if (!mode || !address) {
    Utils.print(ERRORS.MISSING_ARGUMENTS); // Print error message for missing arguments
    process.exit(1);
}

// Determine if a Unix socket is being used based on the mode (mode - local | network)
const isUnixSocket = mode === ARGUMENTS.LOCAL; // isUnixSocket = (mode === 'local') ? true : false;

// Validate the mode argument; if invalid, print an error and exit
if (!isUnixSocket && mode !== ARGUMENTS.NETWORK) {
    Utils.print(ERRORS.INVALID_MODE(mode)); // Print error message
    process.exit(1); // Exit the process
}

// Instantiate the Client class based on whether a Unix socket is used
let client: Client;
if (isUnixSocket) {
    client = new Client(address, true); // new Client class instance with Unix socket mode
} else {
    client = new Client(address); // new Client class instance with network mode
}

client.connectToServer(); // Connect to the server
