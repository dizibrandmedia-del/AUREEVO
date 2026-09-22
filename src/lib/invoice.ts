import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoicePdf(order: any): jsPDF {
  const doc = new jsPDF();

  // Primary Dark Header Banner
  doc.setFillColor(16, 24, 40); // #101828
  doc.rect(0, 0, 210, 40, "F");

  // Logo & Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AUREVO.digital", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Smart Shopping. Better Living.", 14, 27);
  doc.text("GSTIN: 09AABCA9988Z1Z5 | contact@aurevo.digital | +91 98765 43210", 14, 34);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 150, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${order.invoiceNumber || "INV-2026-0001"}`, 150, 27);
  doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}`, 150, 34);

  // Reset text color
  doc.setTextColor(17, 24, 39);

  // Customer & Order Information
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Billed & Delivered To:", 14, 52);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Customer: ${order.customerName}`, 14, 59);
  doc.text(`Phone: ${order.customerPhone}`, 14, 65);
  doc.text(`Address: ${order.shippingAddressText}`, 14, 71, { maxWidth: 90 });

  doc.setFont("helvetica", "bold");
  doc.text("Order Details:", 120, 52);
  doc.setFont("helvetica", "normal");
  doc.text(`Order ID: ${order.orderNumber}`, 120, 59);
  doc.text(`Payment Method: ${order.paymentMethod}`, 120, 65);
  doc.text(`Payment Status: ${order.paymentStatus}`, 120, 71);

  // Items Table
  const tableRows = (order.items || []).map((item: any, index: number) => {
    const itemTotal = item.unitSellingPrice * item.quantity;
    const gstRate = item.unitGstPercent || 18;
    return [
      (index + 1).toString(),
      item.productName,
      item.productSku || "-",
      item.quantity.toString(),
      `INR ${item.unitMrp.toLocaleString()}`,
      `INR ${item.unitSellingPrice.toLocaleString()}`,
      `${gstRate}%`,
      `INR ${itemTotal.toLocaleString()}`,
    ];
  });

  autoTable(doc, {
    startY: 85,
    head: [["#", "Product Description", "SKU", "Qty", "MRP", "Rate", "GST", "Total"]],
    body: tableRows,
    headStyles: {
      fillColor: [37, 99, 235], // #2563EB Primary Blue
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // #F8FAFC
    },
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Calculation Summary Box
  const summaryX = 120;
  doc.setFontSize(10);
  doc.text(`Subtotal:`, summaryX, finalY);
  doc.text(`INR ${order.subtotal.toLocaleString()}`, 190, finalY, { align: "right" });

  if (order.couponDiscount && order.couponDiscount > 0) {
    doc.text(`Coupon Discount (${order.couponCode || "PROMO"}):`, summaryX, finalY + 6);
    doc.text(`- INR ${order.couponDiscount.toLocaleString()}`, 190, finalY + 6, { align: "right" });
  }

  doc.text(`Delivery Charges:`, summaryX, finalY + 12);
  doc.text(order.deliveryCharge > 0 ? `INR ${order.deliveryCharge.toLocaleString()}` : "FREE", 190, finalY + 12, { align: "right" });

  if (order.installationCharge && order.installationCharge > 0) {
    doc.text(`Installation Service:`, summaryX, finalY + 18);
    doc.text(`INR ${order.installationCharge.toLocaleString()}`, 190, finalY + 18, { align: "right" });
  }

  doc.text(`Includes 18% GST:`, summaryX, finalY + 24);
  doc.text(`INR ${order.gstAmount.toLocaleString()}`, 190, finalY + 24, { align: "right" });

  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY + 28, 190, finalY + 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Grand Total:`, summaryX, finalY + 36);
  doc.text(`INR ${order.grandTotal.toLocaleString()}`, 190, finalY + 36, { align: "right" });

  // Footer notes & Brand Warranty
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Terms & Conditions:\n1. All items are backed by 100% genuine manufacturer warranty.\n2. Please retain this invoice copy for claiming brand warranty & service.\n3. Return requests must be raised within 7 days of delivery.\n\nThank you for choosing AUREVO.digital — Smart Shopping. Better Living.",
    14,
    finalY + 45
  );

  return doc;
}

export function generateQuotationPdf(quotation: any): jsPDF {
  const doc = new jsPDF();

  doc.setFillColor(16, 24, 40);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AUREVO.digital", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Official Sales Quotation | Corporate & Wedding Packages", 14, 27);
  doc.text("Helpline: +91 98765 43210 | corporate@aurevo.digital", 14, 34);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", 150, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Quote Ref: ${quotation.quoteNumber}`, 150, 27);
  doc.text(`Valid Till: ${new Date(quotation.validityDate).toLocaleDateString("en-IN")}`, 150, 34);

  doc.setTextColor(17, 24, 39);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Prepared For:", 14, 52);
  doc.setFont("helvetica", "normal");
  doc.text(`Client: ${quotation.customerName}`, 14, 59);
  doc.text(`Mobile: ${quotation.customerPhone}`, 14, 65);
  if (quotation.customerEmail) doc.text(`Email: ${quotation.customerEmail}`, 14, 71);

  const tableRows = (quotation.items || []).map((item: any, index: number) => {
    return [
      (index + 1).toString(),
      item.productName,
      item.quantity.toString(),
      `INR ${item.unitPrice.toLocaleString()}`,
      item.discount > 0 ? `INR ${item.discount.toLocaleString()}` : "-",
      `INR ${item.total.toLocaleString()}`,
    ];
  });

  autoTable(doc, {
    startY: 80,
    head: [["#", "Item Description", "Qty", "Unit Price", "Discount", "Net Total"]],
    body: tableRows,
    headStyles: {
      fillColor: [124, 58, 237], // #7C3AED Electric Violet
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Package Quote:`, 120, finalY);
  doc.text(`INR ${quotation.totalAmount.toLocaleString()}`, 190, finalY, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Notes & Terms:\n${quotation.terms || "Standard brand warranty and free doorstep delivery included. Quotation valid till specified date."}`,
    14,
    finalY + 20
  );

  return doc;
}
