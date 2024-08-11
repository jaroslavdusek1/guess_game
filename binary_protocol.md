# Binary Protocol

## Message Format

Each message consists of a single byte indicating the message type, followed by the message-specific data.

### Message Types

| Byte | Description                             | Additional Data                    |
|------|-----------------------------------------|------------------------------------|
| 0x01 | Welcome message                         | UTF-8 encoded string (message)     |
| 0x02 | Password submission                     | UTF-8 encoded string (password)    |
| 0x03 | Client ID assignment                    | 4-byte integer (client ID)         |
| 0x04 | Wrong password                          | None                               |
| 0x05 | Request list of opponents               | None                               |
| 0x06 | List of opponents response              | 4-byte integer (number of IDs) + repeated 4-byte integers (client IDs) |
| 0x07 | Request match with opponent             | 4-byte integer (opponent ID) + UTF-8 encoded string (word to guess) |
| 0x08 | Confirm match request                   | None                               |
| 0x09 | Error: opponent not available           | None                               |
| 0x0A | Inform opponent of new game             | UTF-8 encoded string (word to guess)|
| 0x0B | Opponent's guess                        | UTF-8 encoded string (guess)       |
| 0x0C | Inform of successful guess              | None                               |
| 0x0D | Inform of incorrect guess               | UTF-8 encoded string (guess)       |
| 0x0E | Hint message                            | UTF-8 encoded string (hint message)|
| 0x0F | Inform of not possible play             | UTF-8 encoded string (inform message)|
| 0x10 | Error: no game found for hint           | UTF-8 encoded string (error message)|
| 0x11 | Give up current game                    | None                               |
