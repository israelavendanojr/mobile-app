from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date

from training.models.logging_models import WorkoutLog
from training.serializers.logging_serializers import WorkoutLogSerializer

from training.models import WorkoutPlan, WorkoutDay, PlannedExercise, WorkoutLog, ExerciseLog
from datetime import date, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_log(request):
    today = date.today()
    user = request.user

    log, created = WorkoutLog.objects.get_or_create(user=user, date=today)

    if created:
        # 1. Get user plan
        plan = WorkoutPlan.objects.filter(user=user).last()
        if not plan:
            return Response({"error": "No saved plan found."}, status=404)

        workout_days = plan.days.all().order_by("order")  # e.g., Push, Pull, Legs
        total_days = workout_days.count()

        # 2. Get last workout log (before today)
        last_log = WorkoutLog.objects.filter(user=user, date__lt=today).order_by("-date").first()

        if last_log and last_log.workout_day:  # Optional: if you store what day was used
            last_day_index = workout_days.filter(day_name=last_log.workout_day.day_name).first().order
            next_day_index = (last_day_index + 1) % total_days
        else:
            next_day_index = 0  # Start from first day in plan

        # 3. Get today's WorkoutDay
        today_day = workout_days[next_day_index]

        # 4. Create ExerciseLogs for today
        for planned_ex in today_day.exercises.all():
            ExerciseLog.objects.create(
                workout=log,
                name=planned_ex.name,
                target_sets=planned_ex.sets,
                target_reps=planned_ex.start_reps,
            )

        # Optional: link WorkoutDay to WorkoutLog
        log.workout_day = today_day
        log.save()

    serializer = WorkoutLogSerializer(log)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_log(request):
    serializer = WorkoutLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
