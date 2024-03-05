#!/bin/bash

# Start the y-websocket server
HOST=0.0.0.0 PORT=1234 node ./node_modules/y-websocket/bin/server.js &

# Save the PID of the background process
WS_SERVER_PID=$!

# Wait a little for the y-websocket server to initialize (optional, adjust time as needed)
sleep 2

# Start the npm development server
npm run dev

# After the npm dev server is stopped (e.g., by pressing Ctrl+C), kill the y-websocket server
kill $WS_SERVER_PID

