const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Application = require("../Model/Application");
const Job = require("../Model/Jobs");
const Internship = require("../Model/Internship");
const { requireUser, requireAdmin, verifyFirebaseToken, verifyAdminToken } = require("../Middleware/auth");

router.post("/", requireUser, async (req, res) => {
  try {
    const { coverLetter, listingId, listingType } = req.body || {};
    const cleanCoverLetter = typeof coverLetter === "string" ? coverLetter.trim() : "";

    if (!cleanCoverLetter) {
      return res.status(400).json({ error: "A cover letter is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ error: "A valid job or internship ID is required" });
    }

    const normalizedType = String(listingType || "").toLowerCase();
    const isJob = normalizedType === "job";
    const isInternship = normalizedType === "internship";
    if (!isJob && !isInternship) {
      return res.status(400).json({ error: "Listing type must be job or internship" });
    }

    const ListingModel = isJob ? Job : Internship;
    const listing = await ListingModel.findById(listingId).lean();
    if (!listing) return res.status(404).json({ error: "The selected listing was not found" });

    const existing = await Application.findOne({
      userId: req.user.uid,
      listingId: listing._id,
    });
    if (existing) {
      return res.status(409).json({ error: "You have already applied to this listing" });
    }

    const user = {
      uid: req.user.uid,
      name: req.user.name || req.user.email || "InternArea User",
      email: req.user.email || "",
      photo: req.user.picture || "",
      phoneNumber: req.user.phoneNumber || "",
    };

    const savedApplication = await Application.create({
      coverLetter: cleanCoverLetter,
      company: listing.company,
      category: listing.category || "",
      Application: listing._id,
      listingId: listing._id,
      listingModel: isJob ? "Job" : "Internship",
      userId: req.user.uid,
      user,
    });

    return res.status(201).json(savedApplication);
  } catch (error) {
    console.error("Unable to submit application:", error);
    return res.status(500).json({ error: "Unable to submit application" });
  }
});

router.get("/mine", requireUser, async (req, res) => {
  try {
    const applications = await Application.find({
      $or: [{ userId: req.user.uid }, { "user.uid": req.user.uid }],
    }).sort({ createAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    console.error("Unable to load user applications:", error);
    return res.status(500).json({ error: "Unable to load applications" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const applications = await Application.find().sort({ createAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    console.error("Unable to load applications:", error);
    return res.status(500).json({ error: "Unable to load applications" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const isAdmin = verifyAdminToken(token);
    let uid = null;

    if (!isAdmin) {
      const user = await verifyFirebaseToken(token);
      uid = user.uid;
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid application ID" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    const ownerUid = application.userId || application.user?.uid;
    if (!isAdmin && ownerUid !== uid) {
      return res.status(403).json({ error: "You cannot view this application" });
    }

    return res.status(200).json(application);
  } catch (error) {
    return res.status(401).json({ error: "Authentication required" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { action } = req.body || {};
  if (!["accepted", "rejected"].includes(action)) {
    return res.status(400).json({ error: "Action must be accepted or rejected" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid application ID" });
  }

  try {
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status: action } },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }
    return res.status(200).json({ success: true, data: updatedApplication });
  } catch (error) {
    console.error("Unable to update application:", error);
    return res.status(500).json({ error: "Unable to update application" });
  }
});

module.exports = router;
