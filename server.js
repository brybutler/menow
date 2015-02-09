// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express

    var http = require('http').Server(express);
    var io = require('socket.io')(http);



    var jwt = require("jsonwebtoken");  // JSON Web Token for authentication
    var eJwt = require('express-jwt'); // JWT for express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var Schema = mongoose.Schema;
    var ObjectId = require('mongoose').Types.ObjectId; 

    var jwtSecret = 'fjkdlsajfoew239053/3uk';

    // configuration =================

    mongoose.connect('mongodb://localhost:27017/menow');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(function(req, res, next) {   // to avoid CORS (Cross Origin Request Sharing) error in the web browser
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });  
    //app.use(eJwt({ secret: jwtSecret }).unless({ path: [ '/api/authenticate' ]}));
    app.use(methodOverride());


  // define model =================
  
  

  var userSchema = new Schema({ 
        _id: Schema.Types.ObjectId,
        name: { firstname: String, surname: String }, 
        phone: String
    });


var groupSchema = new Schema({ 
        _id: Schema.Types.ObjectId,
        action: String, 
        message: String,
        user_id: Schema.Types.ObjectId,
        order: Number,
        contacts: [{
            _id: {type: Schema.Types.ObjectId, ref: 'users', autoIndexId: true  },
            group_id: {type: Schema.Types.ObjectId, ref: 'groups', autoIndexId: true  },

        }]
      
    });

  

  var UserModel = mongoose.model('users', userSchema);
  var GroupModel = mongoose.model('groups', groupSchema);
  
 

// routes ======================================================================

    // api ---------------------------------------------------------------------


    function csortOn( collection, field ) {
        collection.sort(
            function( a, b ) {
                if ( a.field <= b.field ) {
                    return( -1 );
                }
                return( 1 );
                
            }
        );
    }

    
    app.post('/api/authenticate', function(req, res) {
        UserModel.findOne({phone: req.body.phone, password: req.body.password}, function(err, data) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if (data) {
                  var token = jwt.sign({
                      userid: data._id
                    }, jwtSecret);
                  console.log(token);
                   res.json({
                        type: true,
                        data: data,
                        token: token
                    }); 

                } else {
                    res.json({
                        type: false,
                        data: "Incorrect email/password"
                    });    
                }
            }
        });
    });




    app.get('/api/groups/', function(req, res) {
      if ((req.query.group_id) && (req.query.action_id)) {
        console.log('group_id: ' + req.query.group_id);
        console.log('action_id: ' + req.query.action_id);
        var am = req.query.actionMessage;
        if (!am) {
          am = '';
        }

        GroupModel
           .update(
              { 
                _id: req.query.group_id
                },
              { $set: { "action": req.query.action_id, "message": am } }
              , function (err, numberAffected, raw) {
                  if (err) return handleError(err);
                  console.log('Action update: %d', numberAffected);
                  res.send('success');
                });

      }

    });


    app.get('/test/', function(req, res) {
      console.log('phone');
      //console.log(req.params.id);

    });

    app.get('/api/contacts/', 
      eJwt({ secret: jwtSecret }),
      function(req, res) {

        var tokenHeader = req.headers.authorization.replace("Bearer ", "");
        var decoded = jwt.verify(tokenHeader, jwtSecret);
        var user_id = new ObjectId(decoded.userid);


        if ((req.query.group_id) && (req.query.contact_id)) {

            console.log('target_group_id: ' + req.query.group_id);
            console.log('contact_id: ' + req.query.contact_id);
            console.log('contact_group_id: ' + req.query.contact_group_id);
            console.log('origin_group_id: ' + req.query.origin_group_id);

            var contact_id = new ObjectId(req.query.contact_id);
            var origin_group_id = new ObjectId(req.query.origin_group_id);
            var target_group_id = new ObjectId(req.query.group_id);
            var contact_group_id = new ObjectId(req.query.contact_group_id);
           
            GroupModel
           .update(
              { 
                _id: origin_group_id
                },
              { $pull: { 'contacts': { _id: contact_id } }}
              , function (err, numberAffected, raw) {
                  if (err) return handleError(err);
                  console.log('Pull: %d', numberAffected);
                  //console.log('Pull raw: ', raw);
                });

           GroupModel
           .update(
              { 
                _id: target_group_id
                },
              { $push: { 'contacts': { 
                _id: contact_id, 
                group_id: contact_group_id
              } }}
              , function (err, numberAffected, raw) {
                  if (err) return handleError(err);
                  console.log('Push: %d', numberAffected);
                  //console.log('Push raw: ', raw);
                });

          // var setkey = "groups."+req.query.contact_group_id+".contacts.$";

           GroupModel
           .update(
              { 
                _id: contact_group_id,
                "contacts._id": user_id
                },
              { $set: { "contacts.$.group_id": target_group_id } }
              , function (err, numberAffected, raw) {
                  //return numberAffected;
                  if (err) { 
                    console.log(err);
                    return handleError(err);

                  }
                  res.status(raw).end();
                  console.log('Set: %d', numberAffected);
                  console.log('Set raw: ', raw);
                });


        } else {

       
        

          GroupModel
          .find ({ user_id: user_id})
          .populate({
              path: 'contacts._id'//,
             // options: { sort: [['name.surname', 'asc']] }
          })
          .populate({
              path: 'contacts.group_id'
          })

          .exec(function(err, results) {
              //console.log(results.groups[0].contacts[0].contact_id.groups[1]);
             // csortOn(results.groups, 'order');
              console.log(results);
              
              for(var i in results) {
                console.log(results[i].contacts);
              }



              res.send(results);



          });

        }



    });



 // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

        // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");

    http.listen(3000, function () {
      console.log('Express server listening on port %d in %s mode', 3000, app.get('env'));
  });

    io.on('connection', function (socket) {
      console.log('connection');

      socket.on('changeGroup', function (data) {

        if (data.cid) {
          console.log('changeGroup_' + data.cid);
          socket.broadcast.emit('changeGroup_' + data.cid,  data);
        } else if (data.cida) {
          var carray = data.cida;
          for (var i in carray) {
            socket.broadcast.emit('changeGroup_' + carray[i]._id._id,  data);
          }

        }
      });
    });
