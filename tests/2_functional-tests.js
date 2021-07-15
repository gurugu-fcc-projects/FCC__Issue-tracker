const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", () => {
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
        assert.equal(201);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.nestedInclude(res.body, issue);

        done();
      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", done => {
    chai
      .request(server)
      .post("/api/issues/123")
      .send({
        issue_title: "Topchik Issue 1",
        issue_text: "There is an issue with Topchik",
        created_by: "Topchik",
      })
      .end((err, res) => {
        assert.equal(201);
        assert.equal(res.type, "application/json");
        assert.isObject(res.body);
        assert.nestedInclude(res.body, issue);

        done();
      });
  });
});
