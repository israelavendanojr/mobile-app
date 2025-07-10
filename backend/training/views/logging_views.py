from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from training.models import WorkoutLog, WorkoutDayLog, ExerciseLog, SetLog, WorkoutDay, WorkoutPlan
from training.serializers.logging_serializers import WorkoutLogSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_week_log(request):
    user = request.user
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())  # Monday as start

    log, created = WorkoutLog.objects.get_or_create(user=user, start_date=start_of_week)

    if created:
        # Get latest saved plan
        plan = WorkoutPlan.objects.filter(user=user).last()
        if not plan:
            return Response({"error": "No saved plan found."}, status=404)

        workout_days = plan.days.all().order_by("order")

        for idx, day in enumerate(workout_days):
            day_log = WorkoutDayLog.objects.create(
                workout_log=log,
                workout_day=day,
                order=idx
            )

            for planned_ex in day.exercises.all():
                ExerciseLog.objects.create(
                    workout_day_log=day_log,
                    name=planned_ex.name,
                    target_sets=planned_ex.sets,
                    target_reps=planned_ex.start_reps
                )

    serializer = WorkoutLogSerializer(log)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_week_log(request):
    user = request.user
    try:
        log = WorkoutLog.objects.get(id=request.data.get('id'), user=user)
    except WorkoutLog.DoesNotExist:
        return Response({"error": "Workout log not found"}, status=404)

    log.is_complete = True
    log.save()
    return Response({"message": "Workout week submitted!"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_day_log(request, day_log_id):
    try:
        day_log = WorkoutDayLog.objects.get(id=day_log_id, workout_log__user=request.user)
    except WorkoutDayLog.DoesNotExist:
        return Response({"error": "Workout day log not found"}, status=404)

    day_log.is_complete = True
    day_log.save()
    return Response({"message": f"{day_log.workout_day.day_name} marked complete."})