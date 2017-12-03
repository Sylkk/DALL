var express     = require('express');
var mongoose    = require('mongoose');
var config      = require('config');

var Char        = mongoose.model('Char');
var User        = mongoose.model('User');

var router      = express.Router();

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
        else {
            Char.find({}, function(err, chars){
                if(err){
                    res.status(500).end();
                }
                else {
                    res.render('chars', {
                        title: 'Char List',
                        user: req.user,
                        users: users,
                        chars: chars,
                        activePage: {
                            charsList : true
                        }
                    });
                }
            });  
        }
    });
    
    
    

});

router.post('/delete', function(req, res, next){
    var charId = req.body.data.charId;
    
    Char.findOne({"_id":charId}).remove().exec(function(err, chara){
        if(err){
            res.status(500).end();
        }
        if(chara === null){
            res.status(404).end();
        }
    });
    
    console.log("DELETE du char " + charId);
});

module.exports = router;
