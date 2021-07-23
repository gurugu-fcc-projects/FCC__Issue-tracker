"use strict";

const Issue = require("../models/Issue");

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async (req, res) => {
      const project = req.params.project;
      const filters = { project, ...req.query };

      const issues = await Issue.find(filters);

      res.status(200).json(issues);
    })

    .post(async (req, res) => {
      const project = req.params.project;

      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        // return res.status(412).json({ error: "required field(s) missing" });
        return res.json({ error: "required field(s) missing" });
      }

      const data = { project, ...req.body };

      const newIssue = await Issue.create(data);

      res.status(201).json(newIssue);
    })

    .put(async (req, res) => {
      const project = req.params.project;

      if (!req.body._id) {
        return res.status(400).json({ error: "missing _id" });
      }

      const { _id, ...newFields } = req.body;

      if (Object.keys(newFields).length < 1) {
        return res.status(400).json({ error: "no update field(s) sent" });
      }

      await Issue.findByIdAndUpdate(_id, newFields);

      res.status(201).json({ result: "successfully updated", _id });
    })

    .delete(async (req, res) => {
      const project = req.params.project;
    });
};
