import { ReactNode } from "react";
import TopBanner from "./TopBanner";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <TopBanner />
    <Navbar />
    <main className="flex-1">{children}</main>
    <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
      <p>© 2026 JEE Master Hub · Made with ❤️ by Team Phoenix</p>
    </footer>
  </div>
);

export default Layout;
