/*********************************************************************************
*  WEB322 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Sebastian Rubina 
*  Student ID: 150640217 
*  Date: Sep 19th, 2022
********************************************************************************/ 
var blogServices = require("./blog-service");
var express = require("express");
const path = require("path");
var app = express();


var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

function onHttpStart() {
	console.log(`Express http server listening on: ${HTTP_PORT}`);
}

app.use(express.static('public'));


// Routes
app.get("/", (req, res) => {
    res.redirect('/about');
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
});

app.get("/blog", (req, res) => {
    blogServices.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        return {"message":err};
    })
});

app.get("/posts", (req, res) => {
    blogServices.getAllPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        return {"message":err};
    })
});

app.get("/categories", (req, res) => {
    blogServices.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        return {"message":err};
    })
});

app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/views/404.html');
})


blogServices.initialize().then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err) {
    console.log(`Unable to start server: ${err}`);
});
