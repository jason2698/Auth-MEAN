const express = require('express');
const router = express.Router();

//DB details for User
const User = require('./../models/user');

//DB details for User Verification
const UserVerification = require('./../models/userVerification');

//password handler
const bcrypt = require('bcrypt');

//Email handler
const nodeMailer = require('nodemailer');

//unique string
const {v4: uuidv4} = require("uuid")

//ENV variables
require("dotenv").config();

// nodemailer stuff
let transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

//nodemailer testing
transporter.verify((error, success)=>{
    console.log("Entry")
    if(error){
        console.log(error)
    }else{
        console.log("Ready for messages");
        console.log(success); 
    }
})

//path for static verified page
const path = require("path");

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
                    dateOfBirth,
                    verified: false
                });
                newUser.save().then(result=>{
                    // res.json({
                    //     status: "Success",
                    //     message: "Signup successful",
                    //     data: result
                    // })

                    sendVerificationEmail(result, res);
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

//send verification email
const sendVerificationEmail = ({_id, email}, res) => {
    //url to be used in the email
    const currentUrl = "https://localhost:5000/";

    const uniqueString = uuidv4() + _id;

    //mail options
    const mailOptions = {
        from : process.env.AUTH_EMAIL,
        to: email,
        subject : "verify your email",
        html: `<p>Verify your email address to complete the signup and login into your account.</p>
        <p>This link <b>expires in 6 hours</b>.</p>
        <p>Press <a href=${currentUrl +"user/verify/" +_id + "/"+ uniqueString}
        >here</a>to procced.</p>`,
    }

    //hash the unique string
    const salRounds = 10;
    bcrypt
    .hash(uniqueString, salRounds)
    .then((hashedUniqueString)=>{
        const newVerification = new UserVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000 
        });

        newVerification
        .save()
        .then(()=>{
            transporter
            .sendMail(mailOptions)
            .then(()=>{
                res.json({
                    status: "PENDING",
                    message: "Verification email sent"
                })
            })
            .catch((error)=>{
                console.log(error)
                res.json({
                    status: "FAILED",
                    message: "Verification email failed"
                })
            })
        })
        .catch(()=>{
            res.json({
                status: "FAILED",
                message: "Couldn't save email verification data!"
            })
        })
    })
    .catch(()=>{
        res.json({
            status: "FAILED",
            message: "An error occured while hashing emial data!"
        })
    })
}

//Signin
router.post('/signin', (req, res)=>{
    let{ email, password} = req.body;
    email = email.trim();
    password = password.trim();

    User.find({email}).then(data=>{
        if(data.length){
            const hashedPassword = data[0]?.password;
            bcrypt.compare(password, hashedPassword).then(result=>{
                if(result){
                    res.json({
                        status: "Success",
                        message: "Signin successful",
                        data: data
                    })
                }else{
                    res.json({
                        status: "Failed",
                        message: "Invalid password entered!",
                    })
                }
            }).catch(err=>{
                res.json({
                    status: "Failed",
                    message: "Error occured while comparing password"
                })
            })
        }else{
            res.json({
                status: "Failed",
                message: "Invalid credential entered!",
            })
        }
    }).catch(err=>{
        res.json({
            status: "Failed",
            message : "An error occured while login"
        })
    })
})

//Verify email
router.get("/verify/:userId/:uniqueString", (req,res)=>{
    let { userId, uniqueString } = req.params;

    UserVerification.find({userId})
    .then((result)=>{
        if(result.length > 0){

        }else{
            //User verification record doesn't exist
            let message = "Account record doesn't exist or has been verified already. Please Sign up or login.";
            res.redirect(`/user/verified/error=true&message=${message}`);
        }
    })
    .catch((error)=>{
        console.log(error);
        let message = "An error occured while checking for existing user verification record";
        res.redirect(`/user/verified/error=true&message=${message}`);
    })
})

// verified page route
router.get("/verified", (req,res)=>{

    res.sendFile(path.join(__dirname, "./../views/verified.html"));
})

module.exports = router;