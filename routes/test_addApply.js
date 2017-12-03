var express = 	 require('express');
var mongoose = 	 require('mongoose');
var bodyParser = require('body-parser');
var form =       require('express-form');
var config =     require('config');
var util =       require('util');
var util_=       require('../config/util');
var bnet =       require('promise-battlenet-api');

var Apply = 	 mongoose.model('Apply');

var router = 	 express.Router();
var field =      form.field;

// route middleware that will happen on every request
router.use(function(req, res, next) {
    if(req.isAuthenticated())
        if (req.user.rank >= config.get('ACL.webmaster'))
            return next();
    res.redirect('/login');
});

/* GET test_addApply page. */
router.get('/', function(req, res, next) {
    res.render('test_addApply', { 
        title: 'Add apply',
        user: req.user,
        activePage: {
            test_addApply : true
        } 
    });
});

/* send apply form for test */
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
    function checkForm(req, res, next){
        if (!req.form.isValid) { //Handle errors
            //console.log(req.form);
            console.log("Errors Applys : " + req.form.errors);
        } else { //all OK so curl realms/name for datas
            //console.log("lien_armu:", req.form.lien_armu);
            
            var client = new bnet({
                apikey: config.get('Bnet.apiKey'), 
                throttle:{
                    to:  99,    
                    per: 1000  
                }
            });
            
            //http://eu.battle.net/wow/en/character/:realms/:name/advanced
            client.fetch("character", { 
                    region: "eu",
                    realm: req.form.lien_armu.split("/")[6],
                    name: req.form.lien_armu.split("/")[7],
                    fields: "items,progression"
            })
            .then(function createApply(res) {//tout se passe bien
                    statusCode   = res.data;
                    responseTime = res.data;
                    headers      = res.data;
                    data         = res.data; //champs data de res

                    //progression HFC
                    var totHFC = 0;
                    for(i=0;i<13;i++){
                        if(data.progression.raids[34].bosses[i].mythicKills >= 1){
                            totHFC += 1;
                        }
                    }
                    //progression EN
                    var totEN = 0;
                    for(i=0;i<7;i++){
                        if(data.progression.raids[35].bosses[i].mythicKills >= 1){
                            totEN += 1;
                        }
                    }
                    
                    //progression TOV
                    var totTOV = 0;
                    for(i=0;i<3;i++){
                        if(data.progression.raids[37].bosses[i].mythicKills >= 1){
                            totTOV += 1;
                        }
                    }
                    
                    //progression NH
                    var totNH = 0;
                    for(i=0;i<3;i++){
                        if(data.progression.raids[36].bosses[i].mythicKills >= 1){ 
                            totNH += 1;
                        }
                    }
                    
                    // !! WARNING 35 - 37 - 36 - 38 !!!!! voir progress api bnet, pas dans l'ordre
                    
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
                            name:           util_.upFirst(decodeURIComponent(req.form.lien_armu.split("/")[7])),
                            realm:          util_.upFirst(req.form.lien_armu.split("/")[6]),
                            ilvl:           data.items.averageItemLevel,
                            ilvle:          data.items.averageItemLevelEquipped,
                            progressHFC:    totHFC+"/13", //HFC
                            progressEN:     totEN+"/7", //EN
                            progressTOV:    totTOV+"/3", //TOV
                            progressNH:     totNH+"/10", //NH
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
                            }
                        });
            })
            .catch(console.error); //error curl 

        }
        res.redirect('/test_addApply');
  }   

);






module.exports = router;