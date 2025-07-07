import PreferencesScreen from '../../screens/onboarding/PreferencesScreen';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PreferencesRoute() {
  return (
    <ProtectedRoute>
      <PreferencesScreen />
    </ProtectedRoute>
  );
}
