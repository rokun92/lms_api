const PDFDocument = require('pdfkit');

const generateCertificate = (studentName, courseName, instructorName) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Design the certificate
            // Border
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
            doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();

            // Header
            doc.font('Helvetica-Bold').fontSize(40).text('CERTIFICATE OF COMPLETION', 60, 100, {
                align: 'center',
                width: doc.page.width - 120
            });

            doc.moveDown();
            doc.font('Helvetica').fontSize(20).text('This is to certify that', {
                align: 'center'
            });

            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(30).text(studentName, {
                align: 'center',
                underline: true
            });

            doc.moveDown();
            doc.font('Helvetica').fontSize(20).text('has successfully completed the course', {
                align: 'center'
            });

            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(25).text(courseName, {
                align: 'center'
            });

            doc.moveDown();
            doc.font('Helvetica').fontSize(15).text(`Instructor: ${instructorName}`, {
                align: 'center'
            });

            doc.moveDown(2);
            doc.fontSize(15).text(`Date: ${new Date().toLocaleDateString()}`, {
                align: 'center'
            });

            // Footer
            doc.moveDown(4);
            doc.fontSize(10).text('LMS Platform - Excellence in Education', {
                align: 'center'
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };
