from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if not user.role_id:
            return False
        if not self.allowed_roles:
            return True
        return user.role.code in self.allowed_roles


class IsAdminRole(HasRole):
    allowed_roles = ('admin',)


class IsDepartmentHeadRole(HasRole):
    allowed_roles = ('jefatura',)


class IsTeacherRole(HasRole):
    allowed_roles = ('docente',)


class IsStudentRole(HasRole):
    allowed_roles = ('estudiante',)
