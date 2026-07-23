import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Leaf, Box } from 'lucide-react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';
import type { Product } from '@/lib/models/ProductModel';

export const dynamic = 'force-dynamic';

const ProductDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await dbConnect();
  const product: Product | null = await ProductModel.findById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative px-6 sm:px-12 lg:px-20 py-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold">Volver al catálogo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="px-6 sm:px-12 lg:px-20 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Image Column */}
            <div className="relative rounded-3xl overflow-hidden border border-green-500/20 bg-gray-950">
              {product.image ? (
                <div className="relative aspect-square w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Leaf className="w-32 h-32 text-green-500/40" />
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3">
                  {product.stock > 0 ? (
                    <span className="text-sm px-4 py-1.5 rounded-full bg-green-500/20 text-green-300 font-medium border border-green-500/30">
                      Disponible
                    </span>
                  ) : (
                    <span className="text-sm px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                      Agotado
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Descripción
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Box className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock disponible</p>
                    <p className="text-xl font-bold text-white">{product.stock} unidades</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
