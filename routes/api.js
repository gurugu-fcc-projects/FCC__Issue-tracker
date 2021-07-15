"use strict";

const Issue = require("../models/Issue");

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async (req, res) => {
      const project = req.params.project;
    })

    .post(async (req, res) => {
      const project = req.params.project;
      const data = { project, ...req.body };

      const newIssue = await Issue.create(data);

      console.log(newIssue);

      // res.status(201).json(newIssue)
    })

    .put(async (req, res) => {
      const project = req.params.project;
    })

    .delete(async (req, res) => {
      const project = req.params.project;
    });
};
