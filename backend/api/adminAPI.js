module.exports = (app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator) =>{

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
          console.log(hash);
          new adminCollection({
            name: admin.name,
            password: hash
          }).save().then(
            bcrypt.compare(admin.password, hash).then(res=>{
              if(res)
              response.json({message: "Admin initialized"})
            })
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

      adminCollection.findOne({name: request.body.name}).then(res0=>{
        console.log(res0);
        console.log(request.body.oldPassword);
        bcrypt.compare(request.body.oldPassword, res0.password).then(res=>{
          console.log("password matched");

          // Updating password
          console.log(res);
          if(res) {
            bcrypt.hash(request.body.newPassword, saltRounds).then(hash=>{
              adminCollection.findOneAndUpdate(
                {name: request.body.name},
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
  });

  app.post('/adminCreateVendor', (request, response) =>{
    validKeyArray = ["name", "email", "remark","projectid"]

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body"});

    } else {

      vendorCollection.findOne({name: request.body.name}).then(vres=>{
        if(vres) response.json({message: "Vendor is registered with same name"})

        else {
          vendorCollection.findOne({email: request.body.email}).then(vres1=>{
            if(vres1) response.json({message: "Vendor is registered with same email"})
            else{
              // create new vendor

              // generates random password
              // uncomment at production

              // var newPassword = password_generator.generate({
              //     length: 10,
              //     numbers: true
              // });

              var newPassword = "1234";

              var date = new Date();
              date = date.toISOString()

              var hashed = bcrypt.hash(newPassword,saltRounds)

              let createVendor = async () =>{
                new vendorCollection({
                  name: request.body.name,
                  password: await hashed,
                  email: request.body.email,
                  remark: request.body.remark,
                  date: date,
                  projectid: request.body.projectid
                }).save().then(resp1=>{
                  console.log(resp1);
                  response.json({message:"Vendor created"})
                }, err=>{
                  console.log(err);
                })
              }

              createVendor();
            }
          })
        }
      })
    }
  })

  app.post('/adminCreateProjectUser', (request, response) =>{
    validKeyArray = ["name", "email", "remark", "projectid", "board"]

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body"});

    } else {

      projectUserCollection.findOne({name: request.body.name}).then(vres=>{
        if(vres) response.json({message: "Another user is registered with same name"})

        else {
          projectUserCollection.findOne({email: request.body.email}).then(vres1=>{
            if(vres1) response.json({message: "Another user is registered with same email"})
            else{
              // create new vendor

              // var newPassword = password_generator.generate({
              //     length: 10,
              //     numbers: true
              // });

              var newPassword = "1234";

              var date = new Date();
              date = date.toISOString()

              var hashed = bcrypt.hash(newPassword,saltRounds)

              let createUser = async () =>{
                new projectUserCollection({
                  name: request.body.name,
                  password: await hashed,
                  email: request.body.email,
                  remark: request.body.remark,
                  date: date,
                  board: request.body.board,
                  projectid: request.body.projectid
                }).save().then(resp1=>{
                  console.log(resp1);
                  response.json({message:"Project user created"})
                }, err=>{
                  console.log(err);
                })
              }

              createUser();
            }
          })
        }
      })

    }
  });

  app.post('/adminCreateProject', (request, response) =>{
    validKeyArray = ["name", "startDate", "complitionDate", "cost", "remark", "vendor", "projectUser"]

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});

    } else {
      console.log(request.body);
      projectCollection.findOne({name: request.body.name}).then(vres=>{
        if(vres) response.json({message: "Another project is registered with same name"})

        else {
          startDate = "";
          complitiondate = "";
          if(request.body.startDate) {
            startDate = new Date(request.body.startDate)
            startDate = startDate.toISOString();
          }
          if(request.body.complitionDate) {
            complitiondate = new Date(request.body.complitionDate)
            complitiondate = complitiondate.toISOString();
          }

          db_result = new projectCollection({
            name: request.body.name,
            startdate: startDate,
            complitiondate: complitiondate,
            cost: request.body.cost,
            remark: request.body.remark,
            vendor: request.body.vendor,
            projectuser: request.body.projectUser
          }).save()

          fun = async ()=>{
            result_db =  await db_result;
            // console.log(result_db);
            response.json({message: "Project created"})
          }

          fun()
        }
      });
    }

  });

  app.post('/adminAssignProject', (request, response) =>{
    validKeyArray = ["projectId"];
    // console.log(request.body);

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});
    } else {

      projectCollection.findById(request.body.projectId).then(res=>{
        // console.log(res)
        var message = ""
        if(request.body.userId) {
          projectCollection.findByIdAndUpdate(
            {_id: request.body.projectId},
            {$addToSet: {projectuser: request.body.userId}},
            {new: false},
            (err, doc) =>{
              if(err) console.log("err "+err)
              else {
                message = "User added "
                console.log("updated ");
              }
            }
          )
        }

        if(request.body.vendorId) {
          projectCollection.findByIdAndUpdate(
            {_id: request.body.projectId},
            {$addToSet: {vendor: request.body.vendorId}},
            {new: false},
            (err, doc) =>{
              if(err) console.log("err "+err)
              else {
                message += "Vendor added "
                console.log("updated ");
                response.json({message: message})
              }
            }
          )
        }

        else response.json({message: "Unable to add user/ vendor"})

      }, error=>response.json({message: "Project Id not found."}))
    }

  })

  app.post('/adminDeleteProjectChangeRequest', (request, response) =>{
    validKeyArray = ["projectId"];

    if(!checkRequest(validKeyArray, request.body)) {
      console.log(request.body);
      response.json({message: "Malformed request body."});
    } else {
      projectCollection.findByIdAndUpdate(
        {_id: request.body.projectId},
        {changerequest: [] },
        {new: false}
      ).then(res01=> {
        if(res01) {
          console.log(res01);
          response.json({message: "Change request deleted"});
        } else {
          response.json({message: "Unalbe to delete change request"});
        }

      }, err=> {
        console.log(err);
        response.json({message: "Unalbe to delete change request"});
      })
    }
  })

  checkRequest = (validKeyArray, requestBody) =>{
    return validKeyArray.every(key => Object.keys(requestBody).includes(key))
  }

}
