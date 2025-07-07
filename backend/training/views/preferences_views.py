from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from training.models.preference_model import UserPreferences
from training.serializers.preferences_serializers import UserPreferencesSerializer

@api_view(["POST", "PUT"])
@permission_classes([IsAuthenticated])
def save_preferences(request):
    try:
        prefs = UserPreferences.objects.get(user=request.user)
        serializer = UserPreferencesSerializer(prefs, data=request.data)
    except UserPreferences.DoesNotExist:
        serializer = UserPreferencesSerializer(data=request.data)

    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_preferences(request):
    try:
        prefs = request.user.userpreferences
        serializer = UserPreferencesSerializer(prefs)
        return Response(serializer.data)
    except UserPreferences.DoesNotExist:
        return Response({"message": "No preferences set yet."}, status=204)

