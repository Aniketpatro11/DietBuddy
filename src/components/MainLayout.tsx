import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';
import { GamificationSystem } from './GamificationSystem';
import { BlockchainTraceability } from './BlockchainTraceability';
import { FlavorDesignLab } from './FlavorDesignLab';
import { GeneticAnalysis } from './GeneticAnalysis';
import { IoTHealthMonitoring } from './IoTHealthMonitoring';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlanMyDietary } from '@/hooks/usePlanMyDietary';
import { 
  MessageSquare, 
  Trophy, 
  QrCode, 
  Palette,
  Sparkles,
  Menu,
  X,
  Dna,
  Activity
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const {
    profile,
    setProfile,
    messages,
    healthPoints,
    level,
    streak,
    isLoading,
    apiKey,
    setApiKey,
    useOpenAI,
    setUseOpenAI,
    sendMessage,
    handleQuickAction,
    clearChat,
    onQuizComplete,
    onPointsEarned
  } = usePlanMyDietary();

  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAchievementUnlocked = (achievement: any) => {
    // Handle achievement unlock logic
    console.log('Achievement unlocked:', achievement);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden fade-in">
          <div className="fixed left-0 top-0 h-full slide-in-left">
        <Sidebar
          profile={profile}
          onProfileUpdate={setProfile}
          onProfileSave={() => {
            // Force re-render to ensure updated profile is used
            setProfile(prev => ({...prev}));
          }}
          healthPoints={healthPoints}
          level={level}
          onQuickAction={handleQuickAction}
          onClearChat={clearChat}
          apiKey={apiKey}
          setApiKey={setApiKey}
          useOpenAI={useOpenAI}
          setUseOpenAI={setUseOpenAI}
        />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover-lift"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          profile={profile}
          onProfileUpdate={setProfile}
          onProfileSave={() => {
            // Force re-render to ensure updated profile is used
            setProfile(prev => ({...prev}));
          }}
          healthPoints={healthPoints}
          level={level}
          onQuickAction={handleQuickAction}
          onClearChat={clearChat}
          apiKey={apiKey}
          setApiKey={setApiKey}
          useOpenAI={useOpenAI}
          setUseOpenAI={setUseOpenAI}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-background-secondary/50 backdrop-blur-xl border-b border-card-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-success text-white">
              Level {level}
            </Badge>
            <Badge variant="outline">
              {healthPoints} HP
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-card-border bg-background-secondary/30 backdrop-blur-xl">
            <TabsList className="w-full justify-start rounded-none bg-transparent border-0 p-0">
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <MessageSquare className="w-4 h-4" />
                Chat Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="gamification" 
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Trophy className="w-4 h-4" />
                Gamification
                {healthPoints > 0 && (
                  <Badge className="bg-health-points text-white text-xs h-5 px-1">
                    {Math.floor(healthPoints / 20)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="blockchain" 
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <QrCode className="w-4 h-4" />
                Traceability
                <Badge variant="secondary" className="text-xs h-5 px-1">
                  Beta
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="genetics" 
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Dna className="w-4 h-4" />
                Genetics
                <Badge variant="secondary" className="text-xs h-5 px-1">
                  CRISPR
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="flavor" 
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Palette className="w-4 h-4" />
                Flavor Lab
                <Sparkles className="w-3 h-3 text-warning" />
              </TabsTrigger>
              <TabsTrigger 
                value="iot" 
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Activity className="w-4 h-4" />
                IoT Health
                <Badge variant="secondary" className="text-xs h-5 px-1">
                  Live
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 mt-0 fade-in-up">
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              healthPoints={healthPoints}
              onPointsEarned={onPointsEarned}
            />
          </TabsContent>

          <TabsContent value="gamification" className="flex-1 mt-0 p-6 overflow-y-auto fade-in-up">
            <div className="max-w-4xl mx-auto">
              <GamificationSystem
                healthPoints={healthPoints}
                level={level}
                streak={streak}
                onQuizComplete={onQuizComplete}
                onAchievementUnlocked={handleAchievementUnlocked}
              />
            </div>
          </TabsContent>

          <TabsContent value="blockchain" className="flex-1 mt-0 p-6 overflow-y-auto fade-in-up">
            <div className="max-w-4xl mx-auto">
              <BlockchainTraceability />
            </div>
          </TabsContent>

          <TabsContent value="genetics" className="flex-1 mt-0 p-6 overflow-y-auto fade-in-up">
            <div className="max-w-6xl mx-auto">
              <GeneticAnalysis 
                userProfile={profile}
                onPointsEarned={onPointsEarned}
              />
            </div>
          </TabsContent>

          <TabsContent value="flavor" className="flex-1 mt-0 p-6 overflow-y-auto fade-in-up">
            <div className="max-w-4xl mx-auto">
              <FlavorDesignLab />
            </div>
          </TabsContent>

          <TabsContent value="iot" className="flex-1 mt-0 p-6 overflow-y-auto fade-in-up">
            <div className="max-w-6xl mx-auto">
              <IoTHealthMonitoring />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};