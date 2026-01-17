import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

// ===== ESM __dirname =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== VIEW ENGINE =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.static(path.join(__dirname, "public")));

// ===== UPLOADS DIR =====
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== MULTER =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===== JSON DATA =====
const dataDir = path.join(__dirname, "data");
const DATA_FILE = path.join(dataDir, "files.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

const readJSON = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeJSON = (data) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ===== STATIC UPLOADS =====
app.use("/uploads", express.static(uploadDir));

// ===== ROUTES =====

// HOME
app.get("/", (req, res) => {
  const success = req.query.success === "1";
  const video = req.query.video || null;

  res.render("home", {
    success,
    video,
  });
});
// SIGNUP PAGE
app.get("/signup", (req, res) => {
  res.render("signup");
});

// SIGNUP POST (UPLOAD)
app.post("/signup", upload.single("profile_picture"), (req, res) => {
  if (!req.file) return res.status(400).send("File not uploaded");

  const files = readJSON();
  const ext = path.extname(req.file.originalname).slice(1);

  files.push({
    id: Date.now(),
    fileName: req.file.originalname,
    category: ["png", "jpg", "jpeg", "webp"].includes(ext) ? "image" : "video",
    path: "uploads/" + req.file.filename,
  });

  writeJSON(files);
  res.redirect("/dashboard");
});

// DASHBOARD
app.get("/dashboard", (req, res) => {
  const files = readJSON();
  res.render("dashboard", { files });
});

// VIEW (IMAGE + VIDEO)
app.get("/view/:id", (req, res) => {
  const files = readJSON();
  const file = files.find((f) => f.id == req.params.id);
  if (!file) return res.status(404).send("File not found");

  res.render("video", { file });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
