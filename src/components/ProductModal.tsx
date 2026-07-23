'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Leaf, Package, Box } from 'lucide-react';
import type { Product } from '@/lib/models/ProductModel';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl my-8 bg-gray-950 border border-green-500/30 rounded-3xl overflow-y-auto shadow-2xl shadow-green-500/10 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-green-500/50 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative h-72 sm:h-80 w-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-24 h-24 text-green-500/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="px-8 pb-8 -mt-16 relative z-10">
          <h2 className="text-3xl font-black text-white mb-2">
            {product.name}
          </h2>

          <div className="flex items-center gap-3 mb-6">
            {product.stock > 0 ? (
              <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-medium border border-green-500/30">
                Disponible
              </span>
            ) : (
              <span className="text-sm px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                Agotado
              </span>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Descripción
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Box className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Stock</p>
                <p className="text-sm font-bold text-white">{product.stock} unidades</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
