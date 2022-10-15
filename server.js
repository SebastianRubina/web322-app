/*********************************************************************************
*  WEB322 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Sebastian Rubina 
*  Student ID: 150640217 
*  Date: Sep 19th, 2022
*  Online (Cyclic) Link: https://kind-lime-dalmatian-hose.cyclic.app/
********************************************************************************/ 
var blogServices = require("./blog-service");
var express = require("express");
const path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

cloudinary.config ({
    cloud_name: 'dgz3wzysa',
    api_key: '327957768833131',
    api_secret: 'ALAIbNboo8VAINh3PrqVDqImX2k',
    secure: true,
})

const upload = multer();

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

app.get("/posts/add", (req, res) => {
    res.sendFile(__dirname + '/views/addPost.html');
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blogServices.addPost(req.body).then(() => {
            res.redirect("/posts");
        })
    
    });
    
});

app.get("/posts/:value", (req, res) => {
    let id = req.params['value'];
    console.log(`ID IS ${id}`);
    blogServices.getPostById(id).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.send({"message":err});
    })
})

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blogServices.getPostsByCategory(req.query.category).then((data) => {
            res.json(data);
        }).catch((err) => {
            res.send({"message":err});
        })
    } else if (req.query.minDate) {
        blogServices.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json(data)
        }).catch((err) => {
            res.send({"message":err});
        })
    } else {
        blogServices.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.send({"message":err});
        })
    }
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
