from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from django.db import IntegrityError
from .serializers import UserRegistrationSerializer, UserSerializer, UserUpdateSerializer

User = get_user_model()

class EmailTokenObtainPairView(TokenObtainPairView):
    """Custom login view that accepts email or username"""
    
    def post(self, request, *args, **kwargs):
        login_input = request.data.get('login')  # Can be email or username
        email = request.data.get('email')  # Keep backward compatibility
        password = request.data.get('password')
        
        # Support both 'login' field and 'email' field for backward compatibility
        user_identifier = login_input or email
        
        if not user_identifier or not password:
            return Response(
                {'error': 'Email/username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to find user by email or username
        try:
            user = User.objects.get(Q(email=user_identifier) | Q(username=user_identifier))
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
            else:
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User created successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            # Handle database integrity errors
            error_message = "A user with this email or username already exists"
            if 'email' in str(e).lower():
                error_message = "Email already exists"
            elif 'username' in str(e).lower():
                error_message = "Username already exists"
            
            return Response({
                'error': error_message,
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Registration failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Format validation errors better
    errors = {}
    for field, field_errors in serializer.errors.items():
        if isinstance(field_errors, list):
            errors[field] = field_errors[0] if field_errors else 'Invalid value'
        else:
            errors[field] = str(field_errors)
    
    return Response({
        'error': 'Validation failed',
        'errors': errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout(request):
    """Logout endpoint - blacklists the refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'})
        
    except TokenError as e:
        return Response(
            {'error': 'Invalid token', 'details': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': 'Logout failed', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def profile(request):
    """Get current user profile"""
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch profile', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    """Delete current user account"""
    try:
        user = request.user
        user.delete()
        return Response(
            {'message': 'User account deleted successfully'}, 
            status=status.HTTP_204_NO_CONTENT
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete account', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update current user profile"""
    try:
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        
        # Format validation errors better
        errors = {}
        for field, field_errors in serializer.errors.items():
            if isinstance(field_errors, list):
                errors[field] = field_errors[0] if field_errors else 'Invalid value'
            else:
                errors[field] = str(field_errors)
        
        return Response({
            'error': 'Validation failed',
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to update profile', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )