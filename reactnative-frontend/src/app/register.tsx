import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import RegisterScreen from '@/screens/RegisterScreen';

export default function RegisterRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/products" />;

  return <RegisterScreen />;
}