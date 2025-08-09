'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285A41.059 41.059 0 019.664 1.319zM6.75 10.354a.75.75 0 00-1.5 0v2.718c0 .414.336.75.75.75h1.5a.75.75 0 000-1.5h-.75v-1.968z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900">Ayuda Comunitaria</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link 
              href="/"
              className={`transition-colors duration-200 ${
                pathname === '/' 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inicio
            </Link>
            <Link 
              href="/registro"
              className={`transition-colors duration-200 ${
                pathname === '/registro' 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Registro
            </Link>
            <Link 
              href="/registro"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Solicitar Ayuda
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
