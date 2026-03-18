from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"code": "REGISTER_VALIDATION_ERROR", "message": "Validation failed", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "code": "REGISTER_OK",
                "message": "Registered successfully",
                "token": token.key,
                "user": {"id": user.pk, "username": user.username, "email": user.email or ""},
            },
            status=status.HTTP_201_CREATED,
        )
