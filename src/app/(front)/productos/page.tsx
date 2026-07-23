import React from 'react';
import Image from 'next/image';
import { Leaf, Package } from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';
import type { Product } from '@/lib/models/ProductModel';

export const dynamic = 'force-dynamic';

const colorPalette = [
  { color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  { color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  { color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
  { color: 'from-violet-500 to-purple-600', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  { color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { color: 'from-rose-500 to-pink-600', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
];

const ProductosPage = async () => {
  await dbConnect();
  const products: Product[] = await ProductModel.find({}).sort({ createdAt: -1 });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative px-6 sm:px-12 lg:px-20 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 backdrop-blur-sm mb-6">
              <Package className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-200">Catálogo Completo</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-green-400 via-emerald-400 to-teal-400">
                Nuestros Productos
              </span>
            </h1>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Explora nuestra selección de productos naturales para tu salud y bienestar
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-6 sm:px-12 lg:px-20 pb-20">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-24">
              <Leaf className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3">No hay productos disponibles</h2>
              <p className="text-gray-400 text-lg">Próximamente agregaremos productos a nuestro catálogo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => {
                const palette = colorPalette[index % colorPalette.length];

                return (
                  <div
                    key={product._id}
                    className={`group relative rounded-2xl ${palette.bgColor} ${palette.borderColor} border overflow-hidden hover:shadow-xl transition-all duration-500`}
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-linear-to-br ${palette.color} flex items-center justify-center`}>
                          <Leaf className="w-16 h-16 text-white/80" />
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                          Agotado
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-end">
                        {product.stock > 0 && (
                          <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-medium border border-green-500/30">
                            En stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductosPage;
