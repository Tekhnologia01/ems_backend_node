import multer from 'multer';

export const handleFileUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds the allowed limit of 1MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file type uploaded.' });
    }
  }

  if (err.message === 'Only jpg, jpeg, and png files are allowed.') {
    return res.status(400).json({ message: 'Invalid file type. Only JPG, JPEG, and PNG files are allowed.' });
  }

  next(err);
};
