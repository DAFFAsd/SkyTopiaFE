'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiLoader, FiMessageCircle } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import type { ChatMessage } from '../types';

export default function ChatbotPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [threadId, setThreadId] = useState<string>('');
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initializeChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initializeChat = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const response = await fetch('http://localhost:3000/api/chatbot/new', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setThreadId(data.threadId);
                setMessages([{
                    role: 'assistant',
                    content: 'Halo! Saya adalah asisten SkyTopia. Saya dapat membantu Anda dengan informasi tentang anak Anda, jadwal, pembayaran, dan laporan perkembangan. Ada yang bisa saya bantu?',
                    timestamp: new Date()
                }]);
            } else {
                setError(data.message || 'Gagal memulai chat');
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            setError('Terjadi kesalahan saat memulai chat');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !threadId) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const response = await fetch(`http://localhost:3000/api/chatbot/${threadId}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();
            if (data.success) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(data.message || 'Gagal mengirim pesan');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <PageHeader title="Chatbot Asisten" />

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700 mb-4">
                    {error}
                </div>
            )}

            <div className="flex-1 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col mt-6">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-lg p-4 ${
                                message.role === 'user' 
                                    ? 'bg-brand-purple text-white' 
                                    : 'bg-gray-100 text-gray-900'
                            }`}>
                                {message.role === 'assistant' && (
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FiMessageCircle className="h-4 w-4" />
                                        <span className="text-xs font-semibold">Asisten SkyTopia</span>
                                    </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                                    {message.timestamp.toLocaleTimeString('id-ID', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-4">
                                <FiLoader className="h-5 w-5 animate-spin text-brand-purple" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ketik pesan Anda..."
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            disabled={isLoading || !threadId}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading || !threadId}
                            className="rounded-md bg-brand-purple px-6 py-2 text-white hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            <FiSend className="h-5 w-5" />
                            <span>Kirim</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}