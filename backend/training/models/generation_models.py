from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from training.models.generic_models import Muscle, Equipment, ExerciseType

# Generation models
class ExercisePattern(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Vertical Pull"
    primary_muscles = models.ManyToManyField(Muscle, related_name="primary_for")
    secondary_muscles = models.ManyToManyField(Muscle, related_name="secondary_for")
    
    def __str__(self):
        return self.name

class ExerciseMovement(models.Model):
    pattern = models.ForeignKey(ExercisePattern, on_delete=models.CASCADE, related_name="movements")
    name = models.CharField(max_length=100) # e.g., "Pull-up"
    equipment = models.ManyToManyField(Equipment)
    type = models.CharField(max_length=100, choices=ExerciseType.choices, default=ExerciseType.COMPOUND)
    form_image = models.ImageField(upload_to='exercise_form_images', blank=True, null=True)
    
    def __str__(self):
        return self.name

class WorkoutDayTemplate(models.Model):
    name = models.CharField(max_length=100) # e.g., "Pull"
    patterns = models.ManyToManyField(
        'ExercisePattern',
        through='DayPatternThrough',
        related_name='day_templates'
    )
    description = models.TextField(blank=True, null=True)
    
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

    class Meta:
        ordering = ['day_index']
    
    def __str__(self):
        return f"{self.split} - {self.day_template} - {self.day_index}"

class DayPatternThrough(models.Model):
    day_template = models.ForeignKey(WorkoutDayTemplate, on_delete=models.CASCADE)
    pattern = models.ForeignKey(ExercisePattern, on_delete=models.CASCADE)
    pattern_index = models.IntegerField()

    class Meta:
        ordering = ['pattern_index']

    def __str__(self):
        return f"{self.day_template} - {self.pattern} - {self.pattern_index}"



