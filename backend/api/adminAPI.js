module.exports = (app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _) =>{

  app.get('/admin', (request, response)=> res.send('Hello Express!'));

  app.get('/adminInit', (request, response)=> {

    // response.header("Content-Type", "application/json");

    var admin = {
        name: "admin@qcin.org",
        password: "1234"
    }
    adminCollection.findOne({name: admin.name}).then(res=>{
      if(res) {
        response.json({message: "Admin exists"});
      } else {
        // initialize admin
        bcrypt.hash(admin.password, saltRounds).then(hash=>{
          new adminCollection({
            name: admin.name,
            password: hash
          }).save().then(
            response.send('Admin initialized')
          )
        })
      }
    });
  });

  app.post('/adminChangePassword', (request, response) =>{
    validKeyArray = ["name", "oldPassword", "newPassword"]

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body"});

    } else {

      adminCollection.findOne({name: request.body.name}).then(res=>{
        console.log(res);

      })
    }
  });

checkRequest = (validKeyArray, requestBody) =>{
  return validKeyArray.every(key => Object.keys(requestBody).includes(key))
}

}
