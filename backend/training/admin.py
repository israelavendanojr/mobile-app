from django.contrib import admin
from .models import *


admin.site.register(UserPreferences)
admin.site.register(Muscle)
admin.site.register(Equipment)
admin.site.register(ExercisePattern)
admin.site.register(ExerciseMovement)
admin.site.register(WorkoutDayTemplate)
admin.site.register(WorkoutSplitTemplate)
admin.site.register(SplitDayThrough)
admin.site.register(DayPatternThrough)