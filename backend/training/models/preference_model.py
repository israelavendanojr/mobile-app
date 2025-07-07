from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from training.models.generation_models import Muscle, Equipment
from training.models.plan_generation_models import ExerciseMovement

User = get_user_model()
class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    days_per_week = models.IntegerField(default=2, validators=[MinValueValidator(1), MaxValueValidator(7)])
    training_age = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    volume = models.CharField(max_length=50, choices=[
        ("low", "Low"), ("moderate", "Moderate"), ("high", "High")
    ])
    priority_muscles = models.ManyToManyField(Muscle)
    bodyweight_exercises = models.CharField(max_length=50, choices=[
        ("bodyweight", "Bodyweight"), ("weighted", "Weighted"), ("absent", "Absent")
    ])
    equipment = models.ManyToManyField(Equipment)
    
    def __str__(self):
        return f"{self.user.username}'s Preferences"