const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const issueSchema = new Schema(
  {
    project: {
      type: String,
      required: true,
      select: false,
    },
    issue_title: {
      type: String,
      required: true,
    },
    issue_text: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    assigned_to: {
      type: String,
    },
    status_text: {
      type: String,
    },
    open: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_on",
      updatedAt: "updated_on",
    },
  }
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
