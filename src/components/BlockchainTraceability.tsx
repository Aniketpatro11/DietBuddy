import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Truck, 
  Factory, 
  Store, 
  Leaf, 
  Shield, 
  Calendar, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  Package
} from 'lucide-react';

interface SupplyChainStep {
  id: string;
  stage: string;
  location: string;
  date: string;
  organization: string;
  status: 'completed' | 'in-progress' | 'pending';
  details: Record<string, string>;
  icon: React.ReactNode;
}

interface FoodProduct {
  id: string;
  name: string;
  batch: string;
  category: string;
  fortificationLevel: string;
  expiryDate: string;
  supplyChain: SupplyChainStep[];
  certifications: string[];
  nutritionFacts: Record<string, string>;
}

export const BlockchainTraceability: React.FC = () => {
  const [scannedCode, setScannedCode] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<FoodProduct | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const mockProducts: Record<string, FoodProduct> = {
    'FTF2025-014': {
      id: 'FTF2025-014',
      name: 'Iron-Fortified Wheat Flour',
      batch: 'FTF2025-014',
      category: 'Fortified Grains',
      fortificationLevel: 'Iron: 30mg/kg, Folic Acid: 1.5mg/kg',
      expiryDate: '2025-12-15',
      certifications: ['FSSAI Certified', 'ISO 22000', '+F Fortified Logo'],
      nutritionFacts: {
        'Energy': '341 kcal/100g',
        'Protein': '11.8g/100g', 
        'Iron': '4.5mg/100g (Added)',
        'Folic Acid': '0.15mg/100g (Added)',
        'Fiber': '2.7g/100g'
      },
      supplyChain: [
        {
          id: '1',
          stage: 'Farm Source',
          location: 'Madhya Pradesh, India',
          date: '2025-08-15',
          organization: 'Green Fields Cooperative',
          status: 'completed',
          details: {
            'Farmer ID': 'GFC-MP-2451',
            'Variety': 'HD-2967 (High Protein)',
            'Harvest Date': '2025-08-15',
            'Quality Grade': 'A1'
          },
          icon: <Leaf className="w-5 h-5" />
        },
        {
          id: '2', 
          stage: 'Processing & Fortification',
          location: 'Indore, Madhya Pradesh',
          date: '2025-08-20',
          organization: 'Nutrition Plus Mills Pvt Ltd',
          status: 'completed',
          details: {
            'Mill License': 'FSSAI-10012024015',
            'Fortification Date': '2025-08-20',
            'Iron Premix': 'Ferrous Fumarate',
            'Quality Check': 'Passed - Lab Report #NPM-2025-0820'
          },
          icon: <Factory className="w-5 h-5" />
        },
        {
          id: '3',
          stage: 'Distribution',
          location: 'Mumbai, Maharashtra', 
          date: '2025-08-25',
          organization: 'FoodGrid Logistics',
          status: 'completed',
          details: {
            'Transport ID': 'FGL-TRK-4521',
            'Temperature': '18-22°C Maintained',
            'Storage Duration': '2 days',
            'Destination': '15 retail outlets'
          },
          icon: <Truck className="w-5 h-5" />
        },
        {
          id: '4',
          stage: 'Retail Store',
          location: 'Andheri, Mumbai',
          date: '2025-08-27',
          organization: 'Fresh Mart Supermarket',
          status: 'completed',
          details: {
            'Store License': 'FSSAI-11515008000042',
            'Shelf Date': '2025-08-27',
            'Storage Conditions': 'Dry, Cool Place',
            'Stock Rotation': 'FIFO Method'
          },
          icon: <Store className="w-5 h-5" />
        }
      ]
    },
    'OIL2025-089': {
      id: 'OIL2025-089',
      name: 'Vitamin A Fortified Cooking Oil',
      batch: 'OIL2025-089',
      category: 'Fortified Oils',
      fortificationLevel: 'Vitamin A: 15-30 IU/g',
      expiryDate: '2026-02-20',
      certifications: ['FSSAI Certified', 'Heart Foundation Approved', '+F Fortified Logo'],
      nutritionFacts: {
        'Energy': '900 kcal/100ml',
        'Saturated Fat': '14g/100ml',
        'MUFA': '22g/100ml',
        'PUFA': '64g/100ml',
        'Vitamin A': '25 IU/g (Added)'
      },
      supplyChain: [
        {
          id: '1',
          stage: 'Oil Seeds Source',
          location: 'Rajasthan, India',
          date: '2025-07-10',
          organization: 'Desert Gold Oil Seeds',
          status: 'completed',
          details: {
            'Seed Variety': 'Sunflower - Hybrid',
            'Oil Content': '42%',
            'Moisture Level': '<7%',
            'Aflatoxin Test': 'Negative'
          },
          icon: <Leaf className="w-5 h-5" />
        },
        {
          id: '2',
          stage: 'Oil Extraction & Fortification',
          location: 'Kota, Rajasthan',
          date: '2025-07-15',
          organization: 'Golden Harvest Oil Mills',
          status: 'completed',
          details: {
            'Extraction Method': 'Cold Pressed',
            'Vitamin A Source': 'Retinyl Palmitate',
            'Fortification Level': '25 IU/g',
            'Quality Assured': 'IS:548-2015 Compliant'
          },
          icon: <Factory className="w-5 h-5" />
        }
      ]
    }
  };

  const simulateQRScan = (productId: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setCurrentProduct(mockProducts[productId] || null);
      setScannedCode(productId);
      setIsScanning(false);
    }, 1500);
  };

  const handleManualEntry = () => {
    if (scannedCode && mockProducts[scannedCode]) {
      setCurrentProduct(mockProducts[scannedCode]);
    } else {
      setCurrentProduct(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in-progress':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success/30 bg-success/10';
      case 'in-progress':
        return 'border-warning/30 bg-warning/10';
      default:
        return 'border-muted/30 bg-muted/10';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Food Traceability System</h2>
            <p className="text-muted-foreground">Scan QR codes to track food supply chains</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Button 
            onClick={() => simulateQRScan('FTF2025-014')}
            className="bg-gradient-success hover:shadow-glow-success p-4 h-auto"
            disabled={isScanning}
          >
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Iron Fortified Flour</div>
              <div className="text-xs opacity-80">Batch: FTF2025-014</div>
            </div>
          </Button>

          <Button 
            onClick={() => simulateQRScan('OIL2025-089')}
            className="bg-gradient-primary hover:shadow-glow-primary p-4 h-auto"
            variant="secondary"
            disabled={isScanning}
          >
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Vitamin A Oil</div>
              <div className="text-xs opacity-80">Batch: OIL2025-089</div>
            </div>
          </Button>

          <div className="space-y-2">
            <Input 
              placeholder="Enter batch code..."
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
            />
            <Button 
              onClick={handleManualEntry}
              variant="outline" 
              className="w-full"
              size="sm"
            >
              Look Up
            </Button>
          </div>
        </div>

        {isScanning && (
          <Card className="glass p-8 text-center">
            <QrCode className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
            <div className="text-lg font-semibold">Scanning QR Code...</div>
            <div className="text-sm text-muted-foreground">Fetching blockchain data</div>
          </Card>
        )}
      </Card>

      {currentProduct && (
        <Tabs defaultValue="supply-chain" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="supply-chain">Supply Chain</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
          </TabsList>

          <TabsContent value="supply-chain" className="space-y-4">
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{currentProduct.name}</h3>
                  <p className="text-muted-foreground">Batch: {currentProduct.batch}</p>
                </div>
                <Badge className="bg-gradient-success text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">Fortification Level</div>
                  <div className="font-medium">{currentProduct.fortificationLevel}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expiry Date</div>
                  <div className="font-medium">{currentProduct.expiryDate}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Supply Chain Journey
                </h4>

                {currentProduct.supplyChain.map((step, index) => (
                  <Card key={step.id} className={`hover-lift fade-in-up ${index < 4 ? `stagger-${index + 1}` : ''} p-4 ${getStatusColor(step.status)}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                        {step.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{step.stage}</h5>
                          {getStatusIcon(step.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {step.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {step.date}
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium mb-2">{step.organization}</div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(step.details).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-muted-foreground">{key}</div>
                              <div className="font-medium">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {index < currentProduct.supplyChain.length - 1 && (
                      <div className="mt-4 flex justify-center">
                        <div className="w-0.5 h-8 bg-border"></div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4">
            <Card className="glass p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Certifications & Compliance
              </h3>

              <div className="grid gap-3">
                {currentProduct.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="font-medium">{cert}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-semibold text-success mb-2">Blockchain Verification</h4>
                <div className="text-sm text-muted-foreground">
                  This product's supply chain has been verified on the blockchain. 
                  All transactions and quality checkpoints are immutable and traceable.
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Block Hash: 0x7d1a...9f4c | Confirmations: 1,247
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4">
            <Card className="glass p-6">
              <h3 className="text-lg font-bold mb-4">Nutrition Information</h3>

              <div className="grid gap-3">
                {Object.entries(currentProduct.nutritionFacts).map(([nutrient, value]) => (
                  <div key={nutrient} className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="font-medium">{nutrient}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Fortification Benefits</h4>
                <div className="text-sm text-muted-foreground">
                  {currentProduct.category === 'Fortified Grains' 
                    ? 'Iron fortification helps prevent anemia, especially in women and children. Folic acid supports healthy pregnancy and prevents neural tube defects.'
                    : 'Vitamin A fortification supports immune system function, vision health, and proper growth and development.'
                  }
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {scannedCode && !currentProduct && !isScanning && (
        <Card className="glass p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-warning" />
          <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
          <p className="text-muted-foreground">
            The batch code "{scannedCode}" was not found in our database. 
            Please check the code and try again.
          </p>
        </Card>
      )}
    </div>
  );
};