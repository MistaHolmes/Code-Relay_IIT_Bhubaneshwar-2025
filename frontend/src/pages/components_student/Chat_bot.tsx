import React, { useState, useEffect, useRef } from 'react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');


    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);

    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const SUGGESTED_QUESTIONS = [
        "What is the exam date?",
        "How to apply for leave?",
        "Library opening hours?",
        "Where is the sports complex?",
        "How to reset portal password?",
        "Admission deadline?",
        "Professor office hours?",
        "Required documents for admission?"
    ];

    // Persist messages to localStorage
 useEffect(() => {
  // Only run on client side
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    setMessages(JSON.parse(saved));
  }
}, []);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { text: message, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');

        try {
            setIsTyping(true);
            const response = await fetch('http://localhost:3000/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: message }),
            });

            if (!response.ok) throw new Error('Server error');
            
            const data = await response.json();
            setMessages(prev => [...prev, { text: data.answer, isUser: false }]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { 
                    text: '⚠️ Failed to get response. Please try again.', 
                    isUser: false 
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    // Add suggested question handler
    const handleSuggestedQuestion = async (question: string) => {
        setMessage(question);
        // Trigger submit after short delay to allow state update
        await new Promise(resolve => setTimeout(resolve, 50));
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 !important">
            {isOpen && (
                <div className="bg-gray-900 rounded-xl shadow-xl w-80 border border-gray-800">
                    {/* Header remains same */}

                    <div className="h-96 p-4 overflow-y-auto space-y-4">
                        {/* Existing messages */}


                        {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${
                msg.isUser 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300'
            }`}>
                {msg.text}
            </div>
        </div>
    ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 text-gray-300 p-3 rounded-lg">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm">
                                Ask me about exam dates, leave applications, or faculty contacts!
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions */}
                    <div className="px-4 pb-2 border-t border-gray-800">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestedQuestion(q)}
                                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Existing form */}
                </div>
            )}
            
            {/* Toggle button remains same */}
            <button 
  onClick={() => setIsOpen(!isOpen)}
  className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all"
>
  {isOpen ? '×' : '💬'}
</button>
        </div>
    );
};

export default ChatBot; 