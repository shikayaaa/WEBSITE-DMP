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
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #3B82F6 0%, #FFFFFF 100%)', // 💙🤍 Blue-white gradient
      }}
    >
      <Card className="w-full max-w-md border-0 relative z-10 bg-white/95 backdrop-blur-md shadow-2xl">
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
              <CardTitle className="text-2xl font-bold text-blue-700">
                Dumaguete Memorial Park
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Admin & Staff Panel
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full border-0 text-white shadow-lg hover:shadow-2xl transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', // Deep blue gradient for button
              }}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
