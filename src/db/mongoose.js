const mongoose = require('mongoose');


mongoose.connect(process.env.DATABASE_URL, { useCreateIndex: true, useNewUrlParser: true,useFindAndModify:false }).then(() => {

    console.log('connected to database successfully');


}).catch((err) => {

    console.log(err);
});






