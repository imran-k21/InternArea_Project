const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  company: { type: String, trim: true, required: true },
  location: { type: String, trim: true, default: "" },
  Duration: { type: String, default: "" },
  category: { type: String, trim: true, default: "" },
  aboutCompany: { type: String, default: "" },
  aboutInternship: { type: String, default: "" },
  Whocanapply: { type: String, default: "" },
  perks: { type: [String], default: [] },
  numberOfopning: { type: String, default: "" },
  AdditionalInfo: { type: String, default: "" },
  stipend: { type: String, default: "" },
  StartDate: { type: String, default: "" },
  createAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Internship || mongoose.model("Internship", InternshipSchema);
