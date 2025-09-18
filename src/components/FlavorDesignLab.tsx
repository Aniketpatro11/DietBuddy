import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  Sparkles, 
  ChefHat, 
  Beaker, 
  Star, 
  Heart,
  Flame,
  Snowflake,
  Coffee,
  Apple
} from 'lucide-react';

interface FlavorProfile {
  sweetness: number;
  saltiness: number;
  sourness: number;
  bitterness: number;
  umami: number;
  spiciness: number;
}

interface TextureProfile {
  crunchiness: number;
  chewiness: number;
  smoothness: number;
  moisture: number;
}

interface DesignedProduct {
  id: string;
  name: string;
  baseIngredient: string;
  flavorProfile: FlavorProfile;
  textureProfile: TextureProfile;
  nutritionScore: number;
  suggestions: string[];
  matchingFoods: string[];
}

export const FlavorDesignLab: React.FC = () => {
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile>({
    sweetness: 50,
    saltiness: 50,
    sourness: 50,
    bitterness: 50,
    umami: 50,
    spiciness: 50,
  });
  
  const [textureProfile, setTextureProfile] = useState<TextureProfile>({
    crunchiness: 50,
    chewiness: 50,
    smoothness: 50,
    moisture: 50,
  });

  const [designedProduct, setDesignedProduct] = useState<DesignedProduct | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const baseIngredients = [
    { id: 'millet', name: 'Millet (Bajra)', category: 'Grain' },
    { id: 'lentils', name: 'Red Lentils (Masoor)', category: 'Legume' },
    { id: 'chickpea', name: 'Chickpea Flour', category: 'Legume' },
    { id: 'rice', name: 'Brown Rice', category: 'Grain' },
    { id: 'quinoa', name: 'Quinoa', category: 'Grain' },
    { id: 'sweet-potato', name: 'Sweet Potato', category: 'Vegetable' },
  ];

  const generateProduct = () => {
    if (!selectedBase) return;

    setIsGenerating(true);
    
    setTimeout(() => {
      const baseIngredient = baseIngredients.find(b => b.id === selectedBase);
      const productVariants = generateProductVariants(baseIngredient!, flavorProfile, textureProfile);
      
      setDesignedProduct(productVariants);
      setIsGenerating(false);
    }, 2000);
  };

  const generateProductVariants = (
    base: typeof baseIngredients[0], 
    flavor: FlavorProfile, 
    texture: TextureProfile
  ): DesignedProduct => {
    // AI-like suggestions based on flavor and texture profiles
    const suggestions = [];
    const matchingFoods = [];

    // Sweetness-based suggestions
    if (flavor.sweetness > 70) {
      suggestions.push('Add jaggery or dates for natural sweetness');
      matchingFoods.push('Coconut', 'Almonds', 'Raisins');
    } else if (flavor.sweetness < 30) {
      suggestions.push('Balance with mild sweet spices like cinnamon');
    }

    // Spiciness-based suggestions  
    if (flavor.spiciness > 70) {
      suggestions.push('Include cooling elements like mint or yogurt');
      matchingFoods.push('Yogurt', 'Cucumber', 'Mint leaves');
    }

    // Texture-based suggestions
    if (texture.crunchiness > 70) {
      suggestions.push('Add roasted nuts or seeds for extra crunch');
      matchingFoods.push('Roasted peanuts', 'Sesame seeds', 'Fried curry leaves');
    }

    if (texture.smoothness > 70) {
      suggestions.push('Consider a creamy base like coconut milk');
      matchingFoods.push('Coconut milk', 'Cashew paste', 'Ghee');
    }

    // Base-specific recommendations
    if (base.id === 'millet') {
      suggestions.push('Millet pairs well with cumin and coriander');
      matchingFoods.push('Cumin seeds', 'Fresh coriander', 'Lemon juice');
    }

    // Calculate nutrition score based on ingredient balance
    const nutritionScore = Math.round(
      (100 - Math.abs(flavor.sweetness - 40)) * 0.3 +
      (100 - Math.abs(flavor.saltiness - 30)) * 0.2 +
      (flavor.umami * 0.3) +
      (texture.moisture * 0.2)
    );

    return {
      id: `designed-${Date.now()}`,
      name: generateProductName(base, flavor, texture),
      baseIngredient: base.name,
      flavorProfile: flavor,
      textureProfile: texture,
      nutritionScore,
      suggestions: suggestions.slice(0, 4),
      matchingFoods: matchingFoods.slice(0, 6),
    };
  };

  const generateProductName = (
    base: typeof baseIngredients[0], 
    flavor: FlavorProfile, 
    texture: TextureProfile
  ): string => {
    const baseName = base.name.split(' ')[0];
    
    let descriptors = [];
    
    if (flavor.spiciness > 70) descriptors.push('Spicy');
    if (flavor.sweetness > 70) descriptors.push('Sweet');
    if (texture.crunchiness > 70) descriptors.push('Crunchy');
    if (texture.smoothness > 70) descriptors.push('Smooth');
    if (flavor.umami > 60) descriptors.push('Savory');
    
    if (descriptors.length === 0) descriptors = ['Balanced'];
    
    const productTypes = texture.crunchiness > 50 ? ['Crispies', 'Bites', 'Chips'] : ['Porridge', 'Smoothie', 'Pudding'];
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
    
    return `${descriptors.join(' ')} ${baseName} ${productType}`;
  };

  const getFlavorIntensity = (value: number) => {
    if (value > 80) return { label: 'Very High', color: 'text-red-500' };
    if (value > 60) return { label: 'High', color: 'text-orange-500' };
    if (value > 40) return { label: 'Medium', color: 'text-yellow-500' };
    if (value > 20) return { label: 'Low', color: 'text-blue-500' };
    return { label: 'Very Low', color: 'text-gray-500' };
  };

  const getNutritionGrade = (score: number) => {
    if (score >= 80) return { grade: 'A+', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 70) return { grade: 'A', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 60) return { grade: 'B+', color: 'text-warning', bg: 'bg-warning/10' };
    if (score >= 50) return { grade: 'B', color: 'text-warning', bg: 'bg-warning/10' };
    return { grade: 'C', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  return (
    <div className="space-y-6">
      <Card className="glass p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Flavor by Design Lab</h2>
            <p className="text-muted-foreground">Design your perfect food product with AI assistance</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Choose Base Ingredient</label>
          <Select value={selectedBase} onValueChange={setSelectedBase}>
            <SelectTrigger>
              <SelectValue placeholder="Select a base ingredient..." />
            </SelectTrigger>
            <SelectContent>
              {baseIngredients.map((ingredient) => (
                <SelectItem key={ingredient.id} value={ingredient.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{ingredient.category}</Badge>
                    {ingredient.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBase && (
          <Tabs defaultValue="flavor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flavor">Flavor Profile</TabsTrigger>
              <TabsTrigger value="texture">Texture Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="flavor" className="space-y-6">
              <div className="space-y-6">
                {Object.entries(flavorProfile).map(([key, value]) => {
                  const intensity = getFlavorIntensity(value);
                  const icons: Record<string, React.ReactNode> = {
                    sweetness: <Apple className="w-4 h-4" />,
                    saltiness: <Beaker className="w-4 h-4" />,
                    sourness: <Coffee className="w-4 h-4" />,
                    bitterness: <Snowflake className="w-4 h-4" />,
                    umami: <Heart className="w-4 h-4" />,
                    spiciness: <Flame className="w-4 h-4" />,
                  };

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {icons[key]}
                          <label className="text-sm font-medium capitalize">{key}</label>
                        </div>
                        <div className={`text-sm font-medium ${intensity.color}`}>
                          {intensity.label} ({value}%)
                        </div>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => 
                          setFlavorProfile(prev => ({ ...prev, [key]: newValue }))
                        }
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="texture" className="space-y-6">
              <div className="space-y-6">
                {Object.entries(textureProfile).map(([key, value]) => {
                  const intensity = getFlavorIntensity(value);
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium capitalize">{key}</label>
                        <div className={`text-sm font-medium ${intensity.color}`}>
                          {intensity.label} ({value}%)
                        </div>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => 
                          setTextureProfile(prev => ({ ...prev, [key]: newValue }))
                        }
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {selectedBase && (
          <div className="mt-6">
            <Button 
              onClick={generateProduct}
              disabled={isGenerating}
              className="bg-gradient-success hover:shadow-glow-success w-full"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Designing Your Product...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Generate Product Design
                </div>
              )}
            </Button>
          </div>
        )}
      </Card>

      {designedProduct && (
        <Card className="glass hover-lift fade-in-up scale-in p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{designedProduct.name}</h3>
              <p className="text-muted-foreground">Based on {designedProduct.baseIngredient}</p>
            </div>
            
            <div className={`px-3 py-1 rounded-lg ${getNutritionGrade(designedProduct.nutritionScore).bg}`}>
              <div className="text-center">
                <div className={`text-lg font-bold ${getNutritionGrade(designedProduct.nutritionScore).color}`}>
                  {getNutritionGrade(designedProduct.nutritionScore).grade}
                </div>
                <div className="text-xs text-muted-foreground">Nutrition</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </h4>
              <div className="space-y-2">
                {designedProduct.suggestions.map((suggestion, index) => (
                  <div key={index} className={`flex items-start gap-2 p-2 bg-muted/20 rounded-lg hover-lift fade-in-up ${index < 4 ? `stagger-${index + 1}` : ''}`}>
                    <Star className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Perfect Pairings
              </h4>
              <div className="flex flex-wrap gap-2">
                {designedProduct.matchingFoods.map((food, index) => (
                  <Badge key={index} variant="secondary" className="glass">
                    {food}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Product Analysis</h4>
            <div className="text-sm text-muted-foreground">
              Your designed product shows a balanced flavor profile with a nutrition score of {designedProduct.nutritionScore}/100. 
              The combination of {designedProduct.baseIngredient.toLowerCase()} with these flavor characteristics 
              creates a unique product that maintains nutritional value while delivering on taste preferences.
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1">
              Save Design
            </Button>
            <Button 
              onClick={() => setDesignedProduct(null)} 
              className="bg-gradient-primary hover:shadow-glow-primary flex-1"
            >
              Create Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};