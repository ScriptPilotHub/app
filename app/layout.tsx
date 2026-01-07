import "./styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "TempoBook",
  description: "Booking & deposits for solo service professionals"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="top-nav">
            <div className="logo">TempoBook</div>
            <nav>
              <a href="/#features">Features</a>
              <a href="/#pricing">Pricing</a>
              <a href="/dashboard">Dashboard</a>
            </nav>
            <button className="primary">Get started</button>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
