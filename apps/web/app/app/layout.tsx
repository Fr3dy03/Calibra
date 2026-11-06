import AppShell from "@/components/AppShell";

export const metadata = {
  title: "CalibraGraph — Workspace",
};

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
