const { param } = require('express-validator');

// Validation rules for registering a participant to an event
const registerParticipantRules = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID'),
  
  param('participantId')
    .isUUID()
    .withMessage('Invalid participant ID')
];

// Validation rules for removing a participant from an event
const removeParticipantRules = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID'),
  
  param('participantId')
    .isUUID()
    .withMessage('Invalid participant ID')
];

// Validation rules for getting event participants
const getEventParticipantsRules = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID')
];

// Validation rules for getting participant events
const getParticipantEventsRules = [
  param('participantId')
    .isUUID()
    .withMessage('Invalid participant ID')
];

module.exports = {
  registerParticipantRules,
  removeParticipantRules,
  getEventParticipantsRules,
  getParticipantEventsRules
};
