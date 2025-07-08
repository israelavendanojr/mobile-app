import random
from training.models import ExerciseMovement, WorkoutSplitTemplate, ExerciseType

def attach_exercise(preferences, pattern, used_exercises=None):
    if used_exercises is None:
        used_exercises = set()

    # Handle both QuerySet and list cases
    equipment = preferences["equipment"]
    if hasattr(equipment, 'values_list'):
        # It's a QuerySet
        available_equipment = equipment.values_list('name', flat=True)
    else:
        # It's already a list of equipment names or objects
        if equipment and hasattr(equipment[0], 'name'):
            # List of equipment objects
            available_equipment = [eq.name for eq in equipment]
        else:
            # List of equipment names
            available_equipment = equipment

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
                "sets": 0,
                "start_reps": 0,
                "end_reps": 0,
                "skip": True,
            })

    return day_plan

def decide_split(days_per_week):
    return WorkoutSplitTemplate.objects.filter(days_per_week=days_per_week).first()

def generate_plan(preferences):
    days_per_week = preferences["days_per_week"]
    workout_split = decide_split(days_per_week)
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

    
def save_generated_plan(user, plan_dict):
    plan = WorkoutPlan.objects.create(
        user=user,
        name=plan_dict["name"],
        days_per_week=plan_dict["days_per_week"]
    )

    for index, day in enumerate(plan_dict["days"]):
        workout_day = WorkoutDay.objects.create(
            plan=plan,
            day_name=day["day_name"],
            order=index
        )

        for ex in day["exercises"]:
            LoggedExercise.objects.create(
                day=workout_day,
                name=ex["exercise_name"],
                sets=ex.get("sets", 0),
                start_reps=ex.get("start_reps", 0),
                end_reps=ex.get("end_reps", 0),
                skip=ex.get("skip", False)
            )

    return plan
