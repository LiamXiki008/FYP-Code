//Modules
//importing mongodb, mongoose and express
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

//Connecting to MongoDB
const uri = "mongodb+srv://ninjaUser:bmwhqz029@cluster0.ugpfd.mongodb.net/SpaceShooter?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology:true})
	//If a connecting is set and is found, then the server will start listening
	.then((result)=>{

		//Creating a listen in order to run the server on localhost:8080 or any port available depending on user
		const port = process.env.PORT || 5501;
		app.listen(port, () => console.log("Listening on port "+ port + "..."));

	})
	//Else the error is caught and logged
	.catch((err)=>console.log(err));

app.use(express.static('public'));

app.use(bodyParser.json());

// Enable CORS middleware
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

//POST request for player parameters
app.post('/api/player-parameters', (req, res) => {
    // Extract player parameters from request body
    const playerParameters = req.body;
    console.log(req);
    console.log(req.body);
    // Insert player parameters into MongoDB
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(client => {
        const db = client.db('SpaceShooter');
        const playerParametersCollection = db.collection('PlayerParams');
        playerParametersCollection.insertOne(playerParameters)
          .then(result => {
            console.log('Player parameters inserted into MongoDB');
            res.sendStatus(201);
          })
          .catch(error => {
            console.error(error);
            res.sendStatus(500);
          })
          .finally(() => {
            client.close();
          });
      })
      .catch(error => {
        console.error(error);
        res.sendStatus(500);
      });
  });

  //POST request for level parameters
  app.post('/api/level-parameters', (req, res) => {
    // Extract player parameters from request body
    const levelParameters = req.body;
  
    // Insert player parameters into MongoDB
    MongoClient.connect('mongodb+srv://ninjaUser:bmwhqz029@cluster0.ugpfd.mongodb.net/SpaceShooter?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then(client => {
      const db = client.db('SpaceShooter');
      const playerParametersCollection = db.collection('LevelParams');
      playerParametersCollection.insertOne(levelParameters)
        .then(result => {
          console.log('Level parameters inserted into MongoDB');
          res.sendStatus(201);
        })
        .catch(error => {
          console.error(error);
          res.sendStatus(500);
        })
        .finally(() => {
          client.close();
        });
    })
    .catch(error => {
      console.error(error);
      res.sendStatus(500);
    });
  });
  