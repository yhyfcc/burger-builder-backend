const mongoose = require('mongoose');

let db = mongoose.connect('mongodb://localhost/BurgerBuilder',{useNewUrlParser: true});
let onConnectPromise = new Promise((resolve, reject) => {
    db.once('open',resolve());
    db.on('error',reject());
})

module.exports = {onConnectPromise,db: mongoose};