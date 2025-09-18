import { useState, useCallback } from 'react';

export interface GeneticTrait {
  trait_name: string;
  supporting_snps: string[];
  interpretation: string;
  recommendations: {
    type: 'diet' | 'supplement' | 'lifestyle';
    text: string;
    confidence: 'low' | 'moderate' | 'high';
  }[];
  confidence: 'low' | 'moderate' | 'high' | 'user_provided';
}

export interface GeneticAnalysisResult {
  sample_id: string | null;
  upload_hash: string;
  parsed_rows: number;
  valid_rows: number;
  invalid_rows: number;
  missing_rows: Array<{ row_index: number; reason: string }>;
  traits: GeneticTrait[];
  meal_plan: {
    duration_days: number;
    meals: Array<{
      day: number;
      meal: string;
      recipe_id: string;
      title: string;
      serving_size: number;
      estimated_cost: number;
      ingredients: Array<{ name: string; qty: string }>;
      substitutions: Array<{ for: string; sub: string }>;
    }>;
  };
  grocery_list: Array<{ name: string; qty: string; estimated_cost: number }>;
  traceability: {
    file_name: string;
    upload_time: string;
    mapping_version: string;
    hash: string;
  };
  badges_awarded: string[];
  disclaimer: string;
}

interface CSVRow {
  rsid: string;
  chromosome: string;
  position: string;
  genotype: string;
  trait?: string;
  interpretation?: string;
  sample_id?: string;
}

const SNP_TRAIT_MAPPING = {
  'rs4988235': {
    trait: 'Lactose Tolerance',
    mapping: {
      'GG': 'Lactose tolerant',
      'AA': 'Lactose intolerant', 
      'AG': 'Intermediate lactose tolerance',
      'GA': 'Intermediate lactose tolerance'
    }
  },
  'rs1801133': {
    trait: 'Folate Metabolism',
    mapping: {
      'CC': 'Normal folate metabolism',
      'CT': 'Intermediate (reduced) folate function',
      'TC': 'Intermediate (reduced) folate function',
      'TT': 'Reduced folate function (consider increased dietary folate)'
    }
  },
  'rs762551': {
    trait: 'Caffeine Metabolism',
    mapping: {
      'AA': 'Fast metabolizer',
      'AC': 'Intermediate',
      'CA': 'Intermediate',
      'CC': 'Slow metabolizer (recommend lower caffeine)'
    }
  },
  'rs2282679': {
    trait: 'Vitamin D Binding',
    mapping: {
      'GG': 'Normal vitamin D binding',
      'GT': 'Reduced vitamin D binding (consider higher vitamin D sources)',
      'TG': 'Reduced vitamin D binding (consider higher vitamin D sources)',
      'TT': 'Reduced vitamin D binding (consider higher vitamin D sources)'
    }
  },
  'rs174537': {
    trait: 'Omega-3 Processing',
    mapping: {
      'GG': 'Normal omega-3 conversion',
      'GT': 'Intermediate omega-3 conversion',
      'TG': 'Intermediate omega-3 conversion', 
      'TT': 'Lower endogenous conversion (recommend dietary omega-3)'
    }
  },
  'rs9939609': {
    trait: 'FTO Obesity Risk',
    mapping: {
      'TT': 'Typical risk',
      'AT': 'Intermediate risk',
      'TA': 'Intermediate risk',
      'AA': 'Higher risk'
    }
  }
};

const GENETIC_RULES = {
  "Lactose Tolerance": {
    "normal": "You can safely consume milk, yogurt, and cheese.",
    "reduced": "Limit dairy. Prefer lactose-free milk, soy milk, or almond milk.",
    "intolerant": "Avoid dairy completely. Use fortified plant-based alternatives."
  },
  "Folate Metabolism": {
    "normal": "Normal folate metabolism. Maintain a balanced diet.",
    "reduced": "Increase intake of leafy greens, beans, lentils, and citrus fruits.",
    "high": "Monitor folate supplementation, avoid excessive fortified foods."
  },
  "Caffeine Metabolism": {
    "fast": "You process caffeine quickly. Moderate coffee/tea is fine.",
    "slow": "You process caffeine slowly. Limit coffee and avoid late consumption."
  },
  "Vitamin D Binding": {
    "normal": "Maintain adequate sun exposure and a balanced diet.",
    "reduced": "Consider Vitamin D-rich foods (fish, eggs, fortified milk) or supplements."
  },
  "Omega-3 Processing": {
    "normal": "Include fish, flaxseeds, and walnuts regularly.",
    "reduced": "Prioritize fatty fish (salmon, sardines) or omega-3 supplements."
  },
  "FTO Obesity Risk": {
    "typical": "Maintain regular exercise and balanced nutrition.",
    "intermediate": "Focus on portion control and regular physical activity.",
    "higher": "Prioritize structured meal timing and consistent exercise routine."
  }
};

