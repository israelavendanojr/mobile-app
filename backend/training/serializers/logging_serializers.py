from rest_framework import serializers
from training.models import WorkoutLog, WorkoutDayLog, ExerciseLog, SetLog, WorkoutDay

class SetLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetLog
        fields = '__all__'

class ExerciseLogSerializer(serializers.ModelSerializer):
    sets = SetLogSerializer(many=True, required=False)

    class Meta:
        model = ExerciseLog
        fields = '__all__'

class WorkoutDayLogSerializer(serializers.ModelSerializer):
    exercises = ExerciseLogSerializer(many=True, required=False)
    workout_day = serializers.StringRelatedField()  # or .SlugRelatedField if you want the name

    class Meta:
        model = WorkoutDayLog
        fields = '__all__'

class WorkoutLogSerializer(serializers.ModelSerializer):
    days = WorkoutDayLogSerializer(many=True, required=False)

    class Meta:
        model = WorkoutLog
        fields = '__all__'
