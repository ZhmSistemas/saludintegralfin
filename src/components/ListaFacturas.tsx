"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { showToast } from "nextjs-toast-notify";

type Invoice = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  clientWhatsapp: string;
  items: { productName: string; quantity: number; price: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  payments: { amount: number; method: string; date: string }[];
  paidAmount: number;
  balance: number;
  status: string;
  createdAt: string;
};

export default function ListaFacturas() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.whatsapp) {
      fetchInvoices();
    }
  }, [session]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices?clientWhatsapp=${session?.user?.whatsapp}`);
      if (!res.ok) throw new Error("Error al cargar facturas");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    const rounded = Math.round(amount);
    return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-6 lg:w-5/6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Mis Facturas</h1>
      <div className="mb-4">
        <p>Usuario: {session?.user?.name}</p>
        <p>WhatsApp: {session?.user?.whatsapp}</p>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No tienes facturas registradas
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div key={invoice._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">{invoice.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Total: {formatPrice(invoice.total)}</p>
                  <p className="text-sm">Saldo: {formatPrice(invoice.balance)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
