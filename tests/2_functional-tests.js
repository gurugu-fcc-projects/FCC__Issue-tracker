const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;

const server = require("../server");
const Issue = require("../models/Issue");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  setup(async () => await Issue.deleteMany({ project: "123" }));

  test("Create an issue with every field: POST request to /api/issues/{project}", done => {
    const issue = {
      issue_title: "Issue 1",
      issue_text: "There is an issue",
      created_by: "Wunderwaffe",
      assigned_to: "Milwakee",
      status_text: "In progress",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(issue)
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.nestedInclude(res.body, issue);

        done();
      });
  });

  test("Create an issue with only required fields: POST request to /api/issues/{project}", done => {
    const issue = {
      issue_title: "Topchik Issue 1",
      issue_text: "There is an issue with Topchik",
      created_by: "Topchik",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(issue)
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.nestedInclude(res.body, issue);

        done();
      });
  });

  test("Create an issue with missing required fields: POST request to /api/issues/{project}", done => {
    const issue = {
      created_by: "Wunderwaffe",
    };

    chai
      .request(server)
      .post("/api/issues/123")
      .send(issue)
      .end((err, res) => {
        // assert.equal(res.status, 412);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "required field(s) missing");

        done();
      });
  });

  test("View issues on a project: GET request to /api/issues/{project}", done => {
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

  test("View issues on a project with one filter: GET request to /api/issues/{project}", done => {
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

  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", done => {
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
});
