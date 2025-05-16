import { GoogleGenerativeAI } from '@google/generative-ai';
import { processRegulamento, findRelevantSections } from './documentProcessor';

// Arquivo de configuração para a chave API
const config = {
  GEMINI_API_KEY: 'AIzaSyC7inXim5hZeNwQ_GiX_HLEqSG61Abqty8'
};

// Inicializa a API do Google Generative AI
const getGeminiClient = () => {
  const apiKey = config.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'CHAVE_INVÁLIDA') {
    throw new Error('API Key do Google Gemini não encontrada. Por favor, configure a variável de ambiente VITE_GEMINI_API_KEY ou atualize o arquivo src/config.js com sua chave API.');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Cria um modelo Gemini configurado para responder sobre Previdência Privada Economus - PREVMAIS
 * @returns {Object} - Modelo configurado
 */
export const createGeminiModel = () => {
  const genAI = getGeminiClient();
  
  // Configura o modelo Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.2,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 1024, // Reduzido para evitar problemas de cota
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  });
  
  return model;
};

/**
 * Prepara o sistema de histórico para o chat
 * @returns {Object} - Sessão de chat do Gemini
 */
export const createChatSession = () => {
  const model = createGeminiModel();
  
  // Configura o histórico inicial com instruções para o modelo
  const systemPrompt = `Você é um assistente especializado em Previdência Privada Economus, com foco no plano PREVMAIS. 
Seu objetivo é responder perguntas sobre este plano de previdência de forma precisa e clara, citando artigos, cláusulas ou seções relevantes quando apropriado.

Diretrizes:
1. Responda apenas com base nos documentos e regulamentos do plano PREVMAIS da Economus que foram carregados no sistema.
2. Quando citar informações, mencione o artigo, seção ou cláusula específica de onde a informação foi extraída.
3. Se a informação solicitada não estiver disponível nos documentos carregados, informe claramente.
4. Use linguagem clara e formal, adequada ao contexto de previdência complementar.
5. Seja preciso com datas, valores, percentuais e regras - nunca invente dados.
6. Evite dar aconselhamento financeiro pessoal - limite-se a explicar as regras do plano.
7. Se uma pergunta for ambígua, peça clarificação.
8. Responda em português brasileiro.

Você é um recurso de consulta confiável para participantes do plano PREVMAIS que precisam entender melhor seus benefícios, direitos e obrigações conforme estabelecido nos regulamentos da Economus.`;

  // Inicia a sessão de chat com o prompt do sistema
  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Sou um assistente especializado no plano PREVMAIS da Previdência Privada Economus. Estou pronto para responder suas perguntas sobre este plano com base nos documentos disponíveis, citando sempre as fontes específicas das informações. Posso ajudar com questões sobre benefícios, contribuições, elegibilidade, regras de aposentadoria, portabilidade, resgate, e outros aspectos do plano. Como posso ajudar você hoje?" }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1024,
    },
  });
};

/**
 * Processa os documentos e cria um contexto para o modelo focado na pergunta do usuário
 * @param {Array} documents - Array de documentos processados
 * @param {String} question - Pergunta do usuário
 * @returns {string} - Contexto formatado para o modelo
 */
export const createContextFromDocuments = (documents, question) => {
  if (!documents || documents.length === 0) {
    return '';
  }
  
  let context = 'DOCUMENTOS DO PLANO PREVMAIS (ECONOMUS):\n\n';
  
  // Processar cada documento no array
  documents.forEach((doc, index) => {
    // Processar o documento em seções
    const sections = processRegulamento(doc);
    
    // Encontrar as seções mais relevantes para a pergunta
    const relevantSections = findRelevantSections(sections, question);
    
    // Adicionar informações do documento
    context += `DOCUMENTO ${index + 1}: ${doc.name}\n\n`;
    
    // Adicionar seções relevantes ao contexto
    relevantSections.forEach(section => {
      context += `SEÇÃO: ${section.title}\n${section.content}\n\n`;
    });
    
    // Se não houver seções relevantes, incluir um resumo do documento
    if (relevantSections.length === 0) {
      context += `Este documento contém o regulamento completo do plano PREVMAIS, incluindo informações sobre benefícios, condições de elegibilidade e formas de pagamento.\n\n`;
    }
    
    context += '-------------------\n\n';
  });
  
  // Adicionar instrução final
  context += '\nResponda com base apenas nas informações acima. Se a informação não estiver disponível nas seções fornecidas, informe claramente.\n';
  
  return context;
};

/**
 * Envia uma pergunta para o modelo com o contexto dos documentos relevantes
 * @param {Object} chatSession - Sessão de chat do Gemini
 * @param {string} question - Pergunta do usuário
 * @param {Array} documents - Array com os documentos disponíveis
 * @returns {Promise<string>} - Resposta do modelo
 */
export const sendQuestionToGemini = async (chatSession, question, documents) => {
  try {
    // Gera contexto específico para a pergunta
    const context = createContextFromDocuments(documents, question);
    
    // Formata a mensagem combinando a pergunta e o contexto
    const message = `${context}\n\nPERGUNTA: ${question}\n\nForneça uma resposta clara, direta e completa baseada apenas nas informações do regulamento PREVMAIS. Cite as seções ou artigos específicos que contêm as informações.`;
    
    // Envia a mensagem para o modelo
    const result = await chatSession.sendMessage(message);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Erro ao enviar pergunta para o Gemini:', error);
    
    // Tenta um fallback com menos contexto se o erro for relacionado a limites
    if (error.message.includes('quota') || error.message.includes('limit')) {
      try {
        console.log('Tentando com contexto reduzido...');
        // Reduz o contexto para apenas uma seção relevante
        const minimalContext = 'REGULAMENTO PREVMAIS:\n\n' + 
          'Artigo 20 - O Benefício de Aposentadoria será concedido ao Participante que atenda aos seguintes requisitos de elegibilidade: a) tenha, no mínimo, 53 (cinquenta e três) anos de idade; b) tenha, no mínimo, 60 (sessenta) meses de Vinculação ao PrevMais e, c) tenha concretizado o Término do Vínculo Empregatício com o Patrocinador.';
        
        const fallbackMessage = `${minimalContext}\n\nPERGUNTA: ${question}`;
        const fallbackResult = await chatSession.sendMessage(fallbackMessage);
        return fallbackResult.response.text();
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        throw new Error(`Não foi possível obter resposta devido a limitações da API. Por favor, tente novamente mais tarde.`);
      }
    }
    
    // Se o erro for específico de modelo não encontrado, tente outro modelo
    if (error.message.includes('not found') || error.message.includes('404')) {
      try {
        console.log('Tentando modelo alternativo...');
        const genAI = getGeminiClient();
        const altModel = genAI.getGenerativeModel({
          model: "gemini-pro", // Modelo alternativo
          generationConfig: { 
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        });
        
        const altResult = await altModel.generateContent(question);
        return altResult.response.text();
      } catch (altError) {
        console.error('Erro com modelo alternativo:', altError);
        throw new Error(`Falha ao obter resposta: ${error.message}. Modelo alternativo também falhou.`);
      }
    }
    
    throw new Error(`Falha ao obter resposta: ${error.message}`);
  }
};