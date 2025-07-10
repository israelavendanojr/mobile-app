from django.urls import path
from .views.plan_views import preview_plan, save_plan, get_saved_plans
from .views.preferences_views import save_preferences, get_preferences
from .views.generic_views import get_muscles, get_equipment
from .views.logging_views import get_week_log, submit_week_log, submit_day_log

urlpatterns = [
    path("plan/preview/", preview_plan, name="plan-preview"),
    path("plan/save/", save_plan, name="plan-save"),
    path("plan/get/", get_saved_plans, name="plan-get"),
    path("preferences/save/", save_preferences, name="preferences-save"),
    path("preferences/get/", get_preferences, name="preferences-get"),
    path("muscles/", get_muscles, name="muscles-get"),
    path("equipment/", get_equipment, name="equipment-get"),
    path("workout/log/week/", get_week_log, name="workout-log-week"),
    path("workout/log/week/submit/", submit_week_log, name="workout-log-week-submit"),
    path("workout/log/day/<int:day_log_id>/submit/", submit_day_log, name="workout-log-day-submit"),
]
