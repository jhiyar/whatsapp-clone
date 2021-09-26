// // importing
// // import express from 'express'; package.json에 "type" : "module"을 추가했는데안되네...

import express from 'express'
import mongoose from 'mongoose'
import Messages from "./dbMessages.js"
import Pusher from "pusher"

// const express = require('express');
// const mongoose = require('mongoose');
// const Messages =require("./dbMessages.js");
// const Pusher = require('pusher');
// const cors = require('cors');
// const dbConfig = require('./dbConfig.json');

// // app config
 const app = express();
 const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1272923",
    key: "704040a77b12f08a700b",
    secret: "ea1d866c110c369b27da",
    cluster: "ap2",
    useTLS: true
});

// // middleware
app.use(express.json());
//app.use(cors());

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers","*");
//     next();
// })
// DB config

const connection_url =`mongodb+srv://admin:8ku8CprL2RylpR0j@cluster0.zhpdh.mongodb.net/whatsapp?retryWrites=true&w=majority`;

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

 const db = mongoose.connection;

db.once('open', () => {
    console.log('DB connected');

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log('change: ',change);

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received : messageDetails.received
            });
        } else {
            console.log("Error triggering Pusher");
        }
    })
})

// // ????


// // api routes
app.get('/', (request, response) => response.status(200).send('{"message":"Hello API ,This is an expressjs server API"}'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => { 
    
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send("" + err);
        }else{
            res.status(201).send(data);
        }
    })
})



// listener
 app.listen(port, () => console.log(`Listening on localhost:${port}`));







