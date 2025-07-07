# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from training.models.generic_models import Muscle, Equipment
from training.serializers.generic_serializers import MuscleSerializer, EquipmentSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_muscles(request):
    muscles = Muscle.objects.all()
    serializer = MuscleSerializer(muscles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_equipment(request):
    equipment = Equipment.objects.all()
    serializer = EquipmentSerializer(equipment, many=True)
    return Response(serializer.data)
