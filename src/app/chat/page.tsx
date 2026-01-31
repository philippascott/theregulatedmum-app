import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/chat");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Members Chat</h1>
      <p>Signed in as: {session.user?.email ?? "unknown"}</p>

      {/* TODO: Paste CustomGPT embed here */}
      <div style={{ marginTop: 24 }}>
        <div id="customgpt-embed" />
      </div>
    </main>
  );
}
