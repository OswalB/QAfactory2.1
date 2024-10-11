const {Schema, model}= require('mongoose');
const ActionSchema = new Schema({
    titulo:{
        type: 'string',
        required: true,
        alias: 'Titulo',
    }

},{
    timestamps: true,
    versionKey: false
})

module.exports = model('Action',ActionSchema);