const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  company: { type: String, required: true },
  category: { type: String, default: "" },
  coverLetter: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
  Application: mongoose.Schema.Types.Mixed,
  listingId: { type: mongoose.Schema.Types.ObjectId, refPath: "listingModel" },
  listingModel: { type: String, enum: ["Job", "Internship"] },
  userId: { type: String, index: true },
  user: { type: mongoose.Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.models.Application || mongoose.model("Application", applicationSchema);
