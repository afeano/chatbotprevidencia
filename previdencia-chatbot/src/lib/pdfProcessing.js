// Arquivo para processamento de PDFs
// src/lib/pdfProcessing.js

import * as pdfjsLib from 'pdfjs-dist';

/**
 * Processa um arquivo PDF e extrai o texto
 * @param {File} file - Arquivo PDF para processamento
 * @returns {Promise<string>} - Texto extraído do PDF
 */
export const processPdf = async (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        
        // Extrai texto de cada página
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Concatena o texto de todos os itens desta página
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        resolve(fullText);
      } catch (error) {
        console.error('Erro ao processar PDF:', error);
        reject(error);
      }
    };
    
    fileReader.onerror = (error) => {
      console.error('Erro ao ler arquivo:', error);
      reject(error);
    };
    
    // Lê o arquivo como ArrayBuffer
    fileReader.readAsArrayBuffer(file);
  });
};