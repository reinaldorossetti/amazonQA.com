const fs = require('fs');
const path = require('path');

function extractStats(htmlPath) {
  const content = fs.readFileSync(htmlPath, 'utf8');
  
  // Try <template id="playwrightReportBase64">
  let startIdx = content.indexOf('id="playwrightReportBase64"');
  if (startIdx === -1) {
    startIdx = content.indexOf("id='playwrightReportBase64'");
  }
  
  if (startIdx === -1) return null;
  
  // Find the closing > of the opening tag
  const tagEnd = content.indexOf('>', startIdx);
  if (tagEnd === -1) return null;
  
  const contentStart = tagEnd + 1;
  
  // Find the closing tag </template> or </script>
  let endTag = '</template>';
  let contentEnd = content.indexOf(endTag, contentStart);
  if (contentEnd === -1) {
    endTag = '</script>';
    contentEnd = content.indexOf(endTag, contentStart);
  }
  
  if (contentEnd === -1) return null;
  
  const b64 = content.slice(contentStart, contentEnd).trim();
  return b64;
}

const htmlFile = process.argv[2];
if (!htmlFile) {
  console.error('Usage: node find_b64.js <html-file>');
  process.exit(1);
}

const b64 = extractStats(htmlFile);
if (b64) {
  console.log('SUCCESS');
  console.log('LENGTH:', b64.length);
  fs.writeFileSync('temp_b64.txt', b64);
} else {
  console.log('NOT FOUND');
}
