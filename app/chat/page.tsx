import { PageHeader } from "@/components/PageHeader";
import { ChatPanel } from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <div>
      <PageHeader
        title="Your companion"
        description="An empathetic space to talk it through, whenever you need."
      />
      <ChatPanel />
    </div>
  );
}
