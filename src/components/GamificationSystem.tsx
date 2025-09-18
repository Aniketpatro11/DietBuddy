import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Zap, 
  Target, 
  Award, 
  Calendar, 
  Brain, 
  Heart, 
  CheckCircle,
  Star,
  Flame
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface GamificationSystemProps {
  healthPoints: number;
  level: number;
  streak: number;
  onQuizComplete: (points: number) => void;
  onAchievementUnlocked: (achievement: Achievement) => void;
}

export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  healthPoints,
  level,
  streak,
  onQuizComplete,
  onAchievementUnlocked
}) => {
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "Which food improves iron absorption the most when eaten with dal?",
      options: ["Tea", "Lemon", "Coffee", "Cola"],
      correct: "Lemon",
      explanation: "Vitamin C in lemon significantly increases non-heme iron absorption from plant-based foods like dal.",
      points: 20
    },
    {
      id: 2,
      question: "What is the recommended daily water intake for adults in India?",
      options: ["1-1.5 liters", "2-2.5 liters", "3-4 liters", "5+ liters"],
      correct: "2-2.5 liters",
      explanation: "Adults need 2-2.5 liters of water daily, more in hot climates or with physical activity.",
      points: 15
    },
    {
      id: 3,
      question: "Which millet is best for managing diabetes?",
      options: ["Pearl millet", "Finger millet (Ragi)", "Foxtail millet", "Barnyard millet"],
      correct: "Finger millet (Ragi)",
      explanation: "Ragi has the lowest glycemic index among millets and helps in blood sugar management.",
      points: 25
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'first_chat',
      title: 'First Conversation',
      description: 'Started your first chat with the nutrition assistant',
      icon: <Brain className="w-6 h-6" />,
      points: 10,
      unlocked: healthPoints > 0
    },
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Completed 5 nutrition quizzes',
      icon: <Trophy className="w-6 h-6" />,
      points: 50,
      unlocked: false,
      progress: Math.min(5, Math.floor(healthPoints / 20)),
      maxProgress: 5
    },
    {
      id: 'streak_keeper',
      title: 'Streak Keeper',
      description: 'Maintained a 7-day learning streak',
      icon: <Flame className="w-6 h-6" />,
      points: 100,
      unlocked: streak >= 7,
      progress: Math.min(7, streak),
      maxProgress: 7
    },
    {
      id: 'health_champion',
      title: 'Health Champion',
      description: 'Reached 500 health points',
      icon: <Heart className="w-6 h-6" />,
      points: 0,
      unlocked: healthPoints >= 500,
      progress: Math.min(500, healthPoints),
      maxProgress: 500
    },
    {
      id: 'nutrition_expert',
      title: 'Nutrition Expert',
      description: 'Reached level 10',
      icon: <Star className="w-6 h-6" />,
      points: 200,
      unlocked: level >= 10,
      progress: Math.min(10, level),
      maxProgress: 10
    }
  ];

  const startQuiz = () => {
    const randomQuiz = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setCurrentQuiz(randomQuiz);
    setSelectedAnswer('');
    setQuizCompleted(false);
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuiz) return;
    
    setShowResult(true);
    const isCorrect = selectedAnswer === currentQuiz.correct;
    
    setTimeout(() => {
      if (isCorrect) {
        onQuizComplete(currentQuiz.points);
      } else {
        onQuizComplete(5); // Participation points
      }
      setQuizCompleted(true);
    }, 2000);
  };

  const getLevelProgress = () => {
    const currentLevelPoints = healthPoints % 100;
    return (currentLevelPoints / 100) * 100;
  };

  const getNextLevelPoints = () => {
    return 100 - (healthPoints % 100);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card className="glass p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-success flex items-center justify-center shadow-glow-success">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Level {level}</h2>
                <p className="text-muted-foreground">Nutrition Enthusiast</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress to Level {level + 1}</span>
                <span className="text-sm text-muted-foreground">{getNextLevelPoints()} HP to go</span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{healthPoints} HP</span>
                <span>{(level + 1) * 100} HP</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="glass hover-lift p-4 text-center slide-up stagger-1">
              <Zap className="w-8 h-8 mx-auto mb-2 text-health-points" />
              <div className="text-2xl font-bold health-point-gain">{healthPoints}</div>
              <div className="text-sm text-muted-foreground">Health Points</div>
            </Card>
            
            <Card className="glass hover-lift p-4 text-center slide-up stagger-2">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </Card>
            
            <Card className="glass hover-lift p-4 text-center slide-up stagger-3">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4">
          {!currentQuiz ? (
            <Card className="glass p-8 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Test Your Nutrition Knowledge</h3>
              <p className="text-muted-foreground mb-6">
                Take a quick quiz to earn health points and learn something new!
              </p>
              <Button onClick={startQuiz} className="bg-gradient-primary hover:shadow-glow-primary">
                <Brain className="w-4 h-4 mr-2" />
                Start Quiz (+15-25 HP)
              </Button>
            </Card>
          ) : (
            <Card className="glass p-6">
              <div className="mb-4">
                <Badge className="bg-gradient-success text-white">
                  Nutrition Quiz
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">{currentQuiz.question}</h3>
              
              {!showResult && (
                <div className="space-y-3 mb-6">
                  {currentQuiz.options.map((option: string) => (
                    <label
                      key={option}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAnswer === option
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quiz-answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedAnswer === option ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`} />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {showResult && (
                <div className={`p-4 rounded-lg mb-4 ${
                  selectedAnswer === currentQuiz.correct ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
                }`}>
                  {selectedAnswer === currentQuiz.correct ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <div className="font-semibold text-success">Correct! +{currentQuiz.points} HP</div>
                        <div className="text-sm mt-1">{currentQuiz.explanation}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <div className="font-semibold text-warning">Good try! +5 HP</div>
                        <div className="text-sm mt-1">
                          <strong>Correct answer:</strong> {currentQuiz.correct}
                        </div>
                        <div className="text-sm mt-1">{currentQuiz.explanation}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                {!showResult ? (
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!selectedAnswer}
                    className="bg-gradient-success hover:shadow-glow-success"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setCurrentQuiz(null)}
                    className="bg-gradient-primary hover:shadow-glow-primary"
                  >
                    Take Another Quiz
                  </Button>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4">
            {achievements.map((achievement, index) => (
              <Card 
                key={achievement.id} 
                className={`glass hover-lift fade-in-up ${index < 5 ? `stagger-${index + 1}` : ''} p-4 ${
                  achievement.unlocked ? 'border-success/30 bg-success/5 pulse-glow' : 'opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    achievement.unlocked ? 'bg-gradient-success text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {achievement.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      {achievement.unlocked && <CheckCircle className="w-4 h-4 text-success" />}
                      {achievement.points > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points} HP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    
                    {achievement.maxProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                          <span>{Math.round((achievement.progress! / achievement.maxProgress) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(achievement.progress! / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};