from django.core.management.base import BaseCommand
from training.models import (
    Equipment,
    Muscle,
    ExerciseMovement,
    ExercisePattern,
    WorkoutSplitTemplate,
    WorkoutDayTemplate,
    DayPatternThrough,
    SplitDayThrough
)
from django.db import transaction

class Command(BaseCommand):
    help = 'Seeds the database with hypertrophy-friendly exercise content.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Clearing exercise-related data..."))
        self.clear_data()
        self.stdout.write(self.style.SUCCESS("Old data cleared."))

        self.stdout.write(self.style.WARNING("Seeding new data..."))
        self.seed_equipment()
        self.seed_muscles()
        self.seed_exercise_patterns()
        self.seed_exercise_movements()
        self.seed_day_templates()
        self.seed_splits()
        self.seed_day_pattern_through()
        self.stdout.write(self.style.SUCCESS("Exercise data restored."))

    def clear_data(self):
        # Order matters to avoid FK errors
        DayPatternThrough.objects.all().delete()
        SplitDayThrough.objects.all().delete()
        WorkoutSplitTemplate.objects.all().delete()
        WorkoutDayTemplate.objects.all().delete()
        ExerciseMovement.objects.all().delete()
        ExercisePattern.objects.all().delete()
        Muscle.objects.all().delete()
        Equipment.objects.all().delete()

    def seed_equipment(self):
        equipment_names = ["Barbell", "Dumbbell", "Bodyweight", "Machine", "Cable"]
        Equipment.objects.bulk_create([Equipment(name=name) for name in equipment_names])

    def seed_muscles(self):
        muscle_names = [
            "Upper Chest", "Lower Chest",
            "Upper Back", "Lower Back", "Lats", "Traps",
            "Front Delts", "Side Delts", "Rear Delts",
            "Biceps", "Triceps",
            "Quads", "Hamstrings", "Glutes", "Calves", "Lower Back"
        ]
        for name in muscle_names:
            Muscle.objects.get_or_create(name=name)

    def seed_exercise_patterns(self):
        roles = [
            ("Horizontal Incline Push", ["Upper Chest"], ["Front Delts", "Triceps"]),
            ("Horizontal Push", ["Lower Chest"], ["Triceps", "Front Delts"]),
            ("Vertical Push", ["Front Delts"], ["Triceps", "Upper Chest", "Side Delts"]),
            ("Side Delt Isolation", ["Side Delts"], []),
            ("Tricep Isolation", ["Triceps"], []),
            ("Horizontal Pull", ["Upper Back", "Traps"], ["Rear Delts", "Lats", "Biceps"]),
            ("Vertical Pull", ["Lats"], ["Biceps", "Rear Delts", "Upper Back"]),
            ("Rear Delt Isolation", ["Rear Delts"], ["Traps"]),
            ("Bicep Isolation", ["Biceps"], []),
            ("Lat Isolation", ["Lats"], []),
            ("Squat", ["Quads", "Glutes"], ["Hamstrings"]),
            ("Hinge", ["Glutes", "Lower Back"], ["Hamstrings", "Quads"]),
            ("Quad Isolation", ["Quads"], []),
            ("Hamstring Isolation", ["Hamstrings"], []),
            ("Calf Isolation", ["Calves"], [])
        ]

        for name, primary_names, secondary_names in roles:
            pattern, _ = ExercisePattern.objects.get_or_create(name=name)
            pattern.primary_muscles.set(Muscle.objects.filter(name__in=primary_names))
            pattern.secondary_muscles.set(Muscle.objects.filter(name__in=secondary_names))

    def seed_exercise_movements(self):
        examples = [
            ("Incline Barbell Bench Press", "Horizontal Incline Push", "Barbell", "COMPOUND"),
            ("Flat Dumbbell Press", "Horizontal Push", "Dumbbell", "COMPOUND"),
            ("Push-Ups", "Horizontal Push", "Bodyweight", "COMPOUND"),
            ("Machine Shoulder Press", "Vertical Push", "Machine", "COMPOUND"),
            ("Dumbbell Lateral Raise", "Side Delt Isolation", "Dumbbell", "ISOLATION"),
            ("Tricep Pushdown", "Tricep Isolation", "Cable", "ISOLATION"),
            ("Barbell Row", "Horizontal Pull", "Barbell", "COMPOUND"),
            ("Pull-Ups", "Vertical Pull", "Bodyweight", "COMPOUND"),
            ("Face Pulls", "Rear Delt Isolation", "Cable", "ISOLATION"),
            ("Barbell Curl", "Bicep Isolation", "Barbell", "ISOLATION"),
            ("Bayesian Curl", "Bicep Isolation", "Cable", "ISOLATION"),
            ("Straight Arm Lat Pulldown", "Lat Isolation", "Cable", "ISOLATION"),
            ("Barbell Squat", "Squat", "Barbell", "COMPOUND"),
            ("Romanian Deadlift", "Hinge", "Barbell", "COMPOUND"),
            ("Leg Extension", "Quad Isolation", "Machine", "ISOLATION"),
            ("Hamstring Curl", "Hamstring Isolation", "Machine", "ISOLATION"),
            ("Standing Calf Raise", "Calf Isolation", "Machine", "ISOLATION")
        ]

        for name, role_name, equipment_name, kind in examples:
            movement = ExerciseMovement.objects.create(
                name=name,
                pattern=ExercisePattern.objects.get(name=role_name),
                type=kind
            )
            movement.equipment.set([Equipment.objects.get(name=equipment_name)])

    def seed_day_templates(self):
        day_templates = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body"]
        WorkoutDayTemplate.objects.bulk_create([WorkoutDayTemplate(name=name) for name in day_templates])

    def seed_splits(self):
        # Example: Push Pull Legs split
        split = WorkoutSplitTemplate.objects.create(name="Push Pull Legs", days_per_week=3)
        push = WorkoutDayTemplate.objects.get(name="Push")
        pull = WorkoutDayTemplate.objects.get(name="Pull")
        legs = WorkoutDayTemplate.objects.get(name="Legs")
        SplitDayThrough.objects.bulk_create([
            SplitDayThrough(split=split, day_template=push, day_index=0),
            SplitDayThrough(split=split, day_template=pull, day_index=1),
            SplitDayThrough(split=split, day_template=legs, day_index=2),
        ])


    def seed_day_pattern_through(self):
        pattern_map = {
            "Push": ["Horizontal Incline Push", "Horizontal Push", "Vertical Push", "Side Delt Isolation", "Tricep Isolation"],
            "Pull": ["Vertical Pull", "Horizontal Pull", "Lat Isolation", "Rear Delt Isolation", "Bicep Isolation"],
            "Legs": ["Squat", "Hinge", "Quad Isolation", "Hamstring Isolation", "Calf Isolation"]
        }

        for day_name, patterns in pattern_map.items():
            day = WorkoutDayTemplate.objects.get(name=day_name)
            for idx, pattern_name in enumerate(patterns):
                pattern = ExercisePattern.objects.get(name=pattern_name)
                DayPatternThrough.objects.create(
                    day_template=day,
                    pattern=pattern,
                    pattern_index=idx
                )

