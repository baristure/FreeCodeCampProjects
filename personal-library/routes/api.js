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
  app.route("/api/books").get(function(req, res) {
    db.collection("books")
      .aggregate([
        { $match: {} },
        {
          $project: {
            _id: true,
            title: true,
            commentcount: { $size: "$comments" }
            // we don't wanna see all comments
            // , comments: true
          }
        }
      ])
      .toArray((err, result) => {
        if (err) return console.log("Database read error : " + err);
        res.json(result);
      });
    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
  });

  app
    .post("/api/books", (req, res) => {
      var title = req.body.title;
      db.collection("books").insertOne(
        { title: title, comments: [] },
        (err, result) => {
          if (err) return console.log(err);
          res.json(result.ops[0]);
        }
      );
    })

    .delete("/api/books", function(req, res) {
      db.collection("books").remove({}, (err, result) => {
        if (err) return console.log("Database remove error : " + err);
        res.send("complete delete successful");
        console.log(result.result.n + " element deleted");
      });
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      db.collection("books").findOne(
        { _id: ObjectId(bookid) },
        (err, result) => {
          if (err) console.log(err);
          res.json(result);
        }
      );
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      db.collection("books").findOneAndUpdate(
        { _id: ObjectId(bookid) },
        { $push: { comments: req.body.comment } },
        { returnOriginal: false },
        (err, result) => {
          if (err) console.log(err);
          else {
            res.json(result);
          }
        }
      );
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      db.collection("books").findOneAndDelete(
        { _id: ObjectId(bookid) },
        (err, result) => {
          if (err) console.log(err);
          else res.send("Book deleted successfully");
        }
      );
    });
};
