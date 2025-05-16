import React from 'react';
import ReactMarkdown from 'react-markdown';

const Message = ({ message }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? 'bg-[#5d576b]' : 'bg-gradient-to-br from-[#ed6a5a] to-[#9bc1bc]'
          }`}>
            {isUser ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
          </div>
        </div>
        
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-[#5d576b] text-white' 
            : 'bg-white shadow-sm border border-[#9bc1bc]'
        }`}>
          <div className={`text-xs font-medium mb-1 ${
            isUser ? 'text-[#f4f1bb]' : 'text-[#ed6a5a]'
          }`}>
            {isUser ? 'Você' : 'Assistente PrevMais'}
          </div>
          <div className={`prose prose-sm max-w-none ${
            isUser ? 'text-white' : 'text-[#5d576b]'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap break-words m-0">{content}</p>
            ) : (
              <ReactMarkdown 
                className="whitespace-pre-wrap break-words"
                components={{
                  p: ({node, ...props}) => <p className="m-0 mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-2 ml-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-2 ml-4" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-[#5d576b]" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-[#ed6a5a]" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;