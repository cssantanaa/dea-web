import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { TipoUsuario } from '../@types/schema';

interface RoleRouteProps {
  allowedRoles: TipoUsuario[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando aplicação...</div>; // Substitua por um Spinner bonitão depois
  }

  // Se não estiver logado, chuta pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, mas não tiver a role permitida, manda pra uma tela de erro ou dashboard padrão
  if (!allowedRoles.includes(user.tipo)) {
    console.warn(`Acesso negado. Usuário é ${user.tipo}, mas rota exige ${allowedRoles.join(', ')}`);
    // Exemplo: se for admin tentando acessar super-admin, volta pro painel dele
    return <Navigate to={user.tipo === 'admin' ? '/admin' : '/login'} replace />;
  }

  // Se passou em tudo, renderiza as rotas filhas
  return <Outlet />;
};