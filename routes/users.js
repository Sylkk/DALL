var express =   require('express');
var mongoose =  require('mongoose');
var config =    require('config');

var User =      mongoose.model('User');

var router =    express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.webmaster'))
            return next();
    res.redirect('/login');
});

/* GET users list page. */
router.get('/', function(req, res, next) {
    User.find({}, function(err, users){
        if(err){
            res.status(500).end();
        }
        if(users === null){
            res.status(404).end();
        } else {
            res.render('users', {
                title: 'User List',
                user: req.user,
                users: users,
                activePage: {
                    usersList : true
                }
            });
        }
    });
});

module.exports = router;
