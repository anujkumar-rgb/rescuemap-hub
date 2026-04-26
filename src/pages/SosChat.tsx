import { useState, useRef, useEffect } from "react";
import { Send, Mic, AlertTriangle, PhoneCall, Loader2 } from "lucide-react";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/supabase";

export default function SosChat() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusCard, setStatusCard] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "dummy",
    dangerouslyAllowBrowser: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, statusCard]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);
    setStatusCard(null);

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        system: `You are an emergency response AI for RescueTrack disaster relief system in India. When someone describes an emergency, you must:
1. Acknowledge their situation with empathy in 1 sentence.
2. Ask for their exact location if not provided.
3. Classify the emergency type: Flood / Fire / Earthquake / Medical / Landslide / Building Collapse / Other. Ensure you state "CLASSIFICATION: [type]" exactly like that somewhere in your response.
4. Give 2-3 immediate safety instructions.
5. Confirm that rescue teams have been alerted.
Keep responses short, clear and calm. Reply in the same language the user writes in (Hindi or English).`,
        messages: [{ role: "user", content: userText }]
      });

      const aiText = response.content[0].text;
      setMessages(prev => [...prev, { role: "assistant", content: aiText }]);

      // Parse classification
      const match = aiText.match(/CLASSIFICATION:\s*(.+?)(?:\n|$)/i);
      const emergencyType = match ? match[1].trim() : "Unknown";

      // Mock setting up status card
      const newStatus = {
        type: emergencyType,
        team: "Alpha Squad",
        eta: Math.floor(Math.random() * 10) + 5,
      };
      setStatusCard(newStatus);

      // Save to Supabase (Mocked if Demo)
      const isDemo = localStorage.getItem("demo_bypass") === "true";
      if (!isDemo) {
        await supabase.from("sos_reports").insert({
          message: userText,
          emergency_type: emergencyType,
          status: "Pending"
        });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting. Please call emergency services immediately: 112 (National) or 1070 (NDRF)." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-foreground flex flex-col p-4 md:p-8 items-center justify-center">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden h-[80vh]">
        {/* Header */}
        <div className="bg-destructive/10 border-b border-destructive/20 p-4 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">Emergency SOS</h1>
          </div>
          <p className="text-sm text-muted-foreground">Our AI will assess your emergency and alert the nearest rescue team</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm opacity-50">
              Describe your situation below...
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none border border-border'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-3 rounded-lg rounded-bl-none border border-border flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> AI is assessing...
              </div>
            </div>
          )}

          {statusCard && (
            <div className="w-full bg-card border border-border p-4 rounded-lg shadow-card mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detection Details</span>
                <span className="text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">{statusCard.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm border-y border-border py-3">
                <div><span className="text-muted-foreground">Alerted Team:</span> <span className="font-semibold text-blue-400">{statusCard.team}</span></div>
                <div><span className="text-muted-foreground">Estimated ETA:</span> <span className="font-semibold text-amber-400">{statusCard.eta} mins</span></div>
              </div>
              <div className="flex items-center justify-between text-sm pt-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PhoneCall className="h-4 w-4" />
                  National Helpline: <strong className="text-foreground">112</strong>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  NDRF: <strong className="text-foreground">1070</strong>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full transition-colors">
              <Mic className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your emergency here..."
              className="flex-1 rounded-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-destructive transition-colors"
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="p-2.5 bg-destructive text-destructive-foreground rounded-full shadow-glow-red hover:opacity-90 disabled:opacity-50 transition-all">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
