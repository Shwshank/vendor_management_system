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

      adminCollection.findOne({name: request.body.name}).then(vres=>{
        if(vres) response.json({message: "Vendor is registered with same name"})

        else {
          vendorCollection.findOne({email: request.body.email}).then(vres1=>{
            if(vres1) response.json({message: "Vendor is registered with same email"})
            else{
              // create new vendor

              var newPassword = password_generator.generate({
                  length: 10,
                  numbers: true
              });
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

  checkRequest = (validKeyArray, requestBody) =>{
    return validKeyArray.every(key => Object.keys(requestBody).includes(key))
  }

}
