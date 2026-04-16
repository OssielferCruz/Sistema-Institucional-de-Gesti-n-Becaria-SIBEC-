from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import MeViewSet, RoleViewSet, UserViewSet
from apps.academic.views import CareerViewSet, StudyPlanViewSet, TermViewSet
from apps.organization.views import AreaViewSet, SubareaViewSet
from apps.scholarships.views import AssignmentViewSet, DepartmentHeadProfileViewSet, StudentViewSet, TeacherProfileViewSet

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'users', UserViewSet, basename='user')
router.register(r'careers', CareerViewSet, basename='career')
router.register(r'study-plans', StudyPlanViewSet, basename='studyplan')
router.register(r'terms', TermViewSet, basename='term')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'subareas', SubareaViewSet, basename='subarea')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'teachers', TeacherProfileViewSet, basename='teacher')
router.register(r'department-heads', DepartmentHeadProfileViewSet, basename='departmenthead')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
	path('', include(router.urls)),
	path('me/', MeViewSet.as_view({'get': 'profile'}), name='me-profile'),
]
