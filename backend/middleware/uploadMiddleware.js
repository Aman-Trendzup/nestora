import multer from "multer";
import path from "path";
import crypto from "crypto";
import { TEMP_UPLOADS_DIR, ensureUploadDirs } from "../utils/imageStorage.js";

ensureUploadDirs();

// Disk storage for temporary incoming uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirs();
    cb(null, TEMP_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `temp-${uniqueId}${ext}`);
  },
});

// File filter strictly for image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type for "${file.originalname}". Only JPEG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

// Multer instance: max 5 MB per file, max 3 files per workspace listing
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 3, // Max 3 files as required
  },
});

/**
 * Middleware wrapper for workspace image uploads.
 * Handles Multer limits and syntax errors gracefully.
 */
export const uploadWorkspaceImages = (req, res, next) => {
  upload.array("images", 3)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File is too large. Maximum file size allowed is 5 MB per image.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message: "You can upload a maximum of 3 images per workspace listing.",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || "Failed to process uploaded file.",
      });
    }

    next();
  });
};

