var express     = require('express');
var mongoose    = require('mongoose');
var passport    = require('passport');
var config      = require('config');

var Char        = mongoose.model('Char');

var router      = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    var errors = req.flash('error');
    var error = '';
    if (errors.length) {
        error = errors[0];
    }
    
    if(req.isAuthenticated() && req.user.rank >= config.get('ACL.noob')){ //logged
        
        Char.find({"main":true}, function(err, chars){
            if(err){
                res.status(500).end();
            }
            else{
                res.render('home', {
                    title: 'Tools',
                    user: req.user,
                    req: req,
                    chars: chars,
                    messages: req.flash('info'),
                    errors: req.flash('error'),
                    _maxItemLvl: config.get('Wow.maxItemLevel'),
                    _maxAP: config.get('Wow.maxAP'),
                    _maxAchievPts: config.get('Wow.maxAchievPts'),
                    activePage: {
                        index : true
                    } 
                }); 
            }
        }).sort("ilvl"); 
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

module.exports = router;
