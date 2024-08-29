const {Schema, model}= require('mongoose');

const AveriaSchema = new Schema({
    
    consecutivo:{
        type: 'number',
        requiered: true,
        alias: 'Consecutivo'
    },seller:{
        type: 'string',
        requiered: true,
        alias: 'Vendedor Id'
    },
    sellerName:{
        type: 'string',
        requiered: false,
        alias: 'Vendedor'
    },
    client:{
        type: 'string',
        requiered: true,
        alias: 'Cliente'
    },
    nit:{
        type: 'string',
        requiered: true,
        alias: 'Nit'
    },
    notes:{
        type: 'string',
        alias: 'notas'
    },
    state:{
        type: 'number',
        default:0,
        alias: 'Estado'
    },
    firmado:{
        type: 'boolean',
        default:false,
        alias: 'Firmado'
    },
    orderItem:[{
        loteVenta:{
            type: 'string'
        },
        loteRepuesto:{
            type: 'string'
        },
        code: {
            type: 'string',
            requiered: true
        },
        product: {
            type: 'string',
            requiered: true
        }, qty: {
            type: 'number',
            requiered: true
        },dispatch: {
            type: 'number',
            requiered: true
        },

        causal:{
            type: 'string'
        },
        typeResponse:{
            type: 'string'
        },
       
        
        dispatchBy: {
            type: 'string',
            requiered: false
        },
        dispatchDate:{
            type: 'date'
        }
    }]
},{
    timestamps: true,
    versionKey: false 
});


module.exports = model('Averia',AveriaSchema);