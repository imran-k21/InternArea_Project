const mongoose = require("mongoose");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASEURL || "mongodb://127.0.0.1:27017/internarea";
const Internship = require("./Model/Internship");
const Job = require("./Model/Jobs");
const internshipSeedData = require("./Data/InternshipDatAvl");
const jobSeedData = require("./Data/JobsDataAvl");

async function seedIfEmpty() {
  if (process.env.SEED_DATABASE === "false") return;

  const [internshipCount, jobCount] = await Promise.all([
    Internship.countDocuments(),
    Job.countDocuments(),
  ]);

  if (internshipCount === 0 && internshipSeedData.length) {
    await Internship.insertMany(internshipSeedData);
    console.log(`Seeded internships: ${internshipSeedData.length}`);
  }

  if (jobCount === 0 && jobSeedData.length) {
    await Job.insertMany(jobSeedData);
    console.log(`Seeded jobs: ${jobSeedData.length}`);
  }
}

async function connect() {
  await mongoose.connect(DATABASE_URL, {
    serverSelectionTimeoutMS: Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS || 10000),
  });
  console.log("MongoDB connected");
  await seedIfEmpty();
  return mongoose.connection;
}

module.exports = { connect };
