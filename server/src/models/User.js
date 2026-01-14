import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Shtëpi" }, // p.sh. Shtëpi / Punë
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    country: { type: String, default: "Albania" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
    street: { type: String, default: "" },
    building: { type: String, default: "" },
    floor: { type: String, default: "" },
    notes: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const prefsSchema = new mongoose.Schema(
  {
    language: { type: String, default: "sq" }, // sq/en
    newsletter: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, default: "" }, // nëse përdor local auth
    avatar: { type: String, default: "" },

    // Profile data
    phone: { type: String, default: "" },
    birthday: { type: String, default: "" }, // thjeshtë string (YYYY-MM-DD)
    gender: { type: String, default: "" },
    company: { type: String, default: "" },
    vatNumber: { type: String, default: "" },

    addresses: { type: [addressSchema], default: [] },
    prefs: { type: prefsSchema, default: () => ({}) },

    provider: { type: String, default: "local" },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
