from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models

class User(AbstractUser):
    username = models.CharField(
        max_length=150, 
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_]+$',
                message='Username can only contain letters, numbers, and underscores.',
                code='invalid_username'
            ),
        ],
        help_text='Required. 150 characters or fewer. Letters, numbers and underscores only.',
        error_messages={
            'unique': "A user with that username already exists.",
        },
    )
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email