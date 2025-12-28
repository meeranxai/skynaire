
import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../contexts/AuthContext';

const AIChatBot = () => {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Greetings! I am G-Net Genie 🧞‍♂️. How can I assist you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/autonomous/support/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    userContext: {
                        name: currentUser?.displayName || 'User'
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
            } else {
                throw new Error("Genie is resting...");
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "I'm having a little trouble connecting to the magic dimension. Try again in a moment! ✨" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-chatbot-container" style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1500,
            fontFamily: 'var(--font-primary)'
        }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window" style={{
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'var(--background-elevated)',
                    borderRadius: '24px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--border-light)',
                    marginBottom: '20px',
                    animation: 'slideIn 0.3s ease-out',
                    backdropFilter: 'blur(20px)'
                }}>
                    {/* Header */}
                    <div className="chat-header" style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div className="flex items-center gap-3">
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px'
                            }}>
                                🧞‍♂️
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>G-Net Genie</div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>AI Support Assistant</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="chat-messages" style={{
                        flex: 1,
                        padding: '20px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                padding: '12px 16px',
                                borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                fontSize: '14px',
                                lineHeight: '1.4',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{
                                alignSelf: 'flex-start',
                                padding: '12px 16px',
                                borderRadius: '18px 18px 18px 2px',
                                backgroundColor: 'var(--bg-secondary)',
                                display: 'flex',
                                gap: '4px'
                            }}>
                                <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-tertiary)', animation: 'bounce 1.4s infinite' }}></div>
                                <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-tertiary)', animation: 'bounce 1.4s infinite 0.2s' }}></div>
                                <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-tertiary)', animation: 'bounce 1.4s infinite 0.4s' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '15px',
                        borderTop: '1px solid var(--border-light)',
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1,
                                border: '1px solid var(--border-light)',
                                borderRadius: '12px',
                                padding: '10px 15px',
                                background: 'var(--background-elevated)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <i className="fas fa-times"></i> : <span>🧞‍♂️</span>}
            </button>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
};

export default AIChatBot;
