var mongoose =  require('mongoose');
var cronJob  =  require('cron').CronJob; 
var util     =  require('../config/util');
var bnet     =  require('../config/bnet');
var locutus  =  require('locutus/php/array');

var Schema   =  mongoose.Schema;

var CharSchema = mongoose.Schema({
    _id_user:       {type: Schema.Types.ObjectId, ref: 'User', required: true},
    data:           {type: Object, required: true},
    name:           String,
    realm:          String,
    class:          Number,
    lvl:            Number,
    ilvl:           Number,
    ilvle:          Number,
    achievPts:      Number,
    artefactPower:  Number,
    highestArtLvl:  Number,
    mPlusCache:     {type: Object},
    progress:       {   EoA: Number,
                        DHT: Number,
                        NL: Number,
                        HoV: Number,
                        VotW: Number,
                        BRH: Number,
                        MaW: Number,
                        Arcway: Number,
                        CoS: Number,
                        KaraL: Number,
                        KaraH: Number,
                        Cathe: Number,
                        EN_mythic_tot: Number,
                        ToV_mythic_tot: Number,
                        NH_mythic_tot: Number,
                        ToS_mythic_tot: Number
                    },
    lastModified:   Number,
    lastUpdated:    Number,
    icone:          String,
    role:           String,
    main:           Boolean
});

