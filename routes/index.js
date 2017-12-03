var express     = require('express');
var mongoose    = require('mongoose');
var passport    = require('passport');
var config      = require('config');
var util        = require('util');
var util_       = require('../config/util');
var bodyParser  = require('body-parser');
var form        = require('express-form');
var bnet        = require('promise-battlenet-api');
var fs          = require('fs');

var User        = mongoose.model('User');
var Char        = mongoose.model('Char');
var Apply       = mongoose.model('Apply');

var router      = express.Router();
var field       = form.field;


/* GET DALL index page. */
router.get('/', function(req, res, next) {
    Char.find({"main":true}, function(err, chars){
       if(err){
           res.statut(500).end();
       }else{
            User.find({}, function(err, users){
                if(err){
                    res.statut(500).end();
                }else{
                    res.render('index', {
                        title: 'Tools',
                        user: req.user,
                        users: users,
                        mains: chars, 
                        tabRecrut: getMatriceRecrutement(),
                        messages: req.flash('info'),
                        errors: req.flash('error'),
                        activePage: {
                            index : true
                        } 
                    });
                }
            });
       } 
    }).sort("class");
});


router.post('/', 
    form(      
        field("contact_email").trim().required().isEmail(), 
        field("contact_btag").trim(),//.is(/^[A-Za-z]+(#)[0-9]+$/), 
        field("role").trim().required(),
        field("presentation").trim().required(),
        field("lien_armu").trim().required().isUrl(), //regex ?
        field("date_play").trim().required(),
        field("xp_pve").trim().required(),
        field("motivation").trim().required(),
        field("old_guild").trim().required(),
        field("interface").trim().required(),
        field("tc").trim().required(),
        field("reroll").trim()
       ),
    function(req, res, next){
        if (!req.form.isValid) { //Handle errors
            //console.log(req.form);
            console.log(req.form.errors);
        } else { //all OK so curl realms/name for datas
            console.log("lien_armu:", req.form.lien_armu);
            
            var client = new bnet({
                apikey: config.get('Bnet.apiKey'), 
                throttle:{
                    to:  99,    
                    per: 1000  
                }
            });
            
            //http://eu.battle.net/wow/en/character/:realms/:name/advanced
            //http://eu.battle.net/wow/character/:realms/:name/advanced  (wowprogress)
            
            //https://worldofwarcraft.com/en-gb/character/:realms/:name (new armory mai 2017)
            client.fetch("character", { 
                    region: "eu",
                    realm:  req.form.lien_armu.split("/")[5],
                    name:   req.form.lien_armu.split("/")[6],
                    fields: "items,progression"
            })
            .then(function createApply(res) {//tout se passe bien
                    statusCode   = res.data;
                    responseTime = res.data;
                    headers      = res.data;
                    data         = res.data; //champs data de res

                    //progression HFC
                    var totHFC = 0;
                    if(data.progression.raids[34]){
                        for(i=0;i<13;i++){
                            if(data.progression.raids[34].bosses[i].mythicKills >= 1){
                                totHFC += 1;
                            }
                        }
                    }
                
                    //progression EN
                    var totEN = 0;
                    if(data.progression.raids[35]){
                        for(i=0;i<7;i++){
                            if(data.progression.raids[35].bosses[i].mythicKills >= 1){
                                totEN += 1;
                            }
                        }
                    }
                
                    //progression TOV
                    var totTOV = 0;
                    if(data.progression.raids[36]){
                        for(i=0;i<3;i++){
                            if(data.progression.raids[36].bosses[i].mythicKills >= 1){
                                totTOV += 1;
                            }
                        }
                    }
                    
                    //progression NH
                    var totNH = 0;
                    if(data.progression.raids[37]){
                        for(i=0;i<10;i++){
                            if(data.progression.raids[37].bosses[i].mythicKills >= 1){ 
                                totNH += 1;
                            }
                        }
                    }
                    
                    //progression ToS
                    var totToS = 0;
                    if(data.progression.raids[38]){
                        for(i=0;i<9;i++){
                            if(data.progression.raids[38].bosses[i].mythicKills >= 1){ 
                                totToS += 1;
                            }
                        }
                    }
                    
                    //progression Argus
                    var totArgus = 0;
                    if(data.progression.raids[39]){
                        for(i=0;i<9;i++){
                            if(data.progression.raids[39].bosses[i].mythicKills >= 1){ 
                                totArgus += 1;
                            }
                        }
                    }
                    
                
                    var content = {
                        "presentation": req.form.presentation,
                        "lien_armu":    req.form.lien_armu,
                        "date_play":    req.form.date_play,
                        "xp_pve":       req.form.xp_pve,
                        "motivation":   req.form.motivation,
                        "old_guild":    req.form.old_guild,
                        "interface":    req.form.interface,
                        "tc":           req.form.tc,
                        "reroll":       req.form.reroll
                    };

                    //then send to mongoDB
                    var a = new Apply({
                            name:           util_.upFirst(decodeURIComponent(req.form.lien_armu.split("/")[6])),
                            realm:          util_.upFirst(req.form.lien_armu.split("/")[5]),
                            ilvl:           data.items.averageItemLevel,
                            ilvle:          data.items.averageItemLevelEquipped,
                            progressHFC:    totHFC+"/13",//HFC
                            progressEN:     totEN+"/7",  //EN
                            progressTOV:    totTOV+"/3", //TOV
                            progressNH:     totNH+"/10", //NH
                            progressToS:    totToS+"/9", //ToS
                            progressArgus:  totArgus+"/9",//Argus
                            achievPts:      data.achievementPoints,
                            class:          data.class,
                            //artefactPow: 45874,

                            content: content,
                            status: "PENDING",
                            role: req.form.role,
                            dateStart: new Date(),
                            //dateEnd: "",
                            contactMail: req.form.contact_email,
                            contactBTag: req.form.contact_btag
                        });
                        a.save(function saveApplyInDB(err) {
                            if(err){
                                next(err);
                            } else {
                                console.log('new apply: ' + a);
                                a.sendMailNewApply();
                            }
                        });
            })
            .catch(console.error); //error curl 

        }
        res.redirect('/');
    
});



/* logout from DALL TOOLS (dunno why only here works ><) */
router.get('/logout', function(req, res) {
    if (req.isAuthenticated()){
        User.findOneAndUpdate(
            {_id: req.user._id},	//condition
            {online: 0},		//update
            {},                         //options
            function(err, user){	//callback
                req.logout();
                res.redirect('/home');
            });
    }else{
        res.redirect('/');
    }
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
