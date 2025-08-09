import CleanSurvey from '../../components/CleanSurvey';
import CommentsSection from '../../components/CommentsSection';
import Link from 'next/link';

export default function Registro() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header logos estilo banda */}
      <header className="w-full bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-3 sm:px-4 py-3">
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <img src="/loggo.png" alt="Logo" className="h-8 w-8 object-contain" />
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-800 leading-4 text-center">GOBIERNO<br/>ESTADO DE<br/>MÉXICO</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-[11px] sm:text-xs text-orange-600 font-semibold">ESTADO DE MÉXICO</span>
              <div className="text-[11px] sm:text-xs text-orange-500">¡El poder de servir!</div>
            </div>
            <div className="text-center">
              <span className="inline-block bg-rose-700 text-white px-2 py-1 rounded font-bold text-xs">Mujeres con Bienestar</span>
            </div>
          </div>
        </div>
      </header>

      {/* Encabezado de la encuesta */}
      <section className="mx-auto max-w-3xl px-4">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 mt-4 sm:mt-6">
          <div className="p-5 sm:p-6 text-center">
            <h1 className="text-rose-700 font-extrabold text-xl sm:text-2xl tracking-wide">SECRETARÍA DE BIENESTAR</h1>
            <p className="mt-1 text-zinc-600 text-sm sm:text-base">Completa las siguientes preguntas</p>
            <p className="text-zinc-500 text-xs sm:text-sm">| Registro Abierto |</p>
          </div>
        </div>
      </section>

      {/* Contenido principal: encuesta + comentarios */}
      <main className="mx-auto max-w-3xl px-4 py-5 sm:py-8">
        <div className="space-y-6">
          <CleanSurvey />

          <div className="bg-white rounded-xl shadow-md border border-zinc-200">
            <div className="p-4 sm:p-6">
              <h3 className="text-rose-700 font-bold text-center mb-4">Comentarios de usuarios:</h3>
              <CommentsSection />
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-zinc-600 hover:text-rose-700 text-sm">← Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
