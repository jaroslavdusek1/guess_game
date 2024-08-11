import atexit  # Import atexit to register cleanup functions to be executed upon program exit
import os  # Import the os module for interacting with the operating system
import socket  # Import the socket module to enable networking capabilities
import threading  # Import the threading module to handle multiple threads
from client_handler import ClientHandler  # Import the ClientHandler class from the client_handler module
from threading import Thread  # Import the Thread class for creating new threads
from typing import Tuple, Dict  # Import type hints for better code readability
from web_server import run_web_server  # Import the run_web_server function to start the web server

# from common.constants import COMMANDS, MESSAGES


class Server:
    """
    Server class to manage client connections, game logic, and interaction with the clients.

    Attributes:
        HOST (str): The hostname or path to the Unix socket.
        PORT (int): The port number for the server to listen on.
        PASSWORD (bytes): The password required for clients to connect to the server.
        clients (Dict[int, socket.socket]): A dictionary to store active client connections.
        client_id_counter (int): A counter for assigning unique IDs to clients.
        games (dict): A dictionary to hold active game sessions.
        completed_games (dict): A dictionary to store completed games.
        use_unix_socket (bool): A flag indicating whether to use a Unix socket or a TCP socket.
    """

    def __init__(self, host: str, port: int, use_unix_socket: bool = False):
        """
        Initializes the Server instance with the specified host, port, and socket type.

        Args:
            host (str): The hostname or Unix socket path.
            port (int): The port number for the server to listen on.
            use_unix_socket (bool): A flag to use a Unix socket instead of a TCP socket.
        """
        self.HOST = host  # Set the host address
        self.PORT = port  # Set the port number
        
        # In this type of app, particularly for an exercise like this, 
        # it is acceptable to hardcode the password as a plain string
        # however, in a PROD app, handling passwords requires much more care 
        # The password should be stored securely, for instance, in a database with strong encryption 
        # e.g. as SHA256 or SHA512, along with a salt for another security layer
        self.PASSWORD = b'mysecretpw'  # Set the password that clients must provide to connect

        self.clients: Dict[int, socket.socket] = {}  # Initialize the dictionary to store client connections
        self.client_id_counter = 1  # Initialize the client ID counter
        self.games = {}  # Initialize the dictionary to hold active games
        self.completed_games = {}  # Initialize the dictionary to store completed games
        self.use_unix_socket = use_unix_socket  # Set whether to use a Unix socket or TCP socket

        # Register a cleanup function to run when the program exits
        atexit.register(self.cleanup)

    def start(self):
        """
        Starts the server to listen for client connections.

        This method sets up the server socket, binds it to the specified host and port,
        and starts listening for incoming client connections. It also starts a web server
        in a separate thread.
        """
        # Create a socket (either Unix or TCP depending on the configuration)
        self.server_socket = socket.socket(socket.AF_UNIX if self.use_unix_socket else socket.AF_INET, socket.SOCK_STREAM)
        if self.use_unix_socket:
            # If using a Unix socket, remove the existing socket file if it exists
            if os.path.exists(self.HOST):
                os.remove(self.HOST)
            self.server_socket.bind(self.HOST)  # Bind the Unix socket to the specified path
        else:
            self.server_socket.bind((self.HOST, self.PORT))  # Bind the TCP socket to the specified host and port
        self.server_socket.listen(5)  # Start listening for client connections with a backlog of 5
        print(f"[*] Listening on {self.HOST}:{self.PORT if not self.use_unix_socket else ''}")

        # Start the web server in a separate thread
        web_server_thread = threading.Thread(target=run_web_server, args=(self,))
        web_server_thread.start()  # Start the web server thread

        print(f"[*] Web server available at http://localhost:8080/games")

        while True:
            # Accept new client connections in an infinite loop
            client_socket, client_address = self.server_socket.accept()
            print(f"[*] Accepted connection from {client_address}")
            client_handler = Thread(target=self.handle_client, args=(client_socket, client_address))
            client_handler.start()  # Start a new thread to handle the connected client

    def handle_client(self, client_socket: socket.socket, client_address: Tuple[str, int]):
        """
        Handles communication with a connected client.

        Args:
            client_socket (socket.socket): The socket connected to the client.
            client_address (Tuple[str, int]): The address of the connected client.
        """
        handler = ClientHandler(client_socket, client_address, self)  # Create a ClientHandler instance for the client
        handler.handle()  # Start handling client requests

    def cleanup(self):
        """
        Performs cleanup tasks when the server is shutting down.

        This method is registered to run when the program exits. It ensures that the Unix socket file
        is removed if it exists.
        """
        print("Cleaning up...")
        
        if self.server_socket:
            self.server_socket.close()  # Close the server socket
            print(f"Server socket on {'Unix socket' if self.use_unix_socket else 'TCP port'} cleaned up.")

        if self.use_unix_socket and os.path.exists(self.HOST):
            os.remove(self.HOST)  # Remove the Unix socket file if it exists
            print(f"Removed unix socket file: {self.HOST}")

if __name__ == "__main__":
    import sys  # Import the sys module for command-line argument handling
    mode = sys.argv[1] if len(sys.argv) > 1 else 'network'  # Determine the mode from command-line arguments
    if mode == 'local':
        # Run the server in local mode using a Unix socket
        server = Server('/tmp/unix_socket', 0, True)
    else:
        # Run the server in network mode using a TCP socket
        server = Server('0.0.0.0', 9999)
    server.start()  # Start the server
    