from rest_framework import serializers
from ..models import WorkoutPlan, WorkoutDay, PlannedExercise

class PlannedExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlannedExercise
        fields = ("name", "sets", "start_reps", "end_reps", "skip")

class WorkoutDaySerializer(serializers.ModelSerializer):
    exercises = PlannedExerciseSerializer(many=True, source="exercises")

    class Meta:
        model = WorkoutDay
        fields = ("day_name", "order", "exercises")

class WorkoutPlanSerializer(serializers.ModelSerializer):
    days = WorkoutDaySerializer(many=True)

    class Meta:
        model = WorkoutPlan
        fields = ("id", "name", "days_per_week", "created_at", "days")
