import WelcomeScreen from '../../screens/generator/WelcomeScreen';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function WelcomeRoute() {
  return (
    <ProtectedRoute>
      <WelcomeScreen />
    </ProtectedRoute>
  );
}
