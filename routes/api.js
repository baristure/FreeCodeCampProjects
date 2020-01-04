/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var mongoose = require("mongoose");
var db;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
MongoClient.connect(
  process.env.DB,
  {
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err) return console.log(err);
    db = client.db("test"); // whatever your database name is
  }
);

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      db.collection("books")
        .find()
        .toArray((err, result) => {
          if (err) return console.log(err);
          // renders index.ejs
          res.send({
            books: result
          });
        });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(function(req, res) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
    
      var bookId = req.params.id;
      db.collection("books").findOne(
        { _id: ObjectId(bookId) },
        (err, result) => {
          if (err) console.log(err);
          else {
            res.json(result);
          }
        }
      );
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
};
