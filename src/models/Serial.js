const {Schema, model}= require('mongoose');
const SerialSchema = new Schema({
    serialOrders:{
        type: 'Number',
        required: true,
        alias:'Consecutivo ordenes'
    },
    serialPlanillas:{
        type: 'Number',
        required: true,
        alias:'Consecutivo planillas'
    },
    serialAverias:{
        type: 'Number',
        required: true,
        alias:'Consecutivo averias'
    },
    serialPdf:{
        type: 'Number',
        required: true,
        alias:'Consecutivo averias'
    }

},{
    timestamps: true,
    versionKey: false 
})

module.exports = model('Serial',SerialSchema);