from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date

from training.models.logging_models import WorkoutLog
from training.serializers.logging_serializers import WorkoutLogSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_log(request):
    log, created = WorkoutLog.objects.get_or_create(user=request.user, date=date.today())
    serializer = WorkoutLogSerializer(log)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_log(request):
    serializer = WorkoutLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
