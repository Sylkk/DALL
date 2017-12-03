var express = 	require('express');
var mongoose = 	require('mongoose');
var config =    require('config');

var router = 	express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.apply'))
            return next();
    res.redirect('/login');
});

/* GET weakaura page. */
router.get('/', function(req, res, next) {
	res.render('weakaura', { 
		title: 'Weak Aura',
		user: req.user,
		activePage: {
 			weakaura : true
 		} 
	});
});

module.exports = router;