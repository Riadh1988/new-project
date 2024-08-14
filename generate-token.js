const { google } = require('googleapis');

// Create an OAuth2 client with the given credentials
const oauth2Client = new google.auth.OAuth2(
  '141210979717-ecall414a0ohld0d7fpqbo0tdqmrf0oq.apps.googleusercontent.com', // Client ID
  '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', // Client Secret
  'http://localhost:3000/api/auth/callback/google' // Redirect URI
);

// Generate an authorization URL
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'], // Scopes
});

console.log('Authorize this app by visiting this URL:', url);
