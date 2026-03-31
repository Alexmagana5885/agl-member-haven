import jsPDF from "jspdf";
import { Invoice } from "@/services/api";

interface InvoiceGeneratorProps {
  invoice: Invoice & { userEmail: string }; // Assume userEmail available
  userName?: string;
  userPhone?: string;
}

export const generateInvoicePDF = ({ invoice, userName = "Member", userPhone = "N/A" }: InvoiceGeneratorProps) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header = blue band
  doc.setFillColor(110, 193, 228);
  doc.rect(0, 0, pageWidth, 25, "F");

  // Info band below header
  doc.setFillColor(230, 234, 240);
  doc.rect(0, 25, pageWidth, 38, "F");

  // Logo
  try {
    const img = new Image();
    img.src = new URL("./AGLlogo.png", import.meta.url).href;
    doc.addImage(img, "PNG", 10, 4, 40, 18);
  } catch {
    doc.setTextColor(24, 49, 90);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("AGL", 14, 17);
  }

  // Organization contact details
  doc.setTextColor(85, 85, 85);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("info@agl.or.ke", 10, 33);
  doc.text("+254-722-605-048", 10, 39);

  // Invoice title and metadata right side
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 49, 90);
  doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });

  const invoiceNumber = `AGLP${invoice.id.toString().padStart(6, '0')}`;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE NO.", pageWidth - 14, 30, { align: "right" });
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceNumber, pageWidth - 14, 35, { align: "right" });

  const invoiceDate = new Date(invoice.date).toLocaleDateString('en-GB');
  doc.setFont("helvetica", "bold");
  doc.text("DATE", pageWidth - 14, 41, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(invoiceDate, pageWidth - 14, 46, { align: "right" });

  // bill to / pay to sections
  let y = 70;
  const leftX = 10;
  const centerX = pageWidth / 2 + 5;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 49, 90);
  doc.text("BILL TO", leftX, y);
  doc.line(leftX, y + 2, leftX + 90, y + 2);

  doc.text("PAY TO", pageWidth - 14, y, { align: "right" });
  doc.line(pageWidth - 100, y + 2, pageWidth - 10, y + 2);

  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(85, 85, 85);

  const billTo = [
    userName,
    invoice.userEmail,
    userPhone,
    invoice.description || "",
  ];
  billTo.forEach((text) => {
    if (text) {
      doc.text(text, leftX, y);
      y += 6;
    }
  });

  const payToX = pageWidth - 14;
  let yPay = 78;
  const payToLines = [
    "ASSOCIATION OF GOVERNMENT LIBRARIANS",
    "info@agl.or.ke",
    "+254-722-605-048",
  ];
  payToLines.forEach((text) => {
    doc.text(text, payToX, yPay, { align: "right" });
    yPay += 6;
  });

  // item table header
  y = 110;
  doc.setFillColor(110, 193, 228);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.rect(leftX, y - 6, pageWidth - 20, 10, "F");
  doc.text("Description", leftX + 2, y);
  doc.text("Amount Billed", pageWidth / 2 - 15, y);
  doc.text("Amount Paid", pageWidth - 16, y, { align: "right" });

  // item row
  doc.setTextColor(85, 85, 85);
  doc.setFont("helvetica", "normal");
  const amountBilled = parseFloat(invoice.amount.replace(/[^0-9.]/g, '')) || 0;
  const amountPaid = invoice.status === 'Paid' ? amountBilled : 0;

  y += 8;
  doc.rect(leftX, y - 4, pageWidth - 20, 10);
  doc.text(invoice.description || "N/A", leftX + 2, y + 2);
  doc.text(`Ksh ${amountBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth / 2 - 15, y + 2);
  doc.text(`Ksh ${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 16, y + 2, { align: "right" });

  // totals / remarks
  const totalBilled = amountBilled;
  const totalPaid = amountPaid;
  const balanceDue = totalBilled - totalPaid;

  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 49, 90);
  doc.text("Remarks / Payment Instructions", leftX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(85, 85, 85);
  doc.text("CHEQUE: ALL PAYMENTS SHOULD BE MADE TO ASSOCIATION OF GOVERNMENT LIBRARIANS, KCB BANK, KICC BRANCH, ACCOUNT: 1238906532", leftX, y);

  y += 8;
  doc.text("MPESA: TILL 8209382", leftX, y);

  y = 170;
  doc.text(`TOTAL BILLED: Ksh ${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: "right" });
  y += 6;
  doc.text(`DISCOUNT: Ksh 0.00`, pageWidth - 14, y, { align: "right" });
  y += 6;
  doc.text(`TOTAL PAYMENT: Ksh ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: "right" });
  y += 6;
  doc.setDrawColor(170, 170, 170);
  doc.line(pageWidth - 90, y, pageWidth - 14, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 49, 90);
  doc.text(`Balance Due: Ksh ${balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: "right" });

  // Bottom footer band
  const footerBandY = doc.internal.pageSize.getHeight() - 12;
  doc.setFillColor(110, 193, 228);
  doc.rect(0, footerBandY, pageWidth, 12, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("This is a system-generated invoice and does not require a physical signature.", pageWidth / 2, footerBandY + 7, { align: "center" });

  doc.save(`Invoice_${invoice.id}_AGL.pdf`);
};

