var express = 	require('express');
var mongoose = 	require('mongoose');
var config =    require('config');

var Char =      mongoose.model('Char');


var router = 	express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.ami_du_loot'))
            return next();
    res.redirect('/login');
});

/* GET admin page. */
router.get('/',  function(req, res, next) {
    Char.find({"main":true}, function(err, chars){
        if(err){
            res.status(500).end();
        }
        if(chars === null){
            res.status(404).end();
        } else {
            res.render('roster', { 
                title: 'Roster',
                user: req.user,
                chars: chars,
                activePage: {
                    roster : true
                }
            });
        }
    }).sort({ilvle: -1});
});

router.post('/updateAll', function(req, res, next){
    var _id = req.body.data;
   // _id = req.body.data.split("_")[1];
    console.log("UpdateAllRoster request : "+_id);
    
    Char.find({"main": true}, function(err, chars){
        if(err){
            res.status(500).end();
        }
        if(chars === null){
            res.status(404).end();
        } else{
            console.time('update_allRosterChars');
            chars.forEach(function(chara){
                chara.update();
            });
            console.timeEnd('update_allRosterChars');
        }
    });
});


module.exports = router;
