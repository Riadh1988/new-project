import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export default function handler(req, res) {
  if (req.method === 'DELETE') {
    const filename = req.query.filename;
    const filePath = path.join(uploadDir, filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleting the file' });
      }

      res.status(200).json({ message: 'File deleted successfully' });
    });
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
