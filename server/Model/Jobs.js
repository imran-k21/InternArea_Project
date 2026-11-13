const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  company: { type: String, trim: true, required: true },
  location: { type: String, trim: true, default: "" },
  Experience: { type: String, default: "" },
  category: { type: String, trim: true, default: "" },
  aboutCompany: { type: String, default: "" },
  aboutJob: { type: String, default: "" },
  Whocanapply: { type: String, default: "" },
  perks: { type: [String], default: [] },
  numberOfopning: { type: String, default: "" },
  AdditionalInfo: { type: String, default: "" },
  CTC: { type: String, default: "" },
  StartDate: { type: String, default: "" },
  createAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Job || mongoose.model("Job", JobSchema);
