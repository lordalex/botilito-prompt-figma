import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface MessageContextType {
  messages: any;
  isLoading: boolean;
}

const MessageContext = createContext<MessageContextType>({ messages: {}, isLoading: true });

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('/messages.json')
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(error => console.error("Failed to load messages:", error))
            .finally(() => setIsLoading(false));
    }, []); 

    const value = useMemo(() => ({ messages, isLoading }), [messages, isLoading]);

    return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};

export const useMessages = (): MessageContextType => {
    const context = useContext(MessageContext);
    if (!context) {
        return { messages: {}, isLoading: false };
    }
    return context;
};
