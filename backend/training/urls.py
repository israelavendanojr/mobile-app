from django.urls import path
from .views import preview_plan, save_plan

urlpatterns = [
    path("api/plan/preview/", preview_plan, name="plan-preview"),
    path("api/plan/save/", save_plan, name="plan-save"),
]
