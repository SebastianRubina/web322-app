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

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("File is empty, no categories to be displayed.");
        } else {
            resolve(categories);
        }
    })
}