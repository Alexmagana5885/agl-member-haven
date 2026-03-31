import jsPDF from "jspdf";
import { Invoice } from "@/services/api";

interface InvoiceGeneratorProps {
  invoice: Invoice & { userEmail: string };
  userName?: string;
  userPhone?: string;
}

export const generateInvoicePDF = ({
  invoice,
  userName = "Member",
  userPhone = "N/A",
}: InvoiceGeneratorProps) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(110, 193, 228);
  doc.rect(0, 0, pageWidth, 25, "F");

  // Info band
  doc.setFillColor(230, 234, 240);
  doc.rect(0, 25, pageWidth, 38, "F");

  // Logo
  try {
    const img = new Image();
    img.src = new URL("./AGLlogo.png", import.meta.url).href;
    doc.addImage(img, "PNG", 10, 4, 40, 18);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(24, 49, 90);
    doc.text("AGL", 14, 17);
  }

  // Org details
  doc.setFontSize(9);
  doc.setTextColor(85, 85, 85);
  doc.setFont("helvetica", "normal");
  doc.text("info@agl.or.ke", 10, 33);
  doc.text("+254-722-605-048", 10, 39);

  // Invoice title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 49, 90);
  doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });

  const invoiceNumber = `AGLP${invoice.id.toString().padStart(6, "0")}`;
  const invoiceDate = new Date(invoice.date).toLocaleDateString("en-GB");

  doc.setFontSize(10);
  doc.text("INVOICE NO.", pageWidth - 14, 30, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceNumber, pageWidth - 14, 35, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("DATE", pageWidth - 14, 41, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(invoiceDate, pageWidth - 14, 46, { align: "right" });

  // BILL TO / PAY TO
  let y = 70;
  const leftX = 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(24, 49, 90);

  doc.text("BILL TO", leftX, y);
  doc.line(leftX, y + 2, leftX + 90, y + 2);

  doc.text("PAY TO", pageWidth - 14, y, { align: "right" });
  doc.line(pageWidth - 100, y + 2, pageWidth - 10, y + 2);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(85, 85, 85);

  const billTo = [userName, invoice.userEmail, userPhone, invoice.description || ""];
  billTo.forEach((text) => {
    if (text) {
      doc.text(text, leftX, y);
      y += 6;
    }
  });

  let yPay = 78;
  ["ASSOCIATION OF GOVERNMENT LIBRARIANS", "info@agl.or.ke", "+254-722-605-048"].forEach((text) => {
    doc.text(text, pageWidth - 14, yPay, { align: "right" });
    yPay += 6;
  });

  // TABLE HEADER
  y = 110;
  doc.setFillColor(110, 193, 228);
  doc.rect(leftX, y - 6, pageWidth - 20, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Description", leftX + 2, y);
  doc.text("Amount Billed", pageWidth / 2 - 15, y);
  doc.text("Amount Paid", pageWidth - 16, y, { align: "right" });

  // TABLE ROW
  const amountBilled = parseFloat(invoice.amount.replace(/[^0-9.]/g, "")) || 0;
  const amountPaid = invoice.status === "Paid" ? amountBilled : 0;

  y += 8;
  doc.setTextColor(85, 85, 85);
  doc.setFont("helvetica", "normal");

  doc.rect(leftX, y - 4, pageWidth - 20, 10);
  doc.text(invoice.description || "N/A", leftX + 2, y + 2);
  doc.text(`Ksh ${amountBilled.toFixed(2)}`, pageWidth / 2 - 15, y + 2);
  doc.text(`Ksh ${amountPaid.toFixed(2)}`, pageWidth - 16, y + 2, { align: "right" });

  const totalBilled = amountBilled;
  const totalPaid = amountPaid;
  const balanceDue = totalBilled - totalPaid;

  // --- SAME ROW SECTION ---
  y += 22;

  // LEFT (Remarks)
  const remarksY = y;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 49, 90);
  doc.text("Remarks / Payment Instructions", leftX, remarksY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(85, 85, 85);

  let remarksTextY = remarksY + 6;

  doc.text(
    "CHEQUE: ALL PAYMENTS SHOULD BE MADE TO ASSOCIATION OF GOVERNMENT LIBRARIANS, KCB BANK, KICC BRANCH, ACCOUNT: 1238906532",
    leftX,
    remarksTextY,
    { maxWidth: pageWidth / 2 - 20 }
  );

  remarksTextY += 13;
  doc.text("MPESA: TILL 8209382", leftX, remarksTextY);

  // RIGHT (Totals)
  let totalsY = remarksY;

  doc.text(`TOTAL BILLED: Ksh ${totalBilled.toFixed(2)}`, pageWidth - 14, totalsY, { align: "right" });

  totalsY += 6;
  doc.text(`DISCOUNT: Ksh 0.00`, pageWidth - 14, totalsY, { align: "right" });

  totalsY += 6;
  doc.text(`TOTAL PAYMENT: Ksh ${totalPaid.toFixed(2)}`, pageWidth - 14, totalsY, { align: "right" });

  totalsY += 6;
  doc.setDrawColor(170, 170, 170);
  doc.line(pageWidth - 90, totalsY, pageWidth - 14, totalsY);

  totalsY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 49, 90);
  doc.text(`Balance Due: Ksh ${balanceDue.toFixed(2)}`, pageWidth - 14, totalsY, { align: "right" });

  // FOOTER
  const footerY = doc.internal.pageSize.getHeight() - 12;

  doc.setFillColor(110, 193, 228);
  doc.rect(0, footerY, pageWidth, 12, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This is a system-generated invoice and does not require a physical signature.",
    pageWidth / 2,
    footerY + 7,
    { align: "center" }
  );

  doc.save(`Invoice_${invoice.id}_AGL.pdf`);
};