const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Internship = require("../Model/Internship");
const { requireAdmin } = require("../Middleware/auth");

function toPerks(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    if (!String(body.title || "").trim() || !String(body.company || "").trim()) {
      return res.status(400).json({ error: "Internship title and company are required" });
    }

    const internship = await Internship.create({
      title: body.title,
      company: body.company,
      location: body.location,
      Duration: body.Duration || body.duration,
      category: body.category,
      aboutCompany: body.aboutCompany,
      aboutInternship: body.aboutInternship,
      Whocanapply: body.Whocanapply || body.whoCanApply,
      perks: toPerks(body.perks),
      numberOfopning: body.numberOfopning || body.numberOfOpening,
      AdditionalInfo: body.AdditionalInfo || body.additionalInfo,
      stipend: body.stipend,
      StartDate: body.StartDate || body.startDate,
    });

    return res.status(201).json(internship);
  } catch (error) {
    console.error("Unable to create internship:", error);
    return res.status(500).json({ error: "Unable to create internship" });
  }
});

router.get("/", async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createAt: -1 });
    return res.status(200).json(internships);
  } catch (error) {
    console.error("Unable to fetch internships:", error);
    return res.status(500).json({ error: "Unable to fetch internships" });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid internship ID" });
  }
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ error: "Internship not found" });
    return res.status(200).json(internship);
  } catch (error) {
    console.error("Unable to fetch internship:", error);
    return res.status(500).json({ error: "Unable to fetch internship" });
  }
});

module.exports = router;
