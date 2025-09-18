import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, Award, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pointsAwarded?: number;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  healthPoints: number;
  onPointsEarned: (points: number) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  healthPoints,
  onPointsEarned
}) => {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      
      // Award points for engagement
      onPointsEarned(5);
    }
  };

  const getMessageIcon = (role: string, pointsAwarded?: number) => {
    if (role === 'user') {
      return <User className="w-4 h-4" />;
    } else if (pointsAwarded && pointsAwarded > 0) {
      return <Award className="w-4 h-4 text-success" />;
    }
    return <Bot className="w-4 h-4" />;
  };

  const parseStructuredMealPlan = (content: string) => {
    // Updated parsing pattern to match the new format with proper spacing "Day - 01"
    const dayPattern = /Day\s*-\s*(\d+)/gi;
    const mealPattern = /(Breakfast|Lunch|Dinner|Snack):\s*([^-]+?)\s*-\s*Ingredients:\s*([^-]+?)\s*-\s*Cost:\s*₹?(\d+(?:\.\d+)?)\s*-\s*Preparation:\s*(.+?)(?=\n\n|(?:Breakfast|Lunch|Dinner|Snack):|$)/gis;
    
    const days: any[] = [];
    const dayMatches = [...content.matchAll(dayPattern)];
    
    if (dayMatches.length === 0) return null;
    
    for (let i = 0; i < dayMatches.length; i++) {
      const dayMatch = dayMatches[i];
      const dayNumber = dayMatch[1];
      const startIndex = dayMatch.index! + dayMatch[0].length;
      const endIndex = i < dayMatches.length - 1 ? dayMatches[i + 1].index! : content.length;
      const dayContent = content.slice(startIndex, endIndex);
      
      const meals: any[] = [];
      const mealMatches = [...dayContent.matchAll(mealPattern)];
      
      for (const mealMatch of mealMatches) {
        meals.push({
          type: mealMatch[1].toLowerCase(),
          name: mealMatch[2].trim(),
          nutrients: mealMatch[3].trim(),
          cost: parseFloat(mealMatch[4]),
          preparation: mealMatch[5].trim()
        });
      }
      
      if (meals.length > 0) {
        days.push({
          day: parseInt(dayNumber),
          meals
        });
      }
    }
    
    return days.length > 0 ? days : null;
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting for non-meal plan content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/🍽/g, '<span class="text-primary">🍽</span>')
      .replace(/✅/g, '<span class="text-success">✅</span>')
      .replace(/🔬/g, '<span class="text-warning">🔬</span>')
      .replace(/🥦/g, '<span class="text-success">🥦</span>');
  };

  const renderStructuredMealPlan = (days: Array<{day: string, meals: Array<{type: string, name: string, cost?: number | null, nutrients?: string, preparation?: string}>}>) => {
    return (
      <div className="space-y-8">
        {days.map((dayData, dayIndex) => (
          <div key={dayIndex} className="space-y-6">
            {/* Day Header - matches screenshot with green circle */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {dayData.day}
              </div>
              <h3 className="text-lg font-bold text-primary">Day {dayData.day}</h3>
            </div>
            
            {/* Meal Cards Grid - matches screenshot layout */}
            <div className="grid gap-4 md:grid-cols-3">
              {dayData.meals.map((meal, mealIndex) => {
                const getMealConfig = (type: string) => {
                  switch (type.toLowerCase()) {
                    case 'breakfast': return { icon: '🥞', bgColor: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10', iconBg: 'bg-orange-500' };
                    case 'lunch': return { icon: '☀️', bgColor: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10', iconBg: 'bg-yellow-500' };
                    case 'dinner': return { icon: '🍽️', bgColor: 'bg-gradient-to-br from-accent-purple/20 to-accent-purple/10', iconBg: 'bg-accent-purple' };
                    case 'snack': return { icon: '🍎', bgColor: 'bg-gradient-to-br from-red-500/20 to-red-600/10', iconBg: 'bg-red-500' };
                    default: return { icon: '🍽️', bgColor: 'bg-card/50', iconBg: 'bg-muted' };
                  }
                };
                
                const mealConfig = getMealConfig(meal.type);
                
                return (
                  <div key={mealIndex} className={`rounded-2xl p-6 border border-card-border/50 ${mealConfig.bgColor} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}>
                    {/* Meal Type Header with Icon */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 ${mealConfig.iconBg} rounded-lg flex items-center justify-center text-white text-lg shadow-md`}>
                        {mealConfig.icon}
                      </div>
                      <h4 className="font-bold text-lg text-foreground capitalize">{meal.type}</h4>
                    </div>
                    
                    {/* Meal Content - Clean format matching screenshot */}
                    <div className="space-y-3">
                      {/* Meal Name */}
                      <div>
                        <p className="font-semibold text-foreground text-base leading-relaxed">
                          {meal.name}
                        </p>
                      </div>
                      
                      {/* Ingredients List */}
                      {meal.nutrients && (
                        <div className="text-sm text-muted-foreground">
                          <span className="text-foreground">Ingredients:</span> {meal.nutrients}
                        </div>
                      )}
                      
                      {/* Cost */}
                      {meal.cost && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cost:</span> <span className="font-semibold text-primary ml-1">₹{meal.cost}</span>
                        </div>
                      )}
                      
                      {/* Preparation Tip */}
                      {meal.preparation && (
                        <div className="text-sm text-muted-foreground">
                          <span className="text-foreground font-medium">Preparation:</span> {meal.preparation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 bg-background-secondary/50 backdrop-blur-xl border-b border-card-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
            <h1 className="text-xl font-bold text-foreground">Welcome to DietBuddy! 🥗</h1>
            <p className="text-muted-foreground">Your personalized AI nutrition assistant for India</p>
            </div>
          </div>
          <Badge className="bg-gradient-success text-white px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            {healthPoints} HP
          </Badge>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge variant="secondary" className="glass">
            <Sparkles className="w-3 h-3 mr-1" />
            Meal Planning
          </Badge>
          <Badge variant="secondary" className="glass">
            🧬 Health Screening
          </Badge>
          <Badge variant="secondary" className="glass">
            🧠 Nutrition Quiz
          </Badge>
          <Badge variant="secondary" className="glass">
            🏷️ Food Labels
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mt-3">
          Get meal plans, nutrition advice, and health screenings tailored to your needs.
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <Card className="glass p-6 text-center">
              <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Hi there! I'm your AI nutrition assistant</h3>
              <p className="text-muted-foreground mb-4">
                Try the quick actions in the sidebar or ask me anything about nutrition, diet, or screenings...
              </p>
              <div className="text-sm text-muted-foreground">
                Example: "Plan a 3-day vegetarian meal for ₹70/meal" or "Check my iron levels"
              </div>
            </Card>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 fade-in-up ${index < 3 ? `stagger-${index + 1}` : ''} ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-primary text-white'
                      : 'bg-gradient-secondary text-foreground'
                  }`}
                >
                  {getMessageIcon(message.role, message.pointsAwarded)}
                </div>

                <Card
                  className={`glass-hover hover-lift p-4 ${
                    message.role === 'user'
                      ? 'bg-primary/10 border-primary/20'
                      : 'bg-card/70'
                  }`}
                >
                  {message.pointsAwarded && message.pointsAwarded > 0 && (
                    <div className="flex items-center gap-2 mb-2 text-success">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">+{message.pointsAwarded} Health Points!</span>
                    </div>
                  )}
                  
                  {(() => {
                    const structuredPlan = parseStructuredMealPlan(message.content);
                    if (structuredPlan && message.role === 'assistant') {
                      return renderStructuredMealPlan(structuredPlan);
                    }
                    return (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-card-foreground"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                    );
                  })()}
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start fade-in-up">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center pulse-glow">
                  <Bot className="w-4 h-4" />
                </div>
                <Card className="glass p-4 scale-in">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Analyzing your nutrition needs...</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 bg-background-secondary/50 backdrop-blur-xl border-t border-card-border">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about nutrition, diet, or screenings..."
              className="flex-1 glass"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-success hover:shadow-glow-success px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};