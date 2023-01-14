const mongoose = require('mongoose');
const validator = require('validator');

const roomSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    // Throws error if name of the room contains characters other than (a-z,A-Z,0-9)
    validate(value) {
      if (!validator.isAlphanumeric(validator.blacklist(value, ' '))) {
        throw new Error('Room name should only contain alphabets and numbers!');
      }
    },
  },
  locked: {
    type: Boolean,
    default: false,
  },
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
