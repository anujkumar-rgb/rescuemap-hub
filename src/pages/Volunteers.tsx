import { useState } from "react";
import { Search, Plus, UserPlus, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { useVolunteersQuery } from "@/hooks/useQueries";
import { supabase } from "@/supabase";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import type { Volunteer } from "@/data/mock";

const SKILLS_LIST = ["First Aid", "Swimming", "Driving", "Medical", "Construction", "Search & Rescue"];
const AVAILABILITY_OPTIONS = ["Immediate", "Within 24hrs", "Weekend only"];

export default function Volunteers() {
  const { data: volunteers, refetch } = useVolunteersQuery();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState("Immediate");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !city || selectedSkills.length === 0) {
      toast.error("Please fill all required fields and select at least one skill.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isDemo = localStorage.getItem("demo_bypass") === "true";
      if (!isDemo) {
        const { error } = await supabase.from("volunteers").insert({
          name, phone, city, skills: selectedSkills, availability, status: "Available"
        });
        if (error) throw error;
      } else {
        // In demo mode, we just show a success toast
        console.log("Mock Registration:", { name, phone, city, selectedSkills, availability });
      }
      
      toast.success("Volunteer registered successfully!");
      setName(""); setPhone(""); setCity(""); setSelectedSkills([]); setAvailability("Immediate");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to register volunteer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVolunteers = (volunteers || []).filter((v: Volunteer) => {
    const term = searchQuery.toLowerCase();
    return v.city.toLowerCase().includes(term) || 
           v.skills.some(s => s.toLowerCase().includes(term)) ||
           v.name.toLowerCase().includes(term);
  });

  const totalRegistered = volunteers?.length || 0;
  const currentlyAssigned = volunteers?.filter(v => v.status === "Assigned").length || 0;
  const availableNow = volunteers?.filter(v => v.status === "Available").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Management</h1>
          <p className="text-muted-foreground mt-1">Coordinate and deploy civilian volunteers</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-6 shadow-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
            <h3 className="text-2xl font-bold">{totalRegistered}</h3>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Currently Assigned</p>
            <h3 className="text-2xl font-bold">{currentlyAssigned}</h3>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Available Now</p>
            <h3 className="text-2xl font-bold">{availableNow}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">New Volunteer</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Enter full name" />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="+91 XXXXX XXXXX" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">City / Zone</label>
                <input required value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Mumbai, Kurla" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_LIST.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${selectedSkills.includes(skill) ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full mt-4 flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-glow-red hover:opacity-90 disabled:opacity-50">
                {isSubmitting ? "Registering..." : <><Plus className="h-4 w-4" /> Register Volunteer</>}
              </button>
            </form>
          </div>
        </div>

        {/* Volunteers Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-card flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by city, name, or skill..."
                className="w-full rounded-md bg-background border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Skills</th>
                    <th className="px-4 py-3 font-medium">Availability</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No volunteers found matching your criteria.</td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{v.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.city}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {v.skills.map((skill: string) => (
                              <span key={skill} className="bg-accent text-muted-foreground px-2 py-0.5 rounded text-[10px]">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {v.availability}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={v.status === "Available" ? "success" : v.status === "Assigned" ? "warning" : "default"}>
                            {v.status}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select className="bg-background border border-border rounded text-xs px-2 py-1 text-muted-foreground focus:outline-none focus:border-primary">
                            <option value="">Assign to...</option>
                            <option value="zone-a">Zone A</option>
                            <option value="zone-b">Zone B</option>
                            <option value="zone-c">Zone C</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure UsersIcon is imported
function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
