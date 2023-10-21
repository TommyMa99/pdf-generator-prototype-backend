const cors = require('cors');
const express = require('express');
const multer = require('multer');
const pdfGeneratorRouter = require('./routers/generatePDF');
const bodyParser = require('body-parser');
const app = express();
const port = 8001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(pdfGeneratorRouter);
app.listen(port, () => {
    console.log('HTTP: Server is up on port ' + port);
});
