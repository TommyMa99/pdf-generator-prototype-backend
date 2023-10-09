const express = require('express')
const router = new express.Router()
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const reqChecker = require('../middleware/reqChecker.js')
let pdf = require("html-pdf");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const multer = require('multer');
const docx2html = require('docx2html');
const { jsPDF } = require("jspdf");
const upload = multer({
    dest: "./tmp/"
})

function asImageURL(arrayBuffer) {
    const url = URL.createObjectURL(arrayBuffer, { type: 'image/png' });
    return url;
}
  
async function convertDocToHtml(file) {
    let res = null;
    try {
      res = await docx2html(file, {
        container: null,
        asImageURL: asImageURL
      });
    } catch (error_1) {
      console.error('Error converting file:', error_1);
      throw error_1;
    }
    return res;
}

function convertFileToArrayBuffer(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const arrayBuffer = Uint8Array.from(data).buffer;
          resolve(arrayBuffer);
        }
      });
    });
}
router.post('/generatePDF', async (req, res) => {
    const html = req.body.html
    const options = {
        format: 'A3',
        header: {
            height: '20mm'
        },
        footer: {
            height: '20mm',
        },
    };
    pdf.create(html, options).toFile('report.pdf', function (err, data) {
        if (err) {
            console.error(err);
        } else {
            console.log('PDF created successfully');
        }
        const pdfPath = path.join(__dirname, '../../report.pdf');
        console.log(pdfPath);
        res.download(pdfPath, 'report.pdf', (err) => {
            if (err) {
                console.error('Error downloading PDF:', err);
            } else {
                console.log('PDF download successful');
            }
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting PDF:', unlinkErr);
                } else {
                  console.log('PDF deleted successfully');
                }
            });
        });
    });
})

router.post('/convertHTML',upload.single("file"), async (req, res) => {
    const uploadedFile = req.file
    let result = null
    if (uploadedFile) {
        const arrayBuffer = await convertFileToArrayBuffer(uploadedFile.path);
        result = await convertDocToHtml(arrayBuffer)
        // console.log(result)
        fs.unlinkSync(uploadedFile.path);
    }
    res.status(200).send(result.toString())
})

module.exports = router