var express     = require('express');
var mongoose    = require('mongoose');
var passport    = require('passport');
var config      = require('config');
var nodemailer  = require('nodemailer');
var mailgen     = require('mailgen');
var async       = require('async');
var crypto      = require('crypto');


var User        = mongoose.model('User');

var router      = express.Router();


/* GET forgot page. */
router.get('/', function(req, res, next) {
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
    
    if(req.isAuthenticated()){ //logged
        res.redirect('/home');
    }else{ //not logged
        res.render('forgot', { 
            title: 'Dall - Forgot',
            user: req.user,
            error: error,
            info: info,
            hidingInfo: 'hidden',
            hidingError: 'hidden',
            activePage: {
                forgot : true
            }  
        });
    }
});

router.post('/', function(req, res, next){
    console.log("forgot password");
    
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err, user){
                if(!user){
                    req.flash('error', 'Aucun compte existant avec cette adresse email.');
                    return res.redirect('/forgot');
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
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
                subject: 'DALL - Password Reset',
                headers:{
                  'X-Entity-Ref-ID': ''
                },
                text: "Vous avez reçu cet email car vous (ou quelqu'un d'autre) avez demandé un changement de mot de passe.\n\n" +
                      "Merci de cliquer sur le lien suivant (ou de le coller dans votre navigateur) afin de proceder: \n\n" +
                      "http://" +req.headers.host + "/reset/" + token + "\n\n" +
                      "Si vous n'avez rien demandé, merci d'ignorer ce message, et votre mot de passe ne sera pas changé.\n"
            };
            
            transporter.sendMail(mailOptions, function(err, infoMail){
                if(err){
                    console.log(err);
                }else{
                    console.log("Mail sent: " + infoMail.response + "\n MessageId : " + infoMail.messageId);
                    req.flash('info', "Un email avec les instructions va etre envoyé d'ici quelques minutes à l'adresse : " + infoMail.envelope.to + " .");
                    return res.redirect('/forgot'); 
                }
                done(err, 'done');
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    });
    //res.redirect('/forgot');
});


module.exports = router;
