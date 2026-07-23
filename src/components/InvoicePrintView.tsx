"use client";

import { useState } from "react";
import { Printer, X, Download, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";

type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Payment = {
  amount: number;
  date: string;
  method: string;
};

type Invoice = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  clientWhatsapp?: string;
  invoiceDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  paidAmount: number;
  balance: number;
  status: "pending" | "partial" | "paid";
  createdAt: string;
};

type Props = {
  invoice: Invoice;
  onClose: () => void;
};

const formatPrice = (amount: number) => {
  const rounded = Math.round(amount);
  return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getMethodName = (method: string) => {
  switch (method) {
    case "card":
      return "Tarjeta";
    case "transfer":
      return "Transferencia";
    default:
      return "Efectivo";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "paid":
      return "PAGADA";
    case "partial":
      return "ABONADA";
    default:
      return "PENDIENTE";
  }
};

export default function InvoicePrintView({ invoice, onClose }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getInvoiceHTMLContent = () => {
    const printContent = document.getElementById("print-invoice-content");
    if (!printContent) return null;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 15px;">
        ${printContent.innerHTML}
      </div>
    `;
    return wrapper;
  };

  const handleDownloadPDF = async () => {
    const element = getInvoiceHTMLContent();
    if (!element) return;

    setIsDownloading(true);
    try {
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `Factura_${invoice.invoiceNumber}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
        } as any)
        .from(element)
        .save();
    } catch {
      // error silencioso
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-invoice-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Factura #${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
          .header h1 { font-size: 20px; margin-bottom: 2px; }
          .header p { font-size: 11px; color: #555; }
          .invoice-title { text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0; padding: 5px; border: 1px solid #ccc; background: #f9f9f9; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
          .info-box { border: 1px solid #ddd; padding: 8px; border-radius: 4px; }
          .info-box h3 { font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
          .info-box p { font-size: 12px; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th { background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
          td { padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
          tr:nth-child(even) { background: #f5f5f5; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 15px; }
          .totals-box { width: 280px; border: 1px solid #ddd; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 10px; font-size: 12px; }
          .totals-row.total { background: #333; color: #fff; font-weight: bold; font-size: 14px; }
          .totals-row.balance { background: #fee2e2; color: #991b1b; font-weight: bold; }
          .totals-row.balance.paid { background: #dcfce7; color: #166534; }
          .totals-row .label { flex: 1; }
          .totals-row .value { font-weight: 600; }
          .payments { margin-bottom: 15px; }
          .payments h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
          .no-payments { color: #999; font-style: italic; font-size: 12px; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .status-pending { background: #fee2e2; color: #991b1b; }
          .status-partial { background: #fef3c7; color: #92400e; }
          .status-paid { background: #dcfce7; color: #166534; }
          .footer { text-align: center; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 20px; font-size: 10px; color: #999; }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
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
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        {/* Controles (ocultos en impresión) */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Factura #{invoice.invoiceNumber}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? "Generando..." : "Descargar PDF"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido de la factura */}
        <div id="print-invoice-content" className="p-6">
          <div className="header">
            <h1>Salud Integral</h1>
            <p>Sistema de Facturación</p>
          </div>

          <div className="invoice-title">
            <span>FACTURA #{invoice.invoiceNumber}</span>
            <span className="ml-3">
              <span className={`status-badge status-${invoice.status}`}>
                {getStatusText(invoice.status)}
              </span>
            </span>
          </div>

          <div className="info-grid">
            <div className="info-box">
              <h3>Cliente</h3>
              <p>
                <strong>{invoice.customerName}</strong>
              </p>
              {invoice.clientWhatsapp && (
                <p>WhatsApp: {invoice.clientWhatsapp}</p>
              )}
            </div>
            <div className="info-box">
              <h3>Detalles</h3>
              <p>Fecha: {formatDate(invoice.invoiceDate || invoice.createdAt)}</p>
              <p>Factura #: {invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Productos */}
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style={{ textAlign: "center" }}>Cant.</th>
                <th style={{ textAlign: "right" }}>Precio</th>
                <th style={{ textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>{formatPrice(item.price)}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatPrice(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="totals">
            <div className="totals-box">
              <div className="totals-row">
                <span className="label">Subtotal</span>
                <span className="value">{formatPrice(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="totals-row">
                  <span className="label">Descuento</span>
                  <span className="value" style={{ color: "#dc2626" }}>
                    -{formatPrice(invoice.discount)}
                  </span>
                </div>
              )}
              <div className="totals-row total">
                <span className="label">Total</span>
                <span className="value">{formatPrice(invoice.total)}</span>
              </div>
              <div className="totals-row">
                <span className="label">Abonado</span>
                <span className="value" style={{ color: "#16a34a" }}>
                  {formatPrice(invoice.paidAmount)}
                </span>
              </div>
              <div
                className={`totals-row balance ${invoice.balance <= 0 ? "paid" : ""}`}
              >
                <span className="label">Saldo</span>
                <span className="value">{formatPrice(invoice.balance)}</span>
              </div>
            </div>
          </div>

          {/* Pagos */}
          <div className="payments">
            <h3>Historial de Pagos</h3>
            {invoice.payments.length === 0 ? (
              <p className="no-payments">Sin pagos registrados</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(payment.date)}</td>
                      <td>{getMethodName(payment.method)}</td>
                      <td style={{ textAlign: "right" }}>
                        {formatPrice(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="footer">
            <p>Documento generado desde Salud Integral</p>
          </div>
        </div>
      </div>
    </div>
  );
}
