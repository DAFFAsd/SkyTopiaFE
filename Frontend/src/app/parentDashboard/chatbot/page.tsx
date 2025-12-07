'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { FiArrowLeft, FiSend, FiPlus, FiTrash2, FiLoader, FiMessageSquare, FiChevronLeft } from 'react-icons/fi';
import Image from 'next/image'; 
import { apiUrl } from '@/lib/api';

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

    const [showMobileChat, setShowMobileChat] = useState(false);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');
            
            const response = await fetch(apiUrl('/chatbot/sessions'), {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            
            if (data.success) {
                setSessions(data.data);
            } else {
                console.error("Gagal ambil sesi:", data);
            }
        } catch (err: unknown) {
            console.error(err);
        } finally {
            setIsLoadingSessions(false);
        }
    };
    
    const fetchChatHistory = async (threadId: string) => {
        setActiveThreadId(threadId);
        setShowMobileChat(true); 
        setIsLoadingHistory(true);
        setMessages([]); 
        
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');

            const response = await fetch(apiUrl(`/chatbot/history/${threadId}`), {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessages(data.data.messages);
                setTimeout(scrollToBottom, 100);
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
        setShowMobileChat(true); 
    };
    
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessageContent = newMessage;
    setNewMessage(''); 
    setError('');
    setIsSending(true);

    const newMsgObj: Message = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, newMsgObj]);
    
    setTimeout(scrollToBottom, 50);

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan');
        
        let response;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
        const body = JSON.stringify({ message: userMessageContent });
        
        if (activeThreadId) {
            response = await fetch(apiUrl(`/chatbot/${activeThreadId}/message`), {
                method: 'POST', headers, body
            });
        } else {
            response = await fetch(apiUrl('/chatbot/new'), {
                method: 'POST', headers, body
            });
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Gagal terhubung ke server`);
        }

        const data = await response.json();

        if (data.success) {
            const targetThreadId = activeThreadId || data.thread_id;
            
            if (targetThreadId) {
                if (!activeThreadId && data.thread_id) {
                    setActiveThreadId(data.thread_id);
                    fetchSessions(); 
                }
                
                await fetchChatHistory(targetThreadId); 
            }
            
        } else {
            throw new Error(data.error || data.message || 'Gagal mengirim pesan dari server');
        }
        
    } catch (err: unknown) {
        let errorMessage = "Gagal terhubung ke server.";
        if (err instanceof Error) errorMessage = err.message;
        setError(errorMessage);
        setMessages(prev => prev.slice(0, -1)); 
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
            
            await fetch(apiUrl(`/chatbot/${threadId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setSessions(prev => prev.filter(s => s.thread_id !== threadId));
            if (activeThreadId === threadId) {
                handleNewChat();
                setShowMobileChat(false); 
            }
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchSessions();
    }, []); 

    return (
        <div className="space-y-4 flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-80px)]"> 
            <div className="flex-shrink-0">
                <Link
                    href="/parentDashboard"
                    className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Dasbor</span>
                </Link>

                <div className="flex items-center space-x-3">
                    <FiMessageSquare className="h-6 w-6 md:h-8 md:w-8 text-brand-purple" />
                    <h1 className="font-rammetto text-2xl md:text-3xl font-bold text-brand-purple">
                        Tanya SkyBot
                    </h1>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 relative">
                <div className={`
                    w-full lg:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full
                    ${showMobileChat ? 'hidden lg:flex' : 'flex'} 
                `}>
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <button 
                            onClick={handleNewChat}
                            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-login-pink py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all"
                        >
                            <FiPlus className="h-5 w-5" />
                            <span>Obrolan Baru</span>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {isLoadingSessions ? (
                            <div className="text-center text-gray-500 p-4 text-sm">Memuat sesi...</div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center text-gray-400 p-8 text-sm">Belum ada riwayat chat.</div>
                        ) : (
                            sessions.map(session => (
                                <button
                                    key={session.thread_id}
                                    onClick={() => fetchChatHistory(session.thread_id)}
                                    className={`
                                        w-full text-left p-3 rounded-lg group transition-all border border-transparent
                                        ${activeThreadId === session.thread_id 
                                            ? 'bg-white border-brand-purple/20 shadow-sm' 
                                            : 'hover:bg-white hover:shadow-sm'}
                                    `}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm font-medium truncate ${activeThreadId === session.thread_id ? 'text-brand-purple' : 'text-gray-700'}`}>
                                            {session.title || "Obrolan Baru"}
                                        </span>
                                        <div 
                                            onClick={(e) => handleDeleteSession(e, session.thread_id)}
                                            className="p-1 rounded-full hover:bg-red-50 group-hover:text-red-500 text-gray-400 transition-colors"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1 block">
                                        {new Date(session.updated_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className={`
                    w-full lg:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full 
                    ${!showMobileChat ? 'hidden lg:flex' : 'flex'}
                `}>
                    <div className="lg:hidden flex items-center p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <button 
                            onClick={() => setShowMobileChat(false)}
                            className="p-2 mr-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
                        >
                            <FiChevronLeft className="h-6 w-6" />
                        </button>
                        <span className="font-semibold text-gray-800">Obrolan</span>
                    </div>

                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white scroll-smooth">
                        
                        {messages.length === 0 && !isLoadingHistory && (
                            <div className="flex flex-col justify-center items-center h-full opacity-60">
                                <div className="bg-stat-blue-bg/30 p-6 rounded-full mb-4">
                                    <Image src="/skytopia-logo.svg" alt="Logo" width={120} height={32} className="opacity-50" />
                                </div>
                                <p className="text-gray-500 text-center max-w-xs text-sm">
                                    Halo! Saya AI Assistant SkyTopia. Ada yang bisa saya bantu mengenai anak Anda hari ini?
                                </p>
                            </div>
                        )}
                        
                        {isLoadingHistory && (
                            <div className="flex justify-center items-center h-full">
                                <FiLoader className="h-8 w-8 text-brand-purple animate-spin" />
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`
                                    max-w-[85%] md:max-w-[75%] rounded-2xl py-3 px-4 shadow-sm text-sm leading-relaxed
                                    ${msg.role === 'user' 
                                        ? 'bg-brand-purple text-white rounded-br-none' 
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200' 
                                    }
                                `}>
                                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-blue-600 dark:prose-invert">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isSending && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-gray-100 rounded-2xl rounded-bl-none py-3 px-4 border border-gray-200 flex space-x-1 items-center">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div className="h-4"></div> 
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        {error && (
                            <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600 flex justify-between items-center">
                                <span>{error}</span>
                                <button onClick={() => setError('')}><FiTrash2/></button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="flex items-end space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-brand-purple focus-within:ring-1 focus-within:ring-brand-purple/20 transition-all">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                                    }
                                }}
                                placeholder="Ketik pesan Anda..."
                                disabled={isSending}
                                className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm max-h-32 min-h-[44px] py-3"
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={isSending || !newMessage.trim()}
                                className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-brand-purple text-white shadow-md hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all mb-0.5"
                            >
                                {isSending ? (
                                    <FiLoader className="h-5 w-5 animate-spin" />
                                ) : (
                                    <FiSend className="h-5 w-5 ml-0.5" />
                                )}
                            </button>
                        </form>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            SkyBot mungkin membuat kesalahan. Mohon verifikasi informasi penting.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}