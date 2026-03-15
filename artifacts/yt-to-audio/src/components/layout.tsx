import { ReactNode } from "react";
import { HeadphonesIcon, Github, Twitter } from "lucide-react";
import { Link } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Abstract Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      <header className="relative z-10 w-full border-b border-border/50 bg-background/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
              <HeadphonesIcon className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide text-foreground">
              Aura<span className="text-primary">Extract</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">API Specs</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Documentation</a>
            <div className="flex items-center gap-3 pl-6 border-l border-border/50">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col">
        {children}
      </main>

      <footer className="relative z-10 border-t border-border/50 bg-background/30 backdrop-blur-sm py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AuraExtract. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for precision and speed.
          </p>
        </div>
      </footer>
    </div>
  );
}
