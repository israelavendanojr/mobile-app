import WelcomeScreen from '../../screens/onboarding/WelcomeScreen';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function WelcomeRoute() {
  return (
    <ProtectedRoute>
      <WelcomeScreen />
    </ProtectedRoute>
  );
}
