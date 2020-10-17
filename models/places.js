const mongoose = require('mongoose');
//const User= require('./users');
const Schema = mongoose.Schema;

const placeSchema = new Schema({

    title: {type: String, require: true},
    description: {type:String, require: true},
    image: { type: String, require: true},
    address: { type: String, require:true},
    location: {
        lat: {type: Number, require:true},
        lat: {type: Number, require:true}
    },
    creator: {type: mongoose.Types.ObjectId, require: true, ref:'User'}
});

module.exports = mongoose.model('Place', placeSchema);