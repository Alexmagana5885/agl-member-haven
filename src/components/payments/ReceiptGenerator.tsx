import jsPDF from "jspdf";

interface PaymentData {
  id: number;
  name: string;
  contacts: {
    email: string;
    phone: string;
  };
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentCode: string;
  membershipType: string;
}

export const generateReceipt = (payment: PaymentData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 64, 120);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", pageWidth / 2, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt #${payment.paymentCode}`, pageWidth / 2, 32, { align: "center" });

  // Reset text color
  doc.setTextColor(50, 50, 50);

  // Payment details section
  let y = 55;
  const leftX = 20;
  const rightX = pageWidth - 20;

  // Date & Payment Code top row
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Date:", leftX, y);
  doc.setFont("helvetica", "normal");
  doc.text(payment.paymentDate, leftX + 32, y);

  doc.setFont("helvetica", "bold");
  doc.text("Payment Code:", rightX - 60, y);
  doc.setFont("helvetica", "normal");
  doc.text(payment.paymentCode, rightX - 28, y);

  // Divider
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftX, y, rightX, y);

  // Member Information
  y += 12;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Member Information", leftX, y);

  y += 10;
  doc.setFontSize(10);
  const fields = [
    ["Name", payment.name],
    ["Email", payment.contacts.email],
    ["Phone", payment.contacts.phone],
    ["Membership Type", payment.membershipType.charAt(0).toUpperCase() + payment.membershipType.slice(1)],
    ["Payment Number", payment.paymentNumber],
  ];

  fields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "N/A", leftX + 45, y);
    y += 8;
  });

  // Divider
  y += 4;
  doc.line(leftX, y, rightX, y);

  // Amount box
  y += 12;
  doc.setFillColor(240, 245, 250);
  doc.roundedRect(leftX, y - 6, pageWidth - 40, 24, 3, 3, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Amount Paid:", leftX + 8, y + 6);
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 120);
  doc.text(`Ksh ${payment.amount.toLocaleString()}`, rightX - 8, y + 6, { align: "right" });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.text("This is a computer-generated receipt and does not require a signature.", pageWidth / 2, footerY, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 5, { align: "center" });

  // Download
  doc.save(`Receipt_${payment.paymentCode}.pdf`);
};
