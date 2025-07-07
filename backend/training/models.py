from django.db import models

# Create your models here.
class ExercisePattern(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Vertical Pull"
    target_muscles = models.JSONField(default=list)
    equipment = models.JSONField(default=list)
    order = models.IntegerField()

    def __str__(self):
        return self.name

class ExerciseMovement(models.Model):
    pattern = models.ForeignKey(ExercisePattern, on_delete=models.CASCADE, related_name="movements")
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class WorkoutDayTemplate(models.Model):
    name = models.CharField(max_length=100)
    patterns = models.ManyToManyField(ExercisePattern)
    days_per_week = models.IntegerField()

    def __str__(self):
        return self.name

