import AuthGate from "@/components/AuthGate";

export default function ProtectedLayout({ children }) {
  return <AuthGate>{children}</AuthGate>;
}