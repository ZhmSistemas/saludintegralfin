'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, FileText } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="bg-blue-600 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="hover:bg-blue-700 px-3 py-2 rounded-md flex items-center"
            >
              <Image
                src="https://res.cloudinary.com/dahpsctzy/image/upload/v1784775353/logo_salud_integral_wsty8q.webp"
                alt="Salud Integral"
                width={100}
                height={30}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Inicio
              </Link>
              <Link
                href="/nosotros"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Nosotros
              </Link>
              <Link
                href="/productos"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Productos
              </Link>
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors"
                  >
                    {session.user?.name?.split(' ')[0]}
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                      <Link
                        href="/usuario/perfil"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <div className="border-t border-gray-200"></div>
                      {session.user?.isAdmin ? (
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/usuario/facturas"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Facturas
                        </Link>
                      )}
                      <div className="border-t border-gray-200"></div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut({ callbackUrl: '/auth/login' });
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sesión
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-800 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menú</span>
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil tipo ventana flotante */}
      {isOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 flex justify-center mt-2 z-20"
          id="mobile-menu"
        >
          <div className="mx-4 w-full max-w-sm bg-blue-600/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/20 overflow-hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {session ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-blue-200 border-b border-blue-500/30">
                    Hola, {session.user?.name?.split(' ')[0]}
                  </div>
                  {session.user?.isAdmin ? (
                    <Link
                      href="/dashboard"
                      className="hover:bg-blue-700/50 block px-3 py-2 rounded-md text-base font-medium text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/usuario/facturas"
                      className="hover:bg-blue-700/50 block px-3 py-2 rounded-md text-base font-medium text-white flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <FileText className="h-4 w-4" />
                      Mis Facturas
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: '/auth/login' });
                    }}
                    className="w-full text-left hover:bg-blue-700/50 px-3 py-2 rounded-md text-base font-medium text-red-300 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="hover:bg-blue-700/50 block px-3 py-2 rounded-md text-base font-medium text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Sesión
                </Link>
              )}
            </div>
            <Link
              href="/"
              className="hover:bg-blue-700/50 block px-3 py-2 rounded-md text-base font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/nosotros"
              className="hover:bg-blue-700/50 block px-3 py-2 rounded-md text-base font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              Nosotros
            </Link>
            <Link
              href="/productos"
              className="hover:bg-blue-700/50 block px-3 py-2 rounded-md text-base font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              Productos
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
