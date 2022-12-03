/*********************************************************************************
*  WEB322 – Assignment 5
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Sebastian Rubina 
*  Student ID: 150640217 
*  Date: Nov 18th, 2022
*  Online (Cyclic) Link: https://kind-lime-dalmatian-hose.cyclic.app/
********************************************************************************/ 
var blogServices = require("./blog-service");
var authData = require("./auth-service")
var express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const clientSessions = require("client-sessions");


var app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

app.use(clientSessions({
    cookieName: "session",
    secret: "web322_a6",
    duration: 2 * 60 * 10000,
    activeDuration: 1000 * 60
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
})

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }                                    
    } 
}));
app.set('view engine', '.hbs');


var HTTP_PORT = process.env.PORT || 8080;


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

// Midleware stuff for active
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


// Routes
app.get("/", (req, res) => {
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    res.render('about', {
        layout: "main"
    });
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogServices.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogServices.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogServices.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/posts', ensureLogin, (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = blogServices.getPostsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = blogServices.getPostsByMinDate(req.query.minDate);
    } else {
        queryPromise = blogServices.getAllPosts()
    }

    queryPromise.then(data => {
        res.render("posts", {posts: data});
    }).catch(err => {
        res.render("posts", {message: "no results"});
    })

});

app.post("/categories/add", ensureLogin, (req,res)=>{
        blogServices.addCategory(req.body).then(()=>{
            res.redirect("/categories");
        }).catch(err=>{
            res.status(500).send(err);
        })
});

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
    blogServices.deleteCategoryById(req.params.id).
    then(() => {
        res.redirect("/categories");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found)");
    })
});

app.get("/posts/delete/:id", ensureLogin, (req, res) => {
    blogServices.deletePostById(req.params.id)
    .then(() => {
        res.redirect("/posts");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Post / Post not found)");
    })
});

app.get('/post/:id', ensureLogin, (req,res)=>{
    blogServices.getPostById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});

app.get('/blog/:id', ensureLogin, async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogServices.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogServices.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogServices.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogServices.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    console.log(viewData.post);
    res.render("blog", {data: viewData})
});

app.get("/posts/add", ensureLogin, (req, res) => {
    blogServices.getCategories().then((data) => {
        res.render('addPost', {
            layout: "main",
            categories: data
        });
    }).catch((err) => {
        res.render("addPost", {categories: []});
    })
});


app.get("/categories/add", ensureLogin, (req, res) => {
    res.render('addCategory', {
        layout: "main"
    })
});

app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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
        }).catch(err => {
            console.log(err);
        })
    
    });
    
});

app.get("/posts/:value", ensureLogin, (req, res) => {
    let id = req.params['value'];
    blogServices.getPostById(id).then((data) => {
        res.render("posts", {posts:data});
    }).catch((err) => {
        res.render("posts", {message: "no results"});
    })
})

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blogServices.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0)
                res.render("posts", {posts: data});
            else
                res.render("posts", {message: "no results"})
        }).catch((err) => {
            res.render("posts", {message: "no results"});
        })
    } else if (req.query.minDate) {
        blogServices.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0)
                res.render("posts", {posts: data});
            else
                res.render("posts", {message: "no results"})
        }).catch((err) => {
            res.render("posts", {message: "no results"});
        })
    } else {
        blogServices.getAllPosts().then((data) => {
            if (data.length > 0)
                res.render("posts", {posts: data});
            else
                res.render("posts", {message: "no results"})
        }).catch((err) => {
            res.render("posts", {message: "no results"});
        })
    }
});

app.get("/categories", ensureLogin, (req, res) => {
    blogServices.getCategories().then((data) => {
        if (data.length > 0)
        res.render("categories", {categories: data});
    else
        res.render("categories", {message: "no results"})
    }).catch((err) => {
        res.render("categories", {message: "no results"});
    })
});

app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", (req, res) => {
    req.body.userAgent - req.get('User-Agent');
    authData.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect("/posts");
    })
    .catch((err) => {
        res.render("login", {errorMessage: err, userName: req.body.userName});
    })
});

app.get("/register", (req, res) => {
    res.render("register");
})
app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render("register", {successMessage: "User created"});
    }).catch((err) => {
        res.render("register", {errorMessage: err, userName: req.body.userName});
    })
})

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
})

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
})

app.use((req, res) => {
    res.status(404).render("404", {layout:"main"});
})


blogServices.initialize()
.then(authData.initialize)
.then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err) {
    console.log(`Unable to start server: ${err}`);
});
