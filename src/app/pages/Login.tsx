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
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    // Validar que los campos estén llenos
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      setError('Por favor completa todos los campos');
      return;
    }

    // Hacer login asíncrono
    login(email, password)
      .then(() => {
        toast.success('Inicio de sesión exitoso');
        navigate('/dashboard');
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Credenciales inválidas';
        toast.error(message);
        setError(message);
      });
  };

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

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
                  className="bg-[#F5F5F5] border-gray-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2E7D32] hover:bg-[#66BB6A] text-white"
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Quick Login Demo Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3 text-center">Usuarios Semilla Registrados (Demo)</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('bienestar.estudiantil@ulsa.edu.ni', 'Admin123456!')}
                  className="text-xs"
                >
                  Admin (Bienestar)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('jefatura.ice@ulsa.edu.ni', 'Demo123456!')}
                  className="text-xs"
                >
                  Jefatura ICE
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('roberto.mendez@ac.ulsa.edu.ni', 'Demo123456!')}
                  className="text-xs"
                >
                  Docente (R. Mendez)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('juan.perez@est.ulsa.edu.ni', 'Demo123456!')}
                  className="text-xs"
                >
                  Estudiante (J. Perez)
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                El sistema detecta automáticamente el rol según la base de datos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};