from django.test import TestCase
from training.models import (
    WorkoutDayTemplate, ExercisePattern, ExerciseMovement,
    Equipment, Muscle, UserPreferences, DayPatternThrough, 
    WorkoutSplitTemplate, SplitDayThrough
)
from training.utils.plan_generation_utils import generate_day, decide_split
from django.contrib.auth import get_user_model

class ManualDBTestCase(TestCase):
    def setUp(self):
        # === USER & PREFERENCES ===
        self.user = get_user_model().objects.create_user(username='testuser', password='testpass')
        self.dumbbell = Equipment.objects.create(name="Dumbbell")
        self.barbell = Equipment.objects.create(name="Barbell")

        self.pref = UserPreferences.objects.create(
            user=self.user,
            days_per_week=3,
            training_age=1,
            volume="moderate",
            bodyweight_exercises="weighted"
        )
        self.pref.equipment.set([self.dumbbell, self.barbell])

        # === UPPER BODY MUSCLES & PATTERNS ===
        self.chest = Muscle.objects.create(name="Chest")
        self.back = Muscle.objects.create(name="Back")
        self.biceps = Muscle.objects.create(name="Biceps")
        self.rear_delts = Muscle.objects.create(name="Rear Delts")

        self.h_push = ExercisePattern.objects.create(name="Horizontal Push")
        self.vert_pull = ExercisePattern.objects.create(name="Vertical Pull")
        self.h_pull = ExercisePattern.objects.create(name="Horizontal Pull")
        self.rear_delt_iso = ExercisePattern.objects.create(name="Rear Delt Isolation")
        self.bicep = ExercisePattern.objects.create(name="Bicep Curl")

        self.h_push.target_muscles.add(self.chest)
        self.vert_pull.target_muscles.add(self.back)
        self.h_pull.target_muscles.add(self.back)
        self.rear_delt_iso.target_muscles.add(self.rear_delts)
        self.bicep.target_muscles.add(self.biceps)

        ExerciseMovement.objects.create(name="Dumbbell Bench Press", pattern=self.h_push).equipment.add(self.dumbbell)
        ExerciseMovement.objects.create(name="Chin Up", pattern=self.vert_pull).equipment.add(self.barbell)
        ExerciseMovement.objects.create(name="T Bar Row", pattern=self.h_pull).equipment.add(self.barbell)
        ExerciseMovement.objects.create(name="Rear Delt Fly", pattern=self.rear_delt_iso).equipment.add(self.dumbbell)
        ExerciseMovement.objects.create(name="Bicep Curl", pattern=self.bicep).equipment.add(self.dumbbell)

        # === LOWER BODY MUSCLES & PATTERNS ===
        self.quad = Muscle.objects.create(name="Quads")
        self.hamstring = Muscle.objects.create(name="Hamstrings")
        self.glutes = Muscle.objects.create(name="Glutes")
        self.calves = Muscle.objects.create(name="Calves")

        self.squat_pattern = ExercisePattern.objects.create(name="Squat")
        self.rdl_pattern = ExercisePattern.objects.create(name="Hip Hinge")
        self.calf_pattern = ExercisePattern.objects.create(name="Calf Raise")

        self.squat_pattern.target_muscles.add(self.quad, self.glutes)
        self.rdl_pattern.target_muscles.add(self.hamstring, self.glutes)
        self.calf_pattern.target_muscles.add(self.calves)

        ExerciseMovement.objects.create(name="Barbell Squat", pattern=self.squat_pattern).equipment.add(self.barbell)
        ExerciseMovement.objects.create(name="Barbell RDL", pattern=self.rdl_pattern).equipment.add(self.barbell)
        ExerciseMovement.objects.create(name="Dumbbell Calf Raise", pattern=self.calf_pattern).equipment.add(self.dumbbell)

    # Template Tests
    def create_day_template(self, name, patterns_in_order):
        template = WorkoutDayTemplate.objects.create(name=name)
        for index, pattern in enumerate(patterns_in_order):
            DayPatternThrough.objects.create(
                day_template=template,
                pattern=pattern,
                pattern_index=index
            )
        return template

    # Generate Day Tests
    def test_push_day(self):
        day_plan = generate_day(self.pref, self.create_day_template("Push", [self.h_push]))
        self.assertEqual(len(day_plan), 1)
        self.assertEqual(day_plan[0]["exercise_name"], "Dumbbell Bench Press")

    def test_pull_day(self):
        day_plan = generate_day(self.pref, self.create_day_template("Pull", [
            self.vert_pull, self.h_pull, self.rear_delt_iso, self.bicep
        ]))
        expected_names = {"Chin Up", "T Bar Row", "Rear Delt Fly", "Bicep Curl"}
        self.assertEqual(len(day_plan), 4)
        self.assertEqual(set(ex["exercise_name"] for ex in day_plan), expected_names)

    def test_leg_day(self):
        day_plan = generate_day(self.pref, self.create_day_template("Leg", [
            self.squat_pattern, self.rdl_pattern, self.calf_pattern
        ]))
        expected_names = {"Barbell Squat", "Barbell RDL", "Dumbbell Calf Raise"}
        self.assertEqual(len(day_plan), 3)
        self.assertEqual(set(ex["exercise_name"] for ex in day_plan), expected_names)

    # Decide Split Tests
    def test_6_day_pplppl_split(self):
        # Create day templates
        push = WorkoutDayTemplate.objects.create(name="Push")
        pull = WorkoutDayTemplate.objects.create(name="Pull")
        legs = WorkoutDayTemplate.objects.create(name="Legs")

        # Create a 6-day split: P-P-L-P-P-L
        split = WorkoutSplitTemplate.objects.create(name="PPLPPL", days_per_week=6)
        SplitDayThrough.objects.create(split=split, day_template=push, day_index=0)
        SplitDayThrough.objects.create(split=split, day_template=pull, day_index=1)
        SplitDayThrough.objects.create(split=split, day_template=legs, day_index=2)
        SplitDayThrough.objects.create(split=split, day_template=push, day_index=3)
        SplitDayThrough.objects.create(split=split, day_template=pull, day_index=4)
        SplitDayThrough.objects.create(split=split, day_template=legs, day_index=5)

        # Match user preference
        self.pref.days_per_week = 6
        self.pref.save()

        result = decide_split(self.pref)
        self.assertIsNotNone(result)
        self.assertEqual(result.name, "PPLPPL")
        self.assertEqual(result.days_per_week, 6)

        # check that day order is correct
        day_names = [d.name for d in result.workouts.order_by('splitdaythrough__day_index')]
        self.assertEqual(day_names, ["Push", "Pull", "Legs", "Push", "Pull", "Legs"])

    def test_2_day_full_body_split(self):
        # Create day templates
        full_a = WorkoutDayTemplate.objects.create(name="Full Body A")
        full_b = WorkoutDayTemplate.objects.create(name="Full Body B")

        # Create 2-day split
        split = WorkoutSplitTemplate.objects.create(name="2-Day Full Body", days_per_week=2)
        SplitDayThrough.objects.create(split=split, day_template=full_a, day_index=0)
        SplitDayThrough.objects.create(split=split, day_template=full_b, day_index=1)

        # Make sure preferences match
        self.pref.days_per_week = 2
        self.pref.save()

        result = decide_split(self.pref)
        self.assertIsNotNone(result)
        self.assertEqual(result.name, "2-Day Full Body")
        self.assertEqual(result.days_per_week, 2)
