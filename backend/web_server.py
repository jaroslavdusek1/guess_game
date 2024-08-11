from http.server import BaseHTTPRequestHandler, HTTPServer  # Import modules for handling HTTP requests and creating a server

class GameServer(BaseHTTPRequestHandler):
    """
    GameServer class to handle HTTP GET requests and serve the current status of active and finished games.

    Attributes:
        server_instance (Server): The instance of the game server that holds the game data.
    """
    server_instance = None  # A class variable to store the server instance containing the game data

    @classmethod  # A decorator indicating that this method is a class method and will operate on the class itself, not on instances of the class
    # Simply said all instances of the GS class will have access to the same game data because the server_instance variable is defined at the class level 
    # and shared between all instances
    # e.g., 5 child instances of the GameServer class will share the same game data source
    def set_server_instance(cls, server_instance):
        """
        Sets the server instance that the GameServer will use to retrieve game data.

        Args:
            server_instance (Server): An instance of the Server class that holds game information.
        """
        
        cls.server_instance = server_instance  # Assign the server instance to the class variable

    def do_GET(self):
        """
        Handles HTTP GET requests. Responds with the current game status in HTML format.

        This method is automatically called when the server receives an HTTP GET request.
        If the request path is '/games', it will generate and send an HTML page displaying the status of active and finished games.
        """
        
        if self.path == '/games':  # Check if the request path is '/games'
            self.send_response(200)  # Send an HTTP 200 OK
            self.send_header('Content-type', 'text/html')  # Specify that the content is HTML
            self.end_headers()  # End the headers section of the response

            games_html = self.generate_games_html()  # Generate the HTML content for the games
            self.wfile.write(games_html.encode('utf-8'))  # Write the HTML content to the response

    def generate_games_html(self): # Generate HTML content
        """
        Generates an HTML representation of the current status of active and finished games.

        This method constructs an HTML page that lists all active games and finished games with details like the word to guess, attempts, hints, and the result.

        Returns:
            str: The HTML content as a string.
        """
        
        # Start of the HTML document with styling
        html = """
        <html>
        <head>
            <title>Game Status</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 20px;
                }
                h1, h2 {
                    color: #333;
                }
                .container {
                    display: flex;
                    justify-content: space-between;
                }
                .game-section {
                    width: 48%;
                }
                .game-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .game-table th, .game-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .game-table th {
                    background-color: #888888;
                    color: white;
                    text-align: left;
                }
                .game-table tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                .game-table tr:hover {
                    background-color: #ddd;
                }
                .hint, .result {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Game Status</h1>
            <div class="container">
                <div class="game-section">
                    <h2>Active Games</h2>
                    <table class="game-table">
                        <thead>
                            <tr>
                                <th>Game</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
        """

        # Active games section
        # Iterate through the games dict in the server_instance
        for game_key, game_data in self.server_instance.games.items():
            html += f"""
            <tr>
                <td>Game between players with ID {game_key[0]} and {game_key[1]}</td>
                <td>
                    <p>Word to guess: {game_data['word']}</p>
                    <p>Attempts: {', '.join(game_data['attempts'])}</p>
                    <p>Hints: {', '.join(game_data['hints'])}</p>
                </td>
            </tr>
            """

        html += """
                        </tbody>
                    </table>
                </div>
                <div class="game-section">
                    <h2>Finished Games</h2>
                    <table class="game-table">
                        <thead>
                            <tr>
                                <th>Game</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
        """

        # Finished games section
        for game_key, game_list in self.server_instance.completed_games.items():
            for game_data in game_list:  # Iterate over each finished game for this pair of players
                html += f"""
                <tr>
                    <td>Game between players with ID {game_key[0]} and {game_key[1]}</td>
                    <td>
                        <p>Word to guess: {game_data['word']}</p>
                        <p>Attempts: {', '.join(game_data['attempts'])}</p>
                        <p>Hints: {', '.join(game_data['hints'])}</p>
                        <p>Result: {game_data['result']}</p>
                    </td>
                </tr>
                """
        
        html += """
                        </tbody>
                    </table>
                </div>
            </div>
        </body>
        </html>
        """
        return html

def run_web_server(server_instance, port=8080):
    """
    Starts the web server that serves the game status page.

    Args:
        server_instance (Server): The server instance that holds the game data.
        port (int, optional): The port number on which to run the web server. Defaults to 8080.
    """

    GameServer.set_server_instance(server_instance)  # Set the server instance for the GameServer
    web_server = HTTPServer(('localhost', port), GameServer)  # Create the HTTP server
    print(f'Starting web server on port {port}')  # Log the port on which the server is running
    web_server.serve_forever()  # Start serving requests indefinitely
    