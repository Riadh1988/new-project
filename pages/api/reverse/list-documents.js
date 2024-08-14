import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export default function handler(req, res) {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(files);
  });
}
