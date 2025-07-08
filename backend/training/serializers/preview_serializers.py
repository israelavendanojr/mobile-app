from rest_framework import serializers

class ExercisePreviewSerializer(serializers.Serializer):
    exercise_name = serializers.CharField()
    sets = serializers.IntegerField()
    start_reps = serializers.IntegerField()
    end_reps = serializers.IntegerField()
    skip = serializers.BooleanField(default=False)

class DayPreviewSerializer(serializers.Serializer):
    day_name = serializers.CharField()
    exercises = ExercisePreviewSerializer(many=True)

class PlanPreviewSerializer(serializers.Serializer):
    name = serializers.CharField()
    days_per_week = serializers.IntegerField()
    days = DayPreviewSerializer(many=True)

class PlanRequestSerializer(serializers.Serializer):
    days_per_week = serializers.IntegerField()
    training_age = serializers.IntegerField()
    volume = serializers.ChoiceField(choices=["low", "moderate", "high"])
    bodyweight_exercises = serializers.ChoiceField(choices=["bodyweight", "weighted", "absent"])
    equipment = serializers.ListField(child=serializers.IntegerField())
