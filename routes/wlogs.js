var express = 	require('express');
var mongoose = 	require('mongoose');
var config =    require('config');
var https =     require('https');

var router = 	express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.apply'))
            return next();
    res.redirect('/login');
});

/* GET wlogs page. */
router.get('/', function(req, res, next) {
    res.render('wlogs', { 
            title: 'Warcraft Logs',
            user: req.user,
            wlogsPublicKey: config.get('Wlogs.publicKey'),
            activePage: {
                    wlogs : true
            } 
    });
});

module.exports = router;