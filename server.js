const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Set correct MIME type for TypeScript/React files so the browser accepts them as modules
express.static.mime.define({'application/javascript': ['tsx', 'ts']});

app.use(express.static(path.join(__dirname, '.')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Ebenezer System running at http://localhost:${port}`);
});