const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {

let username = req.query.username;
let password = req.query.password;

let filtered_users = users.filter((user) => user.username === username);

if (!username || !password) {
    res.send("Please provide both your username and password")
}else{
    if (filtered_users.length > 0) {
        res.send("The user " + req.query.username + " already exists...");
    }else{
        users.push({
            "username": username,
            "password": password,
        });
    res.send("The user " + req.query.username + " has been added!");
}}
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    let myPromise1 = new Promise((resolve,reject) => {
      resolve(books)
    });

     myPromise1
        .then((books) => {
            res.send(JSON.stringify(books, null));
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the book list.");
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

    let isbn = req.params.isbn;

    let myPromise2 = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject(new Error("Invalid ISBN"));
        }
    });

    myPromise2
        .then((bookDetails) => {
            res.send(JSON.stringify(bookDetails, null));
        })
        .catch((error) => {
            if (error.message === "Invalid ISBN") {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).send("An error occurred while retrieving the book.");
            }
        });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

    let author = req.params.author;
    let booksLenght = Object.keys(books).length;

    let myPromise3 = new Promise((resolve, reject) => {
    for (let y = 1; y < booksLenght; y++) {
        if (books[y]["author"] == author){
            resolve(
            res.send(JSON.stringify(books[y], null))  );
        }else{
            reject(new Error("Book not found"));
        }
    }
    });

        myPromise3
        .then((bookDetails) => {
            res.send(JSON.stringify(bookDetails, null));
        })
        .catch((error) => {
            if (error.message === "Author not found") {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).send("Book not found");
            }
        });
    });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;
    let booksLenght = Object.keys(books).length;

    let myPromise4 = new Promise((resolve, reject) => {
        for (let y = 1; y < booksLenght; y++) {
            if (books[y]["title"] == title){
                resolve(
                    res.send(JSON.stringify(books[y], null))
                );
            }else{
                reject(new Error("Title not found"));
            }
        }
    });

    myPromise4
        .then((bookDetails) => {
            res.send(JSON.stringify(bookDetails, null));
        })
        .catch((error) => {
                if (error.message === "Title not found") {
                    res.status(404).json({ message: error.message });
                } else {
                    res.status(500).send("Book not found");
                }
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Invalid ISBN" });
    } else {
        res.send(JSON.stringify(books[isbn]["reviews"], null));
    } 
});

module.exports.general = public_users;


