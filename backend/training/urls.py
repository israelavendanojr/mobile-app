from django.urls import path
from .views.plan_views import preview_plan, save_plan
from .views.preferences_views import save_preferences, get_preferences

urlpatterns = [
    path("api/plan/preview/", preview_plan, name="plan-preview"),
    path("api/plan/save/", save_plan, name="plan-save"),
    path("api/preferences/save/", save_preferences, name="preferences-save"),
    path("api/preferences/get/", get_preferences, name="preferences-get"),
]
