import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="glass-panel max-w-md w-full p-10 rounded-3xl text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
            <FileQuestion className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">404</h1>
          <p className="text-lg text-muted-foreground mb-8">
            The page or resource you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home className="w-5 h-5" />
            Back to Converter
          </Link>
        </div>
      </div>
    </Layout>
  );
}
