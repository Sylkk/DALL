var mongoose =  require('mongoose');
var util_    =  require('../config/util.js');

var Char     =  mongoose.model('Char');

var UserSchema = mongoose.Schema({
    name:                   {type: String, required: true, unique: true},
    email:                  {type: String, required: true, unique: true},
    password:               {type: String, required: true},
    resetPasswordToken:     String,
    resetPasswordExpires:   Date,
    rank:                   Number,
    lastConnection:         {type: Date, default: Date.now },
    firstConnection:        Date,
    ip:                     String,
    icone:                  String,
    //main:                 {type: Schema.Types.ObjectId, ref: 'Char'},
    online:                  Number
});

UserSchema.methods = {
    authenticate: function (plainText) {
        return util_.encrypt(plainText) === this.password;
    },
    
    getLastConnection: function(){
    	return util_.readableDate(this.lastConnection);
    },
    
    //asynch probleme for the return
    getListChar: function(){
        Char.find({"_id_user":this._id}, function(err, chars){
            if(err){
                console.log("ERR : " + err);
            }else{
                if(chars !== null){
                    return chars;
                }
            }
        });
    },
    
    getRankName: function(){
        var ret;
        switch(this.rank){
            case 1 : ret = "Noob";
                break;
            case 2 : ret = "Ami du Loot";
                break;
            case 3 : ret = "Apply";
                break;
            case 4 : ret = "Member";
                break;
            case 5 : ret = "Raider";
                break;
            case 6 : ret = "Intendant";
                break;
            case 7 : ret = "Officer";
                break;
            case 8 : ret = "Sous-Admin";
                break;
            case 9 : ret = "Admin";
                break;
            case 10: ret = "WebMaster";
                break;
        }
        return ret;
    },
    
    getIconeMain: function(){
        //var baseUrl = "http://render-api-eu.worldofwarcraft.com/static-render/eu/";
        var baseUrl = "http://render-eu.worldofwarcraft.com/character/";
        return baseUrl + this.icone;
    }
    

};

mongoose.model('User', UserSchema);