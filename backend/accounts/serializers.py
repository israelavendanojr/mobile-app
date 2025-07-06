from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_username(self, value):
        # Allow any alphanumeric username, not just email format
        if not value:
            raise serializers.ValidationError("Username is required")
        
        # Check if username already exists
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        
        # Basic username validation (optional - adjust as needed)
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        
        return value
    
    def create(self, validated_data):
        try:
            validated_data.pop('password_confirm')
            password = validated_data.pop('password')
            
            # Create user with the validated data
            user = User.objects.create_user(
                email=validated_data['email'],
                username=validated_data['username'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                password=password
            )
            
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error creating user: {str(e)}")

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': False},
            'username': {'required': False},
        }
    
    def validate_email(self, value):
        # Check if email is being changed and if it already exists
        if self.instance and self.instance.email != value:
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_username(self, value):
        # Check if username is being changed and if it already exists
        if self.instance and self.instance.username != value:
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Username already exists")
        
        # Basic username validation
        if value and len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        
        return value