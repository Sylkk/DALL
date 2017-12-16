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


        https.get(url, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
              error = new Error('Request Failed.\n' +
                                `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
              error = new Error('Invalid content-type.\n' +
                                `Expected application/json but received ${contentType}`);
            }
            if (error) {
              console.error(error.message);
              // consume response data to free up memory
              res.resume();
              return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData);
                //console.log(parsedData);
                
                char.mPlusHighLvls = parsedData.mythic_plus_weekly_highest_level_runs;
                
                
              } catch (e) {
                console.error(e.message);
              }
            });
          }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
    }
    
};