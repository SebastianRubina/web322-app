const Sequelize = require('sequelize');

var sequelize = new Sequelize('qvoqoyoc', 'qvoqoyoc', 'orgZOtt_oyJ78hjkteebbhK20XCdRWa3', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'}); 


module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(()=>{
            resolve("connection successful");
        }).catch(()=>{
            reject("unable to sync the database");
        });
    });
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        Post.findAll()
        .then(function(data){       
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        })
    });
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then(function(data) {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        })
    })

}

module.exports.getPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        }).then(function(data) {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    })

}

module.exports.getPublishedPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category,
                published: true
            }
        }).then(function(data) {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    })
}

module.exports.getPostsByMinDate = function(date) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        })
    });
}

module.exports.getPostById = function(id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then(function(data) {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    })

}

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then(function(data){       
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        })
    });

}

module.exports.addPost = function(postData) {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;

        // for (property in postData) {
        //     if (property == "") field = null;
        // }

        for (let p in postData) if (postData[p] == "") postData[p] = null;
        postData.postDate = new Date();
        Post.create(postData)
        .then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to create post");
        });
    });
}

module.exports.addCategory = function(categoryData) {
    return new Promise((resolve, reject) => {

        Category.create(categoryData)
        .then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to create category")
        });
    });
}

module.exports.deleteCategoryById = function(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("destroyed");
        }).catch((err) => {
            reject("unable to destroy category");
        });
    });
}

module.exports.deletePostById = function(id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("destroyed");
        }).catch((err) => {
            reject("unable to destroy category");
        });
    });
}


// module.exports.initialize = function() {
//     return new Promise((resolve, reject) => {
//         fs.readFile(`./data/posts.json`, (err, data) => {
//             if (err) {
//                 reject(`File not found: ${err}`);
//             }
//             else {
//                 posts = JSON.parse(data);
//                 fs.readFile('./data/categories.json', (err, data) => {
//                     if (err) {
//                         reject(`File not found: ${err}`);
//                     } else {
//                         categories = JSON.parse(data)
//                         resolve();
//                     }
//                 })
//             }
//         });
//     });
// }

// module.exports.getAllPosts = function() {
//     return new Promise((resolve, reject) => {
//         if (posts.length === 0) {
//             reject("File is empty, no posts to be displayed.");
//         } else {
//             resolve(posts);
//         }
//     })
// }

// module.exports.getPublishedPosts = function() {
//     return new Promise((resolve, reject) => {
//         let publishedPosts = posts.filter((post) => post.published);

//         if (!publishedPosts) {
//             reject("No published posts to be displayed.");
//         } else {
//             resolve(publishedPosts);
//         }
//     })
// }

// module.exports.getPostsByCategory = function(category) {
//     return new Promise((resolve, reject) => {
//         let postsByCategory = posts.filter((post) => post.category === +category);

//         if (postsByCategory.length === 0) {
//             reject("no results returned");
//         } else {
//             resolve(postsByCategory);
//         }
//     })
// }

// module.exports.getPublishedPostsByCategory = function(category) {
//     return new Promise((resolve, reject) => {
//         let publishedPostsByCategory = posts.filter((post) => (post.category === +category) && (post.published));

//         if (publishedPostsByCategory.length === 0) {
//             reject("no results returned");
//         } else {
//             resolve(publishedPostsByCategory);
//         }
//     })    
// }

// module.exports.getPostsByMinDate = function(date) {
//     return new Promise((resolve, reject) => {
//         let postsByMinDate = posts.filter((post) => Date.parse(post.postDate) >= Date.parse(date));

//         if (postsByMinDate.length === 0) {
//             reject("no results returned");
//         } else {
//             resolve(postsByMinDate);
//         }
//     })
// }

// module.exports.getPostById = function(id) {
//     return new Promise((resolve, reject) => {
//         let selectedPost = posts.filter((post) => post.id === +id);

//         if (selectedPost.length === 0) {
//             reject("no result returned");
//         } else {
//             resolve(selectedPost[0]);
//         }
//     })
// }

// module.exports.getCategories = function() {
//     return new Promise((resolve, reject) => {
//         if (categories.length === 0) {
//             reject("File is empty, no categories to be displayed.");
//         } else {
//             resolve(categories);
//         }
//     })
// }

// module.exports.addPost = function(postData) {
//     return new Promise(function(resolve, reject) {
//         postData.id = posts.length + 1;
//         postData.published = (postData.published) ? true : false;
//         var today = new Date();
//         var dd = String(today.getDate()).padStart(2, '0');
//         var mm = String(today.getMonth() + 1).padStart(2, '0');
//         var yyyy = today.getFullYear();

//         today = yyyy + '-' + mm + '-' + dd;
        
//         postData.postDate = today;

//         posts.push(postData);
//         resolve();
//     });
// }