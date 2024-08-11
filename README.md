



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