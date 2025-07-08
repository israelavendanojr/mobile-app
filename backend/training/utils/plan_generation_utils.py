import random
from training.models import ExerciseMovement, WorkoutSplitTemplate, ExerciseType, WorkoutPlan, WorkoutDay, PlannedExercise

import random
from training.models import ExerciseMovement, Equipment

def attach_exercise(preferences, pattern, used_exercises=None):
    if used_exercises is None:
        used_exercises = set()

    print(f"\n=== DEBUG attach_exercise for pattern: {pattern} ===")
    print(f"Pattern ID: {pattern.id}")
    print(f"Pattern name: {pattern.name}")

    # Retrieve equipment IDs from preferences
    equipment_ids = preferences.get("equipment", [])
    print(f"Equipment IDs: {equipment_ids}")

    # Get equipment names from IDs
    available_equipment = list(
        Equipment.objects.filter(id__in=equipment_ids).values_list("name", flat=True)
    )
    print(f"Available equipment names from IDs: {available_equipment}")

    # Debug: Check all exercises for this pattern
    all_pattern_exercises = ExerciseMovement.objects.filter(pattern=pattern)
    print(f"All exercises for pattern {pattern.name}: {all_pattern_exercises.count()}")
    for ex in all_pattern_exercises:
        ex_equipment = [eq.name for eq in ex.equipment.all()]
        print(f"  - {ex.name}: equipment={ex_equipment}")

    # Filter exercises by pattern and equipment
    candidates = ExerciseMovement.objects.filter(pattern=pattern)
    print(f"Candidates after pattern filter: {candidates.count()}")

    equipment_filtered = candidates.filter(equipment__name__in=available_equipment).distinct()
    print(f"Candidates after equipment filter: {equipment_filtered.count()}")

    used_exercise_ids = [ex.id for ex in used_exercises]
    print(f"Used exercise IDs: {used_exercise_ids}")

    final_candidates = equipment_filtered.exclude(id__in=used_exercise_ids)
    print(f"Final candidates: {final_candidates.count()}")

    if not final_candidates.exists():
        print("No suitable exercises found!")
        return None

    selected = final_candidates.order_by('?').first()
    print(f"Selected exercise: {selected}")
    print("=== END DEBUG ===\n")

    return selected

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

    print(f"\n=== Generating day: {workout_day_template.name} ===")
    print(f"Patterns for this day: {[p.name for p in patterns]}")

    for pattern in patterns:
        exercise = attach_exercise(preferences, pattern, used_exercises)
        print(f"Exercise for pattern {pattern}: {exercise}")
        
        if exercise:
            used_exercises.add(exercise)
            sets, start_reps, end_reps = decide_sets_and_reps(exercise, preferences.get("volume", "moderate"))
            day_plan.append({
                "exercise": exercise,
                "exercise_name": exercise.name,
                "sets": sets,
                "start_reps": start_reps,
                "end_reps": end_reps,
                "skip": False,
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

    print(f"Day plan generated: {len(day_plan)} exercises")
    return day_plan

def decide_split(days_per_week):
    return WorkoutSplitTemplate.objects.filter(days_per_week=days_per_week).first()

def generate_plan(preferences):
    print(f"\n=== Generating plan ===")
    print(f"Preferences: {preferences}")
    
    days_per_week = preferences["days_per_week"]
    workout_split = decide_split(days_per_week)
    if not workout_split:
        print(f"No workout split found for {days_per_week} days per week")
        return None

    print(f"Using workout split: {workout_split.name}")

    plan = {
        "name": workout_split.name,
        "days_per_week": workout_split.days_per_week,
        "days": []
    }

    ordered_days = workout_split.workouts.order_by("splitdaythrough__day_index")
    print(f"Ordered days: {[d.name for d in ordered_days]}")
    
    for day_template in ordered_days:
        day_plan = generate_day(preferences, day_template)
        plan["days"].append({
            "day_name": day_template.name,
            "exercises": day_plan
        })

    return plan

def save_generated_plan(user, plan_dict):
    """Save a generated plan to the database"""
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
            PlannedExercise.objects.create(
                day=workout_day,
                name=ex["exercise_name"],
                sets=ex.get("sets", 0),
                start_reps=ex.get("start_reps", 0),
                end_reps=ex.get("end_reps", 0),
                skip=ex.get("skip", False)
            )

    return plan