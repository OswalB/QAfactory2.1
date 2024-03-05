const {Schema, model}= require('mongoose');
const EditableSchema = new Schema({
    titulo:{
        type: 'string',
        required: true,
        alias: 'Titulo',
    }

},{
    timestamps: true,
    versionKey: false
})

module.exports = model('Reason',EditableSchema);