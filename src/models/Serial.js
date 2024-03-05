const {Schema, model}= require('mongoose');
const SerialSchema = new Schema({
    consecutivo:{
        type: 'Number',
        required: true,
        alias:'Consecutivo'
    },
    serialAverias:{
        type: 'Number',
        required: true,
        alias:'Consecutivo Averias'
    }

},{
    timestamps: true,
    versionKey: false 
})

module.exports = model('Serial',SerialSchema);