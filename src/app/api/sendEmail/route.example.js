import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ValidationError } from '@/lib/errors';
import { asyncHandler, logger } from '@/lib/errorHandler';

async function sendEmailHandler(req) {
    const data = await req.json();
    const {
        userEmail,
        userName,
        orderId,
        newStatus,
        paymentType,
        paddleDetails,
        ballDetails,
        totalPriceINR,
        convertedPriceWithSymbol,
        timestamp = new Date().toISOString(),
        cartItems = [],
        category,
        // Additional order details
        facilityName,
        facilityLocation,
        facilityType,
        numberOfCourts,
        baseType,
        surfaceType,
        manufacturer,
        contactNumber,
        mailingAddress,
        country,
        state,
        certificationType,
        dateOfCertification,
    } = data;

    logger.debug('Received email request', { orderId, userEmail, newStatus });

    // Validation
    if (!userEmail || !orderId || !newStatus) {
        throw new ValidationError('Missing required fields', [
            { field: 'userEmail', message: 'User email is required' },
            { field: 'orderId', message: 'Order ID is required' },
            { field: 'newStatus', message: 'Status is required' },
        ]);
    }

    const formattedTime = new Date(timestamp).toLocaleString();

    // Determine order type based on status or available data
    const isCourtOrder =
        category === 'Court' ||
        newStatus.toLowerCase().includes('inspection') ||
        facilityName ||
        facilityLocation ||
        newStatus.includes('awaiting inspection');

    // Email template generator (keeping your existing template logic)
    const generateEmailTemplate = (status, orderData) => {
        // ... (keeping all your existing email template code)
        // This is just showing the structure - your full template code stays the same
        const baseStyles = `...`; // Your existing template
        const footerStyles = `...`; // Your existing template

        // Your existing switch statement for different statuses
        switch (status) {
            case 'Payment received, awaiting inspection':
                return {
                    subject: `✅ Payment Confirmed - Court Inspection Process Initiated - Order #${orderId}`,
                    html: `${baseStyles}...${footerStyles}`,
                };
            // ... all your other cases
            default:
                return {
                    subject: `📋 Order Status Update - Order #${orderId}`,
                    html: `${baseStyles}...${footerStyles}`,
                };
        }
    };

    // Generate the email content
    const emailContent = generateEmailTemplate(newStatus, {
        cartItems,
        paddleDetails,
        ballDetails,
        totalPriceINR,
        convertedPriceWithSymbol,
        formattedTime,
        facilityName,
        facilityLocation,
        facilityType,
        numberOfCourts,
        baseType,
        surfaceType,
        manufacturer,
        certificationType,
        dateOfCertification,
    });

    // Configure email transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // User email configuration
    const userMailOptions = {
        from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`,
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
    };

    // Admin notification email
    const adminMailOptions = {
        from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`,
        to: 'admin@brainwavesportstech.com',
        subject: `📥 Status Updated: ${newStatus} - Order #${orderId}`,
        html: `...`, // Your existing admin email template
    };

    // Send both emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    logger.info('Emails sent successfully', { orderId, userEmail, status: newStatus });

    return NextResponse.json({
        success: true,
        message: 'Dynamic status emails sent successfully',
        status: newStatus,
        orderType: isCourtOrder ? 'Court Certification' : 'Product Testing',
    });
}

// Export with error handling wrapper
export const POST = asyncHandler(sendEmailHandler);
