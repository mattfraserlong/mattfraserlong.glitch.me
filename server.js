//assign and require express, body parser, cors and mongoose
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortId = require('shortid')



//create mongoose schema for users and their data
var schema = new Schema({
    playerName: String,
    score: Number,
    shortId: {type: String, unique: true, default: shortId.generate}
});

//create mongoose model from schema
var Player = mongoose.model('Player', schema);

//connect to db
var db = mongoose.connect(process.env.MLAB_URI, function(err) {
  if(err) {console.log("err");}
});

//allows app to access public static files
app.use(express.static('public'))
//with a req to / responds with views/index.html with any dependencies to public static files from line23.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//allows access to public static files
app.use('/public', express.static(process.cwd() + '/public'));


//cross-origin browsing middleware
app.use(cors())


/*----bodyParser middleware----*/
//body-parser extracts the entire body portion of an incoming request stream and exposes it on req.body as something easier to interface with
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


/*----routes----*/

/*----post requests----*/

//route for posting new user to db
app.post('/api/space-invader-post',function (req, res) {
  var playerInst = new Player ({ 
      playerName: req.body.playerName,
      score: req.body.playerScore
      });
  
  playerInst.save(function(err) {
      if(err) {
        res.send("err saving to db.")
      } else {
        res.send("successfully saved.")
      }
  });
});

/*---- get requests----*/

app.get('/api/space-invader', function(req, res){

  Player.find({}).sort('-score').limit(5).exec(function(err, docs) {
    if(docs.length !== 0) {
    var array = []
    for (var i = 0; i < docs.length; i++) {
      var element = "<p>" + docs[i].playerName + ": " + docs[i].score + "</p>";
      array.push (element);
    }
    var stringtoSend = array.join("");
    res.send(stringtoSend);
    } else {
    res.send("No high scores yet");
    }
  });

})


//route for interrogating db

/*----end of routes----*/

/*----functions----*/

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: '404 not found error'})
})


// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})




