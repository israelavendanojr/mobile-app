
from training.models import ExerciseMovement, Equipment

def attach_exercise(preferences, pattern, used_exercises=set()):
    available_equipment = preferences.equipment.values_list('name', flat=True)

    # Filter exercises by pattern, equipment, and exclude already used exercises
    candidates = ExerciseMovement.objects.filter(pattern=pattern)
    candidates = candidates.filter(equipment__name__in=available_equipment).distinct()
    candidates = candidates.exclude(id__in=[ex.id for ex in used_exercises])

    if not candidates.exists():
        return None 

    chosen = candidates.order_by('?').first() # Pick one at random

    return chosen
     
def generate_day(preferences, workout_day_template):
    patterns = workout_day_template.patterns.all()
    used_exercises = set()
    day_plan = []

    for pattern in patterns:
        exercise = attach_exercise(preferences, pattern, used_exercises)
        if exercise:
            used_exercises.add(exercise)
            day_plan.append({
                "exercise": exercise,
                "exercise_name": exercise.name,
                "sets": 2,
                "start_reps": 6,
                "end_reps": 8,
            })
        else:
            day_plan.append({
                "exercise": None,
                "exercise_name": "No Suitable Exercises",
                "skip": True,
            })

    return day_plan

    
def decide_split(preferences):
    pass

def generate_plan(preferences):
    pass 