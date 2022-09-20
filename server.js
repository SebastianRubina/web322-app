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
var app = express();


var HTTP_PORT = process.env.PORT || 8080;

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
    res.send("<h1>Blog Page</h1>")
});

app.get("/posts", (req, res) => {
    res.send("<h1>Posts Page</h1>")
});

app.get("/categories", (req, res) => {
    res.send("<h1>Categories Page</h1>")
});


app.listen(HTTP_PORT, onHttpStart);