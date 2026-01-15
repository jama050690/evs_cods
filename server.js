import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// ===== ESM __dirname =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== VIEW ENGINE =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.static(path.join(__dirname, "public")));

// ===== MULTER =====
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ===== STATIC =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== ROUTES =====
app.get("/", (req, res) => {
  const success = req.query.success === "1";
  const video = req.query.video;
  res.render("home", { success, video });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", upload.single("profile_picture"), (req, res) => {
  res.redirect(`/?success=1&video=${req.file.filename}`);
});

// ===== VIDEOS LIST PAGE =====
app.get("/dashboard", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads");
  const current = req.query.v;

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.render("dashboard", { videos: [], current: null });
    }

    const videos = files.filter((f) => f.endsWith(".mp4"));

    res.render("dashboard", {
      videos,
      current,
    });
  });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(" Server running on http://localhost:" + PORT);
});
