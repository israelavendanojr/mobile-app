import PlanOverview from '../../screens/logging/PlanOverview';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PlanOverviewRoute() {
  return (
    <ProtectedRoute>
      <PlanOverview />
    </ProtectedRoute>
  );
}
