import React, { useState, useEffect } from 'react';
import { createChatSession, sendQuestionToGemini } from '../lib/gemini';
import { preloadedDocuments } from '../lib/loadPrevmais';
import './Chat.css';

function Chat() {
  const [chatSession, setChatSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Inicializa a sessão de chat
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        // Tenta criar a sessão de chat
        const session = createChatSession();
        setChatSession(session);
        setInitialized(true);
        setLoading(false);
        
        // Adiciona uma mensagem de boas-vindas
        setConversations([
          { 
            role: 'assistant', 
            content: 'Olá! Sou o assistente especializado no plano PREVMAIS da Economus. Como posso ajudar você hoje? Você pode perguntar sobre benefícios, eligibilidade, contribuições, ou qualquer outro aspecto do plano.' 
          }
        ]);
      } catch (err) {
        console.error('Erro ao criar sessão de chat:', err);
        setError('Erro ao inicializar o chatbot. Por favor, verifique sua conexão e tente novamente.');
        setLoading(false);
      }
    };

    initChat();
  }, []);

  // Função para enviar a pergunta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !chatSession || loading) return;
    
    // Adicionar pergunta do usuário à conversa
    setConversations(prev => [
      ...prev, 
      { role: 'user', content: question }
    ]);
    
    // Limpar o campo de pergunta
    const questionText = question;
    setQuestion('');
    
    try {
      setLoading(true);
      
      // Enviar a pergunta ao Gemini com os documentos precarregados
      const response = await sendQuestionToGemini(chatSession, questionText, preloadedDocuments);
      
      // Adicionar resposta do assistente à conversa
      setConversations(prev => [
        ...prev, 
        { role: 'assistant', content: response }
      ]);
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(`Erro ao enviar mensagem: ${err.message}`);
      setLoading(false);
      
      // Adicionar mensagem de erro à conversa
      setConversations(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente ou reformule sua pergunta.' 
        }
      ]);
    }
  };

  // Lidar com a tecla Enter para envio
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Função para reiniciar o chat em caso de erro
  const handleRestart = () => {
    setError(null);
    setConversations([]);
    setQuestion('');
    setLoading(true);
    
    try {
      const session = createChatSession();
      setChatSession(session);
      setLoading(false);
      
      // Adiciona uma mensagem de boas-vindas
      setConversations([
        { 
          role: 'assistant', 
          content: 'Chat reiniciado. Como posso ajudar você com o plano PREVMAIS?' 
        }
      ]);
    } catch (err) {
      console.error('Erro ao reiniciar sessão de chat:', err);
      setError('Não foi possível reiniciar o chat. Por favor, recarregue a página.');
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Assistente PREVMAIS</h1>
        <p>Especialista em Previdência Privada Economus - PREVMAIS</p>
      </div>
      
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <div>
            <button onClick={handleRestart} className="restart-button">Reiniciar Chat</button>
            <button onClick={() => setError(null)} className="close-button">×</button>
          </div>
        </div>
      )}
      
      <div className="chat-messages">
        {!initialized && !error ? (
          <div className="initializing">
            <div className="loading-spinner"></div>
            <p>Inicializando assistente...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="welcome-message">
            <h2>Bem-vindo ao Assistente PREVMAIS</h2>
            <p>Faça perguntas sobre o plano de previdência PREVMAIS da Economus.</p>
            <p>Exemplos de perguntas:</p>
            <ul>
              <li>Qual a idade mínima para aposentadoria no plano PREVMAIS?</li>
              <li>Como funciona o benefício de pensão por morte?</li>
              <li>Quais são os requisitos para o autopatrocínio?</li>
              <li>Qual o valor do benefício mínimo?</li>
              <li>Como funciona o resgate de contribuições?</li>
            </ul>
          </div>
        ) : (
          conversations.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        
        {loading && initialized && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Processando sua pergunta...</p>
          </div>
        )}
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta sobre o plano PREVMAIS..."
          disabled={loading || !initialized}
        />
        <button 
          type="submit" 
          disabled={loading || !question.trim() || !initialized}
          className={loading ? 'loading-button' : ''}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      
      <div className="chat-footer">
        <p>PREVMAIS - Plano de Previdência Complementar da Economus</p>
        <button onClick={handleRestart} className="restart-link">
          Reiniciar conversa
        </button>
      </div>
    </div>
  );
}

export default Chat;