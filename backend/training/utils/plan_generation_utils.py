def attach_exercise(preferences, pattern, used_exercises=set()):
    available_equipment = preferences.equipment

    # Filter exercises by pattern, equipment, and exclude already used exercises
    candidates = ExerciseMovement.objects.filter(pattern=pattern)
    candidates = candidates.filter(equipment__overlap=available_equipment)
    candidates = candidates.exclude(id__in=[ex.id for ex in used_exercises])

    if not candidates.exists():
        return None 

    chosen = candidates.order_by('?').first() # Pick one at random

    return chosen
     

def generate_day(preferences):
    pass

def decide_split(preferences):
    pass

def generate_plan(preferences):
    pass 