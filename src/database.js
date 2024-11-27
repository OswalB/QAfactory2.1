const mongoose = require('mongoose');

let MONGODB_URI = process.env.MONGODB_URI;
const entorno = process.env.NODE_ENV;
if(entorno == 'development'){
    MONGODB_URI=process.env.MONGODB_LOCAL
}

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(db => console.log('database is connected, mode: ', entorno))
    .catch(err => console.log(err))