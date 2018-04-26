var express     = require('express');
var mongoose    = require('mongoose');
var passport    = require('passport');
var config      = require('config');
var requestIp   = require('request-ip');
var util        = require('../config/util.js');

var User        = mongoose.model('User');
var Apply       = mongoose.model('Apply');

var router      = express.Router();

//http://www.danse-avec-les-loots.fr/register/94548915364684654354657374357654357457374687115489709
//http://localhost:3000/register/94548915364684654354657374357654357457374687115489709

/* code verification for register */
router.param('code', function(req, res, next, code){
    /*
    if(code === config.get('Dall.registerCode')){
        next();
    }*/
    Apply.findOne({tokenRegister:code}, function(err, apply){
        if(err){
            res.status(500).end();
        }
        if(apply === null){
            res.redirect("/login"); //pas d'apply trouvé avec ce token
        }else{
            next();
        }
    });
});

/* GET home page. */
router.get('/:code', function(req, res, next) {
    var errors = req.flash('error');
    var error = '';
    if (errors.length) {
        error = errors[0];
    }

    res.render('register', { 
        title: 'Register',
        error: error,
        tokenRegister: req.params.code,
        hidingError: 'hidden', 
        activePage: {
            register : true
        } 
    });
});

router.get('/', function(req, res, next) {
    res.redirect("/login");
});

router.post('/:code', function(req,res,next){
    var tokenRegister   = req.params.code;
    var name            = util.upFirst(req.body.name);
    var email           = req.body.email;
    var password1       = req.body.password;
    var password2       = req.body.confirmPassword;
    var rank            = 3; //apply

    User.findOne({$or: [
            {"email": email}, 
            {"name": name}
    ]}, function (err, user) { //email ou name existe déja
        if(user){
            req.flash('error', 'Nous avons déjà un compte avec l\' email (' + email+ ') ou l\'utilisateur (' + name + ')');
            return res.redirect('/register/' + tokenRegister);
        } else { // no duplicate user found
            if(password1 === password2){
                var u = new User({
                    name: util.upFirst(name),
                    email: email,
                    password: util.encrypt(password1),
                    rank: rank,
                    ip: requestIp.getClientIp(req),
                    lastConnection: new Date(),
                    firstConnection: new Date()
                });
                u.save(function (err) {
                    if(err){
                        next(err);
                    } else {
                        console.log('new user: ' + u);
                        req.login(u, function(err){
                            if(err) { return next(err); }
                            //suppression du tokenRegister
                            Apply.update({"tokenRegister":tokenRegister}, 
                                         {$unset: {tokenRegister:1}}, function(err, apply){
                                if(err){
                                    res.status(500).end();}
                                if(apply === null){
                                    res.status(404).end();}
                            });
                            //fin suppression tokenRegister
                            req.flash('info', 'Bienvenue ' + u.name + "!");
                            res.redirect('/home');
                        });
                    }
                });	
            } else {
                req.flash('error', 'Le password de confirmation ne correspond au password de base');
                return res.redirect('/register');
            }
        }
    });
});

module.exports = router;