CharSchema.methods = {
    
    getClassName: function(){
        var ret;
        switch(this.class){
            case 1: ret="Warrior";
                break;
            case 2: ret="Paladin";
                break;
            case 3: ret="Hunter";
                break;
            case 4: ret="Rogue";
                break;
            case 5: ret="Priest";
                break;
            case 6: ret="DK";
                break;
            case 7: ret="Shaman";
                break;
            case 8: ret="Mage";
                break;    
            case 9: ret="Warlock";
                break;    
            case 10: ret="Monk";
                break;    
            case 11: ret="Druid";
                break;    
            case 12: ret="DH";
                break;
        }
        return ret;
    },
    
    getClassColor: function(class_number){
        var ret;
        if(class_number === undefined || class_number < 1 || class_number > 12)
            class_number = this.class;
        switch(class_number){
            case 1: ret="#C79C6E";//war
                break;
            case 2: ret="#F58CBA";//pala
                break;
            case 3: ret="#ABD473";//hunt
                break;
            case 4: ret="#E5B307";//rogue
                break;
            case 5: ret="#000000";//priest
                break;
            case 6: ret="#C41F3B";//dk
                break;
            case 7: ret="#0070DE";//sham
                break;
            case 8: ret="#69CCF0";//mage
                break;    
            case 9: ret="#9482C9";//warlock
                break;    
            case 10: ret="#00FF96";//monk
                break;    
            case 11: ret="#FF7D0A";//druid
                break;    
            case 12: ret="#A330C9";//dh
                break;
        }
        return ret;
    },
    
    getClassColorBlack: function(){
        var ret;
        switch(this.class){
            case 1: ret="#C79C6E";//war
                break;
            case 2: ret="#F58CBA";//pala
                break;
            case 3: ret="#ABD473";//hunt
                break;
            case 4: ret="#FFF569";//rogue
                break;
            case 5: ret="#FFFFFF";//priest
                break;
            case 6: ret="#C41F3B";//dk
                break;
            case 7: ret="#0070DE";//sham
                break;
            case 8: ret="#69CCF0";//mage
                break;    
            case 9: ret="#9482C9";//warlock
                break;    
            case 10: ret="#00FF96";//monk
                break;    
            case 11: ret="#FF7D0A";//druid
                break;    
            case 12: ret="#A330C9";//dh
                break;
        }
        return ret;
    },
    
    getClassIcon: function(){
    	var ret = "/img/class_icon/";
        switch(this.class){
            case 1: ret+="_war.png";
                break;
            case 2: ret+="_pala.png";
                break;
            case 3: ret+="_hunt.png";
                break;
            case 4: ret+="_rogue.png";
                break;
            case 5: ret+="_priest.png";
                break;
            case 6: ret+="_dk.png";
                break;
            case 7: ret+="_sham.png";
                break;
            case 8: ret+="_mage.png";
                break;    
            case 9: ret+="_warlock.png";
                break;    
            case 10: ret+="_monk.png";
                break;    
            case 11: ret+="_druid.png";
                break;    
            case 12: ret+="_dh.png";
                break;
        }
        return ret;
    },
    
    getCharIcon: function(){
        //var baseUrl = "http://render-api-eu.worldofwarcraft.com/static-render/eu/";
        var baseUrl = "http://render-eu.worldofwarcraft.com/character/";
        return baseUrl + this.icone;
    },
    
    getRoleIcon: function(){
        var role_icon;
        
        switch(this.role){
            case "TANK": role_icon = "/img/class_icon/role_icone_tank.png";
                break;
            case "MELEE": role_icon = "/img/class_icon/role_icone_dps.png";
                break;
            case "CASTER": role_icon = "/img/class_icon/role_icone_dps.png";
                break;
            case "HEAL": role_icon = "/img/class_icon/role_icone_heal.png";
                break;
        }
        return role_icon;
    },
    
    getTitle: function(){
        var titles = this.data.titles;
        var title = "";
        for(var i=0; i<titles.length; i++){
            if(typeof titles[i].selected !== "undefined"){
                if(titles[i].selected){
                    title = titles[i].name;
                }
            }
        }
        return title;
    },
    
    getProfessions: function(){
        return this.data.professions.primary;
    },
    
    getProfessionsIcon: function(prof){
        var baseUrl = "http://media.blizzard.com/wow/icons/";
        var size = 36;
        return baseUrl + size + "/" + prof + ".jpg";
    },
    
    /** REPUTATION ************************************************************/
    
    getAllReputation: function(){
        return this.data.reputation; 
    },
    
    getReputation: function(reputId){
        //return max, value, standing, name, id
        var reput = this.getAllReputation().filter(function(v){
            return v.id === reputId;
        })[0];
        
        if(typeof reput !== "undefined")
            return reput;
        else return false;
    },
    
    getReputationBarColor: function(standing){
        var ret;
        switch(standing){
            case 0: ret="danger";//hated
                break;
            case 1: ret="warning";
                break;
            case 2: ret="warning";
                break;
            case 3: ret="warning";//neutral
                break;
            case 4: ret="primary";//friendly
                break;
            case 5: ret="success";//honored
                break;
            case 6: ret="info";//revered
                break;
            case 7: ret="info";//exalted
                break;
        }
        return ret;
    },
    
    isFriendlyReputCircleColor: function(standing){
        if(standing >= 4)
            return "navy";//comme primary sinon gris
        else return "danger";
    },
    
    
    /** PROGRESS **************************************************************/
    
    getSumDungeonBossKills: function(){
        return  this.progress.HoV + 
                this.progress.BRH + 
                this.progress.Arcway + 
                this.progress.VotW + 
                this.progress.EoA + 
                this.progress.NL + 
                this.progress.CoS + 
                this.progress.DHT + 
                this.progress.MaW;
    },
        
    /*
    3337 = titanforged
    3410 -> Mythic 2
    3411 -> Mythic 3
    3412 -> Mythic 4
    3413 -> Mythic 5
    3414 -> Mythic 6
    3415 -> Mythic 7
    3416 -> Mythic 8
    3417 -> Mythic 9
    3418 -> Mythic 10
    3509 -> Mythic 11
    3510 -> Mythic 12
    3511 -> Mythic 13
    3512 -> Mythic 14
    3536 -> Mythic 15
    index : 0 = level , 1 = timestamp */
    getLastMythicPlusLevel: function(index){
        var ret;
        if(this.mPlusCache){
            for (var i in this.mPlusCache.bonusLists){
                switch(this.mPlusCache.bonusLists[i]){
                    case 3536: ret = "+15";
                        break;
                    case 3535: ret = "+14";
                        break;
                    case 3534: ret = "+13";
                        break;
                    case 3510: ret = "+12";
                        break;
                    case 3509: ret = "+11";
                        break;
                    case 3418: ret = "+10";
                        break;
                    case 3417: ret = "+9";
                        break;
                    case 3416: ret = "+8";
                        break;
                    case 3415: ret = "+7";
                        break;
                    case 3414: ret = "+6";
                        break;
                    case 3413: ret = "+5";
                        break;
                    case 3412: ret = "+4";
                        break;
                    case 3411: ret = "+3";
                        break;
                    case 3410: ret = "+2";    
                        break;
                }
            }
            
        if(index === 0)
            return ret;
        if(index === 1)    
            return this.mPlusCache.timestamp;
        }
        return "???";
    },
    
    /*
     * 
        1st subCategories[5] = Dungeons & Raids
        2nb subCategories[i] = extension
            0 = Classic
            1 = The Burning Crusade
            2 = Wrath of the Lich King
            3 = Cataclysm
            4 = Mist of Pandaria
            5 = Warlords of Draenor  
            6 = Legion
                                                                                                                                                                                                                                          
        3rd statistics[i] = stats du boss killed                                                                                                                                                                                                                 
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
    //Deprecated now, use bnet.update for save space disk
    getBossKills: function(extension, index){
        if(typeof this.data.statistics !== "undefined" && this.data.statistics !== ""){
            return this.data.statistics.subCategories[5].subCategories[extension].statistics[index].quantity;
        }
    },
    
    /**
     * 0 = Ap Total gained
     * 1 = Artefact lvl max
     * **/
    //Deprecated now, use bnet.update for save space disk
    getAP: function(index){
        
        var totalAPGained;
        var aLevel;
        
        if(typeof this.data.achievements !== "undefined"){

            var key = locutus.array_search('30103', this.data.achievements.criteria);
            var key2 = locutus.array_search('29395', this.data.achievements.criteria);
            
            if(key !== ''){
                var criterias = new Array();
                locutus.array_push(criterias, this.data.achievements.criteriaQuantity);
                criterias = criterias[0];
                totalAPGained = criterias[key];
                aLevel = criterias[key2];
            }
        }
        
        if(index === 0){
            return totalAPGained;
        }else if (index === 1){
            return aLevel;
        }
        
    },

    
    /** ITEMS *****************************************************************/
    
    // https://www.reddit.com/r/wowaddons/comments/3052t8/help_simple_addon_to_return_itemids_bonus_list/
    //bonusList 3441 is the 7.0 number for 6.0 items being Warforged. Similarly, 
    //bonusList 3442 is the 7.0 number for 6.0 items being Titanforged.
    
    getItems: function(){
        return this.data.items;
    }, 
    
    getiQuality: function(item){
        var ret;
        switch(item.quality){
            case 1: ret="q1";
                break;
            case 2: ret="q2";
                break;
            case 3: ret="q3";
                break;
            case 4: ret="q4"; //epique
                break;
            case 5: ret="q5"; //legendaire
                break;
            case 6: ret="q6";
                break;
            case 7: ret="q7"; //heritage
                break;
            case 8: ret="q8";
                break;
            case 9: ret="q9";
                break;
            case 10: ret="q10";
                break;
        }
        return ret;
    },
    
    getiWowHeadRel: function(item){
        var gems="", ench="", bonus="", pcs="", upgd="";
        
        //gems & enchant & pcs & upgd
        if(typeof item.tooltipParams !== "undefined"){
            if(typeof item.tooltipParams.gem0 !== "undefined")
                gems = item.tooltipParams.gem0;
            if(typeof item.tooltipParams.gem1 !== "undefined")
                gems += ":" + item.tooltipParams.gem1;
            if(typeof item.tooltipParams.gem2 !== "undefined")
                gems += ":" + item.tooltipParams.gem2;
            
            if(typeof item.tooltipParams.enchant !== "undefined")
                ench = item.tooltipParams.enchant;
            
            if(typeof item.tooltipParams.set !== "undefined")
                pcs = item.tooltipParams.set.join(":");
            
            if(typeof item.tooltipParams.upgrade !== "undefined"){
                upgd = item.tooltipParams.upgrade.current;
            }
            
        }   
        //bonus
        if(item.bonusLists)
            bonus = item.bonusLists.join(":");
        
        return "gems="+gems+";ench="+ench+";bonus="+bonus+";upgd="+upgd+";pcs="+pcs+";";
    },

    getiListLeg: function(){
        var items = ["mainHand","offHand","trinket1","trinket2","finger1","finger2","feet","legs","waist","hands","wrist","chest","back","shoulder","neck","head"];
        var tabLeg = new Array();
        for(var i in items){
            if(typeof this.getItems()[items[i]] !== "undefined"){
               if(this.getItems()[items[i]].quality === 5){ //qualité legendaire
                   tabLeg.push(items[i]);
               }
           }
        }
        return tabLeg;                          
    },
    
    getiListRelic: function(artefact){
        var tabRelics = new Array();
        for(var i in artefact.relics){
            if(typeof artefact.relics !== "undefined"){
                tabRelics.push(artefact.relics[i]);
            }
        }
        return tabRelics;
    },
    
    getiListRelicBonusList: function(relic){
        var str = "";
        for(var i = 0; i < relic.length; i++){
            str += relic[i] + ":";
        }
        return str.slice(0, -1); 
    },

    getiTokens: function(){
        var tokens = ["head", "shoulder", "chest", "back", "hands", "legs"];
        var tot = 0;
        for(var i=0; i < tokens.length; i++){
            if(typeof this.getItems()[tokens[i]].tooltipParams.set !== "undefined")
                tot ++; 
        }
        if(tot>=4)
            return "<b>"+tot+"/6</b>";
        else
            return tot+"/6";
    },

    isiToken: function(item){
        if(typeof item.tooltipParams.set !== "undefined"){
            if(util.isInArray(item.id, item.tooltipParams.set)){
                return true;
            }
        }
        return false;
    },
    
    getiBonusLists: function(item){
        if(typeof item.bonusLists !== "undefined"){
            return item.bonusLists.join(":");
        }
    },

    getiUpgrade: function(item){
        if(typeof item.tooltipParams.upgrade !== "undefined"){
            if(item.tooltipParams.upgrade.current > 0)
                return item.tooltipParams.upgrade.itemLevelIncrement;
        }
    },
    
    getiSocket: function(item){
        if(typeof item.bonusLists !== "undefined"){
            for(var i in item.bonusLists){
                if(item.bonusLists[i] === 563 || item.bonusLists[i] === 564 ||
                   item.bonusLists[i] === 565 || item.bonusLists[i] === 523){
                   if(typeof item.tooltipParams.gem0 !== "undefined"){
                        return item.tooltipParams.gem0;
                    }else{
                        return "missing";
                    }
                }  
            }
        }
    },
    
    getiEnchant: function(item){
        if(typeof item.tooltipParams.enchant !== "undefined"){
            return item.tooltipParams.enchant;
        }
    },

    getiAllEmptySocket: function(){
        var items = ["mainHand","offHand","trinket2","trinket1","finger2","finger1","feet","legs","waist","hands","wrist","shirt","chest","back","shoulder","neck","head"];
        var emptySocket = new Array();
        
        //563, 564, 565, 523 = extra socket (normal/heroic/mythic/dungeonLoot)
        for(var i in items){ //on parcours chaques items de la liste
            if(typeof this.getItems()[items[i]] !== "undefined"){ //si le type de l"item est equipé
                if(typeof this.getItems()[items[i]].bonusLists !== "undefined"){ //si l'objet a la propriété "bonusLists"
                    for(var j in this.getItems()[items[i]].bonusLists){ //on parcours les differents bonus
                        if(this.getItems()[items[i]].bonusLists[j] === 563 || 
                           this.getItems()[items[i]].bonusLists[j] === 564 ||
                           this.getItems()[items[i]].bonusLists[j] === 565 ||
                           this.getItems()[items[i]].bonusLists[j] === 523 ){ // si il y a les bonus lié a l'extra socket
                            if(typeof this.getItems()[items[i]].tooltipParams !== "undefined"){
                                if(!("gem0" in this.getItems()[items[i]].tooltipParams)){ //on regarde si une gemme est manquante
                                    emptySocket.push(items[i]);  //on ajoute l'item dans le tableau
                                }
                            }
                        }
                    }
                }
            } 
        }
        return emptySocket;
    },
    
    getiAllEmptyEnchant: function(){
        //var items = ["finger1","finger2","neck","shoulder", "back"]; //LEGION += shoulder
        var items = ["finger1","finger2","neck", "back"];
        var emptyEnchant = new Array();
        
        for(var i in items){
            if(typeof this.getItems()[items[i]] !== "undefined"){
                if(typeof this.getItems()[items[i]].tooltipParams !== "undefined"){
                    if(typeof this.getItems()[items[i]].tooltipParams.enchant === "undefined"){
                        emptyEnchant.push(items[i]);
                        //can compare Enchant ID with Legion Enchant ID
                    }
                }
            }
        }
        return emptyEnchant;
    },

    getArtifactRelics: function(item){
        if(typeof item.relics !== "undefined"){
            return item.relics.length;
        }
        return 0;
    },
    
    getArtifactTraits: function(item){
        if(typeof item.artifactTraits !== "undefined"){
            var totalTraits = 0;
            for(var i=0; i<item.artifactTraits.length; i++){
                totalTraits += item.artifactTraits[i].rank;
            }
            
            //totalTraits -= 3; //minus first point & 3 pts from relics
            
            if(totalTraits > 0)
                return totalTraits;
        }
    },
    
    isEnoughILvlForRaidCircleColor: function(itemLevel){
        if(itemLevel >= 920)
            return "navy";//comme primary sinon gris
        else return "danger";
    },
    

    /** LIST      *************************************************************/
   
    getListReputLegion: function(){
        //test [70,1375,1388,1708,1849,1302];
        return tabReput = [2170,2165,2045,1859,1948,1894,1883,1828,1900];
    },
    
    getListItemEnchantSlot: function(){
        //+shoulder legion  ["finger1", "finger2", "neck", "back", "shoulder"];
        return enchantSlot = ["finger1", "finger2", "neck", "back"];
    },
    
    getListItemGear: function(){
        return enchantSlot = ["head","neck","shoulder","back","chest","wrist","hands","waist","legs","feet","finger1","finger2","trinket1","trinket2","mainHand","offHand"];
    },
    
    getListProfessionsGather: function(){
        return professionGather = ["Herbalism", "Mining", "Skinning"];
    },
    
    
    
    //call bnet middleware to update char in DB
    update: function(){
        console.log("Updating : "+this.realm+" - "+this.name);
        bnet.updateChar(this);
    } 
};

//on every save, change lastUpdate
CharSchema.pre('save', function(next){
    var currentDate = new Date().getTime();
    
    //console.log("Pre-save : "+currentDate)
    this.lastUpdated = currentDate;
    
    next();
});

mongoose.model('Char', CharSchema);