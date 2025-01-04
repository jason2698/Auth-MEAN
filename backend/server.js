const express = require('express');
const app = express();
const mongoose = require('mongoose');


app.listen(5001, function check(err){
    if(err)
        console.log(err)
    else
        console.log("started")
})

// mongoose.connect("mongodb://localhost:27017/sample", {useNewUrlParser: true, useUnifiedTopology: true},
//     function checkDB(err)
//     {
//         if(err)
//         {
//             console.log("Connect Failed while connecting to DB");
//         }
//         else
//         {
//             console.log("Connect Successfully to DB")
//         }
//     }
// )

mongoose.connect('mongodb://127.0.0.1:27017/sample')
  .then(() => console.log('Connected!'));