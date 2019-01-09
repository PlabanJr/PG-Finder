module.exports = function(app){
    var mongoose = require('mongoose');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var session = require('express-session');
    var multer  = require('multer');
    var path = require('path');
    var morgan = require('morgan');

    var url = 'mongodb://localhost/PG_Finder_User_DB'
    const MongoStore = require('connect-mongo')(session);
    
    var user_Customer = require('/home/marcos/Web/PG FInder/models/userModel');
    var pg_facility = require('/home/marcos/Web/PG FInder/models/facilityModel');

    

    const storage = require('multer-gridfs-storage')({
        url: 'mongodb://localhost/PG_Finder_User_DB', 
        file: function(req, file){   
            console.log(req.body)
            return {      
                 bucketName: 'Photos',       
                 filename: file.fieldname,
          }  
        }
    });

    const upload = multer({
        storage: storage,
        limits:{fileSize: 1000000},
    }).single('photos');


    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
        key: 'user_sid',
        resave: false,
        secret: 'indian cat',
        store: new MongoStore({
            url: url,
            autoRemove: 'interval',
            autoRemoveInterval: 10 // In minutes. Default
          }),
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60,
            secure: true,
        } 
    }))  
    app.use(morgan('dev'));
    app.use(cookieParser());
    
    app.use((req, res, next) => {
        if (req.cookies.user_sid && !req.session.user) {
            res.clearCookie('user_sid');
        }
        next();
    });

    var sessionChecker = (req, res, next) => {
        console.log()
        console.log(req.session.user)
        if (req.session.user && req.cookies.user_sid)
        {
            res.redirect('/');
        } 
        else 
        {
            next();
        }    
    };

    app.get('/logout', function(req, res){
        res.clearCookie('user_sid');
        res.render('pages/index.ejs',{
            user: req.body.user_type,
        })
    })

    app.get('/login', function(req,res){ 
        res.render('./pages/login.ejs',{});
    });

    app.post('/login', sessionChecker,function(req,res){
        mongoose.connect(url, { useNewUrlParser: true },function(err, db){
            if(err) throw err;
            var query = { email: req.body.email , password: req.body.password };
            var db_Collection;
            if(req.body.user_type == 1)
            {
                db_Collection = 'user_customers';
            }
            else
            {
                db_Collection = 'owner_customers';  
            }
            

            db.collection(db_Collection).findOne(query, function(err, result){
                if (err) throw err;
                
                if(result == null){ 
                    console.log("no data found");
                    db.close();
                    res.redirect('/login');
                }
                else{
                    console.log(result)
                    req.session.user = result.email; 
                    if(req.body.user_type == 1)
                    {
                        console.log("Entered here")
                        // res.redirect('/')
                        res.render('pages/index.ejs',{
                            user: req.body.user_type,
                        })
                    }
                    else if(req.body.user_type == 2)
                    {
                        res.render('pages/dashboard.ejs', {
                            user: req.body.user_type,
                        }) 
                    }
                }
            });
            
            console.log(req.session.user)
        })
    })

    
    app.post('/sign_up', function(req,res){
        mongoose.connect(url,{ useNewUrlParser: true }, function(err, db){
            if(err) throw err;

            var user = new user_Customer({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.mobile_no,
                password: req.body.password,
                user_type: req.body.sign_up_type,
            });
            
            var db_Collection;

            if(req.body.sign_up_type == 1)
            {
                db_Collection = 'user_customers';
            }
            else
            {
                db_Collection = 'owner_customers'; 
            }

            db.collection(db_Collection).findOne({email: req.body.email}, function(err, result){
                if (err) throw err;

                if(result != null){
                    console.log("User already registered!");
                    res.redirect('/login');
                }
                else{
                    db.collection(db_Collection).insertOne(user);
                    console.log("Data inserted!");
                    req.session.user = req.body.email; 
                    db.close();
                    res.redirect('/'); 
                }
            });
            
        })
    })


    app.post('/dashboard', function(req, res){
        mongoose.connect(url,{ useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            var uID = req.body.email + '-' + req.body.facility_name;
            var pg_obj = {
                _id: uID,
                name: req.body.facility_name,
                sharing: req.body.sharing,
                address: req.body.address,
                landmark:req.body.landmark, 
                phone: req.body.phone,
            }
            var pg = new pg_facility({
                _id: req.body.city,
                facility:[pg_obj]
            })

            

            db.collection('Cities').findOne({_id: req.body.city}, function(err, result){
                if (err) throw err;

                if(result != null){
                    console.log("User already registered!");
                    db.collection('Cities').updateOne(
                        {_id: req.body.city},
                        {$push: {
                            facility: pg_obj,
                        }},
                    )
                    console.log("Data Found in DB!");
                }
                else{
                    db.collection('Cities').insertOne(
                        {
                            _id: req.body.city,
                            facility: pg.facility,
                        }
                    );
                    console.log("Data inserted!");
                    
                }

                
                console.log(Date());
                db.close();
                res.render('pages/upload_photos.ejs',{
                    user: 2,
                    id: uID,
                }); 
                
            });

        })
    })


    app.post('/upload', function(req, res){
        
        upload(req, res, (err) => {
            if(err){
                console.log(err);
                res.send(err);
            } 
            else {
              if(req.file == undefined){
                  console.log("No files chosen")
              } 
              else {
                  console.log("File uploaded")
              }

              
            }
        });

        res.render('pages/index.ejs', {
            user: req.body.user_type
        });
    })


    app.post('/rooms',function(req, res){
        mongoose.connect(url, { useNewUrlParser: true },function(err, db){
            var city = req.body.city;
            db.collection('Cities').findOne({_id: city}, function(err, result){
                if(err) throw err;

                if(result == null)
                {
                    res.render('pages/page_not_found.ejs');
                }
                else
                {
                    console.log(result.facility)
                    res.render('pages/rooms.ejs', {
                        user: 1,
                        location: city,
                        facility: result.facility,
                    })
                }
            })

            db.close();
        })
    })

  
};

