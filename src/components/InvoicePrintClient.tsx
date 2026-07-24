"use client";

import { useState, useEffect } from "react";
import { showToast } from "nextjs-toast-notify";
import { Search, Printer, FileText, Loader2, Download, Table, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import InvoicePrintView from "./InvoicePrintView";

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

type Client = {
  _id: string;
  establishmentName: string;
  contactName: string;
  whatsapp?: string;
  email: string;
  address: string;
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          Pagada
        </span>
      );
    case "partial":
      return (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
          Abonada
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
          Pendiente
        </span>
      );
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "paid": return "PAGADA";
    case "partial": return "ABONADA";
    default: return "PENDIENTE";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "paid": return "Pagada";
    case "partial": return "Abonada";
    default: return "Pendiente";
  }
};

const getMethodName = (method: string) => {
  switch (method) {
    case "card": return "Tarjeta";
    case "transfer": return "Transferencia";
    default: return "Efectivo";
  }
};

export default function InvoicePrintClient() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending_partial" | "paid">("all");
  const [summaryMode, setSummaryMode] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients");
        if (!res.ok) throw new Error("Error al cargar clientes");
        const data = await res.json();
        setClients(data);
      } catch {
        showToast.error("Error al cargar la lista de clientes");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      client.establishmentName.toLowerCase().includes(term) ||
      client.contactName.toLowerCase().includes(term) ||
      client.whatsapp?.toLowerCase().includes(term)
    );
  });

  const visibleInvoices = invoices.filter((inv) => {
    if (statusFilter === "paid") return inv.status === "paid";
    if (statusFilter === "pending_partial") return inv.status === "pending" || inv.status === "partial";
    return true;
  });

  const handleSelectClient = async (client: Client) => {
    setSelectedClient(client);
    setInvoices([]);
    setLoadingInvoices(true);

    try {
      const res = await fetch(
        `/api/invoices?clientWhatsapp=${encodeURIComponent(client.whatsapp || client._id)}`,
      );
      if (!res.ok) throw new Error("Error al cargar facturas");
      const data = await res.json();
      setInvoices(data);
    } catch {
      showToast.error("Error al cargar las facturas del cliente");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const createInvoiceElement = (invoice: Invoice) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 15px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
          <h1 style="font-size: 20px; margin-bottom: 2px;">Salud Integral</h1>
          <p style="font-size: 11px; color: #555;">Sistema de Facturación</p>
        </div>
        <div style="text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0; padding: 5px; border: 1px solid #ccc; background: #f9f9f9;">
          FACTURA #${invoice.invoiceNumber}
          <span style="margin-left: 10px; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; ${
            invoice.status === "paid" ? "background: #dcfce7; color: #166534;" :
            invoice.status === "partial" ? "background: #fef3c7; color: #92400e;" :
            "background: #fee2e2; color: #991b1b;"
          }">${getStatusText(invoice.status)}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div style="border: 1px solid #ddd; padding: 8px; border-radius: 4px;">
            <h3 style="font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 3px;">Cliente</h3>
            <p style="font-size: 12px; line-height: 1.5;"><strong>${invoice.customerName}</strong></p>
            ${invoice.clientWhatsapp ? `<p style="font-size: 12px;">WhatsApp: ${invoice.clientWhatsapp}</p>` : ""}
          </div>
          <div style="border: 1px solid #ddd; padding: 8px; border-radius: 4px;">
            <h3 style="font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 3px;">Detalles</h3>
            <p style="font-size: 12px;">Fecha: ${formatDate(invoice.invoiceDate || invoice.createdAt)}</p>
            <p style="font-size: 12px;">Factura #: ${invoice.invoiceNumber}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase;">Producto</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: center; font-size: 11px; text-transform: uppercase;">Cant.</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: right; font-size: 11px; text-transform: uppercase;">Precio</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: right; font-size: 11px; text-transform: uppercase;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, i) => `
              <tr style="${i % 2 === 1 ? "background: #f5f5f5;" : ""}">
                <td style="padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px;">${item.productName}</td>
                <td style="padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-align: center;">${item.quantity}</td>
                <td style="padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-align: right;">${formatPrice(item.price)}</td>
                <td style="padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-align: right;">${formatPrice(item.subtotal)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
          <div style="width: 280px; border: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; padding: 4px 10px; font-size: 12px;"><span style="flex: 1;">Subtotal</span><span style="font-weight: 600;">${formatPrice(invoice.subtotal)}</span></div>
            ${invoice.discount > 0 ? `<div style="display: flex; justify-content: space-between; padding: 4px 10px; font-size: 12px;"><span style="flex: 1;">Descuento</span><span style="font-weight: 600; color: #dc2626;">-${formatPrice(invoice.discount)}</span></div>` : ""}
            <div style="display: flex; justify-content: space-between; padding: 4px 10px; font-size: 14px; font-weight: bold; background: #333; color: #fff;"><span style="flex: 1;">Total</span><span>${formatPrice(invoice.total)}</span></div>
            <div style="display: flex; justify-content: space-between; padding: 4px 10px; font-size: 12px;"><span style="flex: 1;">Abonado</span><span style="font-weight: 600; color: #16a34a;">${formatPrice(invoice.paidAmount)}</span></div>
            <div style="display: flex; justify-content: space-between; padding: 4px 10px; font-size: 12px; font-weight: bold; ${invoice.balance <= 0 ? "background: #dcfce7; color: #166534;" : "background: #fee2e2; color: #991b1b;"}"><span style="flex: 1;">Saldo</span><span>${formatPrice(invoice.balance)}</span></div>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 3px;">Historial de Pagos</h3>
          ${invoice.payments.length === 0 ? '<p style="color: #999; font-style: italic; font-size: 12px;">Sin pagos registrados</p>' : `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase;">Fecha</th>
                  <th style="background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase;">Método</th>
                  <th style="background: #333; color: #fff; padding: 6px 8px; text-align: right; font-size: 11px; text-transform: uppercase;">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.payments.map((p, i) => `
                  <tr style="${i % 2 === 1 ? "background: #f5f5f5;" : ""}">
                    <td style="padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px;">${formatDate(p.date)}</td>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px;">${getMethodName(p.method)}</td>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-align: right;">${formatPrice(p.amount)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
    return wrapper;
  };

  const createSummaryElement = (clientInvoices: Invoice[], clientName: string) => {
    const totalGeneral = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalAbonado = clientInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalSaldo = clientInvoices.reduce((sum, inv) => sum + inv.balance, 0);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; margin-bottom: 2px;">Salud Integral</h1>
          <p style="font-size: 11px; color: #555;">Resumen de Facturación</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 15px; font-weight: bold; margin-bottom: 4px;">Cliente: ${clientName}</h2>
          <p style="font-size: 12px; color: #666;">${clientInvoices.length} factura${clientInvoices.length !== 1 ? "s" : ""} · ${statusFilter === "all" ? "Todos los estados" : statusFilter === "paid" ? "Solo pagadas" : "Pendientes y abonadas"}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase;"># Factura</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase;">Fecha</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase;">Estado</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: right; font-size: 11px; text-transform: uppercase;">Total</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: right; font-size: 11px; text-transform: uppercase;">Abonado</th>
              <th style="background: #333; color: #fff; padding: 6px 8px; text-align: right; font-size: 11px; text-transform: uppercase;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${clientInvoices.map((inv, i) => `
              <tr style="${i % 2 === 1 ? "background: #f5f5f5;" : ""}">
                <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 12px; font-weight: bold;">${inv.invoiceNumber}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 12px;">${formatDate(inv.invoiceDate || inv.createdAt)}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 12px;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; ${
                    inv.status === "paid" ? "background: #dcfce7; color: #166534;" :
                    inv.status === "partial" ? "background: #fef3c7; color: #92400e;" :
                    "background: #fee2e2; color: #991b1b;"
                  }">${getStatusLabel(inv.status)}</span>
                </td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-align: right; font-weight: 600;">${formatPrice(inv.total)}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-align: right; color: #16a34a;">${formatPrice(inv.paidAmount)}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-align: right; font-weight: bold; ${inv.balance > 0 ? "color: #dc2626;" : "color: #166534;"}">${formatPrice(inv.balance)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr style="background: #333; color: #fff; font-weight: bold;">
              <td colspan="3" style="padding: 8px; font-size: 12px;">TOTALES</td>
              <td style="padding: 8px; font-size: 12px; text-align: right;">${formatPrice(totalGeneral)}</td>
              <td style="padding: 8px; font-size: 12px; text-align: right;">${formatPrice(totalAbonado)}</td>
              <td style="padding: 8px; font-size: 12px; text-align: right;">${formatPrice(totalSaldo)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="text-align: center; border-top: 1px solid #ccc; padding-top: 10px; font-size: 10px; color: #999;">
          <p>Documento generado desde Salud Integral</p>
        </div>
      </div>
    `;
    return wrapper;
  };

  const handleDownloadAllPDF = async () => {
    if (visibleInvoices.length === 0) return;
    setIsDownloading(true);
    try {
      let element: HTMLElement;

      if (summaryMode) {
        element = createSummaryElement(visibleInvoices, selectedClient?.establishmentName || "Cliente");
      } else {
        const combined = document.createElement("div");
        combined.style.fontFamily = "Arial, sans-serif";
        combined.style.fontSize = "13px";
        combined.style.color = "#1a1a1a";
        combined.style.padding = "15px";

        visibleInvoices.forEach((inv, idx) => {
          const el = createInvoiceElement(inv);
          const inner = el.firstElementChild || el;
          combined.appendChild(inner);
          if (idx < visibleInvoices.length - 1) {
            const hr = document.createElement("div");
            hr.style.pageBreakAfter = "always";
            hr.style.borderTop = "2px dashed #ccc";
            hr.style.margin = "20px 0";
            combined.appendChild(hr);
          }
        });
        element = combined;
      }

      const statusLabel = statusFilter === "all" ? "Todas" : statusFilter === "paid" ? "Pagadas" : "Pendientes";
      const modeLabel = summaryMode ? "Resumen" : "Facturas";

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${modeLabel}_${selectedClient?.establishmentName || "Cliente"}_${statusLabel}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
        } as any)
        .from(element)
        .save();
      showToast.success(`PDF descargado exitosamente`);
    } catch {
      showToast.error("Error al descargar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintAll = () => {
    if (visibleInvoices.length === 0) return;

    let printContent: string;
    if (summaryMode) {
      const totalGeneral = visibleInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalAbonado = visibleInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
      const totalSaldo = visibleInvoices.reduce((sum, inv) => sum + inv.balance, 0);

      printContent = `
        <div class="header">
          <h1>Salud Integral</h1>
          <p>Resumen de Facturación</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 15px; font-weight: bold; margin-bottom: 4px;">Cliente: ${selectedClient?.establishmentName}</h2>
          <p style="font-size: 12px; color: #666;">${visibleInvoices.length} factura${visibleInvoices.length !== 1 ? "s" : ""}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th># Factura</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th style="text-align:right">Total</th>
              <th style="text-align:right">Abonado</th>
              <th style="text-align:right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${visibleInvoices.map((inv) => `
              <tr>
                <td><strong>${inv.invoiceNumber}</strong></td>
                <td>${formatDate(inv.invoiceDate || inv.createdAt)}</td>
                <td><span class="status-badge status-${inv.status}">${getStatusLabel(inv.status)}</span></td>
                <td style="text-align:right"><strong>${formatPrice(inv.total)}</strong></td>
                <td style="text-align:right; color: #16a34a;">${formatPrice(inv.paidAmount)}</td>
                <td style="text-align:right; ${inv.balance > 0 ? "color: #dc2626;" : "color: #166534;"}"><strong>${formatPrice(inv.balance)}</strong></td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr style="background: #333; color: #fff; font-weight: bold;">
              <td colspan="3">TOTALES</td>
              <td style="text-align:right">${formatPrice(totalGeneral)}</td>
              <td style="text-align:right">${formatPrice(totalAbonado)}</td>
              <td style="text-align:right">${formatPrice(totalSaldo)}</td>
            </tr>
          </tfoot>
        </table>
      `;
    } else {
      printContent = visibleInvoices.map((inv) => generateInvoiceHTML(inv)).join("<hr style='page-break-after:always; margin: 20px 0; border:none; border-top:2px dashed #ccc;'>");
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Facturas de ${selectedClient?.establishmentName}</title>
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
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${printContent}
        <div class="footer">
          <p>Documento generado desde Salud Integral</p>
        </div>
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

  const generateInvoiceHTML = (invoice: Invoice) => {
    return `
      <div style="margin-bottom: 30px;">
        <div class="header">
          <h1>Salud Integral</h1>
          <p>Sistema de Facturación</p>
        </div>
        <div class="invoice-title">
          <span>FACTURA #${invoice.invoiceNumber}</span>
          <span class="ml-3">
            <span class="status-badge status-${invoice.status}">${getStatusText(invoice.status)}</span>
          </span>
        </div>
        <div class="info-grid">
          <div class="info-box">
            <h3>Cliente</h3>
            <p><strong>${invoice.customerName}</strong></p>
            ${invoice.clientWhatsapp ? `<p>WhatsApp: ${invoice.clientWhatsapp}</p>` : ""}
          </div>
          <div class="info-box">
            <h3>Detalles</h3>
            <p>Fecha: ${formatDate(invoice.invoiceDate || invoice.createdAt)}</p>
            <p>Factura #: ${invoice.invoiceNumber}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align:center">Cant.</th>
              <th style="text-align:right">Precio</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item) => `
              <tr>
                <td>${item.productName}</td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:right">${formatPrice(item.price)}</td>
                <td style="text-align:right">${formatPrice(item.subtotal)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-box">
            <div class="totals-row">
              <span class="label">Subtotal</span>
              <span class="value">${formatPrice(invoice.subtotal)}</span>
            </div>
            ${invoice.discount > 0 ? `
              <div class="totals-row">
                <span class="label">Descuento</span>
                <span class="value" style="color:#dc2626">-${formatPrice(invoice.discount)}</span>
              </div>
            ` : ""}
            <div class="totals-row total">
              <span class="label">Total</span>
              <span class="value">${formatPrice(invoice.total)}</span>
            </div>
            <div class="totals-row">
              <span class="label">Abonado</span>
              <span class="value" style="color:#16a34a">${formatPrice(invoice.paidAmount)}</span>
            </div>
            <div class="totals-row balance ${invoice.balance <= 0 ? "paid" : ""}">
              <span class="label">Saldo</span>
              <span class="value">${formatPrice(invoice.balance)}</span>
            </div>
          </div>
        </div>
        <div class="payments">
          <h3>Historial de Pagos</h3>
          ${invoice.payments.length === 0 ? '<p class="no-payments">Sin pagos registrados</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th style="text-align:right">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.payments.map((p) => `
                  <tr>
                    <td>${formatDate(p.date)}</td>
                    <td>${getMethodName(p.method)}</td>
                    <td style="text-align:right">${formatPrice(p.amount)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
  };

  return (
    <div className="mx-auto w-full overflow-hidden p-4 sm:p-6 lg:w-5/6">
      <div className="my-6 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Imprimir Facturas</h1>
        <p className="text-sm text-gray-500">
          Seleccione un cliente para ver e imprimir sus facturas
        </p>
      </div>

      {/* Búsqueda y selección de cliente */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Buscar cliente
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre del establecimiento, contacto o WhatsApp..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-9 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {loadingClients ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            <span className="ml-2 text-sm text-gray-500">Cargando clientes...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            No se encontraron clientes
          </p>
        ) : (
          <div className="mt-3 max-h-60 overflow-y-auto">
            {filteredClients.map((client) => (
              <button
                key={client._id}
                onClick={() => handleSelectClient(client)}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  selectedClient?._id === client._id
                    ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300"
                    : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-900">
                  {client.establishmentName}
                </p>
                <p className="text-sm text-gray-500">
                  {client.contactName}
                  {client.whatsapp && ` · WhatsApp: ${client.whatsapp}`}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultado: facturas del cliente seleccionado */}
      {selectedClient && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-900">
                {selectedClient.establishmentName}
              </h2>
              <p className="text-sm text-gray-500">
                {visibleInvoices.length} factura{visibleInvoices.length !== 1 ? "s" : ""} encontrada{visibleInvoices.length !== 1 ? "s" : ""}
              </p>
            </div>
            {visibleInvoices.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadAllPDF}
                  disabled={isDownloading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70 sm:flex-initial"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloading ? "Descargando..." : "PDF"}
                </button>
                <button
                  onClick={handlePrintAll}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:flex-initial"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </button>
              </div>
            )}
          </div>

          {/* Filtros de estado y modo */}
          {invoices.length > 0 && (
            <div className="mb-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-600">Estado:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`rounded-md px-3 py-1 text-sm font-medium ${
                      statusFilter === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Todas ({invoices.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending_partial")}
                    className={`rounded-md px-3 py-1 text-sm font-medium ${
                      statusFilter === "pending_partial"
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Pend./Abonadas ({invoices.filter((i) => i.status === "pending" || i.status === "partial").length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("paid")}
                    className={`rounded-md px-3 py-1 text-sm font-medium ${
                      statusFilter === "paid"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Pagadas ({invoices.filter((i) => i.status === "paid").length})
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-600">Formato:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSummaryMode(false)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium ${
                      !summaryMode
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Completas
                  </button>
                  <button
                    onClick={() => setSummaryMode(true)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium ${
                      summaryMode
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <Table className="h-3.5 w-3.5" />
                    Resumen tabla
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="ml-2 text-sm text-gray-500">
                Cargando facturas...
              </span>
            </div>
          ) : visibleInvoices.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                {invoices.length === 0
                  ? "Este cliente no tiene facturas registradas"
                  : "No hay facturas con el filtro seleccionado"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">
                        Factura #{invoice.invoiceNumber}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {formatDate(invoice.invoiceDate || invoice.createdAt)} · Total:{" "}
                        {formatPrice(invoice.total)}
                        {invoice.balance > 0 && (
                          <span className="ml-1 text-red-600">
                            · Saldo: {formatPrice(invoice.balance)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {getStatusBadge(invoice.status)}
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="flex items-center gap-1.5 rounded-md border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 sm:text-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 sm:text-sm"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de impresión */}
      {selectedInvoice && (
        <InvoicePrintView
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
