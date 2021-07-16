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
    const issues = [
      {
        issue_title: "Get Issue 1",
        issue_text: "Getting all issues",
        created_by: "Durandal",
      },
      {
        issue_title: "Get Issue 2",
        issue_text: "Getting all issues",
        created_by: "Durandal",
      },
      {
        issue_title: "Get Issue 3",
        issue_text: "Getting all issues",
        created_by: "Durandal",
      },
    ];

    Promise.all([
      requester.post("/api/issues/123").send(issues[0]),
      requester.post("/api/issues/123").send(issues[1]),
      requester.post("/api/issues/123").send(issues[2]),
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
});
