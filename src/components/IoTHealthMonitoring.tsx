import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, 
  Activity, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Bell,
  Smartphone,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface HealthMetrics {
  bloodPressure: {
    systolic: number;
    diastolic: number;
    status: 'normal' | 'elevated' | 'high';
  };
  bloodGlucose: {
    level: number;
    status: 'normal' | 'low' | 'high';
  };
  heartRate: {
    bpm: number;
    status: 'normal' | 'low' | 'high';
  };
  oxygenSaturation: {
    percentage: number;
    status: 'normal' | 'low';
  };
  timestamp: Date;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  message: string;
  recommendation: string;
  timestamp: Date;
  read: boolean;
}

export const IoTHealthMonitoring: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<HealthMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  // Simulate real-time health data
  const generateRandomMetrics = (): HealthMetrics => {
    const systolic = 90 + Math.random() * 60; // 90-150
    const diastolic = 60 + Math.random() * 30; // 60-90
    const glucose = 70 + Math.random() * 100; // 70-170
    const heartRate = 60 + Math.random() * 60; // 60-120
    const oxygen = 95 + Math.random() * 5; // 95-100

    return {
      bloodPressure: {
        systolic: Math.round(systolic),
        diastolic: Math.round(diastolic),
        status: systolic > 140 || diastolic > 90 ? 'high' : 
                systolic > 120 || diastolic > 80 ? 'elevated' : 'normal'
      },
      bloodGlucose: {
        level: Math.round(glucose),
        status: glucose > 140 ? 'high' : glucose < 80 ? 'low' : 'normal'
      },
      heartRate: {
        bpm: Math.round(heartRate),
        status: heartRate > 100 ? 'high' : heartRate < 60 ? 'low' : 'normal'
      },
      oxygenSaturation: {
        percentage: Math.round(oxygen),
        status: oxygen < 95 ? 'low' : 'normal'
      },
      timestamp: new Date()
    };
  };

  // Check for alerts based on metrics
  const checkForAlerts = (metrics: HealthMetrics) => {
    const newAlerts: HealthAlert[] = [];

    // Blood Pressure Alerts
    if (metrics.bloodPressure.status === 'high') {
      newAlerts.push({
        id: Date.now().toString() + '-bp',
        type: 'critical',
        metric: 'Blood Pressure',
        message: `⚠️ High blood pressure detected: ${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic} mmHg`,
        recommendation: 'Avoid salty or fried foods. Consider light exercise and reduce sodium intake.',
        timestamp: new Date(),
        read: false
      });
    }

    // Blood Glucose Alerts
    if (metrics.bloodGlucose.status === 'high') {
      newAlerts.push({
        id: Date.now().toString() + '-glucose',
        type: 'warning',
        metric: 'Blood Glucose',
        message: `⚠️ High glucose detected: ${metrics.bloodGlucose.level} mg/dL`,
        recommendation: 'Prefer a light protein snack instead of carbs. Avoid sugary foods.',
        timestamp: new Date(),
        read: false
      });
    } else if (metrics.bloodGlucose.status === 'low') {
      newAlerts.push({
        id: Date.now().toString() + '-glucose-low',
        type: 'warning',
        metric: 'Blood Glucose',
        message: `⚠️ Low glucose detected: ${metrics.bloodGlucose.level} mg/dL`,
        recommendation: 'Have a small healthy snack with natural sugars like fruits.',
        timestamp: new Date(),
        read: false
      });
    }

    // Heart Rate Alerts
    if (metrics.heartRate.status === 'high') {
      newAlerts.push({
        id: Date.now().toString() + '-hr',
        type: 'warning',
        metric: 'Heart Rate',
        message: `⚠️ Elevated heart rate: ${metrics.heartRate.bpm} BPM`,
        recommendation: 'Avoid caffeine until heart rate stabilizes. Consider deep breathing.',
        timestamp: new Date(),
        read: false
      });
    }

    // Oxygen Saturation Alerts
    if (metrics.oxygenSaturation.status === 'low') {
      newAlerts.push({
        id: Date.now().toString() + '-oxygen',
        type: 'critical',
        metric: 'Oxygen Saturation',
        message: `⚠️ Low oxygen saturation: ${metrics.oxygenSaturation.percentage}%`,
        recommendation: 'Take slow, deep breaths. Consider iron-rich foods to support oxygen transport.',
        timestamp: new Date(),
        read: false
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
      newAlerts.forEach(alert => {
        toast({
          title: `Health Alert: ${alert.metric}`,
          description: alert.message,
          variant: alert.type === 'critical' ? 'destructive' : 'default',
        });
      });
    }
  };

  // Start IoT simulation
  const startSimulation = () => {
    setIsSimulating(true);
    setIsConnected(true);
    
    const interval = setInterval(() => {
      const newMetrics = generateRandomMetrics();
      setCurrentMetrics(newMetrics);
      checkForAlerts(newMetrics);
    }, 5000); // Update every 5 seconds

    // Store interval ID for cleanup
    (window as any).healthMonitoringInterval = interval;

    toast({
      title: "IoT Device Connected",
      description: "Real-time health monitoring started",
    });
  };

  // Stop IoT simulation
  const stopSimulation = () => {
    setIsSimulating(false);
    setIsConnected(false);
    if ((window as any).healthMonitoringInterval) {
      clearInterval((window as any).healthMonitoringInterval);
    }
    
    toast({
      title: "IoT Device Disconnected",
      description: "Health monitoring stopped",
    });
  };

  // Mark alert as read
  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  // Get status color for metrics
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-success';
      case 'elevated': case 'low': case 'high': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge className="bg-success/20 text-success border-success/30">Normal</Badge>;
      case 'elevated': return <Badge className="bg-warning/20 text-warning border-warning/30">Elevated</Badge>;
      case 'high': return <Badge className="bg-destructive/20 text-destructive border-destructive/30">High</Badge>;
      case 'low': return <Badge className="bg-warning/20 text-warning border-warning/30">Low</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  useEffect(() => {
    return () => {
      if ((window as any).healthMonitoringInterval) {
        clearInterval((window as any).healthMonitoringInterval);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">IoT Health Monitoring</h2>
          <p className="text-muted-foreground">Real-time health metrics from your smartwatch</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isConnected ? 'bg-success/20 text-success' : 'bg-muted/50 text-muted-foreground'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
            <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {!isSimulating ? (
            <Button onClick={startSimulation} className="bg-gradient-primary hover:shadow-glow-primary">
              <Smartphone className="w-4 h-4 mr-2" />
              Connect Device
            </Button>
          ) : (
            <Button onClick={stopSimulation} variant="outline">
              Stop Monitoring
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Notifications
            {alerts.filter(a => !a.read).length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-destructive text-destructive-foreground text-xs">
                {alerts.filter(a => !a.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {!currentMetrics ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Smartphone className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Device Connected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your smartwatch or IoT device to start monitoring your health metrics in real-time.
                </p>
                <Button onClick={startSimulation} className="bg-gradient-primary hover:shadow-glow-primary">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Demo Simulation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Blood Pressure */}
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                  <Heart className={`h-4 w-4 ${getStatusColor(currentMetrics.bloodPressure.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics.bloodPressure.systolic}/{currentMetrics.bloodPressure.diastolic}
                  </div>
                  <p className="text-xs text-muted-foreground">mmHg</p>
                  <div className="mt-2">
                    {getStatusBadge(currentMetrics.bloodPressure.status)}
                  </div>
                </CardContent>
              </Card>

              {/* Blood Glucose */}
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Glucose</CardTitle>
                  <Droplets className={`h-4 w-4 ${getStatusColor(currentMetrics.bloodGlucose.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentMetrics.bloodGlucose.level}</div>
                  <p className="text-xs text-muted-foreground">mg/dL</p>
                  <div className="mt-2">
                    {getStatusBadge(currentMetrics.bloodGlucose.status)}
                  </div>
                </CardContent>
              </Card>

              {/* Heart Rate */}
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                  <Activity className={`h-4 w-4 ${getStatusColor(currentMetrics.heartRate.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentMetrics.heartRate.bpm}</div>
                  <p className="text-xs text-muted-foreground">BPM</p>
                  <div className="mt-2">
                    {getStatusBadge(currentMetrics.heartRate.status)}
                  </div>
                </CardContent>
              </Card>

              {/* Oxygen Saturation */}
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oxygen Saturation</CardTitle>
                  <Wind className={`h-4 w-4 ${getStatusColor(currentMetrics.oxygenSaturation.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentMetrics.oxygenSaturation.percentage}%</div>
                  <p className="text-xs text-muted-foreground">SpO₂</p>
                  <div className="mt-2">
                    {getStatusBadge(currentMetrics.oxygenSaturation.status)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentMetrics && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Health Summary
                </CardTitle>
                <CardDescription>
                  Last updated: {currentMetrics.timestamp.toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Health Status</span>
                    <Badge className={
                      alerts.filter(a => !a.read).length === 0 
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-warning/20 text-warning border-warning/30"
                    }>
                      {alerts.filter(a => !a.read).length === 0 ? 'All Normal' : `${alerts.filter(a => !a.read).length} Alert(s)`}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {alerts.filter(a => !a.read).length === 0 
                      ? "All your health metrics are within normal ranges. Keep up the good work!"
                      : "Some metrics need attention. Check the notifications tab for dietary recommendations."
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Health Notifications
              </CardTitle>
              <CardDescription>
                Real-time alerts and dietary recommendations based on your health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
                  <p className="text-muted-foreground">All your health metrics are normal. Great job!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Alert 
                        key={alert.id} 
                        className={`cursor-pointer transition-all ${
                          alert.read ? 'opacity-60' : ''
                        } ${
                          alert.type === 'critical' ? 'border-destructive/50' : 
                          alert.type === 'warning' ? 'border-warning/50' : 'border-primary/50'
                        }`}
                        onClick={() => markAsRead(alert.id)}
                      >
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.type === 'critical' ? 'text-destructive' : 
                          alert.type === 'warning' ? 'text-warning' : 'text-primary'
                        }`} />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{alert.message}</div>
                              <Badge variant="outline" className="text-xs">
                                {alert.timestamp.toLocaleTimeString()}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              💡 {alert.recommendation}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};