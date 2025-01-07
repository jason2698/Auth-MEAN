require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODO_LOCAL_URL)
    .then(() => {
        console.log("DB connected");
    })
    .catch((err) => console.log(err))