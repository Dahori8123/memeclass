/**
 * Codigo.gs
 * Google Apps Script backend for MemeClass.
 * Uploads Base64 encoded files to Google Drive and returns a public URL.
 */

// REEMPLAZA ESTO CON EL ID DE LA CARPETA DONDE QUIERES GUARDAR LOS ARCHIVOS
const FOLDER_ID = '1tc3Q5GzlgBZIyjTvh7XZ1AYkn1013S4X'; 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const base64Data = data.base64;
    const filename = data.filename || 'meme_upload_' + new Date().getTime();
    const mimeType = data.mimeType || 'image/png';

    // Decode base64 string
    // The base64 from FileReader usually has a prefix like "data:image/png;base64,"
    // We need to remove it if present.
    let base64Clean = base64Data;
    if (base64Clean.indexOf('base64,') !== -1) {
      base64Clean = base64Clean.split('base64,')[1];
    }

    const decoded = Utilities.base64Decode(base64Clean);
    const blob = Utilities.newBlob(decoded, mimeType, filename);

    // Get the folder and create the file
    let folder;
    if (FOLDER_ID === 'TU_CARPETA_ID_AQUI') {
       // If no folder ID is provided, save in root
       folder = DriveApp.getRootFolder();
    } else {
       folder = DriveApp.getFolderById(FOLDER_ID);
    }
    
    const file = folder.createFile(blob);

    // Set permissions to "Anyone with the link can view"
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Get the direct view/download URL
    // The modern direct link format that avoids cookie/CORS blocks is using https://lh3.googleusercontent.com/d/
    const fileId = file.getId();
    const directUrl = "https://lh3.googleusercontent.com/d/" + fileId;

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: directUrl,
      fileId: fileId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Para habilitar CORS en llamadas preflight (OPTIONS)
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}
