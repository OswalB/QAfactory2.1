const {Schema, model} = require('mongoose');
const FormulaSchema = new Schema({
    nombre:{
        type: 'String',
        require: true,
        alias:'Formula para',
        
        failMsg:'Describa a que producto se aplica'
    },
    codigoProd:{
        type: 'String',
        require: true, 
        unique: true,
        alias:'Codigo de producto'
    },
    categoria: {
        type: 'String', 
        require: true,
        alias:'Categoria'
    }, 
    diasVence:{
        type: 'Number',
        default: 0,
        require: true,
        alias:'Días vto.'
    },  
    siFormulaOk:{
        type: 'Boolean', 
        requiere: true,
        default: false,
        alias:'Completa'
    }, 
    prodMin:{
        type: 'Number',
        default: 1,
        require: true,
        alias:'Produccion min.'
    }, 
    prodMax:{
        type: 'Number',
        default: 1,
        require: true,
        alias:'Produccion max.'
    },    detalle:[{
        cantidad:{
            type: 'Number',
            default: 0,
            require: true
        },codigoInsumo:{
            type: 'String',
            require: true
        },
        nombreInsumo:{
            type: 'String',
            require: true
        },
        unidad:{
            type: 'String',
            require: true
        },
        siBase: {
            type: 'Boolean',
            require: true
        }
    }]
},{
    timestamps: true,
    versionKey: false 
});

module.exports = model('Formula', FormulaSchema);