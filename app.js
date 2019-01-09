var express = require('express');
var app = express();

var login_signup_controller = require('./controllers/login_signup_controller');
var sns_controller = require('./controllers/social_media_controller');




// Set template engine
app.set('view engine', 'ejs');

// Static files
app.use(express.static('./public'));

// Fire controller
sns_controller(app);
login_signup_controller(app);


const redirectLogin = (req, res, next) => {
    next();
    // console.log(req.session.user)
    // if(!req.session.user){
    //     res.redirect('/login'); 
    // }
    // else{
    //     next();
    // }
}

var sessionChecker = (req, res, next) => {
    console.log()
    console.log(req.session.user)
    console.log(req.cookies.user_sid)
    if (req.session.user && req.cookies.user_sid)
    {
        res.redirect('/');
    } 
    else 
    {
        next();
    }    
};

app.get('/', sessionChecker, function(req,res){
    res.render('pages/index.ejs',{user: 0});
});

app.get('/rooms', function(req,res){
    res.render('pages/rooms.ejs', {user: 1});
})

app.get('/contact_us', function(req,res){
    res.render('pages/contact_us.ejs', {user: 0});
})
     
app.get('/about', function(req,res){
    res.render('pages/about.ejs', {user: req.body.user_type});
})

app.get('/dashboard', function(req, res){
    res.render('pages/dashboard.ejs', {user: 0});
})

// Listen to port
app.listen(3000);
console.log("Listening to port 3000!");