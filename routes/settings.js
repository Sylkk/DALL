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

/* GET settings page. */
router.get('/', function(req, res, next) {
    res.render('settings', { 
        title: 'Settings',
        user: req.user,
        activePage: {
            infos : true
        } 
    });
});

module.exports = router;