// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var Schema = mongoose.Schema;
    var o = {};



    // configuration =================

    mongoose.connect('mongodb://localhost:27017/menow');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());




  // define model =================
  var userSchema = new Schema({ name: String, phone: String});
  var groupUserSchema = new Schema({ _user_id: Object, _parent_user_id: Object, _group_id: Object});


    var User = mongoose.model('users', userSchema);

    o.map = function () {

        emit(this._id, { name: this.name, phone: this.phone});
    };

    o.query = { phone: '07553718474' };
   
    o.reduce = function (key, values) {
        var reduced = {};
        for (var i in values) {
            reduced.push(values[i]);
            
        }

        return reduced;
    };

    User.mapReduce(o, function (error, results, stats) {
            if(error) throw error;
            console.log(stats);
            console.log(results);
            //res.json(results); 
        });

 
/*
    mr_user.verbose = true;
*/
     


    var group_user = mongoose.model('groups_users', groupUserSchema);

// routes ======================================================================

    // api ---------------------------------------------------------------------
    /* get all company
    app.get('/api/company/:company_id', function(req, res) {

        Company.find({
            _id : req.params.company_id
        }, function(err, companies) {
            if (err)
                res.send(err)
            console.log(companies);
            res.json(companies); // return all todos in JSON format
        });
    });*/

    app.get('/api/contacts/', function(req, res) {
        console.log('contacts api');

       /* user.find({ 
            phone : '07553718474'
        }, function(err, results) {
            if (err)
                res.send(err)
            console.log("parentuser._id:" + contacts.phone);
        });
        
        group_user.find({ "_parent_user_id" : parentuser._id });
        */
        
      

       User.mapReduce(o, function (error, results, stats) {
            if(error) throw error;
            console.log(stats);
            console.log(results);
            //res.json(results); 
        });
/*

       User.find({
            phone: '07553718474'
        },function(err, results) {
            if (err)
                res.send(err)

            res.json(results); // return all todos in JSON format
           // getGroupUser(results[0]._id);
            console.log(results[0].name);

        });
        
        function getGroupUser(userid) {
            group_user.find({ 
                _parent_user_id : userid 

            },function(err, results) {
                getUser(results[0]._user_id);
            });
            

        }

        function getUser(userid) {
            User.find({
                _id: userid
            },function(err, results) {
                if (err)
                    res.send(err)
                console.log(results[0]);

            });
        }*/

       /* user.find({ 
            _id : '07553718474'
        }, function(err, results) {
            if (err)
                res.send(err)
            console.log("parentuser._id:" + contacts.phone);
        });*/
    });



 // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

        // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");
