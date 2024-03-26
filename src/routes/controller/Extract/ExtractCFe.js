const { parseString, Builder } = require('xml2js');
const mime = require('mime-types');

function recursiveExtractAll(obj, targetTag, results = []) {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key === targetTag) {
        if (obj[key] instanceof Array) {
          results.push(...obj[key]);
        } else {
          results.push(obj[key]);
        }
      } else if (obj[key] instanceof Object) {
        recursiveExtractAll(obj[key], targetTag, results);
      }
    }
  }
}

function wrapWithOuterTag(innerTags, outerTag) {
  return { ["extractCFe"]: innerTags.map(innerTag => ({ [outerTag]: innerTag })) };
}

function extractAllCFe(xmlObject, targetTag = 'CFe') {
  const extractedCFes = [];
  recursiveExtractAll(xmlObject, targetTag, extractedCFes);

  if (extractedCFes.length > 0) {
    return wrapWithOuterTag(extractedCFes, targetTag);
  }

  throw new Error(`Failed to extract any ${targetTag} tag from XML.`);
}


async function uploadXML(req, res) {
  try {
    // Check if the file was uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Check the file type
    const mimeType = mime.lookup(req.file.originalname);
    if (mimeType !== 'application/xml') {
      return res.status(400).send('Invalid file type. Only XML files are allowed.');
    }

    // Check the file size (limit: 5 MB)
    const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes
    if (req.file.size > maxFileSize) {
      return res.status(500).send('File size exceeds the maximum limit of 5 MB.');
    }

    const xmlData = req.file.buffer.toString();

    
    parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error parsing XML file.');
      }

      try {
        const extractedCFes = extractAllCFe(result);

        // Convert the object back to XML
        const xmlResult = new Builder().buildObject(extractedCFes);

        res.set('Content-Type', 'application/xml');
        res.status(200).send(xmlResult);
      } catch (error) {
        console.error(error.message);
        return res.status(500).send(`Error extracting ${error.message}`);
      }
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Error during file upload.');
  }
}

module.exports = {
  uploadXML,
};
