var mongoose =  require('mongoose');


var WeakAuraSchema = mongoose.Schema({
    title:          String,
    desc:           String,
    author:         String,
    date:           { type: Date, default: Date.now },
    value:          String,
    categ:          String,
    image:          String
});

WeakAuraSchema.methods = {

};

mongoose.model('WeakAura', WeakAuraSchema);