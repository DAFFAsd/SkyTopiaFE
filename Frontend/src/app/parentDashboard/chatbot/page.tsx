'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiSend, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi';
import Image from 'next/image'; 

interface Session {
    _id: string;
    thread_id: string;
    title?: string;
    updated_at: string;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    }

    interface ChatHistory {
    _id: string;
    thread_id: string;
    user_id: string;
    title?: string;
    messages: Message[];
    }

    export default function ChatbotPage() {

    const [sessions, setSessions] = useState<Session[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    
    const [newMessage, setNewMessage] = useState('');
    
    const [isLoadingHistory, setIsLoadingHistory] = useState(false); 
    const [isLoadingSessions, setIsLoadingSessions] = useState(true); 
    const [isSending, setIsSending] = useState(false); 
    const [error, setError] = useState('');

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan');
        
        const response = await fetch('http://localhost:3000/api/chatbot/sessions', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (data.success) {
            setSessions(data.data);
        } else {
            throw new Error(data.message || 'Gagal mengambil sesi chat');
        }
        } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        } finally {
        setIsLoadingSessions(false);
        }
    };

    const fetchChatHistory = async (threadId: string) => {
        setActiveThreadId(threadId);
        setIsLoadingHistory(true);
        setMessages([]);
        try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan');

        const response = await fetch(`http://localhost:3000/api/chatbot/history/${threadId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        
        const data: { success: boolean, data: ChatHistory, message?: string } = await response.json();
        
        if (data.success) {
            setMessages(data.data.messages);
        } else {
            throw new Error(data.message || 'Gagal mengambil riwayat chat');
        }
        } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        } finally {
        setIsLoadingHistory(false);
        }
    };

    const handleNewChat = () => {
        setActiveThreadId(null);
        setMessages([]);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        setError('');
        const userMessageContent = newMessage;
        setNewMessage(''); 

        setMessages(prev => [...prev, { role: 'user', content: userMessageContent }]);

        try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan');
        
        let response;
        
        if (activeThreadId) {
            response = await fetch(`http://localhost:3000/api/chatbot/${activeThreadId}/message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessageContent }),
            });
        } else {
            response = await fetch('http://localhost:3000/api/chatbot/new', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessageContent }),
            });
        }

        const data = await response.json();

        if (data.success) {
            setMessages(prev => [...prev, { role: 'assistant', content: data.response.message }]);
            
            if (!activeThreadId) {
            setActiveThreadId(data.thread_id);
            fetchSessions();
            }
        } else {
            throw new Error(data.message || 'Gagal mengirim pesan');
        }
        
        } catch (err: unknown) {
        let errorMessage = "Terjadi kesalahan";
        if (err instanceof Error) errorMessage = err.message;
        setError(errorMessage);
        } finally {
        setIsSending(false);
        }
    };

    const handleDeleteSession = async (e: React.MouseEvent, threadId: string) => {
        e.stopPropagation();
        if (!confirm('Yakin mau hapus sesi obrolan ini?')) return;

        try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan');
        
        await fetch(`http://localhost:3000/api/chatbot/${threadId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        setSessions(prev => prev.filter(s => s.thread_id !== threadId));
        if (activeThreadId === threadId) {
            handleNewChat();
        }
        } catch (err: unknown) {
        if (err instanceof Error) alert(err.message);
        }
    };

    useEffect(() => {
        chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
        });
    }, [messages]);

    useEffect(() => {
        fetchSessions();
    }, []); 

    return (
        <div className="space-y-6 flex flex-col h-full"> 
        <Link
            href="/parentDashboard"
            className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
        >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>

        <h1 className="text-3xl font-bold text-brand-purple">
            Chatbot SkyTopia
        </h1>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <button 
                onClick={handleNewChat}
                className="w-full flex items-center justify-center space-x-2 rounded-lg bg-login-pink py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
                >
                <FiPlus className="h-5 w-5" />
                <span>Mulai Obrolan Baru</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoadingSessions ? (
                <div className="text-center text-gray-500 p-4">Memuat sesi...</div>
                ) : (
                sessions.map(session => (
                    <button
                    key={session.thread_id}
                    onClick={() => fetchChatHistory(session.thread_id)}
                    className={`
                        w-full text-left p-3 rounded-lg group
                        ${activeThreadId === session.thread_id 
                        ? 'bg-active-pink text-active-pink-text' 
                        : 'text-brand-purple hover:bg-gray-50'}
                    `}
                    >
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate">
                        {session.title || session.thread_id}
                        </span>
                        <FiTrash2 
                        onClick={(e) => handleDeleteSession(e, session.thread_id)}
                        className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500"
                        />
                    </div>
                    <span className="text-xs opacity-70">
                        Update: {new Date(session.updated_at).toLocaleString('id-ID')}
                    </span>
                    </button>
                ))
                )}
            </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">                
                {messages.length === 0 && !isLoadingHistory && (
                <div className="flex justify-center items-center h-full">
                    <div className="text-center text-gray-400">
                    <Image src="/skytopia-logo.svg" alt="Logo" width={150} height={40} className="mx-auto" />
                    <p className="mt-4">Mulai obrolan baru atau pilih sesi di samping.</p>
                    </div>
                </div>
                )}
                
                {isLoadingHistory && (
                <div className="flex justify-center items-center h-full">
                    <FiLoader className="h-8 w-8 text-brand-purple animate-spin" />
                </div>
                )}

                {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                    className={`
                        max-w-lg rounded-xl py-2 px-4 shadow-sm
                        ${msg.role === 'user' 
                        ? 'bg-stat-blue-bg/70 text-brand-purple' 
                        : 'bg-stat-pink-bg text-brand-purple' 
                        }
                    `}
                    >
                    {msg.content}
                    </div>
                </div>
                ))}
                
                {isSending && (
                <div className="flex justify-start">
                    <div className="rounded-xl py-2 px-4 shadow-sm bg-stat-pink-bg text-brand-purple">
                    <FiLoader className="h-5 w-5 animate-spin" />
                    </div>
                </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    disabled={isSending}
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors disabled:bg-gray-200"
                />
                <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="flex-shrink-0 flex items-center justify-center rounded-lg bg-login-pink py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90
                            disabled:cursor-not-allowed disabled:bg-pink-300"
                >
                    {isSending ? (
                    <FiLoader className="h-5 w-5 animate-spin" />
                    ) : (
                    <FiSend className="h-5 w-5" />
                    )}
                </button>
                </form>
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
            </div>
        </div>
        </div>
    );
}