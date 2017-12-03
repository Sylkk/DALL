var express     = require('express');
var mongoose    = require('mongoose');
var passport    = require('passport');
var config      = require('config');
var fs          = require('fs');

var User        = mongoose.model('User');
var Char        = mongoose.model('Char');

var router      = express.Router();

//soit utilisé la fonction dans chaque demandes, soit utilisé le middleware .use
// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.officer'))
            return next();
    res.redirect('/login');
});
 

/* GET admin page. */
router.get('/', function(req, res, next) {

    User.find({}, function(err, users){
        if(err){
            res.status(500).end();
        }
        if(users === null){
            res.status(404).end();
        } else {
            Char.find({}, function(err, chars){
                if(err){
                    res.status(500).end();
                }
                if(chars === null){
                    res.status(404).end();
                } else {
                    res.render('admin', {
                        title: 'Admin',
                        user: req.user,
                        users: users,
                        chars: chars,
                        tabRecrut: getMatriceRecrutement(),
                        activePage: {
                            admin : true
                        }
                    }); 
                }   
            }).sort({main: -1, ilvl: -1});
        }
    }).sort({rank: 1});
});

router.post('/setRole', function(req, res, next){
    var char_id = req.body.charSelect;
    var role    = req.body.roleSelect;
    if(typeof char_id !== "undefined" && typeof role !== "undefined"){
        Char.findOne({"_id":char_id}, function (err, chara){
            if(err){
                res.status(500).end();
            }
            if(chara === null){
                res.status(404).end();
            } else{
                chara.role = role;
                chara.save();
            }
        }); 
    }
    console.log("Set Role for "+char_id+" as "+role);
    res.redirect("/admin");
});

//can use FindOneAndUpdate
router.post('/setMain', function(req, res, next){
    var user_id = req.body.userSelect;
    var char_id = req.body.charSelect;
    if(typeof char_id !== "undefined" && typeof user_id !== "undefined"){
        Char.find({$and:[{"_id_user":user_id},{"main":true}]}, function(err, chars){ //on set MAIN:false sur le/les main du user 
            if(err){
                res.status(500).end();
            }
            if(chars === null){
                res.status(404).end();
            } else{
                chars.forEach(function(chara){
                    chara.main = false;
                    chara.save();
                });
            }
        });
        Char.findOne({"_id":char_id}, function(err, chara){ //on ajoute le MAIN sur l'unique perso
            if(err){
                res.status(500).end();
            }
            if(chara === null){
                res.status(404).end();
            } else{
                chara.main = true;
                chara.save();
                User.findOne({"_id":user_id}, function(err, user){ //on change le crest/icon du user en conséquence
                    if(err){
                        res.statut(500).end();
                    }
                    if(user === null){
                        res.statut(404).end();
                    }else{
                        user.icone = chara.icone;
                        user.save();
                    }
                });
            }
        });
    }
    console.log("Set Main for "+user_id+" to "+char_id) ;
    res.redirect("/admin");
});

router.post('/removeMain', function(req, res, next){
    var char_id = req.body.charSelect;
    if(typeof char_id !== "undefined"){
        
        Char.findOne({"_id":char_id}, function(err, chara){ //delete main for specific user
            if(err){
                res.status(500).end();
            }
            if(chara === null){
                res.status(404).end();
            } else{
                var user_id = chara._id_user;
                chara.main = false;
                chara.save();
                User.findOne({"_id":user_id}, function(err, user){ //search user and delete crest
                    if(err){
                        res.status(500).end();
                    }
                    if(user === null){
                        res.status(404).end();
                    }else{
                        user.icone = "";
                        user.save();
                    }
                });
            }
        });
    }
    console.log("Remove Main for "+char_id);
    res.redirect("/admin");
});

router.post('/setUserRank', function(req, res, next){
    var user_id = req.body.userSelect;
    var newRank = req.body.rankSelect; 
    if(typeof user_id !== "undefined" && typeof newRank !== "undefined"){
        User.findOne({"_id":user_id}, function(err, user){
            if(err){
                res.statut(500).end();
            }
            if(user === null){
                res.statut(404).end();
            }else{
                user.rank = newRank;
                user.save();
            }
        });
        if(newRank < config.get('ACL.apply')){ //out roster if rank < 3 (apply)
            User.findOne({"_id":user_id}, function(err, user){ //search user and delete crest
                if(err){
                    res.statut(500).end();
                }
                if(user === null){
                    res.statut(404).end();
                }else{
                    user.icone = "";
                    user.save();
                    Char.findOne({$and:[{"_id_user":user_id},{"main":true}]}, function(err, chara){ //delete main for specific user
                        if(err){
                            res.status(500).end();
                        }
                        if(chara === null){
                            res.status(404).end();
                        } else{
                            chara.main = false;
                            chara.save();
                        }
                    });
                }
            });
        }
    }
    console.log("Set User : "+ user_id +" to Rank "+ newRank);
    res.redirect("/admin");
});

