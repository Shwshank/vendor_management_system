const mongoose = require('mongoose');

// Article Schema
let projectCollection = mongoose.Schema({
  name:{
    type: String,
    required: true,
    unique: true
  },
  startdate:{
    type: Date
  },
  complitiondate:{
    type: Date
  },
  cost:{
    type: String,
    required: true
  },
  remark:{
    type: String
  },
  changerequest:{
    type: [],
    unique: true
  },
  vendor:{
    type: []
  },
  projectuser:{
    type: []
  }
});

module.exports = mongoose.model('projectCollection', projectCollection);
