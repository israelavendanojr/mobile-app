import PlanPreviewScreen from '../../screens/onboarding/PlanPreviewScreen';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PlanPreviewRoute() {
  return (
    <ProtectedRoute>
      <PlanPreviewScreen />
    </ProtectedRoute>
  );
}
