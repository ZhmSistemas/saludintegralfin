'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, FlaskConical, Leaf, Droplets, Sprout } from 'lucide-react';
import ProductModal from './ProductModal';
import type { Product } from '@/lib/models/ProductModel';

const colorPalette = [
  { color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  { color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  { color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
  { color: 'from-violet-500 to-purple-600', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  { color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { color: 'from-rose-500 to-pink-600', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
];

const icons = [
  <FlaskConical className="w-8 h-8" />,
  <Leaf className="w-8 h-8" />,
  <Droplets className="w-8 h-8" />,
  <Sprout className="w-8 h-8" />,
];

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => {
          const palette = colorPalette[index % colorPalette.length];
          const icon = icons[index % icons.length];

          return (
            <div
              key={product._id}
              className={`group relative rounded-2xl ${palette.bgColor} ${palette.borderColor} border p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer`}
              onClick={() => setSelectedProduct(product)}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${palette.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

              <div className="relative z-10">
                {product.image ? (
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-5 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${palette.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {icon}
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-end mb-5">
                  {product.stock > 0 ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 font-medium border border-green-500/30">
                      Disponible
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                      Agotado
                    </span>
                  )}
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold text-white bg-linear-to-r ${palette.color} hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                >
                  Ver Producto
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;