export const useGeneticAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState<GeneticAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved genetic data from localStorage
  useState(() => {
    const savedResult = localStorage.getItem('geneticAnalysisResult');
    if (savedResult) {
      try {
        setAnalysisResult(JSON.parse(savedResult));
      } catch (e) {
        console.error('Error loading saved genetic analysis:', e);
      }
    }
  });

  const normalizeGenotype = (genotype: string): string => {
    if (!genotype) return '';
    
    // Remove separators and normalize
    let normalized = genotype.replace(/[\/\|]/g, '').toUpperCase().trim();
    
    // Handle single allele (make homozygous)
    if (normalized.length === 1 && /[ATCG]/.test(normalized)) {
      normalized = normalized + normalized;
    }
    
    // Validate genotype
    if (!/^[ATCG]{2}$/.test(normalized)) {
      return '';
    }
    
    return normalized;
  };

  const validateCSVHeaders = (headers: string[]): { valid: boolean; missing: string[] } => {
    const required = ['rsid', 'chromosome', 'position', 'genotype'];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    
    const missing = required.filter(req => 
      !normalizedHeaders.some(h => h === req)
    );
    
    return { valid: missing.length === 0, missing };
  };

  const parseCSV = useCallback(async (file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV file must contain headers and at least one data row');
          }
          
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const headerValidation = validateCSVHeaders(headers);
          
          if (!headerValidation.valid) {
            throw new Error(`Missing required headers: ${headerValidation.missing.join(', ')}`);
          }
          
          const rows: CSVRow[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length < headers.length) continue;
            
            const row: any = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx] || '';
            });
            
            // Normalize required fields
            if (row.rsid) row.rsid = row.rsid.toUpperCase();
            if (row.genotype) row.genotype = normalizeGenotype(row.genotype);
            
            rows.push(row as CSVRow);
          }
          
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  const mapSNPsToTraits = (rows: CSVRow[]): GeneticTrait[] => {
    const traits: GeneticTrait[] = [];
    const processedTraits = new Set<string>();
    
    for (const row of rows) {
      // Use user-provided trait if available
      if (row.trait && row.interpretation) {
        if (!processedTraits.has(row.trait)) {
          traits.push({
            trait_name: row.trait,
            supporting_snps: [row.rsid],
            interpretation: row.interpretation,
            recommendations: generateRecommendations(row.trait, row.interpretation),
            confidence: 'user_provided'
          });
          processedTraits.add(row.trait);
        }
        continue;
      }
      
      // Map known SNPs
      const snpMapping = SNP_TRAIT_MAPPING[row.rsid as keyof typeof SNP_TRAIT_MAPPING];
      if (snpMapping && row.genotype) {
        const interpretation = snpMapping.mapping[row.genotype as keyof typeof snpMapping.mapping];
        if (interpretation && !processedTraits.has(snpMapping.trait)) {
          traits.push({
            trait_name: snpMapping.trait,
            supporting_snps: [row.rsid],
            interpretation,
            recommendations: generateRecommendations(snpMapping.trait, interpretation),
            confidence: 'moderate'
          });
          processedTraits.add(snpMapping.trait);
        }
      }
    }
    
    return traits;
  };

  const generateRecommendations = (trait: string, interpretation: string): GeneticTrait['recommendations'] => {
    const recommendations: GeneticTrait['recommendations'] = [];
    
    // Generate recommendations based on trait and interpretation
    if (trait === 'Lactose Tolerance' && interpretation.includes('intolerant')) {
      recommendations.push({
        type: 'diet',
        text: 'Replace dairy milk with soy, almond, or oat milk. Choose lactose-free yogurt and cheese alternatives.',
        confidence: 'high'
      });
    }
    
    if (trait === 'Folate Metabolism' && interpretation.includes('reduced')) {
      recommendations.push({
        type: 'diet',
        text: 'Include daily servings of spinach, lentils, chickpeas, and citrus fruits. Consider folate-rich whole grains.',
        confidence: 'moderate'
      });
      recommendations.push({
        type: 'supplement',
        text: 'Consult healthcare provider about folate supplementation.',
        confidence: 'low'
      });
    }
    
    if (trait === 'Caffeine Metabolism' && interpretation.includes('slow')) {
      recommendations.push({
        type: 'lifestyle',
        text: 'Limit caffeine to <200mg daily. Avoid coffee after 2 PM to prevent sleep disruption.',
        confidence: 'high'
      });
    }
    
    return recommendations;
  };

  const analyzeGenetics = useCallback(async (file: File, userProfile: any) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Parse CSV
      const rows = await parseCSV(file);
      setParsedData(rows);
      
      // Validate rows
      const validRows = rows.filter(row => 
        row.rsid && row.rsid.startsWith('RS') && row.genotype && /^[ATCG]{2}$/.test(row.genotype)
      );
      
      const invalidRows = rows.length - validRows.length;
      
      // Map to traits
      const traits = mapSNPsToTraits(validRows);
      
      // Generate file hash
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Create analysis result
      const result: GeneticAnalysisResult = {
        sample_id: null,
        upload_hash: hash,
        parsed_rows: rows.length,
        valid_rows: validRows.length,
        invalid_rows: invalidRows,
        missing_rows: [],
        traits,
        meal_plan: {
          duration_days: 7,
          meals: [] // Will be generated by AI
        },
        grocery_list: [],
        traceability: {
          file_name: file.name,
          upload_time: new Date().toISOString(),
          mapping_version: 'v1.0',
          hash
        },
        badges_awarded: ['DNA-Verified', 'First-Report'],
        disclaimer: 'This service provides informational recommendations only and is not a medical diagnosis. Always consult a licensed healthcare professional before starting supplements or major diet changes.'
      };
      
      setAnalysisResult(result);
      localStorage.setItem('geneticAnalysisResult', JSON.stringify(result));
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [parseCSV]);

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setParsedData(null);
    setUploadedFile(null);
    setError(null);
    localStorage.removeItem('geneticAnalysisResult');
  }, []);

  return {
    analysisResult,
    isAnalyzing,
    uploadedFile,
    setUploadedFile,
    parsedData,
    error,
    analyzeGenetics,
    clearAnalysis
  };
};