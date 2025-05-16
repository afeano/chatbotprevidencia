import { useState, useEffect } from 'react'
import Chat from './components/Chat'
import { preloadedDocuments } from './lib/loadPrevMais'

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    setDocuments(preloadedDocuments);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6ebe0] to-[#9bc1bc] flex flex-col">
      <header className="bg-gradient-to-r from-[#5d576b] to-[#ed6a5a] text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Ícone representativo com animação suave */}
              <div className="bg-white p-2 rounded-lg shadow-md transition-transform hover:scale-105">
                <svg className="h-12 w-12 text-[#5d576b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  Assistente PrevMais
                </h1>
                <p className="text-sm md:text-base text-[#f4f1bb] font-medium">
                  Especialista em Previdência Privada Economus
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-90 border-t-4 border-[#ed6a5a] transition-all hover:shadow-2xl">
            {isLoading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-12 w-12 text-[#5d576b] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-[#5d576b] text-lg">Carregando informações sobre o Plano PrevMais...</p>
              </div>
            ) : (
              <Chat documents={documents} />
            )}
          </div>
          
          <div className="mt-6 text-center text-[#5d576b] bg-white/50 rounded-lg p-4 shadow-md">
            <p className="text-sm">
              Este assistente utiliza inteligência artificial para responder suas dúvidas sobre o Plano PrevMais-Economus.
              As informações são baseadas no regulamento oficial disponibilizado.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-[#5d576b] to-[#9bc1bc] text-white py-6 mt-auto border-t-4 border-[#ed6a5a]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="font-medium mb-1">Plano PrevMais - Economus</p>
              <p className="text-[#f4f1bb] text-sm">© {new Date().getFullYear()} - Todos os direitos reservados</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App