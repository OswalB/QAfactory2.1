const mongoose = require('mongoose');

let MONGODB_URI = process.env.MONGODB_URI;
const entorno = process.env.NODE_ENV;
if(entorno == 'development'){
    MONGODB_URI=process.env.MONGODB_LOCAL
    //console.log(MONGODB_URI)
}

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(db => console.log('database is connected to: ', MONGODB_URI.substring(8,17),'...'))
    .catch(err => console.log(err))