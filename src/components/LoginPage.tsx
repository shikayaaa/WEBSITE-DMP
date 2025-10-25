import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import logoImage from '../assets/dmplogofinal.png';


interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md card-3d-lg border-0 relative z-10">
        <CardHeader className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-4">
            {/* Logo Image */}
            <div className="w-24 h-24 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="Dumaguete Memorial Park Logo" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            
            {/* Text Below Logo */}
            <div className="space-y-2">
              <CardTitle className="text-2xl heading bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Dumaguete Memorial Park
              </CardTitle>
              <CardDescription className="subheading text-base">Admin & Staff Panel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="subheading">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-3d transition-all duration-200 focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="subheading">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-3d transition-all duration-200 focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full button-3d border-0 text-white shadow-lg hover:shadow-2xl"
              style={{background: 'linear-gradient(135deg, #005B73 0%, #00B8F4 50%, #2DF2A3 100%)'}}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}