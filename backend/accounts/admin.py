from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'username', 'is_superuser', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'username')
    ordering = ('-date_joined',)
