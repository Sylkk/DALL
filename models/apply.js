var mongoose    = require('mongoose');
var config      = require('config');
var nodemailer  = require('nodemailer');
var mailgen     = require('mailgen');
var util        = require("../config/util.js");


var ApplySchema = mongoose.Schema({
    name:           {type: String, required: true},
    realm:          {type: String, required: true},
    ilvl:           Number,
    ilvle:          Number,
    artefactPow:    Number,
    progression:    String,
    progressHFC:    String,
    progressEN:     String,
    progressTOV:    String,
    progressNH:     String,
    progressToS:    String,
    progressArgus:  String,
    achievPts:      Number,
    class:          Number,
    content:        [{  presentation:   String,
                        lien_armu:      String,
                        date_play:      String,
                        xp_pve:         String,
                        motivation:     String,
                        old_guild:      String,
                        interface:      String,
                        tc:             String,
                        reroll:         String
                    }],
    status:         String, //PENDING, ACCEPTED, REFUSED, END
    role:           String,
    dateStart:      { type: Date, default: Date.now },
    dateEnd:        Date,
    tokenRegister:  String,
    contactMail:    String,
    contactBTag:    String,
    messages:       []
});

ApplySchema.methods = {
    
    getClassIcon: function(){
    	var ret;
        switch(this.class){
            case 1: ret="/img/class_icon/_war.png";
                break;
            case 2: ret="/img/class_icon/_pala.png";
                break;
            case 3: ret="/img/class_icon/_hunt.png";
                break;
            case 4: ret="/img/class_icon/_rogue.png";
                break;
            case 5: ret="/img/class_icon/_priest.png";
                break;
            case 6: ret="/img/class_icon/_dk.png";
                break;
            case 7: ret="/img/class_icon/_sham.png";
                break;
            case 8: ret="/img/class_icon/_mage.png";
                break;    
            case 9: ret="/img/class_icon/_warlock.png";
                break;    
            case 10: ret="/img/class_icon/_monk.png";
                break;    
            case 11: ret="/img/class_icon/_druid.png";
                break;    
            case 12: ret="/img/class_icon/_dh.png";
                break;
        }
        return ret;
    },
    
    getRoleIcon: function(){
        var ret;
        switch(this.role){
            case "DPS": ret="/img/class_icon/role_icone_dps.png";
                break;
            case "TANK": ret="/img/class_icon/role_icone_tank.png";
                break;
            case "HEAL": ret="/img/class_icon/role_icone_heal.png";
                break;
        }
        return ret;
        
    },

    setStatus: function(status){
        this.status = status;  
      
        switch(status){
            case "ACCEPTED" : 
                this.setTokenRegister();
                this.sendMailAccepted();
                break;
            case "REFUSED"  : 
                this.sendMailRefused();
                break;
        }
 
    },
    
    addMessage: function(message, sender){
        var messageJSON = {
            "message": message,
            "date": Date.now(),
            "sender": sender
        };
        this.messages.push(messageJSON);
    },
    
    setTokenRegister: function(){
        this.tokenRegister = util.randomString(35);
    },
    
    sendMailAccepted: function(){
        
        var mailGenerator = this.getMailGenerator();
        
        var email = this.getMailBody('accepted','');
        
        var emailBody = mailGenerator.generate(email);
        var emailText = mailGenerator.generatePlaintext(email);

        this.sendMail('status apply', emailBody, emailText );
        
        console.log("Envoi de mail acceptation. ");
    },
    
    sendMailRefused: function(){
        
        var mailGenerator = this.getMailGenerator();
        
        var email = this.getMailBody('refused','');
        
        var emailBody = mailGenerator.generate(email);
        var emailText = mailGenerator.generatePlaintext(email);

        this.sendMail('status apply', emailBody, emailText );
        
        console.log("Envoie de mail refus. ");
    },
    
    sendMailMessage: function(message){
        
        var mailGenerator = this.getMailGenerator();
        
        var email = this.getMailBody('message', message);
        
        var emailBody = mailGenerator.generate(email);
        var emailText = mailGenerator.generatePlaintext(email);

        this.sendMail('message', emailBody, emailText );
        
        console.log("Envoi de mail de message : [ " + message + " ]");
    },
    
    sendMailNewApply: function(){
        
        var mailGenerator = this.getMailGenerator();
        
        var email = this.getMailBody('apply','');
        
        var emailBody = mailGenerator.generate(email);
        var emailText = mailGenerator.generatePlaintext(email);
        
        this.sendMail('apply', emailBody, emailText);
        
        console.log("Envoi de mail d'un nouvel apply");
        
    },
    
    /******************************** MAILER  ********************************************/
    
    sendMail: function(typeMessage, mailBody, mailText){
        
        var transporter = nodemailer.createTransport({
            service: config.get('Mail.service'),
            auth: {
                user: config.get('Mail.user'),
                pass: config.get('Mail.pass')
            }
        });
        
        var mailOptions = {
            from: 'danseaveclesloots.contact@gmail.com',
            to: this.contactMail,
            subject: 'DALL - ' + typeMessage,
            headers:{
              'X-Entity-Ref-ID': ''
            },
            text: mailText,
            html: mailBody
        };
        
        transporter.sendMail(mailOptions, function(err, infoMail){
            if(err){
                console.log(err);
            }else{
                console.log("Mail sent: " + infoMail.response);
            }
        });
    },
    
    getMailGenerator: function(){
        var mailGenerator = new mailgen({
            theme: 'default',
            product: {
                name: 'Danse Avec Les Løøts', //header and footer
                link: 'http://www.danse-avec-les-loots.fr/'
                //logo: 'http://www.danse-avec-les-loots.fr/assets/logo.png'
            }
        });
        
        return mailGenerator;
    },
    
    getMailBody: function(type, message){
        var mailBody = "";
        switch (type){
            case 'accepted': 
                mailBody = {
                    body: {
                        greeting: 'Salut',
                        name: this.name,
                        intro: ["Après étude de votre candidature, nous avons décidé de vous prendre à l'essai dans notre Guilde.",
                                "Merci d'essayer de contacter un officier InGame ou d'ajouter le Btag suivant : Aterra#2316 afin de poursuivre l'intégration."],
                        action:{
                            instructions: 'Veuillez également vous inscrire sur le tools suivant et ajouter au moins votre main afin de faciliter la suite des opérations.',
                            button:{
                                color: '#22BC66',
                                text:  'Register to DALL Tools',
                                link:  'http://www.danse-avec-les-loots.fr/register/' + this.tokenRegister
                            }
                        },
                        signature: "<small>Cordialement, la team officier</small>"
                    }
                };
                break;
            case 'refused':
                mailBody = {
                    body: {
                        greeting: 'Salut',
                        name: this.name,
                        intro: ["Nous avons le regret de devoir refuser votre candidature. ",
                                "Merci de l'intérêt porté à notre guilde." ],
                        signature: "<small>Cordialement, la team officier</small>"
                    }
                };
                
                break;
            case 'message':
                mailBody = {
                    body: {
                        greeting: 'Salut',
                        name: this.name,
                        intro: ['Vous avez reçu le message suivant :', '<strong>'+message+'</strong>' ],
                        signature: "<small>Cordialement, la team officier</small>"
                    }
                };
                break;
                
            case 'apply':
                mailBody = {
                    body:{
                        greeting: 'Salut',
                        name: this.name,
                        intro: ['Vous nous avez envoyé une candidature avec les informations suivantes :', 
                                '<strong><center>'+this.name+' - '+this.realm+'</center></strong>',
                                '<strong>Battle tag: </strong>' + this.contactBTag,
                                '<strong>Role: </strong>' + this.role,
                                '<strong>Présentation: </strong>' + this.content[0].presentation,
                                '<strong>Temps de jeu: </strong>' + this.content[0].date_play,
                                '<strong>Experience PVE: </strong>' + this.content[0].xp_pve,
                                '<strong>Motivation: </strong>' + this.content[0].motivation,
                                '<strong>Anciennes Guildes: </strong>' + this.content[0].old_guild,
                                '<strong>Interface: </strong>' + this.content[0].interface,
                                '<strong>TheoryCraft: </strong>' + this.content[0].tc,
                                '<strong>Rerolls: </strong>' + this.content[0].reroll
                        
                                ],
                        signature: ["<small>Nous vous contacterons au plus vite</small>",
                                    "<small> cordialement, la team officier</small>"]
                    }
                };
                break;
        }
        return mailBody;
    }
};

mongoose.model('Apply', ApplySchema);