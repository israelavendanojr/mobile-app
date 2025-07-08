# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from training.models.generic_models import Muscle, Equipment
from training.serializers.generic_serializers import MuscleSerializer, EquipmentSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_muscles(request):
    # Debug logging
    logger.info(f"🔍 Request user: {request.user}")
    logger.info(f"🔍 Is authenticated: {request.user.is_authenticated}")
    logger.info(f"🔍 Auth header: {request.META.get('HTTP_AUTHORIZATION', 'No auth header')}")
    
    print(f"🔍 Request user: {request.user}")
    print(f"🔍 Is authenticated: {request.user.is_authenticated}")
    print(f"🔍 Auth header: {request.META.get('HTTP_AUTHORIZATION', 'No auth header')}")
    
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    muscles = Muscle.objects.all()
    serializer = MuscleSerializer(muscles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_equipment(request):
    # Debug logging
    logger.info(f"🔍 Request user: {request.user}")
    logger.info(f"🔍 Is authenticated: {request.user.is_authenticated}")
    logger.info(f"🔍 Auth header: {request.META.get('HTTP_AUTHORIZATION', 'No auth header')}")
    
    print(f"🔍 Request user: {request.user}")
    print(f"🔍 Is authenticated: {request.user.is_authenticated}")
    print(f"🔍 Auth header: {request.META.get('HTTP_AUTHORIZATION', 'No auth header')}")
    
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    equipment = Equipment.objects.all()
    serializer = EquipmentSerializer(equipment, many=True)
    return Response(serializer.data)