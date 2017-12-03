var express = 	require('express');
var mongoose = 	require('mongoose');
var passport = 	require('passport');
var requestIp = require('request-ip');
var config =    require('config');

var User =      mongoose.model('User');

var router = 	express.Router();

/* GET login page */
router.get('/', function(req, res, next) {
    var errors = req.flash('error');
    var error = '';
    if (errors.length) {
        error = errors[0];
    }
    
    if(req.isAuthenticated()){ //logged
        res.redirect('/home');
    }else{ //not logged
        res.render('login', { 
            title: 'Dall - Login',
            error: error,
            hidingError: 'hidden',
            activePage: {
                login : true
            }  
        });
    }
});

router.post('/', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.' }), function(req, res){
    User.findOneAndUpdate(
        {_id: req.user._id},                //condition
        {lastConnection: new Date(),        //update
         ip: requestIp.getClientIp(req),
         online: 1}, 	
        {},                                 //options
        function(err, user){                //callback
            req.flash('info', 'Bienvenue ' + user.name + '!');
            req.flash('error', "Error : " + err);
            res.redirect('/home');
        });
});


module.exports = router;
