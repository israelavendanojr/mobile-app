import PlanPreviewScreen from '../../screens/generator/PlanPreviewScreen';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PlanPreviewRoute() {
  return (
    <ProtectedRoute>
      <PlanPreviewScreen />
    </ProtectedRoute>
  );
}
