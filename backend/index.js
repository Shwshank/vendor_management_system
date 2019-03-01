const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const morgan = require('morgan')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer  = require('multer')
const password_generator = require('generate-password');
const _ = require('lodash');

const adminCollection = require('./vms_db_model/adminCollection');
const vendorCollection = require('./vms_db_model/vendorCollection');
const projectCollection = require('./vms_db_model/projectCollection');
const projectUserCollection = require('./vms_db_model/projectUserCollection');

const testAPI = require('./api/testAPI');
const adminAPI = require('./api/adminAPI');
const vendorAPI = require('./api/vendorAPI');
const projectAPI = require('./api/projectAPI');
const projectUserAPI = require('./api/projectUserAPI');

const app = express();
const port = 5000;
const saltRounds = 8;
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://127.0.0.1/vms_db', { useNewUrlParser: true });
const db = mongoose.connection;

//Check for connection
db.once('open',()=>{
  console.log('Connected to db');
})

mongoose.set('useCreateIndex', true);

app.use(bodyParser.json());
app.use(morgan('dev'))

const params = (app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator);

adminAPI(app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator);

vendorAPI(app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator);

projectUserAPI(app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator);

// testAPI(app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _);

app.listen(port, () => console.log(`vms listening on port ${port}`))
