from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkoutLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_date = models.DateField()  # Date for the week this log was started
    is_complete = models.BooleanField(default=False)  # for entire week
    created_at = models.DateTimeField(auto_now_add=True)

class WorkoutDayLog(models.Model):
    workout_log = models.ForeignKey(WorkoutLog, on_delete=models.CASCADE, related_name='days')
    workout_day = models.ForeignKey("WorkoutDay", on_delete=models.CASCADE)  # e.g., Push
    order = models.IntegerField()  # 0,1,2,... for navigation
    is_complete = models.BooleanField(default=False)

class ExerciseLog(models.Model):
    workout_day_log = models.ForeignKey(WorkoutDayLog, on_delete=models.CASCADE, related_name='exercises', null=True, blank=True)
    name = models.CharField(max_length=100)
    target_sets = models.IntegerField()
    target_reps = models.IntegerField()

class SetLog(models.Model):
    exercise = models.ForeignKey(ExerciseLog, on_delete=models.CASCADE, related_name='sets')
    set_number = models.IntegerField()
    weight = models.FloatField()
    reps = models.IntegerField()
    rpe = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)
    source = models.CharField(max_length=10, choices=[("manual", "Manual"), ("auto", "Auto")], default="manual")
