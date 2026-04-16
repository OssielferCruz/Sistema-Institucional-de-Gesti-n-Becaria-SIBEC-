import React from 'react';
import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: 'activo' | 'inactivo' | 'completado' | 'pendiente' | 'aprobada' | 'rechazada' | 'activa' | 'finalizada';
}

const statusConfig = {
  activo: { label: 'Activo', color: 'bg-[#1B5E20] text-white' },
  inactivo: { label: 'Inactivo', color: 'bg-gray-400 text-white' },
  completado: { label: 'Completado', color: 'bg-[#2E7D32] text-white' },
  pendiente: { label: 'Pendiente', color: 'bg-[#FBC02D] text-white' },
  aprobada: { label: 'Aprobada', color: 'bg-[#1B5E20] text-white' },
  rechazada: { label: 'Rechazada', color: 'bg-[#D32F2F] text-white' },
  activa: { label: 'Activa', color: 'bg-[#1B5E20] text-white' },
  finalizada: { label: 'Finalizada', color: 'bg-gray-500 text-white' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  return (
    <Badge className={`${config.color} border-none`}>
      {config.label}
    </Badge>
  );
};
