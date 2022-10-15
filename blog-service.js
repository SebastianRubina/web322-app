const e = require('express');
const fs = require('fs');

let posts = [];
let categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile(`./data/posts.json`, (err, data) => {
            if (err) {
                reject(`File not found: ${err}`);
            }
            else {
                posts = JSON.parse(data);
                fs.readFile('./data/categories.json', (err, data) => {
                    if (err) {
                        reject(`File not found: ${err}`);
                    } else {
                        categories = JSON.parse(data)
                        resolve();
                    }
                })
            }
        });
    });
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("File is empty, no posts to be displayed.");
        } else {
            resolve(posts);
        }
    })
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        let publishedPosts = posts.filter((post) => post.published);

        if (!publishedPosts) {
            reject("No published posts to be displayed.");
        } else {
            resolve(publishedPosts);
        }
    })
}

module.exports.getPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        let postsByCategory = posts.filter((post) => post.category === +category);

        if (postsByCategory.length === 0) {
            reject("no results returned");
        } else {
            resolve(postsByCategory);
        }
    })
}

module.exports.getPostsByMinDate = function(date) {
    return new Promise((resolve, reject) => {
        let postsByMinDate = posts.filter((post) => Date.parse(post.postDate) >= Date.parse(date));

        if (postsByMinDate.length === 0) {
            reject("no results returned");
        } else {
            resolve(postsByMinDate);
        }
    })
}

module.exports.getPostById = function(id) {
    return new Promise((resolve, reject) => {
        let selectedPost = posts.filter((post) => post.id === +id);

        if (selectedPost.length === 0) {
            reject("no result returned");
        } else {
            resolve(selectedPost);
        }
    })
}

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("File is empty, no categories to be displayed.");
        } else {
            resolve(categories);
        }
    })
}

module.exports.addPost = function(postData) {
    return new Promise(function(resolve, reject) {
        postData.id = posts.length + 1;
        postData.published = (postData.published) ? true : false;
        posts.push(postData);
        resolve();
    });
}