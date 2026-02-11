const PDFDocument = require('pdfkit');
const User = require('../models/User');

// @desc    Generate and download certificate
// @route   GET /api/users/:id/certificate
// @access  Private
const getCertificate = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Check eligibility (e.g., > 100 points)
        if (user.points < 50) {
            res.status(400);
            throw new Error('You need at least 50 points to earn a certificate!');
        }

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${user.name}.pdf`);

        doc.pipe(res);

        // Draw Certificate Border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#2e7d32');
        doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke('#2e7d32');

        // Header
        doc.font('Helvetica-Bold').fontSize(40).fillColor('#2e7d32').text('Certificate of Appreciation', 0, 100, { align: 'center' });

        // Body
        doc.moveDown();
        doc.font('Helvetica').fontSize(20).fillColor('#000').text('This is to certify that', { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(30).fillColor('#2e7d32').text(user.name, { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica').fontSize(20).fillColor('#000').text(`has been recognized as a`, { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(25).fillColor('#d32f2f').text('RURAL VOICE COMMUNITY HERO', { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica').fontSize(15).fillColor('#555').text(`For their outstanding contribution of ${user.points} points towards community development.`, { align: 'center' });

        // Footer
        doc.moveDown(4);
        doc.fontSize(15).fillColor('#000').text('Date: ' + new Date().toLocaleDateString(), 100, 450);
        doc.text('Rural Voice Team', doc.page.width - 250, 450);

        doc.end();

    } catch (error) {
        next(error);
    }
};

module.exports = { getCertificate };
