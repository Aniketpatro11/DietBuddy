import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dna, 
  Upload, 
  FileBarChart, 
  Award,
  QrCode,
  Sparkles,
  TrendingUp,
  Shield
} from 'lucide-react';
import { GeneticUpload } from './GeneticUpload';
import { GeneticReport } from './GeneticReport';
import { useGeneticAnalysis } from '@/hooks/useGeneticAnalysis';

interface GeneticAnalysisProps {
  userProfile: any;
  onPointsEarned: (points: number) => void;
}

export const GeneticAnalysis: React.FC<GeneticAnalysisProps> = ({
  userProfile,
  onPointsEarned
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  
  const {
    analysisResult,
    isAnalyzing,
    parsedData,
    error,
    analyzeGenetics,
    clearAnalysis
  } = useGeneticAnalysis();

  const handleFileUpload = async (file: File) => {
    try {
      await analyzeGenetics(file, userProfile);
      setActiveTab('report');
      onPointsEarned(50); // Award points for genetic analysis
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleClearResults = () => {
    clearAnalysis();
    setActiveTab('upload');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Dna className="w-10 h-10 text-primary animate-pulse" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              CRISPR-powered Genetic Analysis
            </h1>
            <Badge variant="secondary" className="mt-1">
              Beta Version
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Unlock personalized nutrition insights from your genetic data. Upload your 23andMe-style CSV 
          for AI-powered dietary recommendations tailored to your unique genetic profile.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="text-center hover-lift">
          <CardContent className="p-4">
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Privacy First</h3>
            <p className="text-sm text-muted-foreground">Your genetic data is processed locally and securely</p>
          </CardContent>
        </Card>
        <Card className="text-center hover-lift">
          <CardContent className="p-4">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Science-Based</h3>
            <p className="text-sm text-muted-foreground">Recommendations based on peer-reviewed genetic research</p>
          </CardContent>
        </Card>
        <Card className="text-center hover-lift">
          <CardContent className="p-4">
            <Sparkles className="w-8 h-8 text-warning mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Personalized</h3>
            <p className="text-sm text-muted-foreground">Combines genetics with your dietary preferences</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Data
          </TabsTrigger>
          <TabsTrigger 
            value="report" 
            className="flex items-center gap-2"
            disabled={!analysisResult}
          >
            <FileBarChart className="w-4 h-4" />
            Diet Report
          </TabsTrigger>
          <TabsTrigger value="traceability" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Traceability
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="upload" className="space-y-6">
            <GeneticUpload
              onFileUpload={handleFileUpload}
              isAnalyzing={isAnalyzing}
              error={error}
              parsedData={parsedData}
            />
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            {analysisResult ? (
              <GeneticReport
                result={analysisResult}
                onClearResults={handleClearResults}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileBarChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Genetic Analysis Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your genetic CSV file to generate your personalized diet report
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    Upload Genetic Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="traceability" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Food Source Traceability</h3>
                <p className="text-muted-foreground mb-4">
                  Track the origin and certification of recommended foods in your genetic diet plan
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Badge variant="outline" className="p-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-success">98%</div>
                      <div className="text-sm">Organic Certified</div>
                    </div>
                  </Badge>
                  <Badge variant="outline" className="p-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">4.8/5</div>
                      <div className="text-sm">Trust Score</div>
                    </div>
                  </Badge>
                  <Badge variant="outline" className="p-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-warning">12</div>
                      <div className="text-sm">Supply Chain Steps</div>
                    </div>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Genetic Achievement System</h3>
                <p className="text-muted-foreground mb-6">
                  Earn badges and points by following your genetic-based diet recommendations
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    { name: 'DNA Explorer', desc: 'First genetic analysis completed', points: 50, unlocked: !!analysisResult },
                    { name: 'Lactose Master', desc: 'Follow dairy recommendations for 7 days', points: 30, unlocked: false },
                    { name: 'Folate Fighter', desc: 'Increase folate intake based on genetics', points: 25, unlocked: false },
                    { name: 'Caffeine Controller', desc: 'Optimize caffeine timing for 14 days', points: 35, unlocked: false },
                    { name: 'Omega Optimizer', desc: 'Include omega-3 sources daily', points: 40, unlocked: false },
                    { name: 'Genetic Guru', desc: 'Complete all genetic challenges', points: 100, unlocked: false }
                  ].map((achievement, idx) => (
                    <Card key={idx} className={`text-center ${achievement.unlocked ? 'border-success' : 'opacity-50'}`}>
                      <CardContent className="p-4">
                        <Award className={`w-8 h-8 mx-auto mb-2 ${achievement.unlocked ? 'text-success' : 'text-muted-foreground'}`} />
                        <h4 className="font-semibold text-sm">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{achievement.desc}</p>
                        <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                          {achievement.points} HP
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};