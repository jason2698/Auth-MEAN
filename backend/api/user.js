const express = require('express');
const router = express.Router();

//DB details
const User = require('./../models/user');

//password handler
const bcrypt = require('bcrypt');

//signup
router.post('/signup', (req,res)=>{
    let{name, email, password, dateOfBirth} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    User.find({email}).then(result=>{
        if(result.length){
            res.json({
                status : "Failed",
                message : "User with the provided email already exists"
            })
        }else{
            //try to create new user

            //password handling
            const salRounds = 10;
            bcrypt.hash(password, salRounds).then(hashedPass=>{
                const newUser = new User({
                    name,
                    email,
                    password: hashedPass,
                    dateOfBirth
                });
                newUser.save().then(result=>{
                    res.json({
                        status: "Success",
                        message: "Signup successful",
                        data: result
                    })
                }).catch(err=>{
                    res.json({
                        status : "Failed",
                        message : "An error occured while checking for existing user!"
                    })
                })
            })
        }
    }).catch(err=>{
        console.log(err);
        res.json({
            status : "Failed",
            message : "An error occured while checking for existing user!"
        })
    })
})

//Signin
router.post('/signin', (req, res)=>{

})

module.exports = router;