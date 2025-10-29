import express from "express";
import axios from "axios";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
// import cors from "cors";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const upload = multer({ dest: "uploads/" });

// PostgreSQL connection setup
const pool = new Pool({
  user: "postgres", // your user
  host: "localhost",
  database: "postgres", // your db
  password: "12345",
  port: 5432,
});


// API: Upload PPTX and save info to DB
app.post("/upload-ppt", upload.single("pptx"), async (req, res) => {
  const { originalname, filename, path: filePath } = req.file;
  // Save the file info into Postgres (could include more fields)
  const result = await pool.query(
    "INSERT INTO presentations (filename, originalname, upload_time) VALUES ($1, $2, NOW()) RETURNING id",
    [filename, originalname]
  );
  res.json({ success: true, pptId: result.rows[0].id });
});

// API: Convert PPTX to PDF and serve (on demand)
app.get("/download-ppt/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT filename, originalname FROM presentations WHERE id=$1", [id]);
  if (result.rowCount === 0) return res.sendStatus(404);
  const pptxPath = path.join(__dirname, "uploads", result.rows[0].filename);
  res.download(pptxPath, result.rows[0].originalname || "download.pptx");
});

app.get("/ppt-preview/:id", async (req, res) => {
  const { id } = req.params;

  // Fetch filename from database
  const result = await pool.query("SELECT filename FROM presentations WHERE id=$1", [id]);
  if (result.rowCount === 0) return res.sendStatus(404);

  const filename = result.rows[0].filename;
  const pptxPath = path.join(__dirname, "uploads", filename); // <-- declare here
  const pdfPath = pptxPath + ".pdf"; // And use it

  // If PDF already exists, send it
  if (fs.existsSync(pdfPath)) {
    return res.sendFile(pdfPath);
  }

  // Convert PPTX to PDF with LibreOffice
  const sofficePath = "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

  exec(`"${sofficePath}" --headless --convert-to pdf --outdir "${path.dirname(pptxPath)}" "${pptxPath}"`, (err) => {
    if (err) {
      console.error("LibreOffice error:", err);
      return res.status(500).send("Conversion failed.");
    }
    if (fs.existsSync(pdfPath)) {
      res.sendFile(pdfPath);
    } else {
      res.status(500).send("PDF conversion failed.");
    }
  });
});



app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error?.response?.data || error);
    res.status(500).json({ error: error });
  }
});

app.listen(5000, () => console.log("✅ Backend running on port 5000"));
