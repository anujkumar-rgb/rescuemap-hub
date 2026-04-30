import { ShieldAlert, Zap, Users, Truck, AlertTriangle, TrendingUp, Play, RotateCcw, BrainCircuit, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeamsQuery, useIncidentsQuery, useVehiclesQuery } from "@/hooks/useQueries";

const simulationData = [
  { time: 'T-0', pressure: 10, capacity: 100 },
  { time: 'T+5', pressure: 25, capacity: 95 },
  { time: 'T+10', pressure: 45, capacity: 90 },
  { time: 'T+15', pressure: 85, capacity: 60 },
  { time: 'T+20', pressure: 95, capacity: 40 },
  { time: 'T+25', pressure: 110, capacity: 20 },
  { time: 'T+30', pressure: 120, capacity: 5 },
];

export default function StrategySandbox() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const { data: teams } = useTeamsQuery();
  const { data: incidents } = useIncidentsQuery();
  const { data: vehicles } = useVehiclesQuery();

  const totalPersonnel = useMemo(() => teams?.length || 0, [teams]);
  const totalVehicles = useMemo(() => vehicles?.length || 0, [vehicles]);
  const activeIncidentCount = useMemo(() => incidents?.length || 0, [incidents]);

  const liveSimulationData = useMemo(() => [
    { time: 'T-0', pressure: activeIncidentCount * 5, capacity: totalPersonnel * 10 },
    { time: 'T+5', pressure: activeIncidentCount * 12, capacity: totalPersonnel * 9 },
    { time: 'T+10', pressure: activeIncidentCount * 18, capacity: totalPersonnel * 8 },
    { time: 'T+15', pressure: activeIncidentCount * 25, capacity: totalPersonnel * 6 },
    { time: 'T+20', pressure: activeIncidentCount * 35, capacity: totalPersonnel * 4 },
  ], [activeIncidentCount, totalPersonnel]);

  const startSimulation = (scenario: string) => {
    setSelectedScenario(scenario);
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <div className="space-y-6 text-white font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <BrainCircuit className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">AI Strategic Intelligence</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">AI Strategy Sandbox</h1>
          <p className="text-sm text-muted-foreground mt-1">Simulate disaster impact using live operational data</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => { setSelectedScenario(null); setIsSimulating(false); }}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset Sandbox
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Simulation</CardTitle>
              <CardDescription className="text-xs">Select a baseline disaster scenario to model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'flood', label: 'Monsoon Flash Flood', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { id: 'fire', label: 'Industrial Firestorm', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                { id: 'medical', label: 'Mass Medical Event', icon: ShieldAlert, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => startSimulation(s.label)}
                  className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    selectedScenario === s.label 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold">{s.label}</span>
                  </div>
                  <Play className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedScenario === s.label ? 'opacity-100 text-primary' : ''}`} />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 border-l-4 border-l-primary relative overflow-hidden">
             <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <RefreshCw className="h-2.5 w-2.5 text-emerald-500 animate-spin-slow" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Live Data Active</span>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strategic Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                {selectedScenario 
                  ? `Based on your current ${totalPersonnel} units, AI predicts a critical resource deficit if a ${selectedScenario} occurs now. Deployment adjustment recommended.`
                  : `Connect to ${activeIncidentCount} active incidents to begin forecasting.`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Display */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Projected Pressure vs Real Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                {isSimulating ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-progress" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground animate-pulse">Processing Database Snapshot...</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liveSimulationData}>
                      <defs>
                        <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="pressure" stroke="#DC2626" fillOpacity={1} fill="url(#colorPressure)" strokeWidth={3} />
                      <Area type="monotone" dataKey="capacity" stroke="#34D399" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-info" /> Critical Personnel Deficit
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { zone: 'Sector A', gap: Math.max(0, 15 - totalPersonnel) },
                    { zone: 'Sector B', gap: Math.max(0, 40 - totalPersonnel) },
                    { zone: 'Sector C', gap: Math.max(0, 25 - totalPersonnel) },
                    { zone: 'Sector D', gap: Math.max(0, 10 - totalPersonnel) },
                  ]}>
                    <Bar dataKey="gap" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Simulation Output Table */}
          <Card className="bg-card border-white/5">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Live-Data Deployment Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 font-bold text-muted-foreground">UNIT TYPE</th>
                      <th className="px-6 py-4 font-bold text-muted-foreground">REQ. QUANTITY</th>
                      <th className="px-6 py-4 font-bold text-muted-foreground">LIVE STOCK</th>
                      <th className="px-6 py-4 font-bold text-muted-foreground">DEFICIT</th>
                      <th className="px-6 py-4 font-bold text-muted-foreground">AI RECOMMENDATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { type: 'Heavy Extraction', req: 12, stock: totalVehicles, deficit: totalVehicles - 12, rec: 'Deploy from Base 02' },
                      { type: 'Bio-Hazard Suit', req: 50, stock: 82, deficit: '+32', rec: 'Ready' },
                      { type: 'Field Medics', req: 24, stock: totalPersonnel, deficit: totalPersonnel - 24, rec: 'Recruit Volunteers' },
                      { type: 'Amphibious Craft', req: 8, stock: 2, deficit: -6, rec: 'Inter-agency Request' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                          <Truck className="h-4 w-4 text-muted-foreground" /> {row.type}
                        </td>
                        <td className="px-6 py-4 font-mono">{row.req}</td>
                        <td className="px-6 py-4 font-mono">{row.stock}</td>
                        <td className={`px-6 py-4 font-black ${typeof row.deficit === 'number' && row.deficit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {row.deficit > 0 ? `+${row.deficit}` : row.deficit}
                        </td>
                        <td className="px-6 py-4 italic text-muted-foreground">{row.rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
