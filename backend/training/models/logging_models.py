# logs/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkoutLog(models.Model):
    workout_day = models.ForeignKey("WorkoutDay", on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    is_complete = models.BooleanField(default=False)

class ExerciseLog(models.Model):
    workout = models.ForeignKey(WorkoutLog, on_delete=models.CASCADE, related_name="exercises")
    name = models.CharField(max_length=100)
    target_sets = models.IntegerField()
    target_reps = models.IntegerField()

class SetLog(models.Model):
    exercise = models.ForeignKey(ExerciseLog, on_delete=models.CASCADE, related_name="sets")
    set_number = models.IntegerField()
    weight = models.FloatField()
    reps = models.IntegerField()
    rpe = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)
    source = models.CharField(max_length=10, choices=[("manual", "Manual"), ("auto", "Auto")], default="manual")
