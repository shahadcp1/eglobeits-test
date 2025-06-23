#!/bin/bash

# Test creating an event
echo "Creating an event..."
EVENT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Tech Conference 2023", "description": "Annual technology conference", "eventDate": "2023-12-15T09:00:00.000Z", "capacity": 100}')

echo "Event created:"
echo $EVENT_RESPONSE | jq .

# Extract event ID
EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')

# Test creating a participant
echo -e "\nCreating a participant..."
PARTICIPANT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/participants \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john.doe@example.com"}')

echo "Participant created:"
echo $PARTICIPANT_RESPONSE | jq .

# Extract participant ID
PARTICIPANT_ID=$(echo $PARTICIPANT_RESPONSE | jq -r '.id')

# Register participant for the event
echo -e "\nRegistering participant for the event..."
REGISTRATION_RESPONSE=$(curl -s -X POST http://localhost:3001/api/events/$EVENT_ID/participants/$PARTICIPANT_ID)

echo "Registration response:"
echo $REGISTRATION_RESPONSE | jq .

# List participants for the event
echo -e "\nListing participants for the event..."
curl -s http://localhost:3001/api/events/$EVENT_ID/participants | jq .
