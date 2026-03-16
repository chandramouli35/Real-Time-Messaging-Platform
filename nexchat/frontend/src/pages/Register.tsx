import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { Zap, Mail, Lock, User as UserIcon, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length > 5) strength += 25;
    if (pwd.length > 7) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const strength = calculateStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setUser(res.data);
      toast.success('Registration successful!');
      navigate('/chat');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background-primary">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-background-secondary items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-from/10 to-accent-from/10 z-0"></div>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-center flex flex-col items-center"
        >
          <Zap className="w-20 h-20 text-primary-from mb-6" />
          <h1 className="text-6xl font-black mb-4 tracking-tighter text-gradient leading-tight">Welcome to<br/>NexChat</h1>
          <p className="text-text-secondary text-xl max-w-sm">
            Join the most beautiful real-time messaging platform ever created.
          </p>
        </motion.div>
        
        {/* Floating bubbles */}
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-32 h-32 glass rounded-tl-3xl rounded-tr-3xl rounded-br-3xl shadow-glow-primary flex items-center justify-center text-4xl"
        >
          💬
        </motion.div>
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-24 h-24 glass rounded-t-3xl rounded-br-3xl shadow-glow-accent flex items-center justify-center text-3xl"
        >
          🚀
        </motion.div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background-primary relative z-10 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Zap className="w-12 h-12 text-primary-from" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-text-muted mb-8">Enter your details to get started</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-text-muted" />
                </div>
                <input 
                  type="text" 
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-glass w-full pl-10 h-12" 
                  placeholder="johndoe" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-text-muted" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-glass w-full pl-10 h-12" 
                  placeholder="john@example.com" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-text-muted" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-glass w-full pl-10 pr-10 h-12" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      strength <= 25 ? 'bg-error' : 
                      strength <= 50 ? 'bg-yellow-500' : 
                      strength <= 75 ? 'bg-primary-from' : 'bg-success'
                    }`}
                    style={{ width: `${strength}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-text-muted" />
                </div>
                <input 
                  type="password" 
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-glass w-full pl-10 h-12" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-gradient w-full h-12 mt-4 text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-from font-medium hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
