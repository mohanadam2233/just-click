import AuthGate from "@/components/AuthGate";

export const metadata = {
  title: "AI Studio | JustClick",
  description: "AI-powered learning assistant",
};

export default function AiLayout({ children }) {
  return (
    <AuthGate>
      <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-[#0d0d17]">
        {children}
      </div>
    </AuthGate>
  );
}
