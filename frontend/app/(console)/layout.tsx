import { ConsoleLayout } from "@/components/layout/ConsoleLayout";

export default function ConsoleRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConsoleLayout>{children}</ConsoleLayout>;
}
