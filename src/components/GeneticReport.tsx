import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Dna, 
  FileText, 
  Award, 
  ShoppingCart, 
  AlertTriangle,
  Download,
  Hash,
  Calendar,
  TrendingUp,
  QrCode,
  Loader2
} from 'lucide-react';
import { GeneticAnalysisResult } from '@/hooks/useGeneticAnalysis';
import { usePlanMyDietary } from '@/hooks/usePlanMyDietary';
import { toast } from 'sonner';
import JsBarcode from 'jsbarcode';

interface GeneticReportProps {
  result: GeneticAnalysisResult;
  onClearResults: () => void;
}

export const GeneticReport: React.FC<GeneticReportProps> = ({
  result,
  onClearResults
}) => {
  const { sendMessage, isLoading, profile, setProfile } = usePlanMyDietary();
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-success/10 text-success border-success/20';
      case 'moderate': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted/10 text-muted-foreground border-muted/20';
      case 'user_provided': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'diet': return '🥗';
      case 'supplement': return '💊';
      case 'lifestyle': return '🏃';
      default: return '📝';
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      // Create comprehensive genetic report data for CRISPR genetics input
      const geneticReportData = result.traits.map(trait => 
        `${trait.trait_name}: ${trait.interpretation} (${trait.confidence} confidence) - Recommendations: ${trait.recommendations.map(rec => rec.text).join(', ')}`
      ).join(' | ');
      
      // First, update the user profile with genetic data
      const geneticsData = {
        traits: result.traits.map(trait => ({
          trait_name: trait.trait_name,
          interpretation: trait.interpretation,
          recommendations: trait.recommendations.map(rec => rec.text),
          confidence: trait.confidence
        })),
        uploadHash: result.upload_hash,
        reportData: geneticReportData
      };

      // Update the profile with genetic data
      const updatedProfile = {
        ...profile,
        genetics: geneticsData
      };
      
      setProfile(updatedProfile);
      
      // Create a genetic-focused prompt
      const geneticSummary = result.traits.map(trait => 
        `${trait.trait_name}: ${trait.interpretation} (Confidence: ${trait.confidence})`
      ).join(', ');
      
      const prompt = `Generate a comprehensive 7-day personalized meal plan based on my genetic analysis results: ${geneticSummary}. 

Please provide:
1. Daily meals (breakfast, lunch, dinner, snacks) for 7 days
2. Each meal should address my specific genetic traits
3. Include preparation tips and nutritional benefits
4. Consider my dietary preferences and restrictions from my profile
5. Stay within my budget constraints
6. Highlight which genetic traits each meal addresses

Make sure to create a detailed meal plan that I can follow immediately.`;
      
      // Give a moment for profile to save to localStorage
      setTimeout(async () => {
        await sendMessage(prompt);
      }, 100);
      
      toast.success('Updating profile with genetic data and generating personalized meal plan...');
    } catch (error) {
      toast.error('Failed to generate meal plan. Please try again.');
    }
  };

  const generateBarcode = async () => {
    setIsGeneratingBarcode(true);
    try {
      // Create a unique identifier for the genetic report
      const geneticId = `GR${result.upload_hash.slice(0, 8).toUpperCase()}${Date.now().toString().slice(-4)}`;
      
      // Create a simplified genetic data string for barcode
      const geneticSummary = result.traits.map(trait => {
        const shortName = trait.trait_name.replace(/\s+/g, '').slice(0, 8);
        const shortInterpretation = trait.interpretation.split(' ')[0];
        return `${shortName}=${shortInterpretation}`;
      }).join(';');
      
      // Use the genetic ID as barcode data (shorter and more reliable)
      const barcodeData = geneticId;
      
      // Create a canvas element to generate barcode
      const canvas = document.createElement('canvas');
      
      // Generate barcode using JsBarcode
      JsBarcode(canvas, barcodeData, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        textMargin: 10,
        background: "#FFFFFF",
        lineColor: "#000000"
      });
      
      const barcodeDataURL = canvas.toDataURL('image/png');
      setBarcodeUrl(barcodeDataURL);
      
      // Store the full genetic data with the ID for future reference
      const fullGeneticData = {
        id: geneticId,
        sample_id: result.sample_id,
        upload_hash: result.upload_hash,
        traits: result.traits,
        summary: geneticSummary,
        generated_at: new Date().toISOString()
      };
      
      // Save to localStorage for future barcode scanning
      localStorage.setItem(`genetic_report_${geneticId}`, JSON.stringify(fullGeneticData));
      
      toast.success('Barcode generated successfully!');
    } catch (error) {
      toast.error('Failed to generate barcode. Please try again.');
    } finally {
      setIsGeneratingBarcode(false);
    }
  };

  const downloadBarcode = () => {
    if (barcodeUrl) {
      const link = document.createElement('a');
      link.download = `genetic-report-barcode-${result.traceability.hash.slice(0, 8)}.png`;
      link.href = barcodeUrl;
      link.click();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Dna className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">DietBuddy — Personalized Genetic Nutrition Report</h1>
        </div>
        
        {/* Badges Awarded */}
        <div className="flex justify-center gap-2 flex-wrap">
          {result.badges_awarded.map((badge, idx) => (
            <Badge key={idx} className="bg-gradient-success text-white">
              <Award className="w-3 h-3 mr-1" />
              {badge}
            </Badge>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-primary">{result.traits.length}</div>
              <div className="text-xs text-muted-foreground">Traits Analyzed</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-success">{result.valid_rows}</div>
              <div className="text-xs text-muted-foreground">Valid SNPs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-warning">{result.invalid_rows}</div>
              <div className="text-xs text-muted-foreground">Invalid SNPs</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Genetic Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Genetic Findings
          </CardTitle>
          <CardDescription>
            Your genetic variants and their nutritional implications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.traits.map((trait, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{trait.trait_name}</h3>
                <Badge className={getConfidenceColor(trait.confidence)}>
                  {trait.confidence}
                </Badge>
              </div>
              
              <p className="text-muted-foreground">{trait.interpretation}</p>
              
              {/* Supporting SNPs */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Supporting SNPs:</span>
                {trait.supporting_snps.map((snp, snpIdx) => (
                  <Badge key={snpIdx} variant="outline" className="font-mono text-xs">
                    {snp}
                  </Badge>
                ))}
              </div>

              {/* Recommendations */}
              {trait.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recommendations:</h4>
                  {trait.recommendations.map((rec, recIdx) => (
                    <div key={recIdx} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded">
                      <span className="text-base">{getRecommendationIcon(rec.type)}</span>
                      <div className="flex-1">
                        <span className="font-medium capitalize">{rec.type}:</span> {rec.text}
                      </div>
                      <Badge className={getConfidenceColor(rec.confidence)}>
                        {rec.confidence}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {result.traits.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No known nutritional genetic variants were found in your data. This doesn't mean you don't have any - 
                it may be that your SNPs aren't in our current mapping database.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Traceability Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Traceability & Data Security
          </CardTitle>
          <CardDescription>
            Information about your genetic data processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Name:</span>
                <span className="font-mono">{result.traceability.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upload Time:</span>
                <span>{new Date(result.traceability.upload_time).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mapping Version:</span>
                <span className="font-mono">{result.traceability.mapping_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Hash:</span>
                <span className="font-mono text-xs">{result.traceability.hash.slice(0, 16)}...</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Report PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Download Parsed CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateBarcode}
              disabled={isGeneratingBarcode}
            >
              {isGeneratingBarcode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Hash className="w-4 h-4 mr-2" />
              )}
              Generate Barcode
            </Button>
          </div>
          
          {barcodeUrl && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-2">Genetic Report Barcode</h4>
              <div className="flex items-center gap-4">
                <img src={barcodeUrl} alt="Genetic Report Barcode" className="border rounded bg-white p-2" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This barcode contains your unique genetic report ID and can be scanned to retrieve your data
                  </p>
                  <Button size="sm" onClick={downloadBarcode}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Barcode
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert className="border-warning/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Medical & Privacy Disclaimer:</strong> {result.disclaimer}
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button onClick={onClearResults} variant="outline">
          Upload New File
        </Button>
        <Button 
          onClick={handleGenerateMealPlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          Generate Meal Plan
        </Button>
      </div>
    </div>
  );
};