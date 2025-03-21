#!/bin/bash

# Create the realm-data directory if it doesn't exist
REALM_DATA_DIR="$(pwd)/realm-data"
mkdir -p "$REALM_DATA_DIR"
echo "Created realm-data directory at: $REALM_DATA_DIR"

# Find the Realm database file in the simulator
echo "Looking for Realm database files in simulator..."

# Get the timestamp for the output files
TIMESTAMP=$(date +%s)

# Find all Realm database files in the simulator
REALM_FILES=$(find ~/Library/Developer/CoreSimulator/Devices -name "rntodolist.realm" -type f 2>/dev/null)

if [ -z "$REALM_FILES" ]; then
  echo "No Realm database files found. Make sure the app has been run in the simulator."
  exit 1
fi

# Get the most recent Realm file
LATEST_REALM_FILE=$(ls -t $REALM_FILES | head -1)
echo "Found Realm database at: $LATEST_REALM_FILE"

# Copy the Realm database file
REALM_OUTPUT_PATH="$REALM_DATA_DIR/todos_$TIMESTAMP.realm"
cp "$LATEST_REALM_FILE" "$REALM_OUTPUT_PATH"
echo "Copied Realm database file to: $REALM_OUTPUT_PATH"

# Copy additional Realm files if they exist
if [ -f "$LATEST_REALM_FILE.lock" ]; then
  cp "$LATEST_REALM_FILE.lock" "$REALM_OUTPUT_PATH.lock"
  echo "Copied Realm lock file"
fi

if [ -d "$LATEST_REALM_FILE.management" ]; then
  mkdir -p "$REALM_OUTPUT_PATH.management"
  cp -R "$LATEST_REALM_FILE.management/"* "$REALM_OUTPUT_PATH.management/"
  echo "Copied Realm management directory"
fi

# Also export as JSON for easier viewing
DOCUMENT_DIR=$(dirname "$LATEST_REALM_FILE")
JSON_FILES=$(find "$DOCUMENT_DIR" -name "todos_*.json" -type f 2>/dev/null)

if [ ! -z "$JSON_FILES" ]; then
  # Get the most recent JSON file
  LATEST_JSON_FILE=$(ls -t $JSON_FILES | head -1)
  JSON_OUTPUT_PATH="$REALM_DATA_DIR/todos_$TIMESTAMP.json"
  
  # Copy the JSON file
  cp "$LATEST_JSON_FILE" "$JSON_OUTPUT_PATH"
  echo "Exported todos as JSON to: $JSON_OUTPUT_PATH"
fi

echo -e "\nExport completed successfully!"
echo -e "\nRealm database file exported to: $REALM_OUTPUT_PATH"
echo "You can now open this file with Realm Studio to view and edit your database."
