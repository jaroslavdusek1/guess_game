# Guess game

Guess Game is a app split into a backend and a frontend. The backend is in Python, and the frontend in TypeScript. The goal of this application is to allow users to play a "guess the word" game over a network.

### Why Python and TypeScript?
Backend (Python): Python is good choice for quick development of a simple backend server where we don’t need to handle hundreds of requests per second. Python also has a rich library for networking, if higher performance is required, I would pick C or Rust.

Frontend (TypeScript): TypeScript offers strong typing, which helps prevent errors it's a good choice for modern frontend development.

Prerequisites
This guide assumes this will be tested on freshly installed Ubuntu 22.04 system.

Required Tools
Python 3.8+ for the backend.
Node.js 14+ and npm for the frontend.
Optional: virtualenv for isolating the Python environment.

## Files structure
```
guess-game/
├── backend/
│   ├── client_handler.py
│   ├── server.py
│   ├── web_server.py
│   └── requirements.txt
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
First, clone this repository:
```bash
git clone https://github.com/jaroslavdusek1/guess_game.git
cd guess_game
```

2. Backend Setup
The backend runs on Python, so navigate to the backend directory and install the dependencies.

a) Install Python (if not already installed)
If Python is not installed, install it with the following commands:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

b) Set Up Virtual Environment (Optional but Recommended)
Create and activate a virtual environment:
```bash
sudo apt install python3-venv
python3 -m venv venv
source venv/bin/activate
```

c) Install Dependencies
Navigate to the backend directory and install the necessary dependencies:
```bash
cd backend
pip install -r requirements.txt
```

d) Run the Backend Server
After successfully installing the dependencies, run the backend server:
  1. Local Mode: This mode is used to run the server using a Unix socket.
  2. Network Mode: This mode is used to run the server using a TCP socket.

To run the server in local mode, use the following command:
```bash
python server.py local
```
To run the server in network mode, use the following command:
```bash
python server.py network network
```
These commands allow you to choose between running the server locally (using a Unix socket) or over a network (using TCP/IP).


3. Frontend Setup
The frontend runs on Node.js and is written in TypeScript.

a) Install Node.js and npm (if not already installed)
If Node.js is not installed, install it with the following commands:
```bash
sudo apt install nodejs npm
```

b) Install Dependencies
Navigate to the frontend directory and install all dependencies:
```bash
cd ../frontend
npm install
```

c) Run the Frontend Client
Run the frontend client:
```bash
npm start
```


















// correct
guess-game/
│
├── backend/
│   ├── client_handler.py
│   ├── server.py
│   ├── web_server.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── BinaryHelper.ts
│   │   ├── Client.ts
│   │   ├── CommandHandler.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │   └── Utils.ts
│   └── package.json
│   └── tsconfig.json
│   └── binary_protocol.md
│
└── README.md






# Luxonis Task

## Backend

### Requirements

- Python 3.8+
- Optional: virtualenv

### Setup

1. Navigate to the `backend` directory:

```bash
cd backend
```

2. (Optional) Create and activate a virtual environment:
pip install -r requirements.txt

3. Install the required dependencies:
pip install -r requirements.txt

4. Run the server
python server.py


Frontend

Requirements
Node.js 14+
npm

Setup
1. Navigate to the frontend directory:
cd frontend

2. Install the required dependencies:
npm install

3. Run the client
npm start

Usage
1. Start the server as described above.
2. Start one or more clients as described above.
3. Follow the protocol for interaction as described in the task requirements.


sudo tcpdump -i lo0 port 9999 -X
