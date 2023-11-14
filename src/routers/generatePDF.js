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
const puppeteer = require("puppeteer");
const axios = require('axios');
let filePath = path.join(__dirname, '..', '..', 'public', 'report.pdf');
var Api2Pdf = require('api2pdf');   
var a2pClient = new Api2Pdf('b5c0ebf2-ece5-44cc-a50c-7ecd6b1573fd');

const options = {
  path: filePath,
  format: "A4",
  printBackground: true,
  margin: { top: "1.52cm", right: "2.54cm", bottom: "0.5cm", left: "2.54cm" },
};

const upload = multer({
    dest: "./tmp/"
})

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

router.post('/generate/pdf', async (req, res) => {
  const html = req.body.html;
  console.log(html)
  const regex = /background-color:[^;]+;/g;
  const regexTextColor = /color:[^;]+;/g;
  let modifiedHTML = html.replace(regex, '');
  modifiedHTML = modifiedHTML.replace(regexTextColor, '');
  // Create a browser instance
  const browser = await puppeteer.launch();
  
  // Create a new page
  const page = await browser.newPage();

  await page.setContent(modifiedHTML);
  let pdf = await page.pdf(options);

  await browser.close();

  res.download(filePath, (err) => {
    if (err) {
        console.error('Error downloading PDF:', err);
    } else {
        console.log('PDF download successful');
    }
    fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting PDF:', unlinkErr);
        } else {
          console.log('PDF deleted successfully');
        }
    });
  });
});

router.post('/generate/pdf/api2pdf', async (req, res) => {
  const html = req.body.html;
  a2pClient.wkHtmlToPdf(html).then(async function(result) {
    try {
      const externalUrl = result.FileUrl;
      const response = await axios.get(externalUrl, { responseType: 'stream' });
      const filename = 'document.pdf';
      let filePath = path.join(__dirname, '..', '..', 'public', 'report.pdf');
      const writeStream = fs.createWriteStream(filePath);
      response.data.pipe(writeStream);
      writeStream.on('finish', () => {
        res.download(filePath, filename, (err) => {
          fs.unlinkSync(filePath);
          if (err) {
            console.error('Download error:', err);
          }
        });
      });
    } catch (error) {
      console.error('Download failed:', error.message);
      res.status(500).send('Download failed');
    }
  });
});

router.post('/generate/pdf/api2pdf/v2', async (req, res) => {
  var options = { 
    marginBottom: 0.75,
    marginLeft: 0.75,
    marginRight: 0.75,
    marginTop: 0.75
  };
  const html = req.body.html;
  console.log(html)
  const regex = /background:[^;]+;/g;
  const regexTextColor = /color:[^;]+;/g;
  let modifiedHTML = html.replace(regex, '');
  modifiedHTML = modifiedHTML.replace(regexTextColor, '');
  a2pClient.chromeHtmlToPdf(modifiedHTML, { options: options }).then(async function(result) {
    try {
      const externalUrl = result.FileUrl;
      const response = await axios.get(externalUrl, { responseType: 'stream' });
      const filename = 'document.pdf';
      let filePath = path.join(__dirname, '..', '..', 'public', 'report.pdf');
      const writeStream = fs.createWriteStream(filePath);
      response.data.pipe(writeStream);
      writeStream.on('finish', () => {
        res.download(filePath, filename, (err) => {
          fs.unlinkSync(filePath);
          if (err) {
            console.error('Download error:', err);
          }
        });
      });
    } catch (error) {
      console.error('Download failed:', error.message);
      res.status(500).send('Download failed');
    }
  }).catch(function(err) {
    console.log(err);
  });
  // a2pClient.chromeUrlToPdf(html).then(async function(result) {
  //   console.log(result);
  //   try {
  //     const externalUrl = result.FileUrl;
  //     const response = await axios.get(externalUrl, { responseType: 'stream' });
  //     const filename = 'document.pdf';
  //     let filePath = path.join(__dirname, '..', '..', 'public', 'report.pdf');
  //     const writeStream = fs.createWriteStream(filePath);
  //     response.data.pipe(writeStream);
  //     writeStream.on('finish', () => {
  //       res.download(filePath, filename, (err) => {
  //         fs.unlinkSync(filePath);
  //         if (err) {
  //           console.error('Download error:', err);
  //         }
  //       });
  //     });
  //   } catch (error) {
  //     console.error('Download failed:', error.message);
  //     res.status(500).send('Download failed');
  //   }
  // });
});

router.post('/generatePDF', async (req, res) => {
  // console.log('generate pdf ', req.body.html);
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

    let filePath = path.join(__dirname, '..', '..', 'public', 'report.pdf');
    pdf.create(html, options).toFile(filePath, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            console.log('PDF created successfully');
        }

        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading PDF:', err);
            } else {
                console.log('PDF download successful');
            }
            fs.unlink(filePath, (unlinkErr) => {
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

router.post('/pdf/convert2Html',upload.single("file"), async (req, res) => {
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