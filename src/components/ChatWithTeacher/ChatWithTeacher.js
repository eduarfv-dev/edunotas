import React, { useState, useEffect, useRef } from 'react';
import './ChatWithTeacher.css'; 

function ChatWithTeacher({ onBack }) { 
  const [messages, setMessages] = useState([
    { id: 1, sender: 'professor', text: 'Hola, ¿en qué puedo ayudarte hoy?' },
    { id: 2, sender: 'student', text: 'Hola profe, tengo una duda sobre la última tarea.' },
    { id: 3, sender: 'professor', text: 'Claro, dime cuál es tu duda.' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); 

  const scrollToBottom = () => {
    //messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });//
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault(); 
    if (newMessage.trim() === '') return; 

    const studentMessage = {
      id: Date.now(), 
      sender: 'student',
      text: newMessage,
    };

    setMessages(prevMessages => [...prevMessages, studentMessage]);
    setNewMessage(''); 

    setTimeout(() => {
      const professorResponse = {
        id: Date.now() + 1,
        sender: 'professor',
        text: 'Entendido. Déjame revisar eso...' 
      };
      setMessages(prevMessages => [...prevMessages, professorResponse]);
    }, 1500); 
  };

  return (
    <div className="chat-view-container"> 
      <button onClick={onBack} className="chat-back-button">
        <i className='bx bx-arrow-back' style={{ marginRight: '5px' }}></i> 
        Regresar
      </button>

      <div className="chat-content">
        <h2 className="chat-title">Chat con Profesor</h2>
        
        <div className="chat-messages">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-message chat-message-${msg.sender}`} 
            >
              <span className="message-text">{msg.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} /> 
        </div>
        
        <form className="chat-input-area" onSubmit={handleSendMessage}> 
          <input 
            type="text" 
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={handleInputChange}
            aria-label="Mensaje nuevo"
          />
          <button type="submit">
            <i className='bx bxs-send'></i> 
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWithTeacher;
