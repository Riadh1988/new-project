import { IncomingForm } from 'formidable'; 
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default function handler(req, res) {
  const form = new IncomingForm(); // Ensure correct import
  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files:', err);
      return res.status(500).json({ error: 'Error parsing the files', details: err.message });
    }

    console.log('Fields:', fields);
    console.log('Files:', files);

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const extension = path.extname(file.originalFilename) || '.docx';
    const newFileName = `${fields.candidateName} ${fields.lastName}${extension}`;
    const newPath = path.join(uploadDir, newFileName);

    fs.rename(file.filepath, newPath, (err) => {
      if (err) {
        console.error('Error saving the file:', err);
        return res.status(500).json({ error: 'Error saving the file', details: err.message });
      }

      res.status(200).json({ message: 'File uploaded successfully', filePath: newFileName });
    });
  });
}
