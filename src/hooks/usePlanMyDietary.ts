import { useState, useCallback, useEffect } from 'react';
import OpenAI from 'openai';

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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pointsAwarded?: number;
}

export const usePlanMyDietary = () => {
  const [profile, setProfile] = useState<UserProfile>({
    age: 24,
    sex: 'Female',
    diet: 'Vegetarian',
    region: 'Any',
    budget: 70,
    allergies: '',
    goals: '',
    height: 160,
    weight: 60
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [healthPoints, setHealthPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [useOpenAI, setUseOpenAI] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('planMyDietary_profile');
      const savedHealthPoints = localStorage.getItem('planMyDietary_healthPoints');
      const savedLevel = localStorage.getItem('planMyDietary_level');
      const savedStreak = localStorage.getItem('planMyDietary_streak');
      const savedApiKey = localStorage.getItem('planMyDietary_apiKey');
      const savedUseOpenAI = localStorage.getItem('planMyDietary_useOpenAI');
      
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedHealthPoints) setHealthPoints(parseInt(savedHealthPoints));
      if (savedLevel) setLevel(parseInt(savedLevel));
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedApiKey) setApiKey(savedApiKey);
      if (savedUseOpenAI) setUseOpenAI(JSON.parse(savedUseOpenAI));
    } catch (error) {
      console.log('Error loading saved data:', error);
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('planMyDietary_profile', JSON.stringify(profile));
    localStorage.setItem('planMyDietary_healthPoints', healthPoints.toString());
    localStorage.setItem('planMyDietary_level', level.toString());
    localStorage.setItem('planMyDietary_streak', streak.toString());
    localStorage.setItem('planMyDietary_apiKey', apiKey);
    localStorage.setItem('planMyDietary_useOpenAI', JSON.stringify(useOpenAI));
  }, [profile, healthPoints, level, streak, apiKey, useOpenAI]);

  // Calculate level based on health points
  useEffect(() => {
    const newLevel = Math.floor(healthPoints / 100) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  }, [healthPoints, level]);

  const addHealthPoints = useCallback((points: number) => {
    setHealthPoints(prev => prev + points);
  }, []);

  const buildUserContext = (currentProfile: UserProfile) => {
    const bmi = (currentProfile.weight / ((currentProfile.height / 100) ** 2)).toFixed(1);
    return `User profile → age:${currentProfile.age}, sex:${currentProfile.sex}, diet:${currentProfile.diet}, region:${currentProfile.region}, budget₹:${currentProfile.budget}, allergies:${currentProfile.allergies}, goals:${currentProfile.goals}, height:${currentProfile.height}cm, weight:${currentProfile.weight}kg, BMI:${bmi}`;
  };

  const generateLocalResponse = (userText: string): string => {
    // Minimal fallback response when OpenAI is not available
    return `I'm your AI nutrition assistant, but I need an OpenAI API key to provide detailed responses. Please add your API key in the sidebar settings and enable "Use OpenAI" to get comprehensive nutrition advice tailored to your profile.

For now, try exploring the interactive features like the Quiz, Blockchain Traceability, or Flavor Design Lab in the tabs above!`;
  };

  const generateOpenAIResponse = async (content: string, currentProfile: UserProfile): Promise<string> => {
    if (!apiKey || !useOpenAI) {
      return generateLocalResponse(content);
    }

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const dietaryRestrictions = {
        'Vegetarian': 'NO MEAT, NO FISH, NO SEAFOOD, NO CHICKEN, NO MUTTON, NO BEEF, NO PORK, NO EGGS (strict vegetarian). Only plant-based foods, dairy, and milk products allowed.',
        'Vegan': 'NO ANIMAL PRODUCTS WHATSOEVER - no meat, fish, eggs, dairy, milk, ghee, paneer, yogurt, cheese, honey. Only plant-based foods.',
        'Non-Vegetarian': 'All foods allowed including meat, fish, chicken, eggs, dairy.',
        'Eggitarian': 'Vegetarian diet PLUS eggs allowed. NO MEAT, NO FISH, NO SEAFOOD, NO CHICKEN, NO MUTTON, NO BEEF, NO PORK. Only plant-based foods, dairy, milk products, and eggs.',
        'Non-veg': 'All foods allowed including meat, fish, chicken, eggs, dairy.',
        'Jain': 'No meat, fish, eggs, and NO ROOT VEGETABLES (onions, garlic, potatoes, carrots, radish, ginger). No underground vegetables.',
        'Keto': 'Very low carb, high fat. No rice, wheat, sugar, fruits, potatoes. Focus on meat, fish, eggs, leafy greens, nuts.',
        'Gluten-Free': 'No wheat, barley, rye, oats. Use rice, quinoa, millet alternatives.'
      };

      // Build genetic recommendations if available
      let geneticGuidance = '';
      if (currentProfile.genetics && currentProfile.genetics.traits.length > 0) {
        geneticGuidance = `
🧬 GENETIC DIETARY REQUIREMENTS (CRITICAL - MUST FOLLOW):
Based on uploaded genetic analysis:
`;
        currentProfile.genetics.traits.forEach(trait => {
          geneticGuidance += `
- ${trait.trait_name}: ${trait.interpretation}
  Recommendations: ${trait.recommendations.join(', ')}`;
        });
        geneticGuidance += `

IMPORTANT: All meal recommendations MUST consider these genetic traits. For example:
- If lactose intolerant genetics detected → NO dairy, use plant-based alternatives
- If reduced folate metabolism → emphasize leafy greens, beans, citrus in every meal plan
- If slow caffeine metabolism → limit/avoid coffee recommendations
`;
      }

      const systemPrompt = `You are DietBuddy, an expert AI nutrition assistant specializing in Indian nutrition and dietary planning with CRISPR-powered genetic analysis capabilities.

🚨 CRITICAL DIETARY RESTRICTION - ABSOLUTE COMPLIANCE REQUIRED 🚨
User follows ${currentProfile.diet} diet: ${dietaryRestrictions[currentProfile.diet as keyof typeof dietaryRestrictions] || currentProfile.diet}

${geneticGuidance}

VIOLATION CHECK: Before suggesting ANY meal, verify it follows ${currentProfile.diet} restrictions AND genetic requirements. If uncertain, DO NOT suggest it.

USER PROFILE (MUST USE IN ALL RESPONSES):
- Age: ${currentProfile.age} years, Gender: ${currentProfile.sex}
- Diet: ${currentProfile.diet} (${dietaryRestrictions[currentProfile.diet as keyof typeof dietaryRestrictions] || 'Follow strictly'})
- Region: ${currentProfile.region} India 
- Budget: ₹${currentProfile.budget} per meal (NEVER EXCEED)
- Allergies: ${currentProfile.allergies || 'None'}
- Goals: ${currentProfile.goals || 'General health'}
- Height: ${currentProfile.height}cm, Weight: ${currentProfile.weight}kg, BMI: ${(currentProfile.weight / ((currentProfile.height / 100) ** 2)).toFixed(1)}
${currentProfile.genetics ? `- Genetics: ${currentProfile.genetics.traits.length} genetic traits analyzed` : ''}

RESPONSE FORMAT (EXACT STRUCTURE WITH PROPER SPACING):
Day - 01

Breakfast: [Meal Name] - Ingredients: [ingredients] - Cost: ₹[amount] - Preparation: [tip]

Lunch: [Meal Name] - Ingredients: [ingredients] - Cost: ₹[amount] - Preparation: [tip]

Dinner: [Meal Name] - Ingredients: [ingredients] - Cost: ₹[amount] - Preparation: [tip]

Day - 02

Breakfast: [Meal Name] - Ingredients: [ingredients] - Cost: ₹[amount] - Preparation: [tip]

Lunch: [Meal Name] - Ingredients: [ingredients] - Cost: ₹[amount] - Preparation: [tip]

Dinner: [Meal Name] - Ingredients: [ingredients] - Cost: ₹[amount] - Preparation: [tip]

MANDATORY RULES:
1. DIET COMPLIANCE: Every meal MUST follow ${currentProfile.diet} restrictions exactly
2. GENETIC COMPLIANCE: Every meal MUST consider genetic traits if available
3. BUDGET: All costs ≤ ₹${currentProfile.budget}
4. GOALS: Consider user's goals: ${currentProfile.goals || 'general health'}
5. AUTHENTICATION: Start response mentioning user's profile (age ${currentProfile.age}, ${currentProfile.sex}, ${currentProfile.diet}, ${currentProfile.region}, ₹${currentProfile.budget})
6. INGREDIENTS: Focus on ${currentProfile.region} Indian regional ingredients
7. NO FORMATTING: Clean text, no **, no excessive symbols`;

      // Add user context to the message
      const bmi = (currentProfile.weight / ((currentProfile.height / 100) ** 2)).toFixed(1);
      const bmiStatus = parseFloat(bmi) < 18.5 ? 'underweight' : parseFloat(bmi) > 24.9 ? 'overweight' : 'normal weight';
      
      const contextualContent = `${content}

USER CONTEXT: I am a ${currentProfile.age}-year-old ${currentProfile.sex.toLowerCase()} following a ${currentProfile.diet} diet in ${currentProfile.region}, India with a budget of ₹${currentProfile.budget} per meal. My height is ${currentProfile.height}cm, weight is ${currentProfile.weight}kg (BMI: ${bmi} - ${bmiStatus})${currentProfile.allergies ? ` and I'm allergic to ${currentProfile.allergies}` : ''}${currentProfile.goals ? ` and my goals are ${currentProfile.goals}` : ''}${currentProfile.genetics ? ` and I have genetic analysis data for ${currentProfile.genetics.traits.length} nutrition-relevant traits` : ''}. Please use this information for personalized recommendations.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextualContent }
        ],
        max_tokens: 4000,
        temperature: 0.7
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response content received from OpenAI');
      }
      
      return responseContent;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return `I encountered an error connecting to OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.

${generateLocalResponse(content)}`;
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Always get the current profile from state, not from closure
      const currentProfile = JSON.parse(localStorage.getItem('planMyDietary_profile') || JSON.stringify({
        age: 24,
        sex: 'Female',
        diet: 'Vegetarian',
        region: 'Any',
        budget: 70,
        allergies: '',
        goals: '',
        height: 160,
        weight: 60
      }));
      
      const response = useOpenAI && apiKey 
        ? await generateOpenAIResponse(content, currentProfile)
        : generateLocalResponse(content);
        
      // Add profile information before the response
      const bmi = (currentProfile.weight / ((currentProfile.height / 100) ** 2)).toFixed(1);
      const bmiStatus = parseFloat(bmi) < 18.5 ? 'underweight' : parseFloat(bmi) > 24.9 ? 'overweight' : 'normal weight';
      
      const profileInfo = `📊 **Current Profile Used:**
Age: ${currentProfile.age} years | Gender: ${currentProfile.sex} | Diet: ${currentProfile.diet}
Region: ${currentProfile.region} | Budget: ₹${currentProfile.budget}/meal
Height: ${currentProfile.height}cm | Weight: ${currentProfile.weight}kg | BMI: ${bmi} (${bmiStatus})
${currentProfile.allergies ? `Allergies: ${currentProfile.allergies}` : ''}
${currentProfile.goals ? `Goals: ${currentProfile.goals}` : ''}
${currentProfile.genetics ? `🧬 Genetics: ${currentProfile.genetics.traits.length} traits analyzed` : ''}

---

`;
        
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: profileInfo + response,
        timestamp: new Date(),
        pointsAwarded: useOpenAI && apiKey ? 20 : 10 // More points for AI-powered responses
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Award points for message interaction
      if (assistantMessage.pointsAwarded) {
        addHealthPoints(assistantMessage.pointsAwarded);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [useOpenAI, apiKey, addHealthPoints]);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case '3-day-plan':
        sendMessage(`Plan 3-day ${profile.diet.toLowerCase()} meals, ${profile.region}, ₹${profile.budget} per meal, 2100 kcal/day${profile.allergies ? `, no ${profile.allergies}` : ''}${profile.goals ? `, focusing on ${profile.goals}` : ''}.`);
        break;
      case 'anemia-screen':
        sendMessage('Do a quick anemia self-screen and suggest tests/diet using local foods.');
        break;
      case 'nutrition-quiz':
        addHealthPoints(20);
        sendMessage('I want to take a nutrition quiz to earn health points!');
        break;
      case 'genetic-diet':
        sendMessage('What diet should I follow based on my genetics?');
        break;
      default:
        sendMessage(action);
    }
  }, [profile, sendMessage, addHealthPoints]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const onQuizComplete = useCallback((points: number) => {
    addHealthPoints(points);
  }, [addHealthPoints]);

  const onPointsEarned = useCallback((points: number) => {
    addHealthPoints(points);
  }, [addHealthPoints]);

  return {
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
    onPointsEarned,
    addHealthPoints
  };
};