import React from 'react';
import {
  Droplets,
  Leaf,
  FlaskConical,
  Sprout,
  ChevronRight,
  ShieldCheck,
  Truck,
  Star
} from 'lucide-react';
import Image from 'next/image';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';
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

const NaturalProducts = async () => {
  await dbConnect();
  const products: Product[] = await ProductModel.find({}).sort({ createdAt: -1 });

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-0"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative px-6 sm:px-12 lg:px-20 py-20 lg:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 backdrop-blur-sm mb-8">
              <Leaf className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-200">Productos 100% Naturales</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-green-400 via-emerald-400 to-teal-400">
                Salud Integral
              </span>
              <br />
              <span className="text-white">Naturaleza Pura</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
              Descubre nuestra línea de productos naturales seleccionados para tu bienestar integral
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-12">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span>Calidad Certificada</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-400" />
                <span>Envío en 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>4.9 Estrellas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="relative py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nuestros <span className="bg-clip-text text-transparent bg-linear-to-r from-green-400 to-emerald-400">Productos</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Cada producto está formulado con ingredientes naturales de la más alta calidad
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <Leaf className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Próximamente tendremos productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => {
                const palette = colorPalette[index % colorPalette.length];
                const icon = icons[index % icons.length];

                return (
                  <div
                    key={product._id}
                    className={`group relative rounded-2xl ${palette.bgColor} ${palette.borderColor} border p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden`}
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
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-5">
                        <span className={`text-2xl font-black bg-clip-text text-transparent bg-linear-to-r ${palette.color}`}>
                          ${product.price.toFixed(2)}
                        </span>
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

                      <button className={`w-full py-3 rounded-lg font-semibold text-white bg-linear-to-r ${palette.color} hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3`}>
                        Ver Producto
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative py-20 px-6 sm:px-12 lg:px-20 bg-linear-to-r from-green-900/20 to-emerald-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">
                ¿Por qué elegir <span className="bg-clip-text text-transparent bg-linear-to-r from-green-400 to-emerald-400">Salud Integral</span>?
              </h2>

              <div className="space-y-5">
                {[
                  'Ingredientes 100% naturales y orgánicos',
                  'Procesos de extracción de alta tecnología',
                  'Laboratorios certificados y regulados',
                  'Garantía de satisfacción o devolución',
                  'Envío discreto y seguro a todo el país',
                  'Atención personalizada especializada'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300 text-lg group-hover:text-white transition-colors duration-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-96 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-3xl border border-green-500/20"></div>

              <div className="relative z-10 text-center px-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-400 mb-3">
                  +10 Años
                </div>
                <p className="text-gray-300 text-lg">de experiencia en productos naturales</p>
                <div className="mt-6 inline-block px-6 py-3 rounded-full bg-green-500/20 border border-green-500/50 text-green-300 font-semibold">
                  Confianza Comprobada
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-linear-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-4">
              Transforma tu bienestar hoy
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Únete a miles de clientes satisfechos que ya confían en Salud Integral
            </p>
            <button className="px-10 py-4 rounded-lg font-bold text-lg bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Explorar Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalProducts;
