from rest_framework import serializers
from training.models.preference_model import UserPreferences    
from training.models.generic_models import Muscle, Equipment

class UserPreferencesSerializer(serializers.ModelSerializer):
    priority_muscles = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Muscle.objects.all()
    )
    equipment = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Equipment.objects.all()
    )

    class Meta:
        model = UserPreferences
        fields = (
            "days_per_week",
            "training_age",
            "volume",
            "priority_muscles",
            "bodyweight_exercises",
            "equipment",
        )
