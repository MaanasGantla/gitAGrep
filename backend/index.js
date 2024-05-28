// This file will contain all the endpoints

import constants from './constants.js'
import express from 'express'
import fs from 'fs'
//const express = require('express')
import mongoose, { mongo } from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' });
import connectDB from './config/db.js'
//const fs = require('fs');
import Book from './db_models/book_model.js'
import User from './db_models/user_model.js'
import { BookController } from './controllers/book_controller.js'


//console.log(constants)
const port = process.env.PORT || 5000;
const app = express()
let users = JSON.parse(fs.readFileSync('./data/users.json'));
let emails = JSON.parse(fs.readFileSync('./data/emailconfirmation.json'))

const EXCHANGE_STATE_REQUESTED = 1;
const EXCHANGE_STATE_OFFER_REQUESTED = 2;
const EXCHANGE_STATE_PENDING = 3;
const EXCHANGE_STATE_EXCHANGED = 4;
const EXCHANGE_STATE_RE_EXCHANGED = 5;



connectDB()

app.use(express.json())

app.use('/book', BookController);

app.get('/test', (req, res) => {
    res.json({
        "test": [1, 2, "three", 4, "five"]
    })
});

app.get('/register', (req, res) => {
    res.json({
        status: "success or fail"
        //also send confirmation email
    })
});

app.post('/register', async (req, res, next) => {
    //console.log(req.body);
    try {
        const { username, password, email } = req.body;

        const userExists = await User.exists({ email });

        if (userExists) {
            return res.status(400).json({error: 'User already exists'});
        } 
        const user = await User.create({
            username,
            password,
            email
        });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        next(error);
    }
});


app.get('/forgotpassword', (req, res) => {
    res.json()
});
app.post('/forgotpassword', (req, res) => {
     const newId = emails[emails.length-1].id+1;
     const newEmail = Object.assign({id: newId}, req.body);
     emails.push(newEmail);
     fs.writeFile('./data/emailconfirmation.json', JSON.stringify(emails), (err) => {
         res.status(201).json({
             status: "success"
         })
     });
 });

 app.get('/getuser/:id', (req, res) => {
    const id = req.params.id;
    // const user = {
    //     id: 1,
    //     username: "blah balh",
    // }
    const user = users[0];
    res.send({
        user: user
    });
});

app.get('/getbook', (req, res) => {
    res.json()
});


app.get('/getbookexchanges', (req, res) => {
    const {uuid, auth_token }  = req.body;

    res.json()
});

app.get('startbookexchange', (req, res) => {
    const {user_uuid, auth_token} = req.body
    //return book exchang json
    res.json()
    
});

app.get('chooseoffer', (req, res) => {
    const {user_uuid, auth_token, exchange_uuid, book_uuid} = req.body
    //return new current exchange json
    res.json()
});

app.get('/confirmexchange', (req, res) => {
    const {uuid, auth_token, exchange_uuid} = req.body
    //return new current exchange json
    res.json()

});


app.get('/confirmreexchange', (req, res) => {
    
    res.json()
    
});

app.get('finishedreading', (req, res) => {
    res.json()

    
});

//First connect to the database. If that was successful,
//open the server to listen for HTTP requests.
mongoose.connection.once('open', () => {
    // Tell the app to start listening for API calls

    // GENERATE DUMMY DATA
//    generateDummyData();

    app.listen(port, () => {
        console.log("Server started on port " + port);
    })
});

async function generateDummyData() {
    let bookCollectionLength = await Book.countDocuments({});
    if(!bookCollectionLength | bookCollectionLength == 0) {
        const dummyUser = new User({
            _id: new mongoose.Types.ObjectId('6643d77345389a92052ed220'),
            username: "Chocolate Enjoyer",
            password: "This should be encrypted btw",
            email: "hydroflask@g.ucla.edu",
            userRating: 5
        });
        const doc = await dummyUser.save();
        const dummyBook = new Book({
            title: "The Tales of Rende East",
            author: "Maanas G",
            genre: "Fantasy",
            isBookOutForExchange: false,
            bookOwner: doc._id
        });
        await dummyBook.save();
        console.log("Generated Dummy Data");
        return;
    }
    console.log("Skipping Dummy Data Generation since books collection has something in it already");
}

