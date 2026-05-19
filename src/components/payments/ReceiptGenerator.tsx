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

// New interface for MemberPremiumPayments (includes both registration and premium fees)
interface PremiumPaymentData {
  id: number;
  name: string;
  contacts: {
    email: string;
    phone: string;
  };
  premiumFee: {
    paymentCode: string;
    amount: number;
    paymentDate: string;
  };
  registrationFee: {
    paymentCode: string;
    amount: number;
    paymentDate: string;
  } | null;
  membershipType: string;
}

export const generateReceipt = (payment: PaymentData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(110, 193, 228);
  doc.rect(0, 0, pageWidth, 40, "F");

  try {
    const img = new Image();
    img.src = new URL("./AGLlogo.png", import.meta.url).href;

    const logoWidth = 60;
    const logoHeight = logoWidth * (250 / 811);

    doc.addImage(img, "PNG", 10, 10, logoWidth, logoHeight);
  } catch {
    // fallback
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AGL", 20, 24);
  }

  // Text on the right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", pageWidth - 15, 20, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt #${payment.paymentCode}`, pageWidth - 15, 30, {
    align: "right",
  });

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
    [
      "Membership Type",
      payment.membershipType.charAt(0).toUpperCase() +
        payment.membershipType.slice(1),
    ],
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
  doc.text(`Ksh ${payment.amount.toLocaleString()}`, rightX - 8, y + 6, {
    align: "right",
  });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    pageWidth / 2,
    footerY,
    { align: "center" },
  );
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" },
  );

  // Download
  doc.save(`Receipt_${payment.paymentCode}.pdf`);
};

// Generate receipt for MemberPremiumPayments (includes both registration and premium fees)
export const generatePremiumReceipt = (payment: PremiumPaymentData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Calculate total amount
  const registrationAmount = payment.registrationFee?.amount || 0;
  const premiumAmount = payment.premiumFee?.amount || 0;
  const totalAmount = registrationAmount + premiumAmount;

  // Header
  doc.setFillColor(110, 193, 228);
  doc.rect(0, 0, pageWidth, 40, "F");

  try {
    const img = new Image();
    img.src = new URL("./AGLlogo.png", import.meta.url).href;

    const logoWidth = 60;
    const logoHeight = logoWidth * (250 / 811);

    doc.addImage(img, "PNG", 10, 10, logoWidth, logoHeight);
  } catch {
    // fallback
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AGL", 20, 24);
  }

  // Text on the right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", pageWidth - 15, 20, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Receipt #${payment.premiumFee?.paymentCode || "N/A"}`,
    pageWidth - 15,
    30,
    { align: "right" },
  );

  // Reset text color
  doc.setTextColor(50, 50, 50);

  // Payment details section
  let y = 55;
  const leftX = 20;
  const rightX = pageWidth - 20;

  // Premium Payment Code top row
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Premium Payment Code:", leftX, y);
  doc.setFont("helvetica", "normal");
  doc.text(payment.premiumFee?.paymentCode || "N/A", leftX + 55, y);

  if (payment.premiumFee) {
    doc.setFont("helvetica", "bold");
    doc.text("Payment Date:", rightX - 70, y);
    doc.setFont("helvetica", "normal");
    doc.text(payment.premiumFee.paymentDate || "N/A", rightX - 10, y, {
      align: "right",
    });
  }

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
  const membershipTypeLabel =
    payment.membershipType === "organization"
      ? "Organization"
      : payment.membershipType === "personal"
        ? "Personal"
        : "Unknown";
  const fields = [
    ["Name", payment.name],
    ["Email", payment.contacts.email],
    ["Phone", payment.contacts.phone],
    ["Membership Type", membershipTypeLabel],
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

  // Payment Details Section
  y += 12;

  // Divider
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
  doc.text(`Ksh ${premiumAmount.toLocaleString()}`, rightX - 8, y + 6, {
    align: "right",
  });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    pageWidth / 2,
    footerY,
    { align: "center" },
  );
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" },
  );

  // Download
  const receiptCode =
    payment.premiumFee?.paymentCode || `payment_${payment.id}`;
  doc.save(`Receipt_${receiptCode}.pdf`);
};
