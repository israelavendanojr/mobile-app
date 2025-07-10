import LogScreen from '../../screens/logging/LogScreen';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function LogRoute() {
  return (
    <ProtectedRoute>
      <LogScreen />
    </ProtectedRoute>
  );
}
