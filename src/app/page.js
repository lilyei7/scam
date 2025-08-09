import Link from 'next/link';
import MujeresConBienestarCard from '../components/MCBCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero: imagen responsiva centrada */}
      <section className="relative w-full bg-red-800">
        <img
          src="/hombrescanada.jpg"
          alt="Mujeres con Bienestar - Gobierno del Estado de México"
          className="w-full h-[220px] sm:h-[300px] md:h-[360px] object-cover object-center"
        />
      </section>

      {/* Tarjeta centrada */}
      <section className="w-full bg-slate-50 py-10 sm:py-14 px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-gray-200 shadow-[0_25px_60px_rgba(0,0,0,0.12),_0_12px_25px_rgba(0,0,0,0.08)]">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
            <div className="relative p-6 sm:p-8 pt-7 sm:pt-9">
              <MujeresConBienestarCard />
            </div>
          </div>
        </div>
      </section>

      {/* Footer simple */}
      <section className="w-full bg-white py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="mb-4">
            <Link href="/">
              <img src="/loggo.png" alt="Logo" className="h-14 sm:h-20 mx-auto object-contain" />
            </Link>
          </div>
          <p className="text-[12px] sm:text-sm leading-5 text-gray-800">
            <Link href="/" className="text-[#9f2241] hover:underline">Inicio</Link>
            <span className="mx-2 text-[#9f2241]">•</span>
            <span className="text-[#9f2241]">Términos y Condiciones</span>
            <span className="mx-2 text-[#9f2241]">•</span>
            <span className="text-[#9f2241]">Aviso de Privacidad</span>
          </p>
        </div>
      </section>
    </main>
  );
}
