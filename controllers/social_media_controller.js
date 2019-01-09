module.exports = function(app){
    app.get('/www.facebook.com', function(req,res){
        res.sendFile('/home/marcos/Web/PG FInder/public/' + 'page404.html');
    })
};