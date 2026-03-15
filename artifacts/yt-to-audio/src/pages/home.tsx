import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { ConverterInterface } from "@/components/converter-interface";
import { FileAudio, Zap, Shield, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center pt-24 pb-32 px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/50 text-sm font-medium text-muted-foreground mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>High-Fidelity Audio Extraction Engine</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold font-display tracking-tight text-foreground leading-[1.1]"
          >
            Extract Audio with <br />
            <span className="text-gradient">Studio Precision.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Convert any YouTube video into pristine MP3, M4A, or Lossless WAV formats instantly. No ads, no limits, just pure audio.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full relative"
        >
          <ConverterInterface />
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32"
        >
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Lightning Fast"
            description="Our distributed backend architecture ensures your audio is extracted and ready for download in seconds."
          />
          <FeatureCard 
            icon={<FileAudio className="w-6 h-6 text-primary" />}
            title="Lossless Quality"
            description="Choose WAV for zero compression artifacts, or 320kbps MP3 for the perfect balance of quality and size."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-green-400" />}
            title="Secure & Private"
            description="All conversions are done securely. We don't store your history and files are deleted shortly after download."
          />
        </motion.div>

      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
