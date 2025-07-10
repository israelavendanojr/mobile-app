import ViewPlans from '../../screens/logging/ViewPlans';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ViewPlansRoute() {
  return (
    <ProtectedRoute>
      <ViewPlans />
    </ProtectedRoute>
  );
}
