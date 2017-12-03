var express = 	require('express');
var mongoose = 	require('mongoose');
var config =    require('config');

var router = 	express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.ami_du_loot'))
            return next();
    res.redirect('/login');
});

/* GET infos page. */
router.get('/',  function(req, res, next) {
    res.render('infos', { 
        title: 'Infos',
        user: req.user,
        activePage: {
            infos : true
        }
    });
});

module.exports = router;
