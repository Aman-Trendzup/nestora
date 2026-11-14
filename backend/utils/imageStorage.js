import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_ROOT = path.resolve(__dirname, "..", "uploads");
export const WORKSPACE_UPLOADS_DIR = path.join(UPLOAD_ROOT, "workspaces");
export const TEMP_UPLOADS_DIR = path.join(WORKSPACE_UPLOADS_DIR, "temp");

// Ensure upload directories exist
export const ensureUploadDirs = () => {
  if (!fs.existsSync(WORKSPACE_UPLOADS_DIR)) {
    fs.mkdirSync(WORKSPACE_UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(TEMP_UPLOADS_DIR)) {
    fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
  }
};

// Initial directory verification on startup
ensureUploadDirs();

/**
 * Process and optimize temporary uploaded files using Sharp
 * - Validates actual image binary content
 * - Resizes large images (max 1600x1200, aspect-ratio preserved)
 * - Converts to optimized WebP format
 * - Deletes temp files
 * - Returns metadata array
 */
export const processAndOptimizeImages = async (files = [], req) => {
  ensureUploadDirs();
  const processedImages = [];
  const newlyCreatedFiles = [];

  try {
    for (const file of files) {
      const tempPath = file.path;

      // 1. Verify file exists
      if (!fs.existsSync(tempPath)) {
        continue;
      }

      // 2. Validate actual image content with Sharp
      let metadata;
      try {
        metadata = await sharp(tempPath).metadata();
      } catch (sharpErr) {
        throw new Error(
          `File "${file.originalname}" is corrupted or is not a valid image.`
        );
      }

      const validFormats = ["jpeg", "jpg", "png", "webp"];
      if (!metadata || !validFormats.includes(metadata.format?.toLowerCase())) {
        throw new Error(
          `File "${file.originalname}" has an unsupported image format. Only JPEG, PNG, and WebP are allowed.`
        );
      }

      // 3. Generate unique filename (prevent original filename reliance)
      const uniqueId = crypto.randomUUID();
      const filename = `${uniqueId}.webp`;
      const targetPath = path.join(WORKSPACE_UPLOADS_DIR, filename);

      // 4. Resize and optimize image
      const info = await sharp(tempPath)
        .rotate() // Automatically orient based on EXIF
        .resize({
          width: 1600,
          height: 1200,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4 })
        .toFile(targetPath);

      newlyCreatedFiles.push(targetPath);

      // 5. Clean up temporary uploaded file
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (cleanupErr) {
        console.warn("Failed to delete temp file:", tempPath, cleanupErr.message);
      }

      // 6. Build persistent access URL
      const baseUrl =
        process.env.BACKEND_URL ||
        `${req.protocol}://${req.get("host")}`;

      const url = `${baseUrl}/uploads/workspaces/${filename}`;

      processedImages.push({
        url,
        filename,
        originalName: path.basename(file.originalname).substring(0, 100),
        size: info.size,
        format: "webp",
        alt: "Workspace photo",
      });
    }

    return processedImages;
  } catch (error) {
    // If any image fails, clean up all newly created files in this batch to prevent orphans
    for (const createdPath of newlyCreatedFiles) {
      try {
        if (fs.existsSync(createdPath)) {
          fs.unlinkSync(createdPath);
        }
      } catch (e) {
        console.error("Cleanup error for created file:", createdPath, e.message);
      }
    }

    // Also clean up any remaining temp files from this request
    for (const file of files) {
      try {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (e) {
        // ignore
      }
    }

    throw error;
  }
};

/**
 * Delete image files from the local uploads directory
 * Strictly validates path to prevent path traversal attacks
 */
export const deleteWorkspaceImageFiles = (imageEntries = []) => {
  ensureUploadDirs();

  for (const entry of imageEntries) {
    try {
      let filename = "";

      if (typeof entry === "string") {
        // Could be a URL or filename
        filename = path.basename(entry);
      } else if (entry && typeof entry === "object") {
        filename = entry.filename || (entry.url ? path.basename(entry.url) : "");
      }

      if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        continue;
      }

      // Resolve absolute file path and verify it stays inside WORKSPACE_UPLOADS_DIR
      const targetPath = path.resolve(WORKSPACE_UPLOADS_DIR, filename);

      if (!targetPath.startsWith(WORKSPACE_UPLOADS_DIR)) {
        console.warn("Path traversal blocked for file:", filename);
        continue;
      }

      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        console.log(`Deleted workspace image file: ${filename}`);
      }
    } catch (err) {
      console.warn("Error deleting workspace image file:", err.message);
    }
  }
};

