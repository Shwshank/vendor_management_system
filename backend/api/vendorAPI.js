module.exports = (app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator) => {

  app.post('/vendorChangePassword', (request, response) =>{
    validKeyArray = ["email", "oldPassword", "newPassword"]

    if(!checkRequest(validKeyArray, request.body)){
      console.log(request.body);
      response.json({message: "Malformed request body"});
      } else {

        vendorCollection.findOne({email: request.body.email}).then(res0=>{
          console.log(res0);
          console.log(request.body.oldPassword);
          bcrypt.compare(request.body.oldPassword, res0.password).then(res=>{
            console.log("password matched");

            // Updating password
            console.log(res);
            if(res) {
              bcrypt.hash(request.body.newPassword, saltRounds).then(hash=>{
                vendorCollection.findOneAndUpdate(
                  {email: request.body.email},
                  {$set: {password: hash}},
                  (err=>{
                    console.log("err "+err)
                    response.json({message: err+" Error"})
                  }, res1=>{
                    console.log("res1 "+res1)
                    response.json({message: " Password changed"})
                  })
                );
              })
            } else {
                response.json({message: "Password mismatch"})
            }
          })
        })

    }

  })

  app.post('/vendorChangeName', (request, response) => {
    validKeyArray = ["vendorId", "name"];

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});
    } else {

      vendorCollection.findByIdAndUpdate(
        {_id: request.body.vendorId},
        {name: request.body.name},
        {new: false},
        (err, doc) =>{
          if(err) {
            console.log(err);
            response.json({message: "Unable to change name "+err})
          } else {
            response.json({message: "Name updated"})
          }
        }
      )
    }
  });

  app.get('/vendorGetAllProjects', (request, response) =>{

    var id = request.query.vendorId;
    var projectId = [];

    vendorCollection.findById({_id: id}).then(res1=>{
      console.log(res1);
      projectId = res1.projectid;
      response.json({
        projectId : projectId
      })
    }, err =>{
      console.log("err "+err);
      response.json({message: err})
    })
  });

  app.post('/vendorAddChangeRequest', (request, response) =>{
    validKeyArray = ["projectId", "changeRequest"];

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});
    } else {

      var startDate = new Date(request.body.changeRequest.startDate)
      startDate = startDate.toISOString();
      var endDate = new Date(request.body.changeRequest.endDate);
      endDate = endDate.toISOString()
      var createdOn = new Date();
      createdOn = createdOn.toISOString();
      request.body.changeRequest.createdOn = createdOn;
      request.body.changeRequest.projectUserComment = "";

      projectCollection.findByIdAndUpdate(
        {_id: request.body.projectId},
        {$addToSet: { changerequest: request.body.changeRequest }},
        {new: false},
      ).then(res01=>{
        console.log(res01);
        response.json({message: "Change request added"});
      }, err=>{
        console.log(err);
        response.json({message: "Some error occurs while addinf change request "});
      })
    }

  });

  checkRequest = (validKeyArray, requestBody) =>{
    return validKeyArray.every(key => Object.keys(requestBody).includes(key))
  }

}
