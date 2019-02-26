const mongoose = require('mongoose');

// Article Schema
let projectcollection = mongoose.Schema({
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

module.exports = mongoose.model('projectcollection', projectcollection);