router.post('/deleteUser', function(req, res, next){
    var user_id = req.body.userSelect;
    
    Char.find({"_id_user":user_id}).remove().exec(function(err, chara){
        if(err){
            res.status(500).end();
        }
        if(chara === null){
            res.status(404).end();
        }
    });
    
    User.findOne({"_id":user_id}).remove().exec(function(err, user){
        if(err){
            res.status(500).end();
        }
        if(user === null){
            res.status(404).end();
        }
    });
    console.log("Delete User : " + user_id);
    res.redirect("/admin");
});

router.post('/recrutement', function(req, res, next){
    
    var id = req.body.class;
    var path = "./config/recrutement.txt";
    var tabRecrut = getMatriceRecrutement();
    var tmp = id.split(".");
    
    console.log("Clic : " + tmp);

    if(tabRecrut[tmp[0]][tmp[1]] === 0){
        tabRecrut[tmp[0]][tmp[1]] = tabRecrut[tmp[0]][tmp[1]] + 1;//si 0 on rajoute 1
    }
    else if(tabRecrut[tmp[0]][tmp[1]] === 1){
        tabRecrut[tmp[0]][tmp[1]] = tabRecrut[tmp[0]][tmp[1]] - 1;//si 1 on enleve 1
    }  
    
    fs.writeFileSync('./config/recrutement.txt', ''); //erase file
    
    for(var i = 0; i < 12; i++){
        for(var j = 0; j <= 3; j++){
            fs.appendFileSync(path, tabRecrut[i][j]);//line
        }
        fs.appendFileSync(path, "\n");//new line
    }
        
    res.redirect('/admin');

});


function getMatriceRecrutement(){
   
    var tabRecrut = new Array(); 
    var k = 0;
    
    fs.readFileSync('./config/recrutement.txt').toString().split('\n').forEach(function(line){
        tabRecrut[k] = line;
        k++;
    });
    
    for(var i=0; i < tabRecrut.length ; i++){
        if(tabRecrut[i].toString().localeCompare("0000") === 0){
            tabRecrut[i] = new Array(0,0,0,0);
        }
        if(tabRecrut[i].toString().localeCompare("0001") === 0){
            tabRecrut[i] = new Array(0,0,0,1);
        }
        if(tabRecrut[i].toString().localeCompare("0010") === 0){
            tabRecrut[i] = new Array(0,0,1,0);
        }
        if(tabRecrut[i].toString().localeCompare("0011") === 0){
            tabRecrut[i] = new Array(0,0,1,1);
        }
        if(tabRecrut[i].toString().localeCompare("0100") === 0){
            tabRecrut[i] = new Array(0,1,0,0);
        }
        if(tabRecrut[i].toString().localeCompare("0101") === 0){
            tabRecrut[i] = new Array(0,1,0,1);
        }
        if(tabRecrut[i].toString().localeCompare("0110") === 0){
            tabRecrut[i] = new Array(0,1,1,0);
        }
        if(tabRecrut[i].toString().localeCompare("0111") === 0){
            tabRecrut[i] = new Array(0,1,1,1);
        }
        if(tabRecrut[i].toString().localeCompare("1000") === 0){
            tabRecrut[i] = new Array(1,0,0,0);
        }
        if(tabRecrut[i].toString().localeCompare("1001") === 0){
            tabRecrut[i] = new Array(1,0,0,1);
        }
        if(tabRecrut[i].toString().localeCompare("1010") === 0){
            tabRecrut[i] = new Array(1,0,1,0);
        }
        if(tabRecrut[i].toString().localeCompare("1011") === 0){
            tabRecrut[i] = new Array(1,0,1,1);
        }
        if(tabRecrut[i].toString().localeCompare("1100") === 0){
            tabRecrut[i] = new Array(1,1,0,0);
        }
        if(tabRecrut[i].toString().localeCompare("1101") === 0){
            tabRecrut[i] = new Array(1,1,0,1);
        }
        if(tabRecrut[i].toString().localeCompare("1110") === 0){
            tabRecrut[i] = new Array(1,1,1,0);
        }
        if(tabRecrut[i].toString().localeCompare("1111") === 0){
            tabRecrut[i] = new Array(1,1,1,1);
        }
    }
    
    return tabRecrut;
}

module.exports = router;
