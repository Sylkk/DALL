var express     = require('express');
var mongoose    = require('mongoose');
var passport    = require('passport');
var config      = require('config');
var nodemailer  = require('nodemailer');
var mailgen     = require('mailgen');
var async       = require('async');
var crypto      = require('crypto');
var util        = require('../config/util.js');

var User        = mongoose.model('User');

var router      = express.Router();

/* reset code verification for reset password */
router.param('token', function(req, res, next, token){
    User.findOne({resetPasswordToken:token}, function(err, user){
        if(err){
            res.status(500).end();
        }
        if(user === null){
            res.redirect("/login"); //pas de token de reset trouvé (ou mauvais)
        }else{
            next();
        }
    });
});


/* GET reset page. */
router.get('/:token',  function(req, res, next) {
    var errors = req.flash('error');
    var error = '';
    if (errors.length) {
        error = errors[0];
    }
    
    var infos = req.flash('info');
    var info = '';
    if (infos.length) {
        info = infos[0];
    }
    
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Le token du reset du password à expiré ou est invalide.');
            return res.redirect('/forgot');
        }
        res.render('reset', { 
                title: 'Reset Password',
                tokenNewPassword: req.params.token,
                error: error,
                info: info,
                hidingInfo: 'hidden',
                hidingError: 'hidden',
                user: req.user,
                activePage: {
                    infos : true
            }
        });
    });
});

/*Access page without code, so redirect to login*/
router.get('/', function(req, res, next) {
    res.redirect("/login");
});

/*POST of new password*/
router.post('/:token', function(req,res,next){
    
    var password1       = req.body.password;
    var password2       = req.body.confirmPassword;
    
    
    async.waterfall([
        function(done) {
            if(password1 !== password2){
                req.flash('error', 'Les password ne correspondent pas.');
                    return res.redirect('back');
            }
            
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Le token du reset du password à expiré ou est invalide.');
                    return res.redirect('back');
                }

                user.password = util.encrypt(req.body.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            
            var transporter = nodemailer.createTransport({
                service: config.get('Mail.service'),
                auth: {
                    user: config.get('Mail.user'),
                    pass: config.get('Mail.pass')
                }
            });
            
            var mailOptions = {
                from: 'danseaveclesloots.contact@gmail.com',
                to: user.email,
                subject: 'DALL - Password changed',
                text:   'Bonjour,\n\n' +
                        'Ceci est la confirmation que le password de votre compte : ' + user.email + ' a bien été modifié.\n'
            };
            
            transporter.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Votre password a bien été changé.');
                done(err);
            });
        }
    ], function(err) {
            res.redirect('/home');
        });
});

module.exports = router;
