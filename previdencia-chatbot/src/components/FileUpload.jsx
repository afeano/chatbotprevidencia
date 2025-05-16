import { useState, useCallback, useRef } from 'react';
import { processPdf } from '../lib/pdfProcessing';

const FileUpload = ({ onFileUpload, isProcessing, setIsProcessing }) => {
  const [processStatus, setProcessStatus] = useState('');
  const fileInputRef = useRef(null);
  
  const handleFileChange = useCallback(async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Filtra apenas arquivos PDF
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('Por favor, envie apenas arquivos PDF');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('Processando documentos...');
    
    try {
      // Processa cada PDF para extrair texto
      const processedDocs = [];
      
      for (const file of pdfFiles) {
        setProcessStatus(`Processando ${file.name}...`);
        const content = await processPdf(file);
        
        processedDocs.push({
          name: file.name,
          content,
          file
        });
      }
      
      onFileUpload(processedDocs);
      setProcessStatus('Processamento concluído!');
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => {
        setProcessStatus('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao processar os PDFs:', error);
      setProcessStatus('Erro ao processar arquivos.');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload, setIsProcessing]);

  return (
    <div className="mb-4">
      <div className={`border-2 border-dashed rounded-xl p-6 text-center ${isProcessing ? 'border-[#9bc1bc] bg-[#e6ebe0]/30' : 'border-[#5d576b] hover:border-[#ed6a5a] hover:bg-[#f4f1bb]/10'} transition-colors cursor-pointer`}
        onClick={() => !isProcessing && fileInputRef.current?.click()}>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf" 
          multiple 
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-[#5d576b] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-[#5d576b]">{processStatus}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 text-[#5d576b] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-[#5d576b] font-medium mb-1">Carregue documentos do Plano PrevMais</p>
            <p className="text-xs text-[#9bc1bc]">Clique para selecionar ou arraste PDFs aqui</p>
          </div>
        )}
      </div>
      
      {processStatus && !isProcessing && (
        <p className="text-sm text-[#ed6a5a] mt-2 text-center">{processStatus}</p>
      )}
    </div>
  );
};

export default FileUpload;