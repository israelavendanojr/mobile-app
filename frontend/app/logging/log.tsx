import LogPage from '../../screens/logging/LogPage';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function LogRoute() {
  return (
    <ProtectedRoute>
      <LogPage />
    </ProtectedRoute>
  );
}
