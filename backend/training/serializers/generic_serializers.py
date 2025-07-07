from rest_framework import serializers
from training.models.generic_models import Muscle, Equipment

class MuscleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Muscle
        fields = ['id', 'name']

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ['id', 'name']
