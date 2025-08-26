import PDFDocument from 'pdfkit';

export async function generateInvoicePdf({ order, invoiceNumber, company = {} }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const currency = (n) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(Number(n || 0));

      // Header
      const companyName = company.name || 'BLOOMTECH HUB LIMITED';
      const companyAddress = company.address || 'Nairobi, Kenya';
      const companyEmail = company.email || 'support@bloomtechhub.com';
      const companyPhone = company.phone || '+254-700-000-000';

      doc
        .fontSize(20)
        .text(companyName, { align: 'left' })
        .moveDown(0.2)
        .fontSize(10)
        .text(companyAddress)
        .text(companyEmail)
        .text(companyPhone)
        .moveDown(1.2)
        .fontSize(16)
        .text('Tax Invoice', { align: 'right' })
        .moveDown(0.2)
        .fontSize(10)
        .text(`Invoice Number: ${invoiceNumber}`, { align: 'right' })
        .text(`Order Number: ${order.trackingNumber}`, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString('en-KE')}`, { align: 'right' })
        .moveDown(1);

      // Bill To
      doc
        .fontSize(12)
        .text('Bill To:')
        .fontSize(11)
        .text(`${order.User?.name || ''}`)
        .text(`${order.User?.email || ''}`)
        .moveDown(1);

      // Table header
      doc
        .font('Helvetica-Bold')
        .text('Item', 50, doc.y, { continued: true })
        .text('Qty', 300, doc.y, { continued: true })
        .text('Unit Price (KES)', 350, doc.y, { continued: true })
        .text('Total (KES)', 470)
        .moveDown(0.3)
        .font('Helvetica')
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);

      // Items + subtotal
      let itemsSubtotal = 0;
      (order.OrderItems || []).forEach((item) => {
        const name = item.Product?.name || `Product #${item.productId}`;
        const qty = item.quantity || 1;
        const unit = Number(item.Product?.price || 0);
        const lineTotal = unit * qty;
        itemsSubtotal += lineTotal;
        doc
          .text(name, 50, doc.y, { continued: true })
          .text(String(qty), 300, doc.y, { continued: true })
          .text(currency(unit), 350, doc.y, { continued: true })
          .text(currency(lineTotal), 470)
          .moveDown(0.3);
      });

      doc.moveDown(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // VAT breakdown (assume total includes VAT or apply on subtotal?)
      // Here we compute VAT at 16% of subtotal, and grandTotal = subtotal + VAT
      const VAT_RATE = 0.16;
      const vatAmount = Math.round(itemsSubtotal * VAT_RATE);
      const grandTotal = Math.round(itemsSubtotal + vatAmount);

      // Totals section
      const totalsY = doc.y + 10;
      doc
        .font('Helvetica-Bold')
        .text('Subtotal:', 350, totalsY, { continued: true })
        .text(currency(itemsSubtotal), 470)
        .moveDown(0.3)
        .text('VAT (16%):', 350, doc.y, { continued: true })
        .text(currency(vatAmount), 470)
        .moveDown(0.3)
        .text('Total:', 350, doc.y, { continued: true })
        .text(currency(grandTotal), 470)
        .font('Helvetica')
        .moveDown(1);

      // Notes
      doc
        .fontSize(10)
        .text('Thank you for your business.', { align: 'left' })
        .moveDown(0.2)
        .text('This invoice confirms payment received and order processing has begun.', { align: 'left' })
        .moveDown(1)
        .fontSize(9)
        .text('Bank Details:', { underline: true })
        .text('Account Name: BLOOMTECH HUB LIMITED')
        .text('Account Number: 1234567890')
        .text('Bank Name: EQUITY BANK KENYA')
        .text('Branch: NAIROBI WEST')
        .text('Swift Code: EQBLKEXX')
        .text('Bank Code: 068');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
