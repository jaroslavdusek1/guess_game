import socket
from typing import Tuple, Dict

# For better readability and understanding, i've kept the string messages and control bytes directly in the code,
# instead of replacing them with variables

class ClientHandler:
    """
    Handles communication between the server and a connected client.

    Attributes:
        client_socket (socket.socket): The socket object for communication with the client.
        client_address (Tuple[str, int]): The client's address and port.
        server: Reference to the server instance that manages all clients and games.
        client_id (int): Unique identifier for the connected client.
    """
    
    def __init__(self, client_socket: socket.socket, client_address: Tuple[str, int], server):
        """
        Initializes a new ClientHandler instance.

        Args:
            client_socket (socket.socket): The socket object for communication with the client.
            client_address (Tuple[str, int]): The client's address and port.
            server: The server instance that manages all clients and games.
        """
        self.client_socket = client_socket
        self.client_address = client_address
        self.server = server
        self.client_id = None

    def handle(self):
        """
        Handles the communication loop for the client.

        Exceptions are caught and logged, and the client is removed from the server's client list
        if an error occurs or when the connection is closed.
        """
        try:
            self.client_socket.send(b'\x01Welcome to the server!')  # Send a welcome message to the client
            print("Welcome message sent to client")

            while True:  # Infinite loop to handle communication
                request = self.client_socket.recv(1024)  # Receive data from the client, MAX_SIZE 1024 bytes
                if not request:  # If no data is received, break the loop
                    break
                print(f"Received request: {request}")

                # Call handle_request which handle client's request(s)
                self.handle_request(request)

        except Exception as e:
            print(f"Error handling client {self.client_address}: {e}")
        finally:
            self.client_socket.close()  # If error or the client close the connection -> close the socket
            if self.client_id in self.server.clients:  # Remove the client from the clients dictionary, if exist
                del self.server.clients[self.client_id]
            print(f"Connection with client {self.client_address} closed.")

    def handle_request(self, request: bytes):
        """
        Handles a single request from the client.
        
        This method processes various types of requests such as password submission, match requests,
        guesses, hints, and the give-up command. It manages game state, updates the server's game
        records, and communicates results back to the clients.

        Args:
            request (bytes): The binary request data received from the client.
        """
        try:
            print(f"Handling request: {request}")

            if request.startswith(b'\x02'):  # Check if the data and its first (control byte) starts with 0x02 (password submission)
                password = request[1:]  # Extract the password
                print(f"Received password: {password}")

                if password == self.server.PASSWORD:  # Check if the password is correct
                    self.client_id = self.server.client_id_counter  # Assign a unique ID to the client
                    self.server.client_id_counter += 1  # Increment the counter for the next client, e.g. first client ID 1, second ID 2 etc..
                    self.server.clients[self.client_id] = self.client_socket  # Store the client socket in the clients dictionary

                    # '\x03' control byte + integer (4 bytes - 32 bits), 'big' - big endian format, e.g. int 1 '\x00\x00\x00\x01' ==>
                    # => b'\x03\x00\x00\x00\x01' ==> control byte + int ID
                    self.client_socket.send(b'\x03' + self.client_id.to_bytes(4, 'big'))  # Send the client ID to the client
                    print("Password correct. Client authorized.")
                else:
                    self.client_socket.send(b'\x04')  # Send a message indicating wrong pw
                    self.client_socket.close()  # Close the connection
                    print("Password incorrect. Connection closed.")
                    return

            if request.startswith(b'\x05'):  # Check if the request is for the list of opponents
                print("Request for list of opponents received.")

                opponent_ids = [cid for cid in self.server.clients.keys() if cid != self.client_id]  # Get the list of opponent IDs

                # 'len' => length converted to bytes using to_bytes, ID is an int -> 4 bytes, 'big endian' format
                # The first control byte is the most important as it indicates the type of message
                response = b'\x06' + len(opponent_ids).to_bytes(4, 'big')  # Create a response with the number of opponents
                
                for opp_id in opponent_ids:  # Loop through each opponent
                    response += opp_id.to_bytes(4, 'big')  # Add each opponent ID (4 bytes) to the response
                self.client_socket.send(response)  # Send the completed response to the client

            elif request.startswith(b'\x07'):  # Check if the request is for a match, e.g., cmd ID word -> (match 2 test -> 1 control byte, 4 bytes, x bytes) -> 
                # -> match, ID (opponent ID) and word to guess
                # e.g. b'\x07\x00\x00\x00\x02test'
                opponent_id = int.from_bytes(request[1:5], 'big')  # Read bytes 2, 3, 4, and 5 to get the opponent ID in big-endian format
                word_to_guess = request[5:].decode('utf-8')  # Read from byte 6 till the end and decode it as a UTF-8 string (word to guess)

                print(f"Match request received: opponent_id={opponent_id}, word_to_guess={word_to_guess}")
                
                if opponent_id == self.client_id:
                    self.client_socket.send(b'\x0F' + b'You cannot play against yourself.')  # Send an error if the opponent is the same as the client
                    print(f"Error: Player {self.client_id} cannot play against themselves.")  # Log the error

                elif self.is_player_in_game(self.client_id) or self.is_player_in_game(opponent_id): # Check if the player is busy 
                    self.client_socket.send(b'\x09' + b'Opponent is currently in another game.')  # Send an error if the opponent or client is in another game
                    print(f"Error: Opponent {opponent_id} or player {self.client_id} is currently in another game.")

                elif opponent_id in self.server.clients:  # Check if the opponent is available
                    self.server.games[(self.client_id, opponent_id)] = {  # Create a new game entry
                        'word': word_to_guess,
                        'attempts': [], # list for attempts
                        'hints': [] # list for hints
                    }

                    self.server.clients[opponent_id].send(b'\x0A' + word_to_guess.encode('utf-8'))  # Inform the opponent of the new game
                    self.client_socket.send(b'\x08')  # Confirm the match
                    print(f"Match confirmed with opponent_id={opponent_id}")
                else:
                    self.client_socket.send(b'\x09' + b'Opponent not available.')  # Send an error if the opponent is not available
                    print(f"Error: Opponent {opponent_id} not available.")
                    
            elif request.startswith(b'\x0B'):  # Check if the request is a guess
                # self.server.games = {
                #   (1, 2): {"word": "python", "attempts": [], "hints": []},
                #   (3, 4): {"word": "coding", "attempts": [], "hints": []},
                #   (2, 3): {"word": "developer", "attempts": [], "hints": []},
                # }
                # dict_keys([(1, 2), (3, 4), (2, 3)])

                game_key = [key for key in self.server.games.keys() if key[1] == self.client_id]  # Find the game the client is participating in
                
                if game_key:  # If the game is found
                    game = self.server.games[game_key[0]]  # Get the game details
                    guess = request[1:].decode('utf-8')  # Extract the guess from the request, again get rid of 1 control byte
                    game['attempts'].append(guess)  # Add the guess to the attempts list
                    print(f"Guess received: {guess}")  # Log the guess

                if guess == game['word']:  # Check if the guess is correct
                    opponent_message = f'The opponent guessed the word "{guess}" correctly. You lost the game.'.encode('utf-8')
                    self.server.clients[game_key[0][0]].send(b'\x0C' + opponent_message)  # Inform client A of the successful guess

                    success_message = f'The word "{guess}" is correct. You won the game.'.encode('utf-8')
                    self.client_socket.send(b'\x0C' + success_message)  # Inform client B of the successful guess

                    
                    # Move the game to completed games
                    # Set the success result
                    game['result'] = 'success'
                    
                    # Check if there is already an entry for players (with these IDs), if yes, append a new entry to the list, be aware about duplications
                    if game_key[0] in self.server.completed_games:
                        self.server.completed_games[game_key[0]].append(game)
                    else:
                        self.server.completed_games[game_key[0]] = [game]
                    
                    # finished game e.g. {'word': 'test', 'attempts': ['a', 'b', 'test'], 'hints': ['te__', 'tes_'], 'result': 'success'}
                    print('finished game', game)
                    del self.server.games[game_key[0]]  # Remove the game from the games dictionary
                    print("Guess is correct. Game ended.")  # Log the correct guess and end of the game
                else:
                    incorrect_message = f'The guess "{guess}" is incorrect.'.encode('utf-8')
                    self.server.clients[game_key[0][0]].send(b'\x0D' + incorrect_message)  # Inform client A of the incorrect guess
                    self.client_socket.send(b'\x0D' + incorrect_message)  # Inform client B of the incorrect guess
                    
                    print("Guess is incorrect.")
            
            elif request.startswith(b'\x0E'):  # Check if the request is a hint
                hint = request[1:].decode('utf-8')  # Extract the hint from the request, again get rid of 1 control byte
                game_key = [key for key in self.server.games.keys() if key[0] == self.client_id]
                
                if game_key:
                    opponent_id = game_key[0][1]
                    if opponent_id in self.server.clients:
                        self.server.clients[opponent_id].send(b'\x0E' + hint.encode('utf-8'))
                        self.server.games[game_key[0]]['hints'].append(hint)  # Add the hint to the hints list
                        print(f"Hint sent to opponent {opponent_id}: {hint}")

                    else:
                        print(f"Opponent {opponent_id} not connected.")
                else:
                    self.client_socket.send(b'\x10' + b'No game found for sending hint.')  # Send an error if no game found
                    print("No game found for sending hint.")
                    
            elif request.startswith(b'\x11'):  # Check if the request is to give up
                game_key = [key for key in self.server.games.keys() if key[0] == self.client_id or key[1] == self.client_id]  # Find the game the client is participating in

                print(game_key) # e.g. [(1, 2)] - 0 requestor of the game, 1 player who guess the hidden word

                if game_key:  # If the game is found
                    game = self.server.games[game_key[0]]  # Get the game details

                    if self.client_id == game_key[0][1]:  # Only the player who is guessing can give up (second el in the list)
                        game['result'] = 'gave up'
                        give_up_message = 'You gave up. The game is over. You lose.'.encode('utf-8')
                        self.client_socket.send(b'\x0C' + give_up_message)  # Send message to the player who gave up

                        opponent_message = 'The player has given up. The game is over. You won.'.encode('utf-8')
                        self.server.clients[game_key[0][0]].send(b'\x0C' + opponent_message)  # Send message to the opponent who won

                        # Move the game to completed games, be aware of duplications
                        if game_key[0] in self.server.completed_games:
                            self.server.completed_games[game_key[0]].append(game)
                        else:
                            self.server.completed_games[game_key[0]] = [game]

                        del self.server.games[game_key[0]]  # Remove the game from the games dictionary

                        print(f"Player {self.client_id} has given up. Game ended.")  # Log the give up action
                    else:
                        self.client_socket.send(b'\x0F' + b'Only the player who is guessing can give up.')  # Inform that only the guessing player can give up
                        print("Only the player who is guessing can give up.")
                else:
                    self.client_socket.send(b'\x0F' + b'No active game found to give up.')  # Inform if no active game is found
                    print("No active game found to give up.")
    
        except Exception as e:
            print(f"Error handling request {request}: {e}")  # Log the error
            
    def is_player_in_game(self, player_id):
        """
        Checks if a given player is currently in an active game.

        Args:
            player_id (int): The ID of the player to check.

        Returns:
            bool: True if the player is in an active game, False otherwise.
        """
        for game in self.server.games.keys():
            if player_id in game:
                return True
        return False
