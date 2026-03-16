import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Elements */}
      <motion.div
        animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-[150px] h-[150px] rounded-full bg-gradient-primary blur-[100px] opacity-30"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-gradient-accent blur-[120px] opacity-20"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 text-center max-w-md w-full"
      >
        <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center text-white shadow-glow-primary mx-auto mb-8 rotation-animation relative overflow-hidden">
           <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0"></div>
           <span className="text-5xl font-black relative z-10 filter drop-shadow-md">4</span>
           <span className="text-4xl relative z-10 px-1"><Map className="w-10 h-10" /></span>
           <span className="text-5xl font-black relative z-10 filter drop-shadow-md">4</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-gradient">Page Not Found</h1>
        
        <p className="text-text-muted text-lg mb-10">
          The conversation you're looking for seems to have drifted into another dimension. Let's get you back on track.
        </p>
        
        <Link 
          to="/" 
          className="btn-gradient py-3.5 flex items-center justify-center gap-3 w-full shadow-lg hover:-translate-y-1 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg">Return to Base</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
