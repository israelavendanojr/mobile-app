from rest_framework import serializers
from training.models.logging_models import WorkoutLog, ExerciseLog, SetLog

class SetLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetLog
        fields = '__all__'

class ExerciseLogSerializer(serializers.ModelSerializer):
    sets = SetLogSerializer(many=True)

    class Meta:
        model = ExerciseLog
        fields = ['id', 'name', 'target_sets', 'target_reps', 'sets']

class WorkoutLogSerializer(serializers.ModelSerializer):
    exercises = ExerciseLogSerializer(many=True)

    class Meta:
        model = WorkoutLog
        fields = ['id', 'user', 'date', 'is_complete', 'exercises']
