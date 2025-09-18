import React, { useCallback, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, AlertCircle, CheckCircle, Dna } from 'lucide-react';

interface GeneticUploadProps {
  onFileUpload: (file: File) => void;
  isAnalyzing: boolean;
  error: string | null;
  parsedData: any[] | null;
}

export const GeneticUpload: React.FC<GeneticUploadProps> = ({
  onFileUpload,
  isAnalyzing,
  error,
  parsedData
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFile) {
      if (csvFile.size > 5 * 1024 * 1024) { // 5MB limit
        return;
      }
      setSelectedFile(csvFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedFile && consentGiven) {
      onFileUpload(selectedFile);
    }
  }, [selectedFile, consentGiven, onFileUpload]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Dna className="w-8 h-8 text-primary" />
          <Badge variant="secondary" className="px-3 py-1">
            CRISPR-powered Genetic Analysis Beta
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Upload Your Genetic Data
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your 23andMe-style CSV file to get personalized nutrition recommendations based on your genetics.
          Required columns: rsid, chromosome, position, genotype.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Genetic Data Upload
          </CardTitle>
          <CardDescription>
            Supports CSV files up to 5MB. Expected format: rsid, chromosome, position, genotype, trait (optional), interpretation (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-primary mx-auto" />
                <h3 className="font-medium">{selectedFile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-medium">Drop your CSV file here</h3>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
            />
            <label htmlFor="consent" className="text-sm leading-relaxed">
              I consent to processing my uploaded genetic data for personalized dietary recommendations. 
              I understand this is not medical advice and results are for educational purposes only.
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-destructive/50 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || !consentGiven || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                Analyzing Genetics...
              </>
            ) : (
              <>
                <Dna className="w-4 h-4 mr-2" />
                Analyze My Genetics
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Data */}
      {parsedData && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Parsing Preview
            </CardTitle>
            <CardDescription>
              First 10 rows of your uploaded genetic data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">RSID</th>
                    <th className="text-left p-2 font-medium">Chromosome</th>
                    <th className="text-left p-2 font-medium">Position</th>
                    <th className="text-left p-2 font-medium">Genotype</th>
                    <th className="text-left p-2 font-medium">Trait</th>
                    <th className="text-left p-2 font-medium">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-mono text-xs">{row.rsid}</td>
                      <td className="p-2">{row.chromosome}</td>
                      <td className="p-2 font-mono text-xs">{row.position}</td>
                      <td className="p-2 font-mono text-xs">{row.genotype}</td>
                      <td className="p-2">{row.trait || '-'}</td>
                      <td className="p-2 text-xs">{row.interpretation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex gap-4 text-sm">
              <Badge variant="outline">
                Total Rows: {parsedData.length}
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success">
                Valid: {parsedData.filter(row => row.rsid && row.genotype).length}
              </Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning">
                Missing Data: {parsedData.filter(row => !row.rsid || !row.genotype).length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};