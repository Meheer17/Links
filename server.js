const express = require('express');
const path = require('path');
var cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url')
const multer = require('multer')


const User = require('./exe.js').User
const Exe = require('./exe.js').Exe
const fs = require('fs');
const util = require('util')
const unlinkfile = util.promisify(fs.unlink)



mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors({optionsSuccessStatus: 200}));
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')));

const urlSchema = mongoose.Schema({url : 'string'});
const Url = mongoose.model('url', urlSchema);

app.get('/', (req, res) => {
    const welcome = 'https://next-js-opal-xi.vercel.app/ Follow This Link To Continue.'
    res.json({welcome: welcome})
})

app.get('/projects/tribute-page', (req, res) => {
    res.sendFile(process.cwd() + '/views/1/1.html');
  });
  app.get('/projects/survey-form', (req, res) => {
    res.sendFile(process.cwd() + '/views/1/2.html');
  });
  app.get('/projects/online-shop', (req, res) => {
    res.sendFile(process.cwd() + '/views/1/3.html');
  });
  app.get('/projects/document', (req, res) => {
    res.sendFile(process.cwd() + '/views/1/4.html');
  });
  app.get('/projects/profile-1', (req, res) => {
    res.sendFile(process.cwd() + '/views/1/5.html');
  });

  app.get('/projects/random-quote-machine', (req, res) => {
    res.sendFile(process.cwd() + '/views/2/1.html');
  });
  app.get('/projects/markeddown', (req, res) => {
    res.sendFile(process.cwd() + '/views/2/2.html');
  });
  app.get('/projects/drum-machine', (req, res) => {
    res.sendFile(process.cwd() + '/views/2/3.html');
  });
  app.get('/projects/calculator', (req, res) => {
    res.sendFile(process.cwd() + '/views/2/4.html');
  });
  app.get('/projects/pomodoro-clock', (req, res) => {
    res.sendFile(process.cwd() + '/views/2/5.html');
  });

  app.get('/projects/timestamp-microservice', (req, res) => {
    res.sendFile(process.cwd() + '/views/3/1.html');
  });
  app.get('/projects/head-parser', (req, res) => {
    res.sendFile(process.cwd() + '/views/3/2.html');
  });
  app.get('/projects/url-shortner', (req, res) => {
    res.sendFile(process.cwd() + '/views/3/3.html');
  });
  app.get('/projects/file-metadata', (req, res) => {
    res.sendFile(process.cwd() + '/views/3/4.html');
  });
  app.get('/projects/exercise-tracker', (req, res) => {
    res.sendFile(process.cwd() + '/views/3/5.html');
  });

  app.get('/projects/temp-convert', (req, res) => {
    res.sendFile(process.cwd() + '/views/5/1.html');
  });
  app.get('/projects/tribe-web', (req, res) => {
    res.sendFile(process.cwd() + '/views/5/2.html');
  });
  app.get('/projects/all-react', (req, res) => {
    res.sendFile(process.cwd() + '/views/5/3.html');
  });

  app.get("/projects/api/timestamp-microservice/:input", (req, res) => {
    let input = req.params.input
    if(input.match(/\d{5,}/)){
            input = +input;
    }
    let date = new Date(input);

    if(date.toUTCString() == "Invalid Date"){
            res.json({error: date.toUTCString()})
    }
    res.json({ unix : date.valueOf(), utc : date.toUTCString()} )
    });
    app.get('/projects/api/timestamp-microservice', (req, res) => {
        let date = new Date()
        res.json({unix : date.valueOf(), utc : date.toUTCString()} )
    });

    app.get("/projects/api/head-parser/whoami", function (req, res) {
        res.json({ipaddress : req.connection.remoteAddress, language: req.headers["accept-language"], software: req.headers["user-agent"]});
    });

    app.post('/projects/api/url-shortner/shorturl', function(req, res) {
      console.log(req.body)
      const burl = req.body.url
      
      const sm = dns.lookup(urlparser.parse(burl).hostname,
      (error, address) => {
              if(!address){
                      res.json({error: "invalid url"})
              } else {
                      const url = new Url({url: burl})
                      url.save((err, data) => {
                             res.json({
                              original_url : data.url,
                              short_url : data.id
                             })
                      })
              }
              console.log("dns", error)
              console.log("address", address)
            })
            console.log("sm", sm)
      });

      app.get("/projects/api/url-shortner/shorturl/:id", (req,res) => {
            const id = req.params.id;
            Url.findById(id, (err, data) => {
                    if(!data){
                            res.json({error: "invalid url" })
                    } else {
                            res.redirect(data.url)
                    }
            })
      })

      var upload = multer({dest: 'uploads/'})

      app.post("/projects/api/file-metadata/fileanalyse",upload.single('upfile'),async (req, res) => {
        const data = {"name": req.file.originalname, "type": req.file.mimetype, "size": req.file.size}
        console.log(req.file)
        await unlinkfile(req.file.path)
        res.json(data)
      })



