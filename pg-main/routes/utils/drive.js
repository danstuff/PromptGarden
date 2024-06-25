import { google } from 'googleapis';

function getDrive(req) {
  const oAuthClient = new google.auth.OAuth2();
  oAuthClient.setCredentials({ access_token: req.user.accessToken });
  
  return google.drive({ version: 'v3', auth: oAuthClient });
}

async function listDocuments(req) {
  if (!req.isAuthenticated()) {
    return null;
  }

  const drive = getDrive(req);
  const res = await drive.files.list({
    fields: 'files(id, name)',
  });
  console.log(res.data.files);
  return res.data.files;
}

async function getDocument(req) {
  if (!req.isAuthenticated()) {
    return null;
  }

  const drive = getDrive(req);
  const res = await drive.files.export({
    fileId: req.body.fileId,
    mimeType: 'text/html',
  });
  console.log(res.data);
  return res.data;
}

async function updateDocument(req) {
  if (!req.isAuthenticated()) {
    return;
  }

  const drive = getDrive(req);
  const res = await drive.files.update({
    fileId: req.body.fileId,
    media: {
      body: req.body.fileHTML,
      mimeType: 'text/html',
    }
  }); 
  console.log(res);
}

export { listDocuments, getDocument, updateDocument };