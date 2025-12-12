import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const SUBFOLDER = 'chat-images';

const uploadDir = path.join(__dirname, '../../../php/public/uploads', SUBFOLDER);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl = `/api/node/uploads/${SUBFOLDER}/${req.file.filename}`;

  res.json({ 
    success: true, 
    data: { url: fileUrl } 
  });
};

export const serveFile = (req: Request, res: Response) => {
  const { subfolder, filename } = req.params;

  if (!subfolder || !filename) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  const ALLOWED_FOLDERS = ['chat-images'];
  if (!ALLOWED_FOLDERS.includes(subfolder)) {
    return res.status(403).json({ success: false, message: 'Access Denied' });
  }

  const safeFilename = path.basename(filename);

  const filePath = path.join(__dirname, '../../../php/public/uploads', subfolder, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  res.sendFile(filePath);
};