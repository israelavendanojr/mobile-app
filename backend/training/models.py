from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

class ExercisePattern(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Vertical Pull"
    target_muscles = models.JSONField(default=list)
    equipment = models.JSONField(default=list)
    order = models.IntegerField()

    def __str__(self):
        return self.name

class ExerciseMovement(models.Model):
    pattern = models.ForeignKey(ExercisePattern, on_delete=models.CASCADE, related_name="movements")
    name = models.CharField(max_length=100) # e.g., "Pull-up"
    
    def __str__(self):
        return self.name

class WorkoutDayTemplate(models.Model):
    name = models.CharField(max_length=100) # e.g., "Pull"
    patterns = models.ManyToManyField(ExercisePattern)
    days_per_week = models.IntegerField()
    
    def __str__(self):
        return self.name

User = get_user_model()

class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    days_per_week = models.IntegerField(default=2, validators=[MinValueValidator(1), MaxValueValidator(7)])
    training_age = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    volume = models.CharField(max_length=50, choices=[
        ("low", "Low"), ("moderate", "Moderate"), ("high", "High")
    ])
    priority_muscles = models.JSONField(default=list, blank=True, null=True)
    bodyweight_exercises = models.CharField(max_length=50, choices=[
        ("bodyweight", "Bodyweight"), ("weighted", "Weighted"), ("absent", "Absent")
    ])
    equipment = models.JSONField(default=list)
    

    def __str__(self):
        return f"{self.user.username}'s Preferences"

    