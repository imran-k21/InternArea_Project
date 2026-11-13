const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Job = require("../Model/Jobs");
const { requireAdmin } = require("../Middleware/auth");

function toPerks(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    if (!String(body.title || "").trim() || !String(body.company || "").trim()) {
      return res.status(400).json({ error: "Job title and company are required" });
    }

    const job = await Job.create({
      title: body.title,
      company: body.company,
      location: body.location,
      Experience: body.Experience || body.experience,
      category: body.category,
      aboutCompany: body.aboutCompany,
      aboutJob: body.aboutJob || body.aboutInternship,
      Whocanapply: body.Whocanapply || body.whoCanApply,
      perks: toPerks(body.perks),
      numberOfopning: body.numberOfopning || body.numberOfOpening,
      AdditionalInfo: body.AdditionalInfo || body.additionalInfo,
      CTC: body.CTC || body.ctc,
      StartDate: body.StartDate || body.startDate,
    });

    return res.status(201).json(job);
  } catch (error) {
    console.error("Unable to create job:", error);
    return res.status(500).json({ error: "Unable to create job" });
  }
});

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Unable to fetch jobs:", error);
    return res.status(500).json({ error: "Unable to fetch jobs" });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid job ID" });
  }
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    return res.status(200).json(job);
  } catch (error) {
    console.error("Unable to fetch job:", error);
    return res.status(500).json({ error: "Unable to fetch job" });
  }
});

module.exports = router;
