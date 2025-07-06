from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.EmailTokenObtainPairView.as_view(), name='login'),
    path('register/', views.register, name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
]