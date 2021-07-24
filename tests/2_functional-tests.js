const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;

const server = require("../server");
const Issue = require("../models/Issue");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  setup(async () => await Issue.deleteMany({ project: "123" }));

  test.skip("Create an issue with every field: POST request to /api/issues/{project}", done => {
    const data = {
      issue_title: "Issue 1",
      issue_text: "There is an issue",
      created_by: "Wunderwaffe",
      assigned_to: "Milwakee",
      status_text: "In progress",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(data)
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.nestedInclude(res.body, data);

        done();
      });
  });

  test.skip("Create an issue with only required fields: POST request to /api/issues/{project}", done => {
    const data = {
      issue_title: "Topchik Issue 1",
      issue_text: "There is an issue with Topchik",
      created_by: "Topchik",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(data)
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.nestedInclude(res.body, data);

        done();
      });
  });

  test.skip("Create an issue with missing required fields: POST request to /api/issues/{project}", done => {
    const data = {
      created_by: "Wunderwaffe",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(data)
      .end((err, res) => {
        // assert.equal(res.status, 412);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "required field(s) missing");

        done();
      });
  });

  test.skip("View issues on a project: GET request to /api/issues/{project}", done => {
    const requester = chai.request(server).keepOpen();
    const data = {
      issue_text: "Getting all issues",
      created_by: "Durandal",
    };

    Promise.all([
      requester
        .post("/api/issues/123")
        .send({ ...data, issue_title: "Get Issue 1" }),
      requester
        .post("/api/issues/123")
        .send({ ...data, issue_title: "Get Issue 2" }),
      requester
        .post("/api/issues/123")
        .send({ ...data, issue_title: "Get Issue 3" }),
    ])
      .then(responses => {
        const re = new RegExp("Get Issue \\d");

        chai
          .request(server)
          .get("/api/issues/123")
          .end((err, res) => {
            assert.isArray(res.body);
            assert.lengthOf(res.body, 3);

            res.body.forEach(issue => {
              assert.property(issue, "issue_title");
              assert.match(issue.issue_title, re);
              assert.property(issue, "issue_text");
              assert.equal(issue.issue_text, "Getting all issues");
              assert.property(issue, "created_by");
              assert.equal(issue.created_by, "Durandal");
            });

            done();
          });
      })
      .then(() => requester.close())
      .catch(err => console.log(err));
  });

  test.skip("View issues on a project with one filter: GET request to /api/issues/{project}", done => {
    const requester = chai.request(server).keepOpen();
    const data = {
      issue_title: "Get With One Filter",
      issue_text: "Getting issues with one filter",
    };

    Promise.all([
      requester.post("/api/issues/123").send({ ...data, created_by: "Bob" }),
      requester.post("/api/issues/123").send({ ...data, created_by: "Bob" }),
      requester.post("/api/issues/123").send({ ...data, created_by: "Liz" }),
    ])
      .then(responses => {
        chai
          .request(server)
          .get("/api/issues/123?created_by=Bob")
          .end((err, res) => {
            assert.isArray(res.body);
            assert.lengthOf(res.body, 2);

            res.body.forEach(issue => {
              assert.equal(issue.created_by, "Bob");
            });

            done();
          });
      })
      .then(() => requester.close())
      .catch(err => console.log(err));
  });

  test.skip("View issues on a project with multiple filters: GET request to /api/issues/{project}", done => {
    const requester = chai.request(server).keepOpen();
    const data = {
      issue_title: "Get With One Filter",
      issue_text: "Getting issues with one filter",
    };

    Promise.all([
      requester
        .post("/api/issues/123")
        .send({ ...data, created_by: "Bob", assigned_to: "Liz" }),
      requester
        .post("/api/issues/123")
        .send({ ...data, created_by: "Bob", assigned_to: "Bob" }),
      requester
        .post("/api/issues/123")
        .send({ ...data, created_by: "Liz", assigned_to: "Liz" }),
    ])
      .then(responses => {
        chai
          .request(server)
          .get("/api/issues/123?created_by=Bob&assigned_to=Liz")
          .end((err, res) => {
            assert.isArray(res.body);
            assert.lengthOf(res.body, 1);

            res.body.forEach(issue => {
              assert.equal(issue.created_by, "Bob");
              assert.equal(issue.assigned_to, "Liz");
            });

            done();
          });
      })
      .then(() => requester.close())
      .catch(err => console.log(err));
  });

  test.skip("Update one field on an issue: PUT request to /api/issues/{project}", done => {
    const data = {
      issue_title: "Update Issue 1",
      issue_text: "There is an update issue",
      created_by: "Wunderwaffe",
      assigned_to: "Milwakee",
      status_text: "In progress",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(data)
      .end((err, res) => {
        const issueId = res.body._id;

        chai
          .request(server)
          .put("/api/issues/123")
          .send({ _id: issueId, issue_title: "Update Issue 2" })
          .end((err, res) => {
            chai
              .request(server)
              .get(`/api/issues/123?_id=${issueId}`)
              .end((err, res) => {
                assert.isArray(res.body);
                assert.isObject(res.body[0]);
                assert.equal(res.body[0].issue_title, "Update Issue 2");
                assert.isAbove(
                  Date.parse(res.body[0].updated_on),
                  Date.parse(res.body[0].created_on)
                );

                done();
              });
          });
      });
  });

  test.skip("Update multiple fields on an issue: PUT request to /api/issues/{project}", done => {
    const data = {
      issue_title: "Update Issue 2",
      issue_text: "There is an update issue",
      created_by: "Wunderwaffe",
      assigned_to: "Milwakee",
      status_text: "In progress",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(data)
      .end((err, res) => {
        const issueId = res.body._id;

        chai
          .request(server)
          .put("/api/issues/123")
          .send({
            _id: issueId,
            issue_title: "Update Issue 2",
            issue_text: "There is a multifield update issue",
            status_text: "Resolved",
          })
          .end((err, res) => {
            chai
              .request(server)
              .get(`/api/issues/123?_id=${issueId}`)
              .end((err, res) => {
                assert.isArray(res.body);
                assert.isObject(res.body[0]);
                assert.equal(res.body[0].issue_title, "Update Issue 2");
                assert.equal(
                  res.body[0].issue_text,
                  "There is a multifield update issue"
                );
                assert.equal(res.body[0].status_text, "Resolved");
                assert.isAbove(
                  Date.parse(res.body[0].updated_on),
                  Date.parse(res.body[0].created_on)
                );

                done();
              });
          });
      });
  });

  test.skip("Update an issue with missing _id: PUT request to /api/issues/{project}", done => {
    const data = {
      issue_title: "Update Issue 3",
      issue_text: "There is an update issue",
      created_by: "Wunderwaffe",
      assigned_to: "Milwakee",
      status_text: "In progress",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(data)
      .end((err, res) => {
        chai
          .request(server)
          .put("/api/issues/123")
          .send({
            issue_title: "Update Issue 3",
            issue_text: "There is a multifield update issue",
            status_text: "Resolved",
          })
          .end((err, res) => {
            assert.isObject(res.body);
            assert.equal(res.body.error, "missing _id");

            done();
          });
      });
  });

  test.skip("Update an issue with no fields to update: PUT request to /api/issues/{project}", done => {
    const data = {
      issue_title: "Update Issue 4",
      issue_text: "There is an update issue",
      created_by: "Wunderwaffe",
      assigned_to: "Milwakee",
      status_text: "In progress",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(data)
      .end((err, res) => {
        const issueId = res.body._id;

        chai
          .request(server)
          .put("/api/issues/123")
          .send({
            _id: issueId,
          })
          .end((err, res) => {
            assert.isObject(res.body);
            assert.equal(res.body.error, "no update field(s) sent");

            done();
          });
      });
  });

  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", done => {
    const badId = "5f665eb4cccccc6b9b6a504d";

    chai
      .request(server)
      .put("/api/issues/123")
      .send({
        _id: badId,
      })
      .end((err, res) => {
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id: badId,
        });

        done();
      });
  });
});
