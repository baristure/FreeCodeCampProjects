/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {

  // We want it to be possible to submit (and retrieve, update, delete) issues for various projects. 
  // To this end, our API route has a parameter (i.e: ":project"):
  app.route('/api/issues/:project')

    /*
    USER STORY 6:
    I can GET / api / issues / { project }
    for an array of all issues on that specific project with all the information
    for each issue as wasreturned when posted.
    USER STORY 7:
    I can filter my get request by also passing along any field and value in the query(ie. / api / issues / { project } ? open = false).
    I can pass along as many fields / values as I want.
    */
    .get(function (req, res) {
      var project = req.params.project;
      // We'll save the project name, adding "issueTracker_" to its start.
      // This way, we'll have a specific (and identifiable) collection in the database for each project:
      let collectionName = "issueTracker_" + req.params.project;
      //We'll also save all of the query parameters to a variable:
      let query = req.query;
      // Because the request content is a string, and the "open" property of our issues should be a boolean,
      // we need to convert any query for "open" from string to boolean:
      if (query.open == "true") {
        query.open = true;
      } else if (query.open == "false") {
        query.open = false;
      }
      // With these in hand, we can now search our database's project-specific collection for all issues that match the query parameters we've received:
      // N.B. MongoDB's .find() doesn't take a callback. For that, we tack on .toArray() and have our callback in there.
      db.collection(collectionName).find(query).toArray((err, data) => {
        // We'll handle any errors that might arise from this remote/async activity...
        if (err) return console.log("Error retrieving issues from database:", err);

        // ... and if we don't have any errors, we'll respond with the data:
        return res.json(data);

      }); //   END of callback and END of .toArray()
    })



    /*
      USER STORY 2:I can POST / api / issues / { project } 
      with form data containing required issue_title, issue_text, created_by, and optional assigned_to and status_text.
    */
    /* 
      USER STORY 3: The object saved(and returned) will include all of those fields(blank
      for optional no input) and also include created_on(date / time), updated_on(date / time), open(boolean, true
      for open, false
      for closed), and _id.
      */

    .post(function (req, res) {
      // We'll save the project name, adding "issueTracker_" to the start of it. This way, we'll have a specific collection in the database for each project:
      let collectionName = "issueTracker_" + req.params.project;

      // We'll also save the information submitted via the form, adding in dates, the open status, and blanks for the optional fields that might not have been filled out:
      let issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        open: true,
        status_text: req.body.status_text || ""
      }

      // Next, we'll do some server-side validation to make sure that all the required fields have been submitted:
      if (typeof issue.issue_title == "undefined" || typeof issue.issue_text == "undefined" || typeof issue.created_by == "undefined") {
        return res.json("missing required fields");
      };

      // If all the required fields have been submitted, we'll then add the new issue to a project-specific collection in our database...
      db.collection(collectionName).insertOne(issue, (err, data) => {
        // ... making sure to use the callback function to handle any errors that might arise from the remote/async activity...
        if (err) return console.log("Error POSTing new issue:", err);

        // ... and if there are no errors, we'll return a JSON object containing all of the data for the issue we've just added:
        return res.json({
          _id: data.ops[0]._id,
          issue_title: data.ops[0].issue_title,
          issue_text: data.ops[0].issue_text,
          created_on: data.ops[0].created_on,
          updated_on: data.ops[0].updated_on,
          created_by: data.ops[0].created_by,
          assigned_to: data.ops[0].assigned_to,
          open: data.ops[0].open,
          status_text: data.ops[0].status_text
        });

      }) //  END of .insertOne()
    }) //  END of POST route handler

    /*
    USER STORY 4:
    I can PUT / api / issues / { project }
    with a _id and any fields in the object with a value to object said object.
    Returned will be‘ successfully updated’ or‘ could not update‘ + _id.
    This should always update updated_on.If no fields are sent
    return‘ no updated fieldsent’.
    */
    .put(function (req, res) {

      // We'll save the project name, adding "issueTracker_" to its start. This way, we'll have a specific (and identifiable) collection in the database for each project:
      let collectionName = "issueTracker_" + req.params.project;
      // We'll also save the information submitted via the form:
      let issue = req.body;

      // With our data in hand, we'll start by doing some server-side validation to make sure that the required field has been submitted:
      if (typeof issue._id == "undefined") return res.json("missing required fields");

      // Because the request content is a string, and the "open" property of our issues is a boolean, we need to convert requests to set open=false from string to boolean:
      if (issue.open == "false") {
        issue.open = false;
      };

      // We'll only want to update the fields of our database entry/document/instance for which the user has provided information, so let's discard any empty fields:
      for (let element in issue) {
        if (issue[element].length == 0) {
          delete issue[element];
        };
      };

      // If no updated fields are submitted (other than _id), we can simply return "no updated field sent" as per the user stories:
      if (Object.keys(issue).length == 1) return res.json("no updated field sent");

      // If we DO have some fields to update, before we attempt to update the database entry, we'll add in the updated_on property...
      issue.updated_on = new Date();

      // Next, for the MongoDB query to work, we need to convert the _id string we currently have into an ObjectId, making sure that the _id entered is valid to avoid errors:
      if (ObjectId.isValid(issue._id)) {
        issue._id = ObjectId(issue._id);
      } else {
        return res.json("could not update " + issue._id);
      }


      // With our information cleaned up, let's go ahead and attempt to update the given issue in the project-specific collection of our database:
      db.collection(collectionName).findAndModify({
          _id: issue._id
        }, {}, {
          $set: issue
        }, // set only the fields that we have in our issue object
        {
          new: true
        }, // returns the updated document/instance rather than the pre-updated version
        (err, data) => {
          // We'll handle any errors that might arise from the remote/async action...
          if (err) return console.log("Error updating issue:", err);

          // ... and if there are no errors and we successfully updated an issue/doc/instance, then we'll respond with messages according to the user stories:          
          if (data.lastErrorObject.updatedExisting) {
            return res.json("successfully updated");
          } else {
            return res.json("could not update " + issue._id);
          };

        } // END of callback function
      ) // END of .findAndModify()
    })
    /*
    USER STORY 5:
    I can DELETE /api/issues/{project} with a _id to completely delete an issue. 
    If no _id is sent return ‘_id error’, success: ‘deleted +_id, failed: ‘could not delete ‘+_id.
    */
    .delete(function (req, res) {
      // We'll save the project name, adding "issueTracker_" to its start. This way, we'll have a specific (and identifiable) collection in the database for each project:
      let collectionName = "issueTracker_" + req.params.project;
      // We'll also save the information submitted via the form:
      let issue = req.body;

      // Let's start by converting the received _id string into an ObjectId, first making sure that the format is valid:
      if (ObjectId.isValid(issue._id)) {
        issue._id = ObjectId(issue._id);
      } else {
        return res.json("_id error");
      };

      // With our converted id in hand, let's attempt to delete the entry in the project-specific collection within our database:
      db.collection(collectionName).deleteOne({
          _id: issue._id
        },
        (err, data) => {
          // We'll handle any errors that might arise from the remote/async activity:
          if (err) return console.log("Error deleting entry:", err);

          // If there are no errors, we'll respond with messages according to the user stories:
          // It could be that the submitted ID is a valid ObjectId format, but that there is no match for it in the project-specific collection of issues:
          if (data.deletedCount == 0) {
            return res.json("could not delete " + issue._id);
          } else if (data.deletedCount == 1) {
            return res.json("deleted " + issue._id);
          } else {
            return res.json("something completely unexpected has happened while deleting the issue with id: " + issue._id);
          };

        } // END of callback function
      ); // END of .deleteOne()
    }); //  END of DELETE route handler

};