import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect, requireCustomer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/', protect, requireCustomer, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Fallback for demo keys or unconfigured Cloudinary
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'demo_api_key') {
      const mime = req.file.mimetype || 'image/jpeg';
      const base64Image = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
      return res.json({
        success: true,
        data: {
          url: base64Image,
          publicId: `upload_${Date.now()}`,
        }
      });
    }

    // Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ezfinanz_kyc' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error, falling back to data URI:', error);
          const mime = req.file.mimetype || 'image/jpeg';
          const base64Image = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
          return res.json({
            success: true,
            data: {
              url: base64Image,
              publicId: `upload_${Date.now()}`,
            },
          });
        }
        res.json({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
          },
        });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
});

export default router;
