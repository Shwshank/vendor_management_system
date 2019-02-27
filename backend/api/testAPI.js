module.exports = (app, adminCollection, vendorCollection, projectCollection, projectUserCollection, bcrypt, saltRounds, jwt, _, password_generator) =>{

  console.log("testing mode");
  const testString = "1234";
  const testString2 = 'not_bacon';

  // bcrypt async function with salt

  // bcrypt.genSalt(saltRounds, function(err, salt) {
  //     bcrypt.hash(testString, salt, function(err, hash) {
  //         let tempHash = hash;
  //         console.log(tempHash);
  //
  //         bcrypt.compare(testString, tempHash, function(err, res) {
  //             console.log("Error "+err);
  //             console.log("Response "+res);
  //         });
  //     });
  // });


  // bcrypt async function without salt

  // bcrypt.hash(testString, saltRounds, function(err, hash) {
  //   console.log(hash);
  //
  //   bcrypt.compare(testString, hash, function(err, res) {
  //     console.log(hash);
  //     console.log("Error "+err);
  //     console.log("Response "+res);
  //   });
  //
  // });


  // bcrypt with promise

  bcrypt.hash(testString, saltRounds).then(res=>{
    console.log(res);

    bcrypt.compare("1234", res).then(res=>{
      console.log(res);
    })

  })

}
