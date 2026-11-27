#!/bin/sh
PORT=${PORT:-3000}
echo "Starting on port $PORT"
exec npx next start -p $PORT
