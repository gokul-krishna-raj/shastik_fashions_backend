import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    const uploadPath = isLambda ? '/tmp/' : './uploads/';
    cb(null, uploadPath);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: (Error | null), filename: string) => void) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Check file type
function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array('images', 5); // 'images' is the field name, 5 is max count

export default upload;