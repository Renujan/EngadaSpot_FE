import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface BillItem {
  product: {
    id: string;
    name: string;
    price: number;
    sku: string;
  };
  quantity: number;
}

export interface BillData {
  items: BillItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  billNumber: string;
  date: string;
  cashier: string;
}

export const generateBillPDF = async (billData: BillData): Promise<void> => {
  const pdf = new jsPDF();
  
  // Professional Header with SPOT branding
  pdf.setFontSize(28);
  pdf.setTextColor(24, 131, 77); // SPOT Green
  pdf.text('SPOT', 105, 25, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setTextColor(80, 80, 80);
  pdf.text('Professional Restaurant POS', 105, 35, { align: 'center' });
  
  // Business details
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('123 Food Street, Colombo 03, Sri Lanka', 105, 45, { align: 'center' });
  pdf.text('Tel: +94 11 234 5678 | Email: hello@spot.lk', 105, 52, { align: 'center' });
  
  // Decorative line
  pdf.setDrawColor(24, 131, 77);
  pdf.setLineWidth(0.5);
  pdf.line(20, 60, 190, 60);
  
  // Bill information section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BILL RECEIPT', 20, 75);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Bill Number: ${billData.billNumber}`, 20, 85);
  pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 92);
  pdf.text(`Time: ${new Date().toLocaleTimeString('en-GB')}`, 20, 99);
  pdf.text(`Cashier: ${billData.cashier}`, 120, 85);
  pdf.text(`Payment: ${billData.paymentMethod.toUpperCase()}`, 120, 92);
  
  // Table section
  const tableTop = 115;
  pdf.setDrawColor(24, 131, 77);
  pdf.setLineWidth(0.3);
  pdf.line(20, tableTop, 190, tableTop);
  
  // Table headers with background
  pdf.setFillColor(240, 248, 244);
  pdf.rect(20, tableTop + 2, 170, 12, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 131, 77);
  pdf.text('ITEM', 25, tableTop + 10);
  pdf.text('SKU', 85, tableTop + 10);
  pdf.text('QTY', 115, tableTop + 10);
  pdf.text('PRICE', 135, tableTop + 10);
  pdf.text('TOTAL', 165, tableTop + 10);
  
  pdf.line(20, tableTop + 14, 190, tableTop + 14);
  
  // Items with alternating row colors
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  let yPos = tableTop + 25;
  
  billData.items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    
    // Alternating row background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 252, 251);
      pdf.rect(20, yPos - 8, 170, 10, 'F');
    }
    
    pdf.text(item.product.name.substring(0, 22), 25, yPos);
    pdf.text(item.product.sku, 85, yPos);
    pdf.text(item.quantity.toString(), 118, yPos);
    pdf.text(`Rs. ${item.product.price.toFixed(2)}`, 135, yPos);
    pdf.text(`Rs. ${itemTotal.toFixed(2)}`, 165, yPos);
    
    yPos += 12;
  });
  
  // Totals section
  yPos += 8;
  pdf.setDrawColor(24, 131, 77);
  pdf.line(120, yPos - 5, 190, yPos - 5);
  
  pdf.setFontSize(10);
  pdf.text('Subtotal:', 135, yPos);
  pdf.text(`Rs. ${billData.subtotal.toFixed(2)}`, 165, yPos);
  
  yPos += 12;
  pdf.text(`Tax (${(billData.taxRate * 100).toFixed(1)}%):`, 135, yPos);
  pdf.text(`Rs. ${billData.tax.toFixed(2)}`, 165, yPos);
  
  // Final total with highlight
  yPos += 15;
  pdf.setFillColor(24, 131, 77);
  pdf.rect(120, yPos - 8, 70, 12, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TOTAL:', 135, yPos);
  pdf.text(`Rs. ${billData.total.toFixed(2)}`, 165, yPos);
  
  // Footer section
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Thank you for dining with SPOT Restaurant!', 105, yPos + 25, { align: 'center' });
  pdf.text('Follow us @spot_restaurant | www.spotrestaurant.lk', 105, yPos + 35, { align: 'center' });
  pdf.text('Please keep this receipt for your records', 105, yPos + 45, { align: 'center' });
  
  // QR Code placeholder (text-based)
  pdf.setFontSize(8);
  pdf.text('Scan QR for feedback:', 20, yPos + 40);
  pdf.rect(20, yPos + 45, 15, 15);
  pdf.text('QR', 26, yPos + 54);
  
  // Save PDF with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  pdf.save(`SPOT-Bill-${billData.billNumber}-${timestamp}.pdf`);
};

export const printBillHTML = (elementId: string) => {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SPOT Bill</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            color: #000;
          }
          .bill-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .bill-title {
            font-size: 24px;
            color: #22C55E;
            font-weight: bold;
          }
          .bill-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .totals {
            text-align: right;
            margin-top: 20px;
          }
          .total-line {
            font-weight: bold;
            font-size: 16px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};