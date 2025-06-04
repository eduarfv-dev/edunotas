import React, { useState, useEffect, useRef } from 'react';
import './ChatProfesorVista.css'; 

// --- DATOS DE PRUEBA PARA CHATS ---
const MOCK_CHAT_CONTACTS = [
  {
    id: 'student001',
    studentName: 'Ana Pérez',
    avatar: 'https://via.placeholder.com/40/FFC107/000000?Text=AP', // Placeholder avatar
    lastMessage: '¡Gracias, profesor! Entendido.',
    timestamp: '10:30 AM',
    unreadCount: 0,
    messages: [
      { id: 'msg1', sender: 'student', text: 'Profesor, tengo una duda sobre la tarea 3.', timestamp: 'Ayer 09:15 AM' },
      { id: 'msg2', sender: 'teacher', text: 'Hola Ana, dime cuál es tu duda.', timestamp: 'Ayer 09:20 AM' },
      { id: 'msg3', sender: 'student', text: 'No entiendo el último ejercicio.', timestamp: 'Ayer 09:22 AM' },
      { id: 'msg4', sender: 'teacher', text: 'Claro, se refiere a aplicar el teorema de Bayes. Revisa la página 45 del libro.', timestamp: 'Ayer 09:25 AM' },
      { id: 'msg5', sender: 'student', text: '¡Gracias, profesor! Entendido.', timestamp: '10:30 AM' },
    ],
  },
  {
    id: 'student002',
    studentName: 'Carlos Ruiz',
    avatar: 'https://via.placeholder.com/40/4CAF50/FFFFFF?Text=CR',
    lastMessage: '¿Podría revisar mi avance del proyecto?',
    timestamp: '09:15 AM',
    unreadCount: 2,
    messages: [
      { id: 'msg6', sender: 'student', text: 'Buenos días, profesor.', timestamp: '09:00 AM' },
      { id: 'msg7', sender: 'student', text: '¿Podría revisar mi avance del proyecto?', timestamp: '09:15 AM' },
    ],
  },
  {
    id: 'student003',
    studentName: 'Laura Gómez',
    avatar: 'https://via.placeholder.com/40/E91E63/FFFFFF?Text=LG',
    lastMessage: 'Ok, lo envío en un momento.',
    timestamp: 'Ayer',
    unreadCount: 0,
    messages: [
      { id: 'msg8', sender: 'teacher', text: 'Laura, por favor recuerda enviar el documento firmado.', timestamp: 'Ayer 03:00 PM' },
      { id: 'msg9', sender: 'student', text: 'Ok, lo envío en un momento.', timestamp: 'Ayer 03:05 PM' },
    ],
  },
];
// --- FIN DE DATOS DE PRUEBA ---

function TeacherChatView({ onBack }) { 
  const [chatContacts, setChatContacts] = useState(MOCK_CHAT_CONTACTS);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); // Para auto-scroll

  useEffect(() => {
    // Cargar mensajes del chat seleccionado
    if (selectedChatId) {
      const selectedContact = chatContacts.find(contact => contact.id === selectedChatId);
      if (selectedContact) {
        setCurrentMessages(selectedContact.messages);
        // Marcar mensajes como leídos (simulación)
        setChatContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === selectedChatId ? { ...contact, unreadCount: 0 } : contact
          )
        );
      }
    } else {
      setCurrentMessages([]);
    }
  }, [selectedChatId, chatContacts]);

  useEffect(() => {
    // Auto-scroll al final de los mensajes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  const handleSelectChat = (studentId) => {
    setSelectedChatId(studentId);
  };

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;

    const newMsgObject = {
      id: `msg${Date.now()}`,
      sender: 'teacher', // El profesor siempre envía
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Actualizar el estado de los contactos y los mensajes actuales
    setChatContacts(prevContacts =>
      prevContacts.map(contact => {
        if (contact.id === selectedChatId) {
          return {
            ...contact,
            messages: [...contact.messages, newMsgObject],
            lastMessage: newMsgObject.text,
            timestamp: newMsgObject.timestamp,
          };
        }
        return contact;
      })
    );
    // setCurrentMessages(prevMessages => [...prevMessages, newMsgObject]); // Se actualiza por el useEffect
    setNewMessage('');
  };

  const selectedChatDetails = chatContacts.find(c => c.id === selectedChatId);

  return (
    <div className="teacher-chat-container">
      <button onClick={onBack} className="teacher-chat-back-button">
        <i className='bx bx-arrow-back' style={{ marginRight: '5px' }}></i>
        Regresar
      </button>
      <div className="teacher-chat-layout">
        {/* Lista de Contactos de Chat */}
        <div className="teacher-chat-sidebar">
          <div className="teacher-chat-sidebar-header">
            <h3>Chats Recientes</h3>
          </div>
          <ul className="teacher-chat-contact-list">
            {chatContacts.map(contact => (
              <li 
                key={contact.id} 
                className={`teacher-chat-contact-item ${selectedChatId === contact.id ? 'active' : ''}`}
                onClick={() => handleSelectChat(contact.id)}
              >
                <img src={contact.avatar} alt={contact.studentName} className="teacher-chat-avatar" />
                <div className="teacher-chat-contact-info">
                  <span className="teacher-chat-contact-name">{contact.studentName}</span>
                  <span className="teacher-chat-contact-lastmsg">{contact.lastMessage}</span>
                </div>
                <div className="teacher-chat-contact-meta">
                  <span className="teacher-chat-contact-time">{contact.timestamp}</span>
                  {contact.unreadCount > 0 && (
                    <span className="teacher-chat-unread-badge">{contact.unreadCount}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Ventana de Chat Principal */}
        <div className="teacher-chat-main">
          {selectedChatId && selectedChatDetails ? (
            <>
              <div className="teacher-chat-main-header">
                <img src={selectedChatDetails.avatar} alt={selectedChatDetails.studentName} className="teacher-chat-avatar-large" />
                <h3>{selectedChatDetails.studentName}</h3>
                {/* Podrías añadir más info o acciones aquí */}
              </div>
              <div className="teacher-chat-messages-area">
                {currentMessages.map(msg => (
                  <div key={msg.id} className={`teacher-chat-message ${msg.sender === 'teacher' ? 'sent' : 'received'}`}>
                    <p className="teacher-chat-message-text">{msg.text}</p>
                    <span className="teacher-chat-message-time">{msg.timestamp}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Elemento para auto-scroll */}
              </div>
              <form className="teacher-chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Escribe un mensaje..." 
                  value={newMessage}
                  onChange={handleNewMessageChange}
                />
                <button type="submit">
                  <i className='bx bxs-send'></i> Enviar
                </button>
              </form>
            </>
          ) : (
            <div className="teacher-chat-placeholder-main">
              <i className='bx bx-message-rounded-dots' style={{ fontSize: '60px', color: '#ccc' }}></i>
              <p>Selecciona un chat para comenzar a conversar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TeacherChatView;