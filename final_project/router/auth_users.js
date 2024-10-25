const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"User","password":"password123"}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

regd_users.post("/", (req,res) => {
 return res.send(users);
}
);

const authenticatedUser = (username,password, req)=>{
let filteredUsersList = users.filter((u)=>{
    return (u.username === username && u.password === password)
  });
  if(filteredUsersList.length > 0){
    let accessToken = jwt.sign({
        data: username
      }, 'access', { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
        accessToken
    }
    req.session.username = {
        username
    }
    return true;

 } else {
    return false;
  }
}

regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        res.send("Please provide both your username and password")
    }else{
      if (authenticatedUser(username,password, req)) {
      //return res.send("succes");
      if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        
        jwt.verify(token, "access", (err) => {
            if (!err) {
                req.username = username;
                return res.status(200).json({ message: "User authenticated" });
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
        
    } else {
        return res.status(403).json({ message: "User not logged in1" });
    }
    }else {
        return res.status(403).json({ message: "User not logged inn" });
    }
}
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let token = req.session.authorization['accessToken'];

    jwt.verify(token, "access", (err) => {
        if (!err) {
            let isbn = req.params.isbn;
            
            if (!books[isbn]) {
                return res.status(404).json({ message: "Invalid ISBN" });
            } else {
                let filtered_book = books[isbn];
                let username = req.session.username;
                let review = req.body.review;    

                if (review) {
                    filtered_book.reviews[username] = review;
                    return res.status(200).json({ message: "Update successful"});
                }
            }
        } else {
            return res.status(403).json({ message: "Update failed" });
        }
    });    
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let token = req.session.authorization['accessToken'];

    jwt.verify(token, "access", (err) => {
        if (!err) {
            let isbn = req.params.isbn;
            
            if (!books[isbn]) {
                return res.status(404).json({ message: "Invalid ISBN" });
            } else {
                let book = books[isbn];
                let username = req.session.username;

                if (book.reviews[username]) {
                    delete book.reviews[username]; 
                    return res.status(200).json({ message: "Deletion successful" });
                } else {
                    return res.status(404).json({ message: "Review not found" });
                }
            }
        } else {
            return res.status(403).json({ message: "User not authenticated" });
        }
    });    
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