app.route('/projects/api/exercise-tracker/users')
.post((req,res) => {
  const newPerson = new User({username: req.body.username})
  newPerson.save((err, data) => {
    if(err){
      res.send("User Name Taken")
    } else{
      res.json({"username": data.username, "_id": data.id})
    }
  })
})

.get((req, res) => {
  User.find({}, (err, data) => {
    if(!err){
      const formatData = data.map((user) => {
        return{
          username: user.username,
          '_id': user.id
        }
      })
      res.json(formatData)
    } else {
      console.log("Error")
    }
  });
})

app.route('/projects/api/exercise-tracker/users/:id/exercises')
.post(async (req, res) => {
  const name = req.params.id
  User.findById(name, (err, data) => {
    if(err) {
      res.json({"Error": "There is no such user."})
    } else {
      if(req.body.date == undefined) {
        console.log("hello")
        const newExe = new Exe({
          duration: parseInt(req.body.duration),
          description: req.body.description,
          date: new Date() 
        })
      console.log(newExe)
        data.log.push(newExe)
        data.save((err, udata) => {
          if(err) {
            res.json({"Error" : "There was some error."})
          } else {
            res.json({
              username: data.username,
              "_id" : data._id,
              description: req.body.description,
              duration: parseInt(req.body.duration),
              date: new Date().toDateString() 
            })
          }
        })
         
      } else {
        
        const newExe = new Exe({
          duration: parseInt(req.body.duration),
          description: req.body.description,
          date: new Date(req.body.date)
        })
        console.log("hello 1")
      console.log(newExe)
        data.log.push(newExe)
        data.save((err, udata) => {
          if(err) {
            res.json({"Error" : "There was some error."})
          } else {
            res.json({
              username: data.username,
              "_id" : data._id,
              description: req.body.description,
              duration: parseInt(req.body.duration),
              date: new Date(req.body.date).toDateString() 
            })
          }
        })
        
      }
        
      }
  })
})

app.get("/projects/api/exercise-tracker/users/:_id/logs",async(req,res)=>{
if(req.params._id){
  User.findById(req.params._id,(err,result)=>{
    // console.log(result)
  if(!err){
    let responseObj={}
    responseObj["_id"]=result._id
    responseObj["username"]=result.username
    responseObj["count"]=result.log.length
    
    if(req.query.limit){
      responseObj["log"]=result.log.slice(0,req.query.limit)
    }else{
      responseObj["log"]=result.log.map(log=>({
      description:log.description,
      duration:log.duration,
      date: new Date(log.date).toDateString()
    }))
    }
    if(req.query.from||req.query.to){
      let fromDate=new Date(0)
      let toDate=new Date()
      if(req.query.from){
        fromDate=new Date(req.query.from)
      }
      if(req.query.to){
        toDate=new Date(req.query.to)
      }
      fromDate=fromDate.getTime()
      toDate=toDate.getTime()
      responseObj["log"]=result.log.filter((session)=>{
        let sessionDate=new Date(session.date).getTime()

        return sessionDate>=fromDate&&sessionDate<=toDate
      })
    }
    // console.log(responseObj)
      res.json(responseObj)
    }else{
      res.json({err:err})
    }
  })
  }else{
    res.json({user:"user not found with this id"})
  }
  })



  

app.listen(3000, 
    console.log('server started 3000')
);