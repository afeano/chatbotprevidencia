import { useRef, useEffect } from 'react';
import Message from './Message';

const MessageList = ({ messages = [] }) => {
  const messagesEndRef = useRef(null);

  // Rola para a mensagem mais recente quando mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="py-20 text-center text-[#5d576b]">
        <svg className="w-16 h-16 mx-auto text-[#9bc1bc] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-lg font-medium mb-1">Assistente PrevMais</h3>
        <p className="max-w-md mx-auto">
          Faça perguntas sobre o Plano de Previdência Privada PrevMais-Economus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;