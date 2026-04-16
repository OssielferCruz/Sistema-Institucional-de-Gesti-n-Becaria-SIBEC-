import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      setError('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    login(email, password)
      .then(() => {
        toast.success('Inicio de sesión exitoso');
        navigate('/dashboard');
      })
      .catch(() => {
        toast.error('Credenciales inválidas o backend no disponible. Intenta con admin@sibec.local / Admin123456!');
        setError('Credenciales inválidas o backend no disponible. Intenta con admin@sibec.local / Admin123456!');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const quickLoginAdmin = () => {
    setEmail('admin@sibec.local');
    setPassword('Admin123456!');
  };

  const disableForm = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
            <h1 className="text-4xl font-bold text-[#2E7D32]">SIBEC</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Sistema Institucional de Gestión Becaria
          </h2>
          <p className="text-white/80">Universidad Tecnológica La Salle</p>
        </div>

        {/* Login Card */}
        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ulsa.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={disableForm}
                  className="bg-[#F5F5F5] border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={disableForm}
                  className="bg-[#F5F5F5] border-gray-200"
                />
              </div>

              {error && (
                <p className="text-sm text-[#D32F2F]">{error}</p>
              )}

              <Button
                type="submit"
                disabled={disableForm}
                className="w-full bg-[#2E7D32] hover:bg-[#66BB6A] text-white"
              >
                {isSubmitting ? 'Validando...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Quick Login Demo Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3 text-center">Acceso rápido de desarrollo</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={quickLoginAdmin}
                  className="text-xs"
                  disabled={disableForm}
                >
                  Autocompletar Admin
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Credenciales seed: admin@sibec.local / Admin123456!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};