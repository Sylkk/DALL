var mongoose    = require('mongoose');
var locutus     = require('locutus/php/array');
var bnet        = require('promise-battlenet-api');
var config      = require('config');
var https       = require('https');

module.exports = {
    
    updateMPlus: function (char){
        //console.log('Updating : M+ for :' + char.name + ' - '+ char.realm );
        //https://raider.io/api/v1/characters/profile?region=eu&realm=ysondre&name=fetpro&fields=mythic_plus_weekly_highest_level_runs
        
        var pre     = "https://raider.io/api/v1/characters/profile?";
        var region  = "eu";
        var realm   = char.realm;
        var name    = char.name;
        var fields  = "mythic_plus_weekly_highest_level_runs";
        
        var url     = pre + "region=" + region + "&realm=" + realm + "&name=" + name + "&fields=" + fields;

        
        https.get(url, function(res){
            statusCode = res;
            contentType = res.headers['content-type'];

            error;
            if (statusCode !== 200) {
              error = new Error('Request Failed.\n' + 'Status Code:' + res);
            } else if (!/^application\/json/.test(contentType)) {
              error = new Error('Invalid content-type.\n' + 'Expected application/json but received ' + contentType);
            }
            if (error) {
              console.error(error.message);
              // consume response data to free up memory
              res.resume();
              return;
            }

            res.setEncoding('utf8');
            rawData = '';
            res.on('data', function(chunk){ rawData += chunk; });
            res.on('end', function(){
              try {
                parsedData = JSON.parse(rawData);
                //console.log(parsedData);
                
                char.mPlusHighLvls = parsedData.mythic_plus_weekly_highest_level_runs;
                
              } catch (e) {
                console.error(e.message);
              }
            });
          }).on('error', function(e){
                console.error('Got error: '+ e.message);
        });
    }
    
};