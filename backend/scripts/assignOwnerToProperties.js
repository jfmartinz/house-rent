require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("../schemas/property");
const User = require("../schemas/user");

function parseList(s) {
  if (!s) return [];
  return String(s)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI in .env");

  const ownerEmail = process.argv.find((a) => a.startsWith("--owner-email="));
  const ownerNameArg = process.argv.find((a) => a.startsWith("--owner-name="));
  const matchNamesArg = process.argv.find((a) =>
    a.startsWith("--match-names="),
  );
  const dry = process.argv.includes("--dry");

  const ownerEmailVal = ownerEmail ? ownerEmail.split("=")[1] : null;
  const ownerNameVal = ownerNameArg ? ownerNameArg.split("=")[1] : null;
  const matchNames = matchNamesArg
    ? parseList(matchNamesArg.split("=")[1])
    : [];

  if (!ownerEmailVal && !ownerNameVal) {
    throw new Error("Please provide --owner-email or --owner-name");
  }

  await mongoose.connect(uri);

  let owner = null;
  if (ownerEmailVal)
    owner = await User.findOne({ email: ownerEmailVal.toLowerCase() }).lean();
  if (!owner && ownerNameVal)
    owner = await User.findOne({ name: ownerNameVal }).lean();
  if (!owner) throw new Error("Owner user not found");

  console.log(
    "Assigning properties to owner:",
    owner.name,
    owner._id.toString(),
  );
  if (matchNames.length === 0) {
    console.log(
      'No match names provided; aborting. Use --match-names="Alice,Jackq"',
    );
    await mongoose.disconnect();
    return;
  }

  const filter = { ownerName: { $in: matchNames } };
  const props = await Property.find(filter).lean();
  console.log("Found", props.length, "properties to update");
  for (const p of props) {
    console.log(
      " -",
      p._id.toString(),
      p.propertyAddress || p.propertyType || "(no address)",
    );
  }

  if (dry) {
    console.log("\nDry run complete. No changes made.");
    await mongoose.disconnect();
    return;
  }

  const res = await Property.updateMany(filter, {
    $set: { ownerId: owner._id, ownerName: owner.name },
  });
  console.log(
    "updateMany result:",
    res.nModified || res.modifiedCount || res.ok || res,
  );

  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error("Error:", e && e.message ? e.message : e);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
