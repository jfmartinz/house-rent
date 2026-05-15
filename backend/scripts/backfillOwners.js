require("dotenv").config();

const mongoose = require("mongoose");
const Property = require("../schemas/property");
const User = require("../schemas/user");

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function run() {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI in .env");
  }

  await mongoose.connect(uri);

  const owners = await User.find({ role: "owner" }).select("_id name").lean();
  const ownersByName = new Map();

  for (const owner of owners) {
    const key = normalizeName(owner.name);
    if (!key) continue;
    if (!ownersByName.has(key)) ownersByName.set(key, []);
    ownersByName.get(key).push(owner);
  }

  const candidates = await Property.find({
    $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
  })
    .select("_id propertyAddress propertyType ownerName ownerId")
    .lean();

  let matchCount = 0;
  let ambiguousCount = 0;
  let missingNameCount = 0;
  let noMatchCount = 0;

  const updates = [];

  for (const p of candidates) {
    const key = normalizeName(p.ownerName);
    if (!key) {
      missingNameCount += 1;
      continue;
    }

    const possibleOwners = ownersByName.get(key) || [];
    if (possibleOwners.length === 1) {
      matchCount += 1;
      updates.push({
        propertyId: p._id,
        ownerId: possibleOwners[0]._id,
        ownerName: p.ownerName || "",
      });
    } else if (possibleOwners.length > 1) {
      ambiguousCount += 1;
    } else {
      noMatchCount += 1;
    }
  }

  console.log("Backfill ownerId report");
  console.log("-----------------------");
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`Owners found: ${owners.length}`);
  console.log(`Properties needing ownerId: ${candidates.length}`);
  console.log(`Unique ownerName matches: ${matchCount}`);
  console.log(`Ambiguous ownerName matches: ${ambiguousCount}`);
  console.log(`Missing ownerName: ${missingNameCount}`);
  console.log(`No matching owner account: ${noMatchCount}`);

  if (!apply) {
    console.log("\nDry-run complete. No DB changes were made.");
    await mongoose.disconnect();
    return;
  }

  if (updates.length === 0) {
    console.log("\nNo safe updates to apply.");
    await mongoose.disconnect();
    return;
  }

  const bulkOps = updates.map((u) => ({
    updateOne: {
      filter: {
        _id: u.propertyId,
        $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
      },
      update: { $set: { ownerId: u.ownerId } },
    },
  }));

  const result = await Property.bulkWrite(bulkOps, { ordered: false });
  console.log("\nApply complete.");
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Backfill failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // no-op
  }
  process.exit(1);
});
