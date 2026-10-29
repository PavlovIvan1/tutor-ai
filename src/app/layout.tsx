import { Header } from "@/components/layout/Header";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tutor — AI домашки для репетиторов",
  description: "Персонализированные домашние задания из контекста урока",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="nord">
      <body className="min-h-screen bg-base-200 text-base-content antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
