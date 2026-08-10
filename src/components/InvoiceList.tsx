'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { showToast } from 'nextjs-toast-notify';
import {
  ChevronDown,
  ChevronUp,
  Package,
  Trash2,
  AlertTriangle,
  Pencil,
  X,
  Printer,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import InvoicePrintView from './InvoicePrintView';

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
  observation?: string;
  image?: string;
};

type Invoice = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  paidAmount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid';
  image?: string;
  createdAt: string;
};

export default function InvoiceList() {
  const router = useRouter();
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const isSuperAdmin = session?.user?.isSuperAdmin === true;
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'number' | 'date'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePaymentConfirm, setDeletePaymentConfirm] = useState<{
    invoiceId: string;
    paymentIndex: number;
    amount: number;
  } | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentObservation, setPaymentObservation] = useState('');
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [paymentImagePreview, setPaymentImagePreview] = useState('');
  const [addingPayment, setAddingPayment] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPrintInvoice, setSelectedPrintInvoice] =
    useState<Invoice | null>(null);

  const toggleSort = (field: 'number' | 'date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredInvoices = invoices
    .filter((invoice) => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.customerName.toLowerCase().includes(searchLower) ||
        invoice.invoiceNumber.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortField === 'number') {
        const diff = Number(a.invoiceNumber) - Number(b.invoiceNumber);
        return sortOrder === 'asc' ? diff : -diff;
      } else {
        const diff =
          new Date(a.invoiceDate || a.createdAt).getTime() -
          new Date(b.invoiceDate || b.createdAt).getTime();
        return sortOrder === 'asc' ? diff : -diff;
      }
    });

  const formatPrice = (amount: number) => {
    const rounded = Math.round(amount);
    return '$' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Pagada
          </span>
        );
      case 'partial':
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

  const getMethodName = (method: string) => {
    switch (method) {
      case 'card':
        return 'Tarjeta';
      case 'transfer':
        return 'Transferencia';
      case 'cruce':
        return 'Cruce Cuentas';
      case 'other':
        return 'Otro';
      default:
        return 'Efectivo';
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const url =
        filter !== 'all' ? `/api/invoices?status=${filter}` : '/api/invoices';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar facturas');
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      showToast.error(
        err instanceof Error ? err.message : 'Error al cargar facturas'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoice(expandedInvoice === id ? null : id);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentObservation('');
    setPaymentImage(null);
    setPaymentImagePreview('');
    setPaymentError(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const confirmDeletePayment = (
    invoiceId: string,
    paymentIndex: number,
    amount: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setDeletePaymentConfirm({ invoiceId, paymentIndex, amount });
  };

  const cancelDeletePayment = () => {
    setDeletePaymentConfirm(null);
  };

  const deletePayment = async () => {
    if (!deletePaymentConfirm) return;
    const { invoiceId, paymentIndex } = deletePaymentConfirm;

    setIsDeletingPayment(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removePayment: paymentIndex }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el abono');
      }
      const { invoice: updatedInvoice } = await res.json();
      setInvoices(
        invoices.map((inv) => (inv._id === invoiceId ? updatedInvoice : inv))
      );
      setDeletePaymentConfirm(null);
      showToast.success('Abono eliminado exitosamente');
    } catch (err) {
      showToast.error(
        err instanceof Error ? err.message : 'Error al eliminar el abono'
      );
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const deleteInvoice = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar factura');
      setInvoices(invoices.filter((inv) => inv._id !== id));
      setDeleteConfirmId(null);
      showToast.success('Factura eliminada exitosamente');
    } catch {
      showToast.error('Error al eliminar la factura');
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
    );
    formData.append('folder', 'imageproduct');
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('El nombre de la nube de Cloudinary no está definido');
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Cloudinary error: ${errorData.error.message}`);
      }
      const data = await res.json();

      return {
        public_id: data.public_id,
        image_url: data.secure_url,
      };
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  };

  const handlePaymentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setPaymentImage(files[0]);
      const objectUrl = URL.createObjectURL(files[0]);
      setPaymentImagePreview(objectUrl);
    }
  };

  const addPayment = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentError(null);

    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setPaymentError('Ingrese un monto válido');
      return;
    }

    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (!invoice) return;

    const newPaymentAmount = Number(paymentAmount);
    if (newPaymentAmount > invoice.balance) {
      setPaymentError(
        `El abono no puede ser mayor al saldo: ${formatPrice(invoice.balance)}`
      );
      return;
    }

    setAddingPayment(invoiceId);
    try {
      let imageUrl = '';
      if (paymentImage) {
        const uploadedImage = await uploadImage(paymentImage);
        if (uploadedImage && uploadedImage.image_url) {
          imageUrl = uploadedImage.image_url;
        }
      }

      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: {
            amount: newPaymentAmount,
            method: paymentMethod,
            observation: paymentObservation,
            date: paymentDate,
            image: imageUrl,
          },
        }),
      });

      if (!res.ok) throw new Error('Error al registrar abono');

      const { invoice: updatedInvoice } = await res.json();
      setInvoices(
        invoices.map((inv) => (inv._id === invoiceId ? updatedInvoice : inv))
      );
      setPaymentAmount('');
      setPaymentMethod('cash');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentObservation('');
      setPaymentImage(null);
      setPaymentImagePreview('');
    } catch {
      setPaymentError('Error al registrar el abono');
    } finally {
      setAddingPayment(null);
    }
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
      <div className="my-6 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
        <div className="flex w-full flex-col items-center gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o número..."
            className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                filter === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Sin Abono
            </button>
            <button
              onClick={() => setFilter('partial')}
              className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                filter === 'partial'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Abonadas
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                filter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Pagadas
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Ordenar:
            </span>
            <button
              onClick={() => toggleSort('number')}
              className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                sortField === 'number'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Factura
              {sortField === 'number' && (
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
            <button
              onClick={() => toggleSort('date')}
              className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                sortField === 'date'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Fecha
              {sortField === 'date' && (
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </div>
        </div>

        {filteredInvoices.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-center">
              <p className="text-xs font-medium text-indigo-600 uppercase">
                Todas
              </p>
              <p className="text-lg font-bold text-indigo-700">
                {formatPrice(
                  filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)
                )}
              </p>
              <p className="mt-1 text-xs text-indigo-500">
                {filteredInvoices.length} factura
                {filteredInvoices.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-xs font-medium text-red-600 uppercase">
                Pendiente
              </p>
              <p className="text-lg font-bold text-red-700">
                {formatPrice(
                  filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0)
                )}
              </p>
              <p className="mt-1 text-xs text-red-500">
                {filteredInvoices.filter((inv) => inv.balance > 0).length}{' '}
                factura
                {filteredInvoices.filter((inv) => inv.balance > 0).length !== 1
                  ? 's'
                  : ''}
              </p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center">
              <p className="text-xs font-medium text-yellow-600 uppercase">
                Abonada
              </p>
              <p className="text-lg font-bold text-yellow-700">
                {formatPrice(
                  filteredInvoices
                    .filter((inv) => inv.status === 'partial')
                    .reduce((sum, inv) => sum + inv.paidAmount, 0)
                )}
              </p>
              <p className="mt-1 text-xs text-yellow-500">
                {
                  filteredInvoices.filter((inv) => inv.status === 'partial')
                    .length
                }{' '}
                factura
                {filteredInvoices.filter((inv) => inv.status === 'partial')
                  .length !== 1
                  ? 's'
                  : ''}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
              <p className="text-xs font-medium text-green-600 uppercase">
                Pagada
              </p>
              <p className="text-lg font-bold text-green-700">
                {formatPrice(
                  filteredInvoices
                    .filter((inv) => inv.status === 'paid')
                    .reduce((sum, inv) => sum + inv.total, 0)
                )}
              </p>
              <p className="mt-1 text-xs text-green-500">
                {filteredInvoices.filter((inv) => inv.status === 'paid').length}{' '}
                factura
                {filteredInvoices.filter((inv) => inv.status === 'paid')
                  .length !== 1
                  ? 's'
                  : ''}
              </p>
            </div>
          </div>
        )}

        {filteredInvoices.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white text-center text-gray-500">
            {searchTerm
              ? 'No se encontraron facturas con ese criterio'
              : 'No hay facturas registradas'}
          </div>
        ) : (
          <div className="space-y-2 w-full">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className={`rounded-lg border shadow-sm transition-all duration-200 ${
                  expandedInvoice === invoice._id
                    ? invoice.status === 'paid'
                      ? 'bg-green-100 border-green-300 ring-2 ring-green-400'
                      : invoice.status === 'partial'
                        ? 'bg-yellow-100 border-yellow-300 ring-2 ring-yellow-400'
                        : 'bg-red-100 border-red-300 ring-2 ring-red-400'
                    : invoice.status === 'paid'
                      ? 'bg-green-50 border-green-200'
                      : invoice.status === 'partial'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                }`}
              >
                <div
                  className={`flex flex-col sm:flex-row cursor-pointer items-start sm:items-center justify-between p-4 gap-3 sm:gap-0 ${
                    invoice.status === 'paid'
                      ? 'hover:bg-green-100'
                      : invoice.status === 'partial'
                        ? 'hover:bg-yellow-100'
                        : 'hover:bg-red-100'
                  }`}
                  onClick={() => toggleExpand(invoice._id)}
                >
                  <div className="flex items-center gap-4">
                    {invoice.image ? (
                      <div
                        className="h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(invoice.image!);
                        }}
                      >
                        <Image
                          src={invoice.image}
                          alt="Factura"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <Package className="h-5 w-5 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.customerName}
                      </p>
                      <p className="text-xs text-gray-400 sm:hidden">
                        {formatDate(invoice.invoiceDate || invoice.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-600">
                        Total: {formatPrice(invoice.total)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Saldo:{' '}
                        <span
                          className={
                            invoice.balance > 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {formatPrice(invoice.balance)}
                        </span>
                      </p>
                    </div>
                    {getStatusBadge(invoice.status)}
                    <div className="text-sm text-gray-500 hidden sm:block">
                      {formatDate(invoice.invoiceDate || invoice.createdAt)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/dashboard/facturas/editafactura/${invoice._id}`
                        );
                      }}
                      className="rounded-md p-1 text-indigo-600 hover:bg-indigo-50"
                      title="Editar factura"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPrintInvoice(invoice);
                      }}
                      className="rounded-md p-1 text-indigo-600 hover:bg-indigo-50"
                      title="Imprimir factura"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={(e) => confirmDelete(invoice._id, e)}
                        className="rounded-md p-1 text-red-600 hover:bg-red-50"
                        title="Eliminar factura"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {expandedInvoice === invoice._id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedInvoice === invoice._id && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-3 font-semibold text-gray-900">
                          Productos
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[300px]">
                            <thead>
                              <tr className="border-b text-left text-gray-600">
                                <th className="pb-2">Producto</th>
                                <th className="pb-2">Cant</th>
                                <th className="pb-2">Precio</th>
                                <th className="pb-2">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoice.items.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-2">{item.productName}</td>
                                  <td className="py-2">{item.quantity}</td>
                                  <td className="py-2">
                                    {formatPrice(item.price)}
                                  </td>
                                  <td className="py-2">
                                    {formatPrice(item.subtotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 font-semibold text-gray-900">
                          Abonos / Pagos
                        </h3>
                        {invoice.payments.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            Sin abonos registrados
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[300px]">
                              <thead>
                                <tr className="border-b text-left text-gray-600">
                                  <th className="pb-2">Monto</th>
                                  <th className="pb-2">Método</th>
                                  <th className="pb-2">Fecha</th>
                                  <th className="pb-2">Observación</th>
                                  <th className="pb-2">Imagen</th>
                                  {isSuperAdmin && <th className="pb-2"></th>}
                                </tr>
                              </thead>
                              <tbody>
                                {invoice.payments.map((payment, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="py-2">
                                      {formatPrice(payment.amount)}
                                    </td>
                                    <td className="py-2">
                                      {getMethodName(payment.method)}
                                    </td>
                                    <td className="py-2">
                                      {formatDate(payment.date)}
                                    </td>
                                    <td className="py-2 text-sm text-gray-600">
                                      {payment.observation || '—'}
                                    </td>
                                    <td className="py-2">
                                      {payment.image ? (
                                        <div
                                          className="h-10 w-10 cursor-pointer overflow-hidden rounded-md border border-gray-200"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(payment.image!);
                                          }}
                                        >
                                          <Image
                                            src={payment.image}
                                            alt="Comprobante del abono"
                                            width={40}
                                            height={40}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-400">
                                          —
                                        </span>
                                      )}
                                    </td>
                                    {isSuperAdmin && (
                                      <td className="py-2">
                                        <button
                                          onClick={(e) =>
                                            confirmDeletePayment(
                                              invoice._id,
                                              idx,
                                              payment.amount,
                                              e
                                            )
                                          }
                                          className="rounded-md p-1 text-red-600 hover:bg-red-50"
                                          title="Eliminar abono"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    {invoice.status !== 'paid' && (
                      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                        <h3 className="mb-3 font-semibold text-gray-900">
                          Agregar Abono
                        </h3>
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="w-full sm:w-40">
                            <label className="block text-sm font-medium text-gray-700">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Monto
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              max={invoice.balance}
                              value={paymentAmount}
                              onChange={(e) => {
                                setPaymentAmount(e.target.value);
                                setPaymentError(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={`Máx: ${formatPrice(invoice.balance)}`}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div className="w-full sm:w-40">
                            <label className="block text-sm font-medium text-gray-700">
                              Método
                            </label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="cash">Efectivo</option>
                              <option value="card">Tarjeta</option>
                              <option value="transfer">Transferencia</option>
                              <option value="cruce">Cruce Cuentas</option>
                              <option value="other">Otro</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={(e) => addPayment(invoice._id, e)}
                              disabled={addingPayment === invoice._id}
                              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70 w-full sm:w-auto"
                            >
                              {addingPayment === invoice._id
                                ? 'Abonando...'
                                : 'Abonar'}
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Observación
                          </label>
                          <input
                            type="text"
                            value={paymentObservation}
                            onChange={(e) =>
                              setPaymentObservation(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Comentario del abono (opcional)"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Imagen del abono (comprobante)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePaymentImageChange}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                          {paymentImagePreview && (
                            <div className="mt-2 inline-block">
                              <Image
                                src={paymentImagePreview}
                                alt="Vista previa del comprobante"
                                width={80}
                                height={80}
                                className="rounded-md object-cover"
                              />
                            </div>
                          )}
                        </div>
                        {paymentError && (
                          <p className="mt-2 text-sm text-red-600">
                            {paymentError}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-gray-600">Subtotal:</span>
                          <p className="font-medium">
                            {formatPrice(invoice.subtotal)}
                          </p>
                        </div>
                        {invoice.discount > 0 && (
                          <div>
                            <span className="text-gray-600">Descuento:</span>
                            <p className="font-medium text-red-600">
                              -{formatPrice(invoice.discount)}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <p className="font-bold">
                            {formatPrice(invoice.total)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Abonado:</span>
                          <p className="font-medium text-green-600">
                            {formatPrice(invoice.paidAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Saldo:</span>
                          <p
                            className={`font-bold ${invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {formatPrice(invoice.balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl p-2">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 text-center w-full">
                Confirmar eliminación
              </h3>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              ¿Está seguro que desea eliminar la factura{' '}
              <span className="font-semibold">
                {
                  invoices.find((inv) => inv._id === deleteConfirmId)
                    ?.invoiceNumber
                }
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => deleteInvoice(deleteConfirmId, e)}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePaymentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl p-2">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 text-center w-full">
                Confirmar eliminación de abono
              </h3>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              ¿Está seguro que desea eliminar el abono por{' '}
              <span className="font-semibold">
                {formatPrice(deletePaymentConfirm.amount)}
              </span>
              ? El saldo de la factura se recalculará sin este abono. Esta
              acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeletePayment}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={deletePayment}
                disabled={isDeletingPayment}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {isDeletingPayment ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-50 rounded-full bg-red-600 p-2 text-white shadow-lg transition-colors hover:bg-red-500"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative z-10">
            <Image
              src={selectedImage}
              alt="Factura ampliada"
              width={1200}
              height={1600}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {selectedPrintInvoice && (
        <InvoicePrintView
          invoice={selectedPrintInvoice}
          onClose={() => setSelectedPrintInvoice(null)}
        />
      )}
    </div>
  );
}
