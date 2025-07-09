import PreferencesScreen from '../../screens/generator/PreferencesScreen';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PreferencesRoute() {
  return (
    <ProtectedRoute>
      <PreferencesScreen />
    </ProtectedRoute>
  );
}
