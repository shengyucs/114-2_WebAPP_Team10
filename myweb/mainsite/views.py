from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils import timezone
from .models import Task, Meeting


def _process_task_form(request):
    action = request.POST.get('action')
    if action == "add":
        content = request.POST.get('content')
        task_type = request.POST.get('type')  # daily 或 normal
        if content:
            Task.objects.create(
                text=content,
                is_daily=(task_type == 'daily'),
                user=request.user
            )
    elif action == "toggle":
        task_id = request.POST.get('task_id')
        task = get_object_or_404(Task, pk=task_id, user=request.user)
        task.completed = not task.completed
        task.save()
    elif action == "delete":
        task_id = request.POST.get('task_id')
        task = get_object_or_404(Task, pk=task_id, user=request.user)
        task.delete()


def project_page(request):
    if not request.user.is_authenticated:
        return redirect('login')

    if request.method == "POST":
        _process_task_form(request)
        return redirect('project_page')

    tasks = Task.objects.filter(user=request.user, is_daily=False).order_by('-created_at')
    daily_tasks = Task.objects.filter(user=request.user, is_daily=True).order_by('-created_at')

    # GET Search Logic
    query = request.GET.get('q')
    if query:
        tasks = tasks.filter(text__icontains=query)
        daily_tasks = daily_tasks.filter(text__icontains=query)
    
    # Calculate statistics based on current visible tasks
    total_count = tasks.count() + daily_tasks.count()
    completed_count = tasks.filter(completed=True).count() + daily_tasks.filter(completed=True).count()
    pending_count = total_count - completed_count
    
    progress_percentage = 0
    if total_count > 0:
        progress_percentage = int((completed_count / total_count) * 100)

    last_login = request.session.get('last_login')

    return render(request, 'index.html', {
        'page': 'project',
        'page_title': '專案總覽',
        'tasks': tasks,
        'daily_tasks': daily_tasks,
        'stats': {
            'total': total_count,
            'completed': completed_count,
            'pending': pending_count,
            'percentage': progress_percentage,
        },
        'last_login': last_login,
    })


def task_list(request):
    if not request.user.is_authenticated:
        return redirect('login')

    if request.method == "POST":
        _process_task_form(request)
        return redirect('task_list')

    tasks = Task.objects.filter(user=request.user, is_daily=False).order_by('-created_at')
    daily_tasks = Task.objects.filter(user=request.user, is_daily=True).order_by('-created_at')

    # GET Search Logic
    query = request.GET.get('q')
    if query:
        tasks = tasks.filter(text__icontains=query)
        daily_tasks = daily_tasks.filter(text__icontains=query)

    last_login = request.session.get('last_login')

    return render(request, 'index.html', {
        'page': 'task',
        'page_title': '任務',
        'tasks': tasks,
        'daily_tasks': daily_tasks,
        'total_count': tasks.count() + daily_tasks.count(),
        'stats': {'total': tasks.count() + daily_tasks.count()},
        'last_login': last_login,
    })


def meeting_list(request):
    if not request.user.is_authenticated:
        return redirect('login')

    if request.method == "POST":
        action = request.POST.get('action')
        if action == "add":
            content = request.POST.get('content')
            if content:
                Meeting.objects.create(text=content)
        elif action == "toggle":
            meeting_id = request.POST.get('task_id')
            meeting = get_object_or_404(Meeting, pk=meeting_id)
            meeting.completed = not meeting.completed
            meeting.save()
        elif action == "delete":
            meeting_id = request.POST.get('task_id')
            meeting = get_object_or_404(Meeting, pk=meeting_id)
            meeting.delete()
        return redirect('meeting_list')

    meetings = Meeting.objects.order_by('-created_at')

    last_login = request.session.get('last_login')

    return render(request, 'index.html', {
        'page': 'meeting',
        'page_title': '會議',
        'meetings': meetings,
        'last_login': last_login,
    })


def task_detail(request, task_id):
    if not request.user.is_authenticated:
        return redirect('login')

    task = get_object_or_404(Task, pk=task_id, user=request.user)
    
    # POST Update Logic
    if request.method == "POST":
        new_content = request.POST.get('content')
        if new_content:
            task.text = new_content
            task.save()
            return redirect('task_detail', task_id=task.id)

    last_login = request.session.get('last_login')

    return render(request, 'detail.html', {
        'task': task,
        'page_title': '任務詳情',
        'last_login': last_login,
    })


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            request.session['last_login'] = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
            messages.success(request, '登入成功！')
            return redirect('project_page')
        else:
            messages.error(request, '帳號或密碼錯誤。')
    return render(request, 'login.html')


def logout_view(request):
    logout(request)
    messages.success(request, '登出成功！')
    return redirect('login')


def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        if password == password2:
            if User.objects.filter(username=username).exists():
                messages.error(request, '帳號已存在。')
            else:
                user = User.objects.create_user(username=username, password=password)
                user.save()
                messages.success(request, '註冊成功！請登入。')
                return redirect('login')
        else:
            messages.error(request, '密碼不一致。')
    return render(request, 'register.html')


