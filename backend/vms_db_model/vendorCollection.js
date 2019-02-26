const mongoose = require('mongoose');

// Article Schema
let vendorcollection = mongoose.Schema({
  name:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  date:{
    type: Date
  }
});

module.exports = mongoose.model('vendorcollection', vendorcollection);
