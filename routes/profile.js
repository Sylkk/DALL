var express = 	require('express');
var mongoose = 	require('mongoose');
var config =    require('config');
var bnet =      require('../config/bnet');
var util_ =     require('../config/util');

var Char =      mongoose.model('Char');

var router = 	express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.ami_du_loot'))
            return next();
    res.redirect('/login');
});

// path data for href
router.use(function(req, res, next) {
    res.locals.current_path = req.path;
    next();
});

/* GET profile page. */
router.get('/', function(req, res, next) {
    Char.find({"_id_user":req.user._id}, function(err, chars){
        if(err){
            res.status(500).end();
        }
        if(chars === null){
            res.status(404).end();
        } else {
            res.render('profile', { 
                title:       'Profile',
                user:        req.user,
                chars:       chars,
                messages:    req.flash('info'),
                errors:      req.flash('error'),
                _realmsList: config.get('Wow.realmsList'),
                _maxItemLvl: config.get('Wow.maxItemLevel'),
                _maxAP:      config.get('Wow.maxAP'),
                _targetAPPoint: config.get('Wow.targetAPPoint'),
                activePage: {
                    profile : true
                }
            });
        }
    }).sort({main: -1, realm: -1, ilvl: -1});
});

router.get('/:realm/:name', function (req, res, next){
    var realm = util_.upFirst(req.params.realm);
    var name =  util_.upFirst(req.params.name);
    
    Char.findOne({"realm": realm, "name": name}, function(err, char){
        if(err){
            console.log("500");
            res.status(500).end();
        }
        if(char === null){ //render char not found
            console.log("Char not found in DB");
            res.render('char', {
                title: realm + " - " + name + " (not found)",
                user: req.user,
                chara: "",
                activePage: {
                    profile : true
                }
            });
        } else {    //render char in DB
            res.render('char', {
                title: realm + " - " + name,
                user: req.user,
                chara: char,
                _maxItemLvl:  config.get('Wow.maxItemLevel'),
                activePage: {
                    profile : true
                }
            });
        }
    });
});

router.post('/setMain', function (req, res, next){
    var _id = req.body.data;
    console.log("setMain id : "+_id);
    //asynch ? (refresh, to continue)
});

router.post('/addChar', function (req, res, next){
    var data = req.body.data;
    console.log("AddChar request : " + JSON.stringify(data));
    bnet.addChar(req, data);
});

router.post('/delete', function(req, res, next){
    var _id = req.body.data;
    console.log("DeleteChar request : " + JSON.stringify(_id));
    
    Char.findOne({"_id":_id}).remove().exec(function(err, char){
        if(err){
            res.status(500).end();
        }
        if(char === null){
            res.status(404).end();
        }
    });       
});

router.post('/updateAll', function(req, res, next){
    var _id = req.body.data;
   // _id = req.body.data.split("_")[1];
    console.log("UpdateAll request : "+_id);
    
    Char.find({"_id_user":_id}, function(err, chars){
        if(err){
            res.status(500).end();
        }
        if(chars === null){
            res.status(404).end();
        } else{
            console.time('update_allchars');
            chars.forEach(function(chara){
                chara.update();
                
            });
            console.timeEnd('update_allchars');
        }
    });
});

router.post('/update', function (req, res, next) {  
    var _id = req.body.data;
    console.log("Update request : "+_id);
    
    Char.findOne({"_id":_id}, function(err, char){
        if(err){
            res.status(500).end();
        }
        if(char === null){
            res.status(404).end();
        } else {
            res.status(200).send('OK');
            char.update();
        }
    });
});


module.exports = router;