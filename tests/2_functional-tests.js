/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
// 
chai.use(chaiHttp);

suite('Functional Tests', function () {

// we'll need some valid IDs to run tests on the PUT and DELETE requests.
// To get some of these, when we run our test POST methods, we'll save the returned IDs here globally, so that we can access them later on:
  let id1;
  let id2;
  
  suite('POST /api/issues/{project} => object with issue data', function () {

    test('Every field filled in', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');

          // We'll save the ID globally :
          id1 = res.body._id;
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Every field filled in");
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, "In QA");

          done();
        });
    });

    test('Required fields filled in', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Another test another title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');

          // We'll save the ID globally : 
          id2 = res.body._id;

          assert.equal(res.body.issue_title, "Another test another title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Required fields filled in");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, "");
          done();
        });
    });

    test('Missing required fields', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Last test',
          created_by: 'Functional Test - Missing required fields'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "Missing required fields");
          done();
        });
    });

  });



  // Start PUT test suite

  suite('PUT /api/issues/{project} => text', function () {

    test('No body', function (done) {
      chai.request(server)
        .put("/api/issues/test")
        .send({
          _id: id1
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "There is no updated field to sent");
          done();
        });
    });

    test('One field to update', function (done) {
      chai.request(server)
        .put("/api/issues/test")
        .send({
          _id: id2,
          issue_title: "Updated title"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "Successfully updated");
          done();
        });
    });

    test('Multiple fields to update', function (done) {
      chai.request(server)
        .put("/api/issues/test")
        .send({
          _id: id2,
          issue_title: "Updated title",
          issue_text: "Updated text"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "Successfully updated");
          done();
        })
    });
  });

  // End PUT test suite


  // Start GET test suite

  suite('GET /api/issues/{project} => Array of objects with issue data', function () {

    test('No filter', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('One filter', function (done) {
      chai.request(server)
        .get("/api/issues/test")
        .query({
          issue_title: "Updated title"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].issue_title, "Updated title");
          done();
        });
    });

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
      chai.request(server)
        .get("/api/issues/test")
        .query({
          issue_title: "Updated title",
          open: true
        })
        .end(function (err, res) {
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].issue_title, "Updated title");

          assert.equal(res.body[0].issue_title, "Updated title");
          assert.equal(res.body[0].open, true);
          done();
        });
    });
  });

  // End GET test suite

  // Start DELETE test suite

  suite('DELETE /api/issues/{project} => text', function () {

    test('No _id', function (done) {
      chai.request(server)
        .delete("/api/issues/test")
        .send({}) // <<<<< There is no id 
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "_id Error!!");
          done();
        });
    });

    test('Valid _id', function (done) {
      chai.request(server)
        .delete("/api/issues/test")
        .send({
          _id: id1
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "deleted " + id1);
          done();
        })
    });
  });
  // End DELETE test suite

}); //End Functional Tests