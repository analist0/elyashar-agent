import { VoiceAgent } from "../components/VoiceAgent";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Agent } from "../services/api";

export function PublicVoiceBookingPage() {
  const { agentId = "elyashar" } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    api.getAgent(agentId).then(({ agent }) => setAgent(agent)).catch(() => setAgent(null));
  }, [agentId]);

  return (
    <main className="min-h-[100dvh] p-4 md:grid md:place-items-center md:p-8">
      <VoiceAgent agentId={agentId} agentName={agent?.name ?? "הסוכן"} />
    </main>
  );
}
