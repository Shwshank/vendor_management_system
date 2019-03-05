const crypto = require("crypto");

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

  app.post('/vendorSaveChangeRequest', (request, response) =>{
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

      // I M P O R T A N T
      //
      //  crypto function may be cpu intensed - blocking - process
      //
      // I M P O R T A N T

      // Instead of crypto,
      // var cr_id = password_generator.generate({
      //     length: 10,
      //     numbers: true
      // });

      var cr_id = crypto.randomBytes(10).toString('hex');

      request.body.changeRequest.createdOn = createdOn;
      request.body.changeRequest.cr_id = cr_id;
      request.body.changeRequest.projectuserid = "";
      request.body.changeRequest.projectusercomment = "";


      projectCollection.findByIdAndUpdate(
        {_id: request.body.projectId},
        {$addToSet:{ changerequest: request.body.changeRequest }},
        {new: false}
      ).then(res01=>{
        console.log(res01);
        if(!res01) response.json({message: "Unable to process"});
        response.json({message: "Change request added"});
      }, err=>{
        console.log(err);
        response.json({message: "Some error occurs while addinf change request "});
      })
    }

  });

  app.post('/vendorDeleteChangeRequest', (request, response) =>{
    validKeyArray = ["projectId", "cr_id"]

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body"});

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

          if(changeRequest[index].status === "Review" ||
          changeRequest[index].status === "Complete") {
            response.json({message: "Unable to delete as status of the change request is "+changeRequest[index].status});
          } else {

            // delete index of object
            changeRequest.splice(index, 1)

            projectCollection.findByIdAndUpdate(
              {_id: request.body.projectId},
              {changerequest: changeRequest },
              {new: false}
            ).then(res01=> {
              console.log(res01);
              response.json({message: "Change request deleted"});
            }, err=> {
              console.log(err);
              response.json({message: "Unalbe to delete change request"});
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

  app.post('/vendorEditChangeRequest', (request, response) =>{
    validKeyArray = ["projectId", "cr_id", "title", "startDate", "endDate", "cost", "vendorComment", "snapshot"];

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

          if(changeRequest[index].status === "Review" || changeRequest[index].status === "Complete") {
            response.json({message: "Unable to update as status of the change request is "+changeRequest[index].status});
          }
          else {

            // update data
            changeRequest[index].title = request.body.title;
            changeRequest[index].startdate = request.body.startDate;
            changeRequest[index].enddate = request.body.endDate;
            changeRequest[index].cost = request.body.cost;
            changeRequest[index].vendorcomment = request.body.vendorComment;
            changeRequest[index].snapshot = request.body.snapshot;

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

  app.post('/vendorUpdateChangeRequestStatus', (request, response) =>{
    validKeyArray = ["projectId", "cr_id"];

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
            response.json({message: "Status of this CR is already Completed!"});
          } else {

            // update data
            changeRequest[index].status = "Complete";

            projectCollection.findByIdAndUpdate(
              {_id: request.body.projectId},
              {changerequest: changeRequest },
              {new: false}
            ).then(res01=> {
              console.log(res01);
              response.json({message: "Change request Completed"});
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
  });

  checkRequest = (validKeyArray, requestBody) =>{
    return validKeyArray.every(key => {
      Object.keys(requestBody).includes(key)
    })
  }

}
