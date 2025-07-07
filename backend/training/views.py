# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    PlanRequestSerializer,
    PlanPreviewSerializer,
    WorkoutPlanSerializer,
)
from .utils.plan_generation_utils import generate_plan, save_generated_plan

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def preview_plan(request):
    """
    Generate a plan in-memory from user preferences (no DB writes).
    """
    serializer = PlanRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    plan_dict = generate_plan(serializer.validated_data)
    preview = PlanPreviewSerializer(plan_dict)
    return Response(preview.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_plan(request):
    """
    Persist a previously generated plan (client sends the full plan JSON).
    """
    # validate the incoming plan structure
    preview_serializer = PlanPreviewSerializer(data=request.data)
    preview_serializer.is_valid(raise_exception=True)
    plan_dict = preview_serializer.validated_data

    # save it
    plan = save_generated_plan(request.user, plan_dict)

    # return the saved instance (with ID and timestamps)
    output = WorkoutPlanSerializer(plan)
    return Response(output.data, status=status.HTTP_201_CREATED)
