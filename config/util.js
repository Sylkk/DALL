var crypto = require('crypto');

module.exports = {

    encrypt: function (plainText){
        return crypto.createHash('md5').update(plainText).digest('hex');
    },

    randomString: function (length){
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz';

        var string = '';

        for (var i = 0; i < length; i++) {
            var randomNumber = Math.floor(Math.random() * chars.length);
            string += chars.substring(randomNumber, randomNumber + 1);
        }

        return string;
    },
    
    isInArray: function (value, array) {
        return array.indexOf(value) > -1;
    },
    
    upFirst: function(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    numberWithSep: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    
    
    //moment now
    readableDate: function(date){
        var dd   = date.getDate();
        var mm   = date.getMonth()+1; //january = 0
        var yyyy = date.getFullYear();

        if(dd<10){
            dd='0'+dd;
        }
        if(mm<10){
            mm='0'+mm;
        }

        return date = dd+"/"+mm+"/"+yyyy;
    },
    
    //moment now
    timeSince: function(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }
    
};