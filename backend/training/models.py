from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

# Generic models
class Muscle(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Equipment(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class ExerciseType(models.TextChoices):
    COMPOUND = "compound", "Compound"
    ISOLATION = "isolation", "Isolation"

# Generation models
class ExercisePattern(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Vertical Pull"
    target_muscles = models.ManyToManyField(Muscle)
    
    def __str__(self):
        return self.name

class ExerciseMovement(models.Model):
    pattern = models.ForeignKey(ExercisePattern, on_delete=models.CASCADE, related_name="movements")
    name = models.CharField(max_length=100) # e.g., "Pull-up"
    equipment = models.ManyToManyField(Equipment)
    type = models.CharField(max_length=100, choices=ExerciseType.choices)
    
    def __str__(self):
        return self.name

class WorkoutDayTemplate(models.Model):
    name = models.CharField(max_length=100) # e.g., "Pull"
    patterns = models.ManyToManyField(
        'ExercisePattern',
        through='DayPatternThrough',
        related_name='day_templates'
    )
    
    def __str__(self):
        return self.name

class WorkoutSplitTemplate(models.Model):
    name = models.CharField(max_length=100) # e.g., "Push Pull Legs"
    workouts = models.ManyToManyField(WorkoutDayTemplate, through='SplitDayThrough')
    days_per_week = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(7)])
    
    def __str__(self):
        return self.name

# Through models
class SplitDayThrough(models.Model):
    split = models.ForeignKey(WorkoutSplitTemplate, on_delete=models.CASCADE)
    day_template = models.ForeignKey(WorkoutDayTemplate, on_delete=models.CASCADE)
    day_index = models.IntegerField() 

class DayPatternThrough(models.Model):
    day_template = models.ForeignKey(WorkoutDayTemplate, on_delete=models.CASCADE)
    pattern = models.ForeignKey(ExercisePattern, on_delete=models.CASCADE)
    pattern_index = models.IntegerField()

    class Meta:
        ordering = ['pattern_index']

# User model
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

