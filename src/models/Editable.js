const {Schema, model}= require('mongoose');
const EditableSchema = new Schema({
    titulo:{
        type: 'string',
        required: true,
        alias: 'Titulo',
    },
    modelo:{
        type: 'string',
        required: true,
        alias: 'Modelo'
    }

},{
    timestamps: true,
    versionKey: false
})

module.exports = model('Editable',EditableSchema);