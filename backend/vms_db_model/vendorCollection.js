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
  email:{
    type: String,
    required: true
  },
  remark:{
    type: String
  },
  date:{
    type: Date
  },
  projectid: {
    type: []
  }
});

module.exports = mongoose.model('vendorcollection', vendorcollection);
