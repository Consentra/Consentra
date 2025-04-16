
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, ChevronRight, Loader2 } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  context?: string;
  placeholder?: string;
}

export function AIAssistant({ context = '', placeholder = 'Ask Daisy a question...' }: AIAssistantProps) {
  const { askQuestion, isLoading } = useAI();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m Ethra. How can I help with your governance questions today?' 
    }
  ]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to history
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Get AI response
    try {
      const response = await askQuestion(userMessage, context);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  }

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Ethra" 
            className="h-5 w-5" 
          />
          Ethra
        </CardTitle>
        <CardDescription>
          Ask questions about proposals, voting, or get governance recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[320px] pr-4">
          <div className="flex flex-col gap-4">
            {messages.map((message, i) => (
              <div 
                key={i}
                className={`flex gap-2 ${message.role === 'assistant' ? 'items-start' : 'items-start justify-end'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div 
                  className={`rounded-lg px-4 py-2 max-w-[85%] text-sm ${
                    message.role === 'assistant' 
                      ? 'bg-muted' 
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted max-w-[85%] text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="w-full flex gap-2"
        >
          <Input
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
