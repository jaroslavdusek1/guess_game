/**
 * Object containing various constraints for inputs and formatting.
 * 
 * @type {Object<string, number | RegExp | string>}
 */
export const CONSTRAINTS = {
    MAX_LENGTH: 24,
    UNDERLINE: '_ ',
    SPACE: ' ',
    SPACE_REGEX: /\s+/g,
};

/**
 * Object command codes used in the binary protocol.
 * 
 * @type {Object<string, string>}
 */
 export const COMMANDS = {
    WELCOME: 0x01,
    PASSWORD_SUBMIT: 0x02,
    CLIENT_ID: 0x03,
    WRONG_PASSWORD: 0x04,
    LIST_OPPONENTS: 0x05,
    OPPONENTS_LIST: 0x06,
    MATCH_REQUEST: 0x07,
    MATCH_CONFIRM: 0x08,
    OPPONENT_UNAVAILABLE: 0x09,
    NEW_GAME: 0x0A,
    GUESS: 0x0B,
    SUCCESS: 0x0C,
    INCORRECT_GUESS: 0x0D,
    HINT: 0x0E,
    INFO: 0x0F,
    ERROR: 0x10,
    GIVE_UP: 0x11,
};

/**
 * Object containing conditions for user input.
 * 
 * @type {Object<string, string>}
 */
export const CONDITIONS = {
    YES: 'Y',
};

/**
 * Object containing error messages used for handling various errors.
 * 
 * @type {Object<string, string | Function>}
 */
export const ERRORS = {
    INVALID_MODE: (mode: string) => `Invalid mode. Use "local" or "network". Provided mode: ${mode}`,
    MISSING_ARGUMENTS: 'Error: Both --mode and --address arguments are required.',
};

/**
 * Object containing error codes used for connection handling.
 * 
 * @type {Object<string, string>}
 */
export const ERROR_CODES = {
    ECONNREFUSED: 'ECONNREFUSED',
    ENOENT: 'ENOENT',
};

/**
 * Object containing strings that represent different user inputs.
 * 
 * @type {Object<string, string>}
 */
export const INPUTS = {
    GIVE: 'give',
    GUESS: 'guess',
    HELP: 'help',
    HELP_SHORT: '-h',
    HINT: 'hint',
    LIST: 'list',
    MATCH: 'match',
    OPPONENTS: 'opponents',
    UP: 'up',
};

/**
 * Object containing messages used for user prompts and outputs.
 * 
 * @type {Object<string, string | Function>}
 */
export const MESSAGES = {
    AUTH_PROMPT: 'Enter authorization password: ',
    AUTH_SUCCESS: 'Authorization successful,\nReceived client ID: ',
    AVAILABLE_COMMANDS: `
Available commands:
  list opponents          - Request a list of opponents.
  match [id] [word]       - Request a match with an opponent by ID and provide a word to guess.
                            Note: The word to guess must be at most 24 characters long.
  guess [word]            - Make a guess for the word.
                            Note: The guess must be at most 24 characters long.
  hint [text]             - Send a hint to the opponent.
                            Note: The hint must be at most 24 characters long.
  give up                 - Give up the game.
  help                    - Show this help message.
    `,
    CANNOT_CONNECT: 'Cannot connect to server. Please make sure the server is running and try again.\n',
    CONNECTION_CLOSED: 'Connection closed',
    CONNECTED_SERVER: 'Connected to the server...',
    CONNECTED_UNIX_SOCKET: 'Connected to the Unix socket...',
    CONNECTING: 'Connecting to server...',
    ERROR_GUESS_TOO_LONG: (maxLength: number) => `Error: The guess must be at most ${maxLength} characters long.`,
    ERROR_HINT_TOO_LONG: (maxLength: number) => `Error: The hint must be at most ${maxLength} characters long.`,
    ERROR_NO_GUESS: 'Error: No guess provided.',
    ERROR_NO_HINT: 'Error: No hint provided.',
    ERROR_PREFIX: 'Error: ',
    ERROR_PROVIDE_OPPONENT: 'Error: Please provide - opponent ID and word to guess.',
    ERROR_WORD_TOO_LONG: (maxLength: number) => `Error: The word to guess must be at most ${maxLength} characters long.`,
    HINT_RECEIVED: (hint: string) => `Hint received: ${hint}`,
    INCORRECT_GUESS: 'Your guess was incorrect.',
    MATCH_CONFIRMED: 'Match request confirmed.',
    NEW_GAME: 'New game started! Word to guess: ',
    NUMBER_OF_OPPONENTS: (count: number) => `Number of opponents: ${count}`,
    OPPONENT_ID: (opponentId: number) => `Opponent ID: ${opponentId}`,
    OPPONENT_UNAVAILABLE: 'Error: Opponent not available.',
    PASSWORD_SENT: 'Password buffer sent.',
    PRINT_SEPARATOR: '*',
    PROGRAM_TERMINATED: 'Program has been terminated. You can restart it using "npm start".\n',
    PROMPT_COMMAND: 'Enter command: ',
    RECONNECT_PROMPT: 'Do you want to try reconnecting? (Y/N): ',
    UNKNOWN_COMMAND: 'Unknown command',
    UNKNOWN_ERROR: 'An unknown error occurred.',
    USE_HELP: '\nUse the command "-h" or "help" for list available commands.',
    WELCOME_MESSAGE: `
            .__           .__  .__          
            |  |__   ____ |  | |  |   ____  
            |  |  \_/ __ \|  | |  |  /  _ \ 
            |   Y  \  ___/|  |_|  |_(  <_> )
            |___|  /\___  >____/____/\____/ 
                 \/     \/                  
_____________________________________________________________________
    `,
    WRONG_PASSWORD: 'Wrong password. Disconnected by server.',
};

/**
 * Object containing byte offset values used for slicing buffers.
 * 
 * @type {Object<string, numbers>}
 */
export const OFFSETS = {
    COMMAND_OFFSET: 1,
    LENGTH_4_BYTES: 5,
    LENGTH_8_BYTES: 9,
};

/**
 * Object containing separators for different contexts.
 * 
 * @type {Object<string, string>}
 */
export const SEPARATORS = {
    IP_PORT_SEPARATOR: ':',
};

/**
 * Object containing command line argument keys.
 * 
 * @type {Object<string, string>}
 */
export const ARGUMENTS = {
    ADDRESS: 'address',
    LOCAL: 'local',
    MODE: 'mode',
    NETWORK: 'network',
    SHORT_ADDRESS: 'a',
    SHORT_MODE: 'm',
};
