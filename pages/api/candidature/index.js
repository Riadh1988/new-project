import { mongooseConnect } from '@/lib/mongoose';
import Candidature from '@/models/candidature'; 
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};


export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();

  switch (method) {
    case 'GET':
      try { 
        const candidatures = await Candidature.find().populate('clientToAssign', 'client');
        res.status(200).json(candidatures);
      } catch (error) {
        console.error('Error fetching candidatures:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch candidatures' });
      }
      break;
      case 'POST':
        const form = new IncomingForm({
          keepExtensions: true,
          maxFileSize: 10 * 1024 * 1024, // 10 MB
        });
  
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ success: false, error: 'Form parsing error' });
          }
        
          const {
            candidateName,
            phone,
            email,
            language,
            clientToAssign,
            interviewDateTime,
          } = fields;
        
          // Extract the first value from each array
          const candidateNameValue = candidateName[0];
          const phoneValue = phone[0];
          const emailValue = email[0];
          
          // Ensure the language value is an array, split by commas if necessary
          const languageValue = language[0].includes(',')
            ? language[0].split(',').map(lang => lang.trim())
            : [language[0]];
        
          const clientToAssignValue = clientToAssign ? clientToAssign[0] : null;
          const interviewDateTimeValue = interviewDateTime ? interviewDateTime[0] : null;
        
          let fileUrl = null;
        
          if (files.fileUrl && files.fileUrl[0]) {
            try {
              const file = files.fileUrl[0];
        
              const uploadResult = await cloudinary.uploader.upload(file.filepath, {
                folder: 'candidature_files', // You can change the folder name as needed
              });
        
              fileUrl = uploadResult.secure_url;
              console.log('Uploaded file URL:', fileUrl); // Log uploaded file URL
            } catch (uploadError) {
              console.error('Error uploading file to Cloudinary:', uploadError);
              return res.status(500).json({ success: false, error: 'File upload error' });
            }
          } else {
            console.error('No file provided or file path is missing');
            return res.status(400).json({ success: false, error: 'No file provided or file path is missing' });
          }
        
          try {
            const candidature = new Candidature({
              candidateName: candidateNameValue,
              phone: phoneValue,
              email: emailValue,
              language: languageValue, // Save the language array to the database
              clientToAssign: clientToAssignValue,
              interviewDateTime: interviewDateTimeValue,
              fileUrl, // Save the Cloudinary file URL to the database
            });
        
            await candidature.save();
        
            res.status(201).json({ success: true, data: candidature });
          } catch (saveError) {
            console.error('Error adding candidature:', saveError);
            res.status(400).json({ success: false, error: 'Failed to add candidature' });
          }
        });
        
        break;
      
      case 'PUT':
      try {
        const {
          id,
          clientDecision,
          declineReason,
          declineComment,
          rescheduleDateTime,
        } = req.body;

        const updateData = {
          clientDecision,
          declineReason,
          declineComment,
          rescheduleDateTime,
        };

        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        const updatedCandidature = await Candidature.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ success: true, data: updatedCandidature });
      } catch (error) {
        console.error('Error updating candidature:', error);
        res.status(400).json({ success: false, error: 'Failed to update candidature' });
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        await Candidature.findByIdAndDelete(id);
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting candidature:', error);
        res.status(400).json({ success: false, error: 'Failed to delete candidature' });
      }
      break;
    default:
      res.status(400).json({ success: false, message: 'Unsupported method' });
      break;
  }
}
