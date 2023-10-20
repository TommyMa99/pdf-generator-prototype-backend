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
const mammoth = require('mammoth');
const upload = multer({
    dest: "./tmp/"
})

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const configObj = {
  region: "ap-southeast-1",
  signatureVersion: 'v4'
}
// https://s3.ap-southeast-1.amazonaws.com/stage.storage.meyzer.corpsec/template/Shareholders-Declaration-Form-01HCQW2W64HN39P2XXDR8EKFJE.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAVLGMNK7MA4BMNO6P%2F20231016%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20231016T103925Z&X-Amz-Expires=86400&X-Amz-Signature=7d60e5e8d0144f0795fa3535d8da0d579cb9c36db1de536b6e899702e7558de5&X-Amz-SignedHeaders=host&x-id=GetObject
const s3Client = new S3Client(configObj);

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    //stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

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
          console.log('XXXXXXXXXXXXXXXXXX ', err);
          reject(err);
        } else {
          const arrayBuffer = Uint8Array.from(data).buffer;
          resolve(arrayBuffer);
        }
      });
    });
}
router.post('/generatePDF', async (req, res) => {
  console.log('generate pdf ', req.body.html);
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
        console.log(result)
        fs.unlinkSync(uploadedFile.path);
    }
    res.status(200).send(result.toString())
})

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return ab;
}

router.post('/convertHTML2',upload.single("file"), async (req, res) => {
  // const uploadedFile = req.file;
  console.log('body: ', req.body);
  const url = req.body.buffer.data;
  console.log('url: ', url);
  let result = null

  // mammoth.convertToHtml({ buffer: url })
  //   .then(resp => {
  //     console.log('resp ', resp);
  //     return resp.value;
  //   })
  //   .then(r => res.status(200).send({
  //     data: r.toString(),
  //   }))

  const arrayBuffer = toArrayBuffer(url);
  // if (uploadedFile) {
      // const arrayBuffer = await convertFileToArrayBuffer(url);
      result = await convertDocToHtml(arrayBuffer)
      console.log(result)
      // fs.unlinkSync(uploadedFile.path);
  // }
  res.status(200).send({
    data: result.toString(),
  })
});

router.get('/', async (req, res) => {
  res.send('OK');
});

module.exports = router