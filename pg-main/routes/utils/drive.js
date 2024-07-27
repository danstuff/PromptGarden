import { google } from 'googleapis';
import DOMPurify from 'isomorphic-dompurify';

import { appLog, appTry } from './log.js';

async function getDrive(user) {
  const oAuthClient = new google.auth.OAuth2();
  var drive = null;

  await appTry(async function (){
    oAuthClient.setCredentials({ access_token: user?.accessToken, refresh_token: user?.refresh_token });
    drive = google.drive({ version: 'v3', auth: oAuthClient });
  });
  return drive;
}

async function getDocs(user) {
  const oAuthClient = new google.auth.OAuth2();
  var docs = null;

  await appTry(async function (){
    oAuthClient.setCredentials({ access_token: user?.accessToken });
    docs = google.docs({ version: 'v1', auth: oAuthClient });
  });
  return docs;
}

async function listDocuments(user) {
  const drive = await getDrive(user);
  var res = null;
  await appTry(async function() {
      res = await drive.files.list({
        q: 'mimeType=\'application/vnd.google-apps.document\'',
        fields: 'files(id, name)',
      });
  });
  
  appLog(`Got ${res?.data?.files?.length} documents`);
  return res?.data?.files;
}

async function getDocument(user, documentid) {
  const drive = await getDrive(user);
  var res = null;
  await appTry(async function() {
    res = await drive.files.export({
      fileId: documentid,
      mimeType: 'text/html',
    });
  });

  appLog(`Got document ${documentid} - ${res?.data?.length} chars`);
  return res?.data;
}

async function putDocument(user, documentid, start, end, text) {
  const docs = await getDocs(user);
  var res = null;
  await appTry(async function() {
    const body = {
      'requests': [
        {
          'deleteContentRange': {
            'range': {
              'startIndex': start,
              'endIndex': end,
            },
          },
        },
        {
          'insertText': {
            'location': {
              'index': start,
            },
            'text': text,
          }
        },
      ]
    }
    res = await docs.documents.batchUpdate({
      documentId: documentid,
      resource: body,
    });
  }); 
  
  appLog(`Put document`);
  return 200;
}

export { listDocuments, getDocument, putDocument };