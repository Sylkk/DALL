var express = 	require('express');
var mongoose = 	require('mongoose');
var config =    require('config');
var bodyParser = require('body-parser');

var Apply =     mongoose.model('Apply');

var router = 	express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next){
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.apply'))
            return next();
    res.redirect('/login');
});

/* GET admin page. */
router.get('/', function(req, res, next) {
    Apply.find({}, function(err, applys){
        if(err){
            res.status(500).end();
        }
        if(applys === null){
            res.status(404).end();
        } else {
            res.render('applys', { 
		title: 'Applys',
		user: req.user,
                applys: applys,
		activePage: {
                    applys : true
 		} 
            });
        }
    }).sort({dateStart: -1});
});

router.post('/status', function(req, res, next){
    var apply_id        = req.body.applyId;
    var apply_status    = req.body.status;
    
    Apply.findOne({"_id":apply_id}, function(err, apply){
        if(err){
            res.status(500).end();
        }
        if(apply === null){
            res.status(404).end();
        }else{
            apply.setStatus(apply_status);
            apply.save();
            
            res.redirect('/applys');
        }
    });
    console.log("Set apply status to : " + apply_status + " for apply : " + apply_id);
});

router.post('/delete', function(req, res, next){
    var applyId = req.body.data.applyId;
    
    Apply.findOne({"_id":applyId}).remove().exec(function(err, apply){
        if(err){
            res.status(500).end();
        }
        if(apply === null){
            res.status(404).end();
        }
    });
    
    console.log("DELETE de l'apply  " + applyId);
});

router.post('/sendMessage', function(req, res, next){
    var message  = req.body.data.message;
    var mail     = req.body.data.mailContact;
    var pseudo   = req.body.data.pseudo;
    var realm    = req.body.data.realm;
    var sender   = req.body.data.sender;

    Apply.findOne({$and:[{"contactMail":mail},{"name":pseudo},{"realm":realm}]}, function(err, apply){
        if(err){
            res.status(500).end();
        }
        if (apply === null){
            res.status(404).end();
        }else{
            apply.sendMailMessage(message);
            apply.addMessage(message, sender);
            apply.save();
        }
    });
});


router.get('/newApplyNumber', function(req, res, next){
    Apply.count({"status":"PENDING"}, function(err, count){
        if(err){
            res.statut(500).end();
        }
        else{
            res.send(count.toString());
        }
    });
});

module.exports = router;
