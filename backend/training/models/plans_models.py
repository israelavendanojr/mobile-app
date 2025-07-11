from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkoutPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="plans")
    name = models.CharField(max_length=100)
    days_per_week = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"

class WorkoutDay(models.Model):
    plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name="days")
    day_name = models.CharField(max_length=100)
    order = models.IntegerField()

class PlannedExercise(models.Model):
    day = models.ForeignKey(WorkoutDay, on_delete=models.CASCADE, related_name="exercises")
    name = models.CharField(max_length=100)
    sets = models.IntegerField()
    start_reps = models.IntegerField()
    end_reps = models.IntegerField()
    skip = models.BooleanField(default=False)  # for placeholders like “No Suitable Exercises”

    
