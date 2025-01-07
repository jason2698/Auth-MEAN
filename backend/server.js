const app = require('express')();
const port = 3000;

//For accepting post from data
const bodyParser = require('express').json;
app.use(bodyParser());

//mongoDB
require('./config/db');

//user router
const UserRouter = require('./api/user')

app.use('/user', UserRouter);

app.listen(port, function check(err){
    if(err)
        console.log(err)
    else
        console.log(`server running on port ${port}`)
})
