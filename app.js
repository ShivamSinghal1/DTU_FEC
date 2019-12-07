var express 		= require("express"),
	app 	       	= express(),
    mongoose        = require("mongoose"),
    admin           = require('firebase-admin'),
    serviceAccount  = require("./serviceAccountKey.json"),
     dotenv = require('dotenv');
dotenv.config();

//Models for Mongo DB
var subject   = require("./models/subject"),
    resource  = require("./models/resource");

mongoose.connect("mongodb+srv://Shivam:"+process.env.DATABASE_PASSWORD+"@cluster-qxo00.mongodb.net/DTUFec?retryWrites=true&w=majority", { useNewUrlParser: true });

//connect to firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://dtufec.appspot.com/"
});
var bucket = admin.storage().bucket();


app.set("view engine", "ejs");
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

//Route Start from Here
app.get("/", function(req, res){
  subject.find({}, function(err, subjects){
    if(!err){
      res.render("home",{
        subjects: subjects
      })
    }
  });
});


app.get("/about",function(req,res){
  res.render("about");
});


app.get("/:subject", function(req,res){
  var sub = req.params.subject;
  subject.find({}, function(err, subjects){
    if(!err){
      resource.find({},function(err, resources){
        if(!err){
          res.render("subject",{
            subjects: subjects,
            resources: resources,
            sub: sub
          })
        }
      });
    }
  });
});


app.get("/:subject/:resource", function(req, res){
  var sub = req.params.subject;
  var resrc = req.params.resource;
  var query;
  subject.find({}, function(err, subjects){
    if(!err){
      var j,x = subjects.length;
      for(j=0;j<x;j++){
        if(subjects[j].name == sub){
          query = subjects[j].code;
        }
      };
      if(j==x){
        resource.find({name: resrc},function(err, resources){
        if(!err){
          bucket.getFiles(function(err,files){
            if(!err){
              var i,length = files.length;
              var files_name = [];
              var files_download_token = [];
              if(resources.length != 0){
                query = query.concat(resources[0].code);
              }
              for(i=0;i<length;i++){
                var fileName = files[i].name;
                if(fileName.indexOf(query)!=-1){
                  files_name.push(fileName);
                  files_download_token.push(files[i].metadata.metadata.firebaseStorageDownloadTokens);
                }
              }
              if(i==length){
                res.render("resource",
                  {
                    sub: sub,
                    subjects: subjects,
                    resrc: resrc,
                    files_name: files_name,
                    files_download_token: files_download_token
                  }
                );
              }      
            }
          });
        }
        });
      }
    }
  });
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
  res.status(404);
  res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

//Server Start
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
