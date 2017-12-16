var mongoose    = require('mongoose');
var locutus     = require('locutus/php/array');
var bnet        = require('promise-battlenet-api');
var config      = require('config');

module.exports = {
    
    getClient: function(){
        var client = new bnet({
            apikey: config.get('Bnet.apiKey'), // LIMIT -> 100 calls/s ; 36 000/h
            throttle:{
                to:  50,       //number of calls
                per: 1000      //timeframe in milliseconds
            }
        });
        return client;
    },


    addChar: function(req, data){
        var user    = req.user;
        var client  = this.getClient();
        var Char    = mongoose.model('Char');

        client.fetch("character", {
            region: "eu",                             
            realm:  data.realm,                         
            name:   encodeURIComponent(data.name),
            fields: config.get('Bnet.fields')
        })
        .then(function (res) {
            statusCode   = res.statusCode;
            responseTime = res.responseTime;
            headers      = res.headers;
            data         = res.data;

            console.log("statusCode : "+statusCode);
            if(statusCode === 200){
                //check existant Realm/Name
                Char.findOne({$and:[{realm: data.realm}, {name: data.name}]}, function (err, char) {
                    if(char !== null){
                        console.log('Char already found : ' + data.realm + " - " + data.name);
                        req.flash('error', 'We have already a char with Realm (' + data.realm + ') and Name (' + data.name + ')');
                    } else { // no duplicate char found
                        console.log("Creation Char : "+data.name+" - "+data.realm);

                        //then send to mongoDB                       
                        var c = new Char({
                                _id_user:       user._id,
                                data:           data,
                                name:           data.name,
                                realm:          data.realm,
                                class:          data.class,
                                lvl:            data.level,
                                ilvl:           data.items.averageItemLevel,
                                ilvle:          data.items.averageItemLevelEquipped,
                                achievPts:      data.achievementPoints,
                                //artefactPow:    Number,
                                //role:           "no",
                                lastModified:   data.lastModified,
                                LastUpdated:    new Date().getTime(),
                                icone:          data.thumbnail,
                                main:           false
                            });  

                            c.save(function (err) {
                                if(err){
                                    next(err);
                                } else {
                                    console.log('new char added : ' + c.realm + " - " + c.name);
                                    req.flash('info', 'Char [' + c.title + "] ajouté!");
                                }
                            });         
                    }
                });
            }
        })
        .catch(console.error);
    },


    updateChar: function (char){

        var client = this.getClient();

        client.fetch("character", {
            region: "eu",                             
            realm:  char.realm,                         
            name:   encodeURIComponent(char.name),
            fields: config.get('Bnet.fields')
        })
        .then(function SaveInDB(res){
            statusCode   = res.statusCode;
            responseTime = res.responseTime;
            data         = res.data;

            // CAN Save space disk with :  Reputation & Title & profession
            if(statusCode === 200){
                console.log("statusCode : " + statusCode + " | responseTime : " + responseTime + "ms");

                //PROGRESS
                /** 
                       1st subCategories[5] = Dungeons & Raids
                       2nb subCategories[i] = extension
                           0 = Classic
                           1 = The Burning Crusade
                           2 = Wrath of the Lich King
                           3 = Cataclysm
                           4 = Mist of Pandaria
                           5 = Warlords of Draenor  
                           6 = Legion

                       3rd statistics[i] = stats du boss killed     (boss de raid voir livre)                                                                                                                                                                                                            
                           2 = EoA mythic
                           5 = DHT mythic
                           8 = NL mythic
                           11 = HoV mythic
                           20 = VotW mythic
                           23 = BRH mythic
                           26 = MaW mythic 
                           27 = Arcway mythic
                           28 = CoS mythic   

                       last = id, name, quantity, lastUpdated, money
                   */
                if(typeof this.data.statistics !== "undefined"){
                    char.progress.EoA    = data.statistics.subCategories[5].subCategories[6].statistics[2].quantity;
                    char.progress.DHT    = data.statistics.subCategories[5].subCategories[6].statistics[5].quantity;
                    char.progress.NL     = data.statistics.subCategories[5].subCategories[6].statistics[8].quantity;
                    char.progress.HoV    = data.statistics.subCategories[5].subCategories[6].statistics[11].quantity;
                    char.progress.VotW   = data.statistics.subCategories[5].subCategories[6].statistics[20].quantity;
                    char.progress.BRH    = data.statistics.subCategories[5].subCategories[6].statistics[23].quantity;
                    char.progress.MaW    = data.statistics.subCategories[5].subCategories[6].statistics[26].quantity;
                    char.progress.Arcway = data.statistics.subCategories[5].subCategories[6].statistics[27].quantity;
                    char.progress.CoS    = data.statistics.subCategories[5].subCategories[6].statistics[28].quantity;
                    //char.progress.KaraL  = data.statistics.subCategories[5].subCategories[6].statistics[28].quantity;
                    //char.progress.KaraH  = data.statistics.subCategories[5].subCategories[6].statistics[28].quantity;
                    //char.progress.Cathe  = data.statistics.subCategories[5].subCategories[6].statistics[28].quantity;
                    
                    //ToS mythic Kill quantity total
                    char.progress.ToS_mythic_tot = 0;
                    char.progress.ToS_mythic_tot =  data.statistics.subCategories[5].subCategories[6].statistics[113].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[117].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[121].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[125].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[129].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[133].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[137].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[141].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[145].quantity ;
                    
                    //Antorus mythic Kill quantity total
                    char.progress.Ant_mythic_tot = 0;
                    char.progress.Ant_mythic_tot =  data.statistics.subCategories[5].subCategories[6].statistics[149].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[153].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[157].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[161].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[165].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[169].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[173].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[177].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[181].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[185].quantity +
                                                    data.statistics.subCategories[5].subCategories[6].statistics[189].quantity;
                    
                    
                }
                
                //Artefact Power
                if(typeof data.achievements !== "undefined"){

                    var key = locutus.array_search('30103', data.achievements.criteria);
                    var key2 = locutus.array_search('29395', data.achievements.criteria);

                    if(key !== ''){
                        var criterias = new Array();
                        locutus.array_push(criterias, data.achievements.criteriaQuantity);
                        criterias = criterias[0];
                    }
                }
                
                char.artefactPower = criterias[key];
                //char.highestArtLvl = criterias[key2];
                if(!char.highestArtLvl)
                    char.highestArtLvl = 0; //for new char, first update
                
                if(char.getArtifactTraits(char.getItems().mainHand) > char.highestArtLvl) //mainHand artefact
                    char.highestArtLvl = char.getArtifactTraits(char.getItems().mainHand) - 3; //relics length
                //char.highestArtLvl = 0;
                
                
                
                //Mythic+ Last Week
                var cache, lastCache;
                var feed = data.feed;

                for (var i in feed){
                    if(feed[i].type === "LOOT" && feed[i].context === "challenge-mode-jackpot"){
                        cache = feed[i];
                        if(!lastCache || cache.timestamp > lastCache.timestamp){//plus c'est grand, plus c'est recent
                            lastCache = cache;
                        }
                    }
                }

                if(lastCache)
                    char.mPlusCache = lastCache;

                // free space disk with erase data coz statistics/achievements are HUGE !!
                data.statistics     = ""; 
                data.achievements   = "";

                char.data           = data;
                char.class          = data.class;
                char.lvl            = data.level;
                char.ilvl           = data.items.averageItemLevel;
                char.ilvle          = data.items.averageItemLevelEquipped;
                char.achievPts      = data.achievementPoints;
                char.lastModified   = data.lastModified;
                char.icone          = data.thumbnail;



                char.save(function(err, char, numAffected){
                    if(err){
                        console.log("Error saveDB in Char.update()");
                    } else {
                        console.log('Char '+char.name+' updated !');
                    }
                });
            }
        });
    }
    
};