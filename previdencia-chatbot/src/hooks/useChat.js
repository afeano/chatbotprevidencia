import { useState, useEffect, useCallback, useRef } from 'react';
import { createChatSession, createContextFromDocuments, sendQuestionToGemini } from '../lib/gemini';

const useChat = (documents = []) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Referência para sessão de chat do Gemini
  const chatSessionRef = useRef(null);
  
  // Inicializa a sessão de chat quando os documentos mudam
  useEffect(() => {
    try {
      if (documents.length > 0 && !chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
      }
    } catch (err) {
      console.error('Erro ao criar sessão de chat:', err);
      setError('Falha ao inicializar o chat. Verifique se a API key do Gemini está configurada corretamente.');
    }
  }, [documents]);

  // Função para enviar mensagem
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;
    
    // Verifica se há documentos carregados
    if (documents.length === 0) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content },
        { 
          role: 'assistant', 
          content: 'Por favor, carregue arquivos de acordos coletivos antes de fazer perguntas. Preciso analisar esses documentos para poder responder adequadamente.' 
        }
      ]);
      return;
    }
    
    // Verifica se a sessão de chat foi iniciada
    if (!chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (err) {
        console.error('Erro ao criar sessão de chat:', err);
        setError('Falha ao inicializar o chat. Verifique se a API key do Gemini está configurada corretamente.');
        return;
      }
    }
    
    // Adiciona a mensagem do usuário ao histórico
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Cria o contexto a partir dos documentos carregados
      const context = createContextFromDocuments(documents);
      
      // Envia a pergunta para o Gemini
      const response = await sendQuestionToGemini(chatSessionRef.current, content, context);
      
      // Adiciona a resposta ao histórico
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(`Erro ao obter resposta: ${err.message}`);
      
      // Adiciona uma mensagem de erro ao histórico
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  // Função para limpar o histórico de mensagens
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Função para reiniciar a sessão do chat
  const resetChat = useCallback(() => {
    chatSessionRef.current = null;
    
    if (documents.length > 0) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (err) {
        console.error('Erro ao reiniciar sessão de chat:', err);
        setError('Falha ao reiniciar o chat.');
      }
    }
    
    clearMessages();
  }, [documents, clearMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    resetChat
  };
};

export default useChat;
