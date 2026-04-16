from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import Role, User
from apps.accounts.serializers import CurrentUserSerializer, RoleSerializer, UserSerializer
from apps.common.permissions import IsAdminRole


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('role').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']


class MeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def profile(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)
