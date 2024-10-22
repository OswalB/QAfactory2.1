const {Schema, model} = require('mongoose');
const FormulaSchema = new Schema({
    nombre:{
        type: 'String',
        required: true,
        alias:'Formula para'
    },
    codigoProd:{
        type: 'String',
        required: true, 
        unique: true,
        alias:'Codigo de producto'
    },
    categoria: {
        type: 'String', 
        required: true,
        alias:'Categoria'
    }, 
    diasVence:{
        type: 'Number',
        default: 0,
        required: true,
        alias:'Días vto.'
    },  
    siFormulaOk:{
        type: 'Boolean', 
        requiered: true,
        default: false,
        alias:'Completa'
    }, 
    detalle:[{
        cantidad:{
            type: 'Number',
            default: 0,
            required: true
        },codigoInsumo:{
            type: 'String',
            required: true
        },
        nombreInsumo:{
            type: 'String',
            required: true
        },
        unidad:{
            type: 'String',
            required: true
        },
        siBase: {
            type: 'Boolean',
            required: true
        }
    }]
},{
    timestamps: true,
    versionKey: false 
});

module.exports = model('Formula', FormulaSchema);