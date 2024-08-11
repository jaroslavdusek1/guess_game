# Guess game

The aim of this app is to allow users to play a "guess the word" game over the network. Guess Game is an application divided into a backend and a frontend. The backend is in Python and the frontend is in TypeScript.

### Why Python and TypeScript?
Backend (Python): Python is a good choice for quick development of a simple backend server where we don't need to process hundreds of requests per second. Python also has a rich library for networking, if more performance is required, I would choose C or Rust.

Frontend (TypeScript): TypeScript offers strong typing, which helps prevent errors it's a good choice for modern frontend development.

## Prerequisites
It is expected to be tested on a freshly installed Ubuntu 22.04 system.

## Required Tools
Python 3.8+ for the backend.
Node.js 14+ and npm for the frontend.

## Files structure
```
guess-game/
├── backend/
│   ├── client_handler.py
│   ├── server.py
│   ├── web_server.py
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── BinaryHelper.ts
│   │   ├── Client.ts
│   │   ├── CommandHandler.ts
│   │   ├── constants.ts
│   │   ├── index.ts
│   │   └── Utils.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── binary_protocol.md
└── README.md
```

## Step-by-Step Setup

1. Clone the Repository
First open a new terminal window and clone the repository:
```bash
git clone https://github.com/jaroslavdusek1/guess_game.git
cd guess_game
```

## 2. Backend Setup
The backend runs on Python, so navigate to the backend directory.

Navigate to the backend folder:
```bash
cd backend
```

_Note: The virtual environment (venv) was not used because the project does not have any external dependencies._

a) Install Python (if not already installed)
If Python is not installed, install it with the following commands:
```bash
sudo apt update
sudo apt install python3
```

b) Run the Backend Server

  1. Local Mode: This mode is used to run the server using a Unix socket.
  2. Network Mode: This mode is used to run the server using a TCP socket.

To run the server in local mode, use the following command:
```bash
python3 server.py local
```
To run the server in network mode, use the following command:
```bash
python3 server.py network
```
These commands allow you to choose between running the server locally (using a Unix socket) or over a network (using TCP/IP).



##  3. Frontend Setup
The frontend runs on Node.js and is written in TypeScript.

a) Install Node.js and npm (if not already installed)
If Node.js is not installed, install it with the following commands:
```bash
sudo apt install nodejs npm
```

b) Install Dependencies
Navigate to the frontend directory and install all dependencies:
```bash
cd /path/to/your/project/frontend
npm install
```
_Note: Replace /path/to/your/project/ with the actual path where you have cloned the repository._

c) Run the Frontend Client
The frontend client requires specific commands to run, depending on whether you're running the server locally (Unix socket) or over the network (TCP socket).

For Local Mode:
Run the frontend client in local mode, where the server is using a Unix socket:
```bash
npm start -- --mode=local --address=/tmp/unix_socket
```

For Network Mode:
Run the frontend client in network mode, where the server is using a TCP socket:

```bash
npm start -- --mode=network --address=192.168.0.1:9999
```
_Note: Replace e.g. 192.168.0.1 with the IP address where the SERVER is running. You can check the server's IP address by using the command 'ip a' on the server machine._

This will start the frontend and connect it to the specified backend server.


## Checking Server Status
1. For Local Mode:
Since the server runs using a Unix socket in local mode, there's no need to check for a port, you can ensure that the socket file is created:
```bash
ls /tmp/unix_socket
```
If the file /tmp/unix_socket exists, the server is running in local mode.

2. For Network Mode:
To check if the server is running and listening on port 9999:
```bash
sudo lsof -iTCP:9999 -sTCP:LISTEN
```
Output might seems like this:
```bash
COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Python  19358   jd    3u  IPv4 0xde012581c8bea40d      0t0  TCP *:distinct (LISTEN)
```
If you see output indicating that port 9999 is in use, your server is running correctly in network mode.
