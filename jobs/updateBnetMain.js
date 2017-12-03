var mongoose = require('mongoose');
var cronJob  = require('cron').CronJob; 
var config   = require('config');
var bnet     = require('../config/bnet');

var Char     = mongoose.model('Char');

var job = new cronJob({
    cronTime: config.get('JobCRON.mainChar'),
    onTick: function(){
        console.log('onTick');
        
        Char.find({"main": true}, function(err, chars){
            if(err){
                console.log("Error CRON Char find");
                job.stop();
            }
            if(chars === null){
                console.log("No Main Char yet");
            } else{
                console.time('update_allRosterChars');
                chars.forEach(function(chara){
                    chara.update();
                });
                console.timeEnd('update_allRosterChars');
            }
        });
    },
    start: false,
    timeZone: 'Europe/Paris'
});
    
//job.start();    

module.exports = job;