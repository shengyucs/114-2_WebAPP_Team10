from django.urls import path
from . import views

urlpatterns = [
    path('', views.project_page, name='project_page'),
    path('tasks/', views.task_list, name='task_list'),
    path('meetings/', views.meeting_list, name='meeting_list'),
    path('task/<int:task_id>/', views.task_detail, name='task_detail'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
]
