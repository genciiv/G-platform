// server/src/controllers/userProfileController.js
import User from "../models/User.js";

function pickUser(u) {
  if (!u) return null;
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    avatar: u.avatar || "",
    phone: u.phone || "",
    birthday: u.birthday || "",
    gender: u.gender || "",
    company: u.company || "",
    vatNumber: u.vatNumber || "",
    prefs: u.prefs || { language: "sq", newsletter: false, orderUpdates: true },
    addresses: Array.isArray(u.addresses) ? u.addresses : [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function getMe(req, res) {
  try {
    console.log("PROFILE GET req.user:", req.user);
    const id = req.user?.id;
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ message: "Not found" });
    return res.json({ user: pickUser(u) });
  } catch (e) {
    console.log("PROFILE GET error:", e?.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateMe(req, res) {
  try {
    const id = req.user?.id;

    const payload = {
      name: req.body?.name ?? "",
      phone: req.body?.phone ?? "",
      birthday: req.body?.birthday ?? "",
      gender: req.body?.gender ?? "",
      company: req.body?.company ?? "",
      vatNumber: req.body?.vatNumber ?? "",
      avatar: req.body?.avatar ?? "",
      prefs: {
        language: req.body?.prefs?.language ?? "sq",
        newsletter: !!req.body?.prefs?.newsletter,
        orderUpdates: req.body?.prefs?.orderUpdates !== false,
      },
    };

    const u = await User.findByIdAndUpdate(id, payload, { new: true });
    if (!u) return res.status(404).json({ message: "Not found" });
    return res.json({ user: pickUser(u) });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateAddresses(req, res) {
  try {
    const id = req.user?.id;

    const incoming = Array.isArray(req.body?.addresses)
      ? req.body.addresses
      : [];

    // sanitize + ensure default
    const cleaned = incoming.map((a) => ({
      label: a?.label || "Shtëpi",
      fullName: a?.fullName || "",
      phone: a?.phone || "",
      country: a?.country || "Albania",
      city: a?.city || "",
      zip: a?.zip || "",
      street: a?.street || "",
      building: a?.building || "",
      floor: a?.floor || "",
      notes: a?.notes || "",
      isDefault: !!a?.isDefault,
    }));

    if (cleaned.length && !cleaned.some((x) => x.isDefault)) {
      cleaned[0].isDefault = true;
    }

    const u = await User.findByIdAndUpdate(
      id,
      { addresses: cleaned },
      { new: true }
    );

    if (!u) return res.status(404).json({ message: "Not found" });
    return res.json({ user: pickUser(u) });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
}
