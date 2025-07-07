import random
from training.models import ExerciseMovement, WorkoutSplitTemplate, ExerciseType

def attach_exercise(preferences, pattern, used_exercises=None):
    if used_exercises is None:
        used_exercises = set()

    available_equipment = preferences.equipment.values_list('name', flat=True)

    # Filter exercises by pattern, equipment, and exclude already used exercises
    candidates = ExerciseMovement.objects.filter(pattern=pattern)
    candidates = candidates.filter(equipment__name__in=available_equipment).distinct()
    candidates = candidates.exclude(id__in=[ex.id for ex in used_exercises])

    if not candidates.exists():
        return None 

    return candidates.order_by('?').first()

def decide_sets_and_reps(exercise, volume):
    if not exercise or not hasattr(exercise, "type"):
        return (2, 8, 10)  # fallback if exercise or type is missing

    roll = random.randint(1, 2)

    if volume == "low":
        if exercise.type == ExerciseType.COMPOUND:
            return (2, 4, 6) if roll == 1 else (2, 6, 8)
        else:  # ISOLATION
            return (2, 6, 8) if roll == 1 else (1, 8, 10)

    elif volume == "moderate":
        if exercise.type == ExerciseType.COMPOUND:
            return (3, 6, 10) if roll == 1 else (3, 8, 12)
        else:
            return (2, 8, 10) if roll == 1 else (3, 8, 12)

    elif volume == "high":
        if exercise.type == ExerciseType.COMPOUND:
            return (4, 8, 12) if roll == 1 else (3, 10, 15)
        else:
            return (3, 8, 12) if roll == 1 else (3, 10, 15)

    return (2, 8, 10)  # final fallback

def generate_day(preferences, workout_day_template):
    patterns = workout_day_template.patterns.all()
    used_exercises = set()
    day_plan = []

    for pattern in patterns:
        exercise = attach_exercise(preferences, pattern, used_exercises)
        if exercise:
            used_exercises.add(exercise)
            sets, start_reps, end_reps = decide_sets_and_reps(exercise, preferences.volume)
            day_plan.append({
                "exercise": exercise,
                "exercise_name": exercise.name,
                "sets": sets,
                "start_reps": start_reps,
                "end_reps": end_reps,
            })
        else:
            day_plan.append({
                "exercise": None,
                "exercise_name": "No Suitable Exercises",
                "skip": True,
            })

    return day_plan

def decide_split(preferences):
    return WorkoutSplitTemplate.objects.filter(days_per_week=preferences.days_per_week).first()

def generate_plan(preferences):
    workout_split = decide_split(preferences)
    if not workout_split:
        return []

    plan = {
        "name": workout_split.name,
        "days_per_week": workout_split.days_per_week,
        "days": []
    }

    ordered_days = workout_split.workouts.order_by("splitdaythrough__day_index")
    for day_template in ordered_days:
        day_plan = generate_day(preferences, day_template)
        plan["days"].append({
            "day_name": day_template.name,
            "exercises": day_plan
        })

    return plan

    
