from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from training.serializers import (
    PlanRequestSerializer,
    PlanPreviewSerializer,
    WorkoutPlanSerializer,
)
from training.utils.plan_generation_utils import generate_plan, save_generated_plan

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
    preview_serializer = PlanPreviewSerializer(data=request.data)
    preview_serializer.is_valid(raise_exception=True)
    plan_dict = preview_serializer.validated_data

    plan = save_generated_plan(request.user, plan_dict)

    output = WorkoutPlanSerializer(plan)
    return Response(output.data, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_saved_plans(request):
    plans = WorkoutPlan.objects.filter(user=request.user)
    serializer = WorkoutPlanSerializer(plans, many=True)
    return Response(serializer.data)