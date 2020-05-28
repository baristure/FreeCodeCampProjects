/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var db;

const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})
const Schema = mongoose.Schema;
const threadSchema = new mongoose.Schema({
  board: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  delete_password: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  bumped_on: {
    type: Date,
    default: Date.now
  },
  reported: {
    type: Boolean,
    default: false
  },
  replies: {
    type: [{
      text: {
        type: String,
        required: true
      },
      delete_password: {
        type: String,
        required: true
      },
      created_on: {
        type: Date,
        default: Date.now
      },
      reported: {
        type: Boolean,
        required: true
      },
    }],
    default: []
  },
  replycount: {
    type: Number,
    default: 0
  }
})

// const replySchema
const Thread = mongoose.model('Thread', threadSchema);
module.exports = function (app) {

  app.route('/api/threads/:board')
    // === THREAD | GET REQUEST === \\
    .get(async (req, res) => {
      const boardTitle = req.params.board;

      const threads = await Thread.find({
          board: boardTitle
        }, ('-__v -reported -delete_password'))
        .limit(10).sort({
          bumped_on: -1
        })

      threads.map(thread => {
        thread.replycount = thread.replies.length;

        if (thread.replies.length > 3) {
          thread.replies = thread.replies.filter((reply, index) => {
            return index >= thread.replies.length - 3
          })

          thread.replies = thread.replies.map(reply => {
            const testObj = reply.toObject()
            delete testObj.delete_password;
            delete testObj.reported;
            return testObj
          })
        }
      })
      res.json(threads)
    })
    // === THREAD | POST REQUEST === \\
    .post(async (req, res) => {
      const board = req.params.board;
      const {
        text,
        delete_password
      } = req.body
      const thread = new Thread({
        board,
        text,
        delete_password
      })

      thread.save();

      // res.json({board, text, delete_password})
      res.redirect(`https: //atlantic-modem.glitch.me/b/${board}/`)
    })

    // === THREAD | PUT REQUEST === \\
    .put(async (req, res) => {
      const board = req.params.board;
      const {
        thread_id
      } = req.body

      try {
        const thread = await Thread.findById(thread_id)

        thread.reported = true;
        thread.save();
        res.status(200).send('success')
      } catch (error) {
        res.status(400).send('incorrect thread id')
      }
    })
    // === THREAD | DELETE REQUEST === \\
    .delete(async (req, res) => {
      const {
        thread_id,
        delete_password
      } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        if (thread.delete_password === delete_password) {
          await Thread.findByIdAndRemove(thread_id);

          res.status(200).send('success')
        } else {
          res.status(401).send('incorrect password')
        }
      } catch (error) {
        res.json('incorrect id')
      }
    })
  app.route('/api/replies/:board')
    // === REPLIES | GET REQUEST === \\
    .get(async (req, res) => {
      const board = req.params.board;
      const thread_id = req.query.thread_id;
      const thread = await Thread.findById(thread_id, ('-__v -reported -delete_password'));

      thread.replies = thread.replies.map(reply => {
        const newObj = reply.toObject();
        delete newObj.reported;
        delete newObj.delete_password;
        return newObj;
      })

      res.json(thread)
    })
    // === REPLIES | POST REQUEST === \\
    .post(async (req, res) => {
      const board = req.params.board;
      const {
        thread_id,
        text,
        delete_password
      } = req.body;

      const thread = await Thread.findById(thread_id);
      const reply = {
        text,
        delete_password,
        reported: false
      };

      thread.replies.push(reply);
      thread.replycount++;
      thread.bumped_on = Date.now();
      thread.save();

      // res.status(200).json({board, thread_id, text, delete_password })
      res.redirect(`https: //atlantic-modem.glitch.me/b/${board}/${thread_id}`)


    })
    // === REPLIES | PUT REQUEST === \\
    .put(async (req, res) => {
      const {
        thread_id,
        reply_id
      } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        let found = false;

        thread.replies.map(reply => {
          if (reply._id == reply_id) {
            reply.reported = true;
            found = true;
          }

          return reply
        })

        if (found) {
          thread.save();

          res.status(200).send('success')
        } else {
          res.status(404).send('no id found')
        }
      } catch (error) {
        res.status(404).json('incorrect thread id')
      }
    })

    // === REPLIES | DELETE REQUEST === \\
    .delete(async (req, res) => {
      const {
        thread_id,
        reply_id,
        delete_password
      } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        let found = null;

        thread.replies.map(reply => {
          if (reply._id == reply_id) {
            if (reply.delete_password === delete_password) {
              reply.text = '[deleted]';

              found = true;
            } else {
              found = false;
            }
          }

          return reply
        })

        if (found !== null) {
          if (found) {
            thread.save();

            res.status(200).send('success')
          } else {
            res.status(200).send('incorrect password')
          }
        } else {
          res.status(404).send('id not found')
        }
      } catch (error) {
        res.json('incorrect thread id')
      }
    })
};