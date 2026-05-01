import { useState, useRef, useEffect } from "react";
import { Send, Bot, X, Maximize2, Minimize2, Loader2, Zap, Shield, Users, AlertTriangle } from "lucide-react";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/supabase";
import { cn } from "@/lib/utils";

export default function AdminAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Sentinel AI Command Center online. I have full access to the ResqNet database. How can I assist with deployment or data analysis today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "dummy",
    dangerouslyAllowBrowser: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleCommand = async (command: string) => {
    const isDemo = localStorage.getItem("demo_bypass") === "true";
    
    // Simple Regex-based Command Parser for fallback/robustness
    const deployMatch = command.match(/deploy\s+(.+?)\s+to\s+(.+)/i);
    if (deployMatch) {
      const teamName = deployMatch[1].trim();
      const destination = deployMatch[2].trim();
      
      if (!isDemo) {
        const { error } = await supabase
          .from('teams')
          .update({ status: 'En Route', zone: destination })
          .ilike('name', `%${teamName}%`);
        
        if (error) return `Error deploying team: ${error.message}`;
      }
      return `SUCCESS: ${teamName} has been deployed to ${destination}. System status updated.`;
    }

    const assignMatch = command.match(/assign\s+(.+?)\s+to\s+incident\s+(.+)/i);
    if (assignMatch) {
      const teamName = assignMatch[1].trim();
      const incidentId = assignMatch[2].trim();

      if (!isDemo) {
        const { error } = await supabase
          .from('incidents')
          .update({ team: teamName, status: 'In Progress' })
          .eq('id', incidentId);
        
        if (error) return `Error assigning incident: ${error.message}`;
      }
      return `SUCCESS: Incident ${incidentId} assigned to ${teamName}. Response protocols initiated.`;
    }

    return null;
  };

  const getSystemContext = async () => {
    const { data: teams } = await supabase.from('teams').select('name, status, zone');
    const { data: incidents } = await supabase.from('incidents').select('id, type, location, status, team');
    
    return `
      CURRENT SYSTEM STATE:
      TEAMS: ${JSON.stringify(teams)}
      INCIDENTS: ${JSON.stringify(incidents)}
      
      You are Sentinel AI, the Command Center Assistant for ResqNet.
      You can perform actions by telling the user you are doing them and then using one of these formats:
      "DEPLOY [Team Name] TO [Location]"
      "ASSIGN [Team Name] TO INCIDENT [Incident ID]"
    `;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      let responseText = "";
      
      if (!import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY === "dummy") {
        // Advanced Local Mock Engine
        await new Promise(r => setTimeout(r, 800));
        const cmdResult = await handleCommand(userText);
        if (cmdResult) {
          responseText = cmdResult;
        } else if (userText.toLowerCase().includes("status") || userText.toLowerCase().includes("teams")) {
          const { data } = await supabase.from('teams').select('*');
          responseText = `Current Fleet Status: ${data?.length || 0} teams active. Major clusters in Zone A and C. Would you like a detailed breakdown?`;
        } else {
          responseText = "I've analyzed your query. Without a live Anthropic key, I'm limited to deployment commands like 'Deploy Alpha Squad to Zone B'.";
        }
      } else {
        const context = await getSystemContext();
        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 400,
          system: context,
          messages: [{ role: "user", content: userText }]
        });

        responseText = response.content[0].text;
        
        // Post-process for commands
        const cmdResult = await handleCommand(responseText);
        if (cmdResult) responseText += `\n\n[SYSTEM ACTION]: ${cmdResult}`;
      }

      setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
    } catch (error) {
      console.error("Sentinel Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Signal interference detected. Command Center is operating in offline mode. Please repeat your instruction." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary shadow-glow-red flex items-center justify-center text-white z-50 hover:scale-110 transition-all group"
      >
        <Zap className="h-6 w-6 group-hover:animate-pulse" />
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
      </button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 w-[380px] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300",
        isMinimized ? "h-14" : "h-[500px]"
      )}
    >
      {/* Header */}
      <div className="bg-primary p-3 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Sentinel Command AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div 
                  className={cn(
                    "max-w-[85%] p-3 rounded-xl text-xs leading-relaxed",
                    m.role === 'user' 
                      ? "bg-primary text-white rounded-br-none shadow-md" 
                      : "bg-muted text-foreground rounded-bl-none border border-border shadow-sm"
                  )}
                >
                  {m.content.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-1" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-xl rounded-bl-none border border-border flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Neural processing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t border-border bg-card flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { label: 'Status', icon: Shield },
              { label: 'Incidents', icon: AlertTriangle },
              { label: 'Teams', icon: Users },
            ].map(tool => (
              <button 
                key={tool.label}
                onClick={() => setInput(prev => prev + (prev ? ' ' : '') + tool.label)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors shrink-0"
              >
                <tool.icon size={10} className="text-primary" />
                {tool.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Issue command or query database..."
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-glow-red hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
