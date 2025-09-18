import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Settings, Zap, Target, Activity, ChevronDown, ChevronRight } from 'lucide-react';

interface UserProfile {
  age: number;
  sex: string;
  diet: string;
  region: string;
  budget: number;
  allergies: string;
  goals: string;
  height: number; // in cm
  weight: number; // in kg
  genetics?: {
    traits: Array<{
      trait_name: string;
      interpretation: string;
      recommendations: string[];
      confidence: string;
    }>;
    uploadHash?: string;
    reportData?: string; // Full genetic report data for CRISPR genetics input
  };
}

interface SidebarProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  onProfileSave: () => void;
  healthPoints: number;
  level: number;
  onQuickAction: (action: string) => void;
  onClearChat: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  useOpenAI: boolean;
  setUseOpenAI: (use: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profile,
  onProfileUpdate,
  onProfileSave,
  healthPoints,
  level,
  onQuickAction,
  onClearChat,
  apiKey,
  setApiKey,
  useOpenAI,
  setUseOpenAI
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    onProfileUpdate({ ...profile, [field]: value });
  };

  const getLevelBadgeColor = () => {
    if (level >= 10) return "bg-gradient-success text-white";
    if (level >= 5) return "bg-gradient-primary text-white";
    return "bg-level-bronze text-white";
  };

  const getHealthPointsPercentage = () => {
    const maxPoints = (level + 1) * 100;
    return (healthPoints % 100) / 100 * 100;
  };

  return (
    <div className="w-80 h-screen bg-background-secondary/70 backdrop-blur-xl border-r border-card-border overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-card-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">DietBuddy</h1>
            <p className="text-sm text-muted-foreground">AI Nutrition Assistant</p>
          </div>
        </div>
        
        {/* Gamification Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-health-points" />
              <span className="text-sm font-medium">Health Points</span>
            </div>
            <Badge className={`${getLevelBadgeColor()} px-2 py-1 text-xs`}>
              Level {level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{healthPoints} HP</span>
              <span className="text-muted-foreground">{((level + 1) * 100)} HP</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-success transition-all duration-500 ease-out" 
                style={{ width: `${getHealthPointsPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearChat}
            className="text-xs"
          >
            Clear Chat
          </Button>
        </div>

        {/* User Profile */}
        <Collapsible open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">User Profile</span>
              </div>
              {isProfileOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pb-4">
            <Card className="glass p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age" className="text-xs text-muted-foreground">Age</Label>
                  <Input 
                    id="age"
                    type="number" 
                    value={profile.age} 
                    onChange={(e) => updateProfile('age', parseInt(e.target.value))}
                    className="mt-1"
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <Label htmlFor="sex" className="text-xs text-muted-foreground">Sex</Label>
                  <Select value={profile.sex} onValueChange={(value) => updateProfile('sex', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="diet" className="text-xs text-muted-foreground">Diet Type</Label>
                <Select value={profile.diet} onValueChange={(value) => updateProfile('diet', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Eggitarian">Eggitarian</SelectItem>
                    <SelectItem value="Non-veg">Non-veg</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region" className="text-xs text-muted-foreground">Region (India)</Label>
                <Select value={profile.region} onValueChange={(value) => updateProfile('region', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="NE">Northeast</SelectItem>
                    <SelectItem value="Any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Budget per meal: ₹{profile.budget}</Label>
                <Slider
                  value={[profile.budget]}
                  onValueChange={([value]) => updateProfile('budget', value)}
                  max={200}
                  min={30}
                  step={10}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₹30</span>
                  <span>₹200</span>
                </div>
              </div>

              <div>
                <Label htmlFor="allergies" className="text-xs text-muted-foreground">Allergies</Label>
                <Input 
                  id="allergies"
                  placeholder="e.g., peanuts, shellfish" 
                  value={profile.allergies} 
                  onChange={(e) => updateProfile('allergies', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="goals" className="text-xs text-muted-foreground">Goals</Label>
                <Input 
                  id="goals"
                  placeholder="e.g., weight loss, muscle gain" 
                  value={profile.goals} 
                  onChange={(e) => updateProfile('goals', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="height" className="text-xs text-muted-foreground">Height (cm)</Label>
                  <Input 
                    id="height"
                    type="number" 
                    value={profile.height} 
                    onChange={(e) => updateProfile('height', parseInt(e.target.value))}
                    className="mt-1"
                    min={100}
                    max={250}
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-xs text-muted-foreground">Weight (kg)</Label>
                  <Input 
                    id="weight"
                    type="number" 
                    value={profile.weight} 
                    onChange={(e) => updateProfile('weight', parseInt(e.target.value))}
                    className="mt-1"
                    min={20}
                    max={200}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">BMI Calculator</Label>
                <div className="mt-1 p-2 bg-muted/30 rounded text-sm">
                  <span className="font-medium">
                    BMI: {profile.height && profile.weight ? 
                      (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : 
                      '0.0'
                    }
                  </span>
                  <span className="text-muted-foreground ml-2">
                    ({profile.height && profile.weight ? 
                      ((profile.weight / ((profile.height / 100) ** 2)) < 18.5 ? 'Underweight' : 
                       (profile.weight / ((profile.height / 100) ** 2)) > 24.9 ? 'Overweight' : 'Normal') :
                      'Enter height & weight'
                    })
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="genetics" className="text-xs text-muted-foreground">CRISPR Genetics Data</Label>
                <Input 
                  id="genetics"
                  placeholder="Genetic traits data (auto-filled from upload)" 
                  value={profile.genetics?.reportData || (profile.genetics ? `${profile.genetics.traits.length} genetic traits analyzed` : '')}
                  onChange={(e) => {
                    const genetics = profile.genetics || { traits: [], uploadHash: '', reportData: '' };
                    genetics.reportData = e.target.value;
                    updateProfile('genetics', genetics);
                  }}
                  className="mt-1"
                />
                {profile.genetics && profile.genetics.traits.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {profile.genetics.traits.slice(0, 3).map((trait, index) => (
                      <div key={index} className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                        {trait.trait_name}: {trait.interpretation}
                      </div>
                    ))}
                    {profile.genetics.traits.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{profile.genetics.traits.length - 3} more traits...
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button 
                onClick={onProfileSave}
                className="w-full bg-gradient-primary hover:shadow-glow-primary mt-4"
                size="sm"
              >
                Save Profile
              </Button>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* OpenAI Integration */}
        <Card className="glass p-4 mb-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="text-xs text-white font-bold">AI</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">OpenAI Settings</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Use OpenAI</Label>
                <p className="text-xs text-muted-foreground">Get enhanced AI responses</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={useOpenAI}
                  onCheckedChange={setUseOpenAI}
                />
                {useOpenAI && apiKey && (
                  <Badge className="bg-success/20 text-success border-success/30 text-xs px-2 py-0.5">
                    AI Active
                  </Badge>
                )}
              </div>
            </div>
            
            {useOpenAI && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="apiKey" className="text-xs text-muted-foreground">
                  OpenAI API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="text-sm"
                />
                <div className="flex items-center gap-1 text-xs">
                  {apiKey ? (
                    <>
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      <span className="text-success">Ready for AI responses</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span className="text-warning">Enter API key for AI responses</span>
                    </>
                  )}
                </div>
                {!useOpenAI && (
                  <div className="bg-muted/30 rounded p-2 text-xs text-muted-foreground">
                    💡 Responses will use local knowledge only
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            Quick Actions
          </h3>
          
          <div className="space-y-2">
            <Button 
              onClick={() => onQuickAction('3-day-plan')}
              className="w-full bg-gradient-success hover:shadow-glow-success text-left justify-start"
              size="sm"
            >
              <div>
                <div className="font-medium">3-Day Meal Plan</div>
                <div className="text-xs opacity-80">Get a personalized meal plan</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => onQuickAction('anemia-screen')}
              className="w-full bg-gradient-secondary hover:shadow-card text-left justify-start"
              variant="secondary"
              size="sm"
            >
              <div>
                <div className="font-medium">Anemia Self-screen</div>
                <div className="text-xs opacity-80">Quick health assessment</div>
              </div>
            </Button>

            <Button 
              onClick={() => onQuickAction('nutrition-quiz')}
              className="w-full bg-gradient-primary hover:shadow-glow-primary text-left justify-start"
              size="sm"
            >
              <div>
                <div className="font-medium">Nutrition Quiz</div>
                <div className="text-xs opacity-80">Earn health points +20 HP</div>
              </div>
            </Button>

            <Button 
              onClick={() => onQuickAction('genetic-diet')}
              className="w-full bg-gradient-to-r from-primary to-accent-purple hover:shadow-glow-primary text-left justify-start"
              size="sm"
            >
              <div>
                <div className="font-medium">🧬 Genetic Diet Plan</div>
                <div className="text-xs opacity-80">AI recommendations from DNA</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Team Code Biologists Credit */}
        <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">🧬</span>
              </div>
              <span className="text-sm font-bold text-primary">Team Code Biologists</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Designed & Developed with ❤️
            </p>
            <p className="text-xs text-muted-foreground opacity-80">
              Advancing nutrition through technology
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Educational purposes only. Consult healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};