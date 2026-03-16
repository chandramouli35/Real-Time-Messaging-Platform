import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, MessageSquare, Shield, Globe, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background-primary flex flex-col items-center justify-center">
      {/* Animated Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-from/20 blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-from/20 blur-[150px] pointer-events-none"
      />

      <div className="z-10 text-center px-4 max-w-5xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-primary-from w-10 h-10" />
            <h1 className="text-3xl font-bold text-gradient">NexChat</h1>
          </div>
          
          <div className="inline-block glass px-4 py-1.5 rounded-full text-sm text-primary-from font-medium mb-8 border-primary-from/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            ⚡ Real-Time Messaging Platform
          </div>

          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Chat Without <span className="text-gradient">Limits</span>
          </h2>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            Connect instantly with anyone, anywhere. Experience real-time messaging reimagined with stunning design and lightning-fast performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link to="/register" className="btn-gradient w-full sm:w-auto px-8 py-3.5 text-lg rounded-xl">
              Start Chatting Free
            </Link>
            <Link to="/login" className="btn-ghost w-full sm:w-auto px-8 py-3.5 text-lg rounded-xl">
              Login to Account
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
            <Zap className="w-8 h-8 text-primary-from mb-4" />
            <h3 className="font-semibold text-lg mb-2">Real-Time</h3>
            <p className="text-sm text-text-muted">Instant delivery with WebSockets</p>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
            <Shield className="w-8 h-8 text-success mb-4" />
            <h3 className="font-semibold text-lg mb-2">Secure</h3>
            <p className="text-sm text-text-muted">JWT based authentication</p>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
            <Globe className="w-8 h-8 text-accent-from mb-4" />
            <h3 className="font-semibold text-lg mb-2">Global</h3>
            <p className="text-sm text-text-muted">Connect across the world</p>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
            <Users className="w-8 h-8 text-primary-to mb-4" />
            <h3 className="font-semibold text-lg mb-2">Group Rooms</h3>
            <p className="text-sm text-text-muted">Public and private spaces</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
