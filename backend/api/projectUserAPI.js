module.exports = (app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator) => {

  app.post('/userChangePassword', (request, response) =>{
    validKeyArray = ["email", "oldPassword", "newPassword"]

    if(!checkRequest(validKeyArray, request.body)){
      console.log(request.body);
      response.json({message: "Malformed request body"});
      } else {

        projectUserCollection.findOne({email: request.body.email}).then(res0=>{
          console.log(res0);
          console.log(request.body.oldPassword);
          bcrypt.compare(request.body.oldPassword, res0.password).then(res=>{
            console.log("password matched");

            // Updating password
            console.log(res);
            if(res) {
              bcrypt.hash(request.body.newPassword, saltRounds).then(hash=>{
                projectUserCollection.findOneAndUpdate(
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

  app.post('/userChangeName', (request, response) =>{
    validKeyArray = ["userId", "name"];

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});
    } else {

      projectUserCollection.findByIdAndUpdate(
        {_id: request.body.userId},
        {name: request.body.name},
        {new: false}).then(
        (res, err) =>{
          if(res) {
            console.log(res);
            response.json({message: "Name updated"})
          } else {
            response.json({message: "error "+err})
          }
        })

    }
  })

  app.post('/userChangeBoardName', (request, response) =>{
    validKeyArray = ["userId", "boardName"];

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});
    } else {

      projectUserCollection.findByIdAndUpdate(
        {_id: request.body.userId},
        {board: request.body.boardName},
        {new: false}).then(
        (res, err) =>{
          if(res) {
            console.log(res);
            response.json({message: "Name updated"})
          } else {
            response.json({message: "error "+err})
          }
      })
    }
  })

  app.get('/userGetAllProjects', (request, response) =>{

    var id = request.query.userId;
    var projectId = [];

    projectUserCollection.findById({_id: id}).then(res1=>{
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

  app.get('/userUpdateChangeRequestComment', (request, response) =>{
    validKeyArray = ["projectId", "cr_id", "userName", "userId", "userComment"];

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});
    } else {

      projectCollection.findOne({_id: request.body.projectId}).then(res01=>{
        console.log(res01);
        if(!res01) response.json({message: "Change request not found"});
        var changeRequest = res01.changerequest;

        // search index of change request
        var index = _.findIndex(changeRequest, { 'cr_id': request.body.cr_id });
        console.log(index);

        // if index not found, index will be -1
        if(index > -1){
          console.log(changeRequest[index].status);
          if(changeRequest[index].status === "Complete" ) {
            response.json({message: "Unable to update as status of the change request is "+changeRequest[index].status});
          } else {

            // update data
            changeRequest[index].projectuesrid = request.body.uesrId;
            changeRequest[index].projectuesrname = request.body.userName;
            changeRequest[index].projectuesrcomment = request.body.userComment;
            changeRequest[index].status = "Reviewing";

            projectCollection.findByIdAndUpdate(
              {_id: request.body.projectId},
              {changerequest: changeRequest },
              {new: false}
            ).then(res01=> {
              console.log(res01);
              response.json({message: "Change request updated"});
            }, err=> {
              console.log(err);
              response.json({message: "Unalbe to update change request"});
            })

          }

        } else {
          response.json({message: "Change Request not found"});
        }

      }, err=>{
        console.log(err);
      })

    }
  })

  checkRequest = (validKeyArray, requestBody) =>{
    return validKeyArray.every(key => Object.keys(requestBody).includes(key))
  }

}
