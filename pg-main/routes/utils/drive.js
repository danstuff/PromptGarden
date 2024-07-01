import { google } from 'googleapis';
import DOMPurify from 'isomorphic-dompurify';

import { appLog, appTry } from './log.js';

function getDrive(user) {
  const oAuthClient = new google.auth.OAuth2();
  var drive = null;

  appTry(function (){
    oAuthClient.setCredentials({ access_token: user?.accessToken });
    drive = google.drive({ version: 'v3', auth: oAuthClient });
  });
  return drive;
}

function getDocs(user) {
  const oAuthClient = new google.auth.OAuth2();
  var docs = null;

  appTry(function (){
    oAuthClient.setCredentials({ access_token: user?.accessToken });
    docs = google.docs({ version: 'v1', auth: oAuthClient });
  });
  return drive;
}

async function listDocuments(user) {
  const drive = getDrive(user);
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
  const drive = getDrive(user);
  var res = null;
  await appTry(async function() {
    res = await drive.files.export({
      fileId: documentid,
      mimeType: 'text/html',
    });
  });

  appLog(`Got document ${documentid} - ${res?.data?.length} chars`);
  return DOMPurify.sanitize(res?.data);
}

async function putDocument(user, documentid, start, end, text) {
  const docs = getDocs(user);
  var res = null;
  appTry(async function() {
    const body = {
      requests: [
        {
          deleteContentRange: {
            range: {
              startIndex: start,
              endIndex: end,
            },
          },
        },
        {
          insertText: {
            location: {
              index: start,
            },
            text: DOMPurify.sanitize(text),
          }
        },
      ]
    }
    res = await docs.documents.batchUpdate({
      documentId: documentid,
      body: body,
    });
  }); 
  
  appLog(`Put document: ${res}`);
}

export { listDocuments, getDocument, putDocument };