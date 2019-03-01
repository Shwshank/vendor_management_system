const mongoose = require('mongoose');

// Article Schema
let projectusercollection = mongoose.Schema({
  name:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  remark:{
    type: String
  },
  date:{
    type: Date
  },
  board: {
    type: String
  },
  projectid: {
    type: []
  }
});

module.exports = mongoose.model('projectusercollection', projectusercollection);
