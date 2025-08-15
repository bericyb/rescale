"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from django.http import JsonResponse
from rest_framework import routers 
from joblister.views import JobViewSet

def health_check(request):
    return JsonResponse({'status': 'healthy'})

router = routers.DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')

urlpatterns = [
    path('health/', health_check, name='health'),
    path('api/', include(router.urls)),
]
