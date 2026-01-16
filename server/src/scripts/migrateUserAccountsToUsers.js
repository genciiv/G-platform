// server/src/scripts/migrateUserAccountsToUsers.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import UserAccount from "../models/UserAccount.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ connected");

  const oldUsers = await UserAccount.find({});
  console.log("Found old users:", oldUsers.length);

  let created = 0;
  for (const ou of oldUsers) {
    const email = String(ou.email || "")
      .toLowerCase()
      .trim();
    if (!email) continue;

    const exists = await User.findOne({ email }).select("_id");
    if (exists) continue;

    await User.create({
      name: ou.name || "User",
      email,
      passwordHash: ou.passwordHash || "",
      role: "user",
      provider: "local",
    });
    created++;
  }

  console.log("✅ migrated:", created);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
