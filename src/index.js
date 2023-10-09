// const fs = require('fs');
// const path = require('path');
// const ejs = require('ejs');
// let pdf = require("html-pdf");
// const express = require('express');
// const app = express();
// const port = 3000;
// // Hardcode 1 company info retrieved from meyzer_secretary excel file
// // Later replaced with stramlined reading from myyzer_secretary file stored from our infra(s3, db, etc.)
// let company = {
//     companyRegistrationNumber: '12345',
//     'S/N': "TDB",
//     entityName: "companyA",
//     acraUenNo: "201003184M",
//     '1stDirector&ControllerName':['directorA', 'directorB', 'directorC'],
//     registerAddressCompany: "123 abc road, apt 220, Raleigh, NC 26703, USA",
//     financialYearEnd: '12/31/22',
//     '1stDirector&ControllerEmail':['directorAEmail', 'directorBEmail', 'directorCEmail'],
//     dateOfIncorporation: '08/16/94',
//     companyStatus: 'Active/Solvent',
//     nomineeDirector: 'No',
//     '1stBusinessOwner&ControllerName':['ownerA', 'ownerB', 'ownerC'],
//     homeAddress1stDirector: ['123 abc street, SG10020', '', ''],
//     '1stdirectorDOB': ['30', '', '44'],
//     directorAcra: ['ACRAdirectorA', 'ACRAdirectorB', 'ACRAdirectorC'],
//     nricOrPassport1stDirector: ['S1208758F', 'aaaa', 'cccc'],
//     companySecretary: ['CHEN SEEK MAE'],
//     shareHolderACRA: ['shareholder1', 'shareholder2', 'shareholder3'],
//     proofOfAddress: '', //what is this? Does it need to be corresponded to each shareholder
//     paiedUpCapital: '10,000.00',
//     numberOfShares: '10,000', //same question as above
//     nationality1stDirector: ['Singapore', 'China', 'avcc'],
//     currentDate: new Date().toISOString().split('T')[0]
// }
// const templatePath = path.join(__dirname, '../../public/resource/doc_html/Letter_Of_Indemnity_And_Authority.html');
// console.log(templatePath)
// fs.readFile(templatePath, 'utf8', (err, templateContent) => {
//     if (err) {
//         console.error('Error reading template:', err);
//         return;
//     }

//     // Render the template with data
//     const renderedTemplate = ejs.render(templateContent, company);
//     const options = {
//         height: '297mm', // A4 height in mm
//         width: '210mm',  // A4 width in mm
//         header: {
//             height: '20mm'
//         },
//         footer: {
//             height: '20mm',
//         },
//     };
    
//     // Generate PDF from HTML using html-pdf
//     pdf.create(renderedTemplate, options).toFile('report.pdf', function (err, data) {
//         if (err) {
//             console.error(err);
//         } else {
//             console.log('PDF created successfully');
//         }
//     });
// });

// // Serve the PDF for download
// app.get('/download', (req, res) => {
//     const pdfPath = path.join(__dirname, 'report.pdf');
//     res.download(pdfPath, 'report.pdf', (err) => {
//         if (err) {
//             console.error('Error downloading PDF:', err);
//         } else {
//             console.log('PDF download successful');
//         }
//     });
// });

// // Start the Express server
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });


const cors = require('cors');
const express = require('express')
const multer = require('multer');
const pdfGeneratorRouter = require('./routers/generatePDF')
const bodyParser = require('body-parser');
const app = express()
const port = 8001

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: '50mb' }));
app.use(pdfGeneratorRouter)
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})