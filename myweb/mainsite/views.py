from django.shortcuts import render, redirect, get_object_or_404
from .models import Task, Meeting


def _process_task_form(request):
    action = request.POST.get('action')
    if action == "add":
        content = request.POST.get('content')
        task_type = request.POST.get('type')  # daily 或 normal
        if content:
            Task.objects.create(
                text=content,
                is_daily=(task_type == 'daily')
            )
    elif action == "toggle":
        task_id = request.POST.get('task_id')
        task = get_object_or_404(Task, pk=task_id)
        task.completed = not task.completed
        task.save()
    elif action == "delete":
        task_id = request.POST.get('task_id')
        task = get_object_or_404(Task, pk=task_id)
        task.delete()


def project_page(request):
    if request.method == "POST":
        _process_task_form(request)
        return redirect('project_page')

    tasks = Task.objects.filter(is_daily=False).order_by('-created_at')
    daily_tasks = Task.objects.filter(is_daily=True).order_by('-created_at')

    return render(request, 'index.html', {
        'page': 'project',
        'page_title': '專案',
        'tasks': tasks,
        'daily_tasks': daily_tasks,
    })


def task_list(request):
    if request.method == "POST":
        _process_task_form(request)
        return redirect('task_list')

    tasks = Task.objects.filter(is_daily=False).order_by('-created_at')
    daily_tasks = Task.objects.filter(is_daily=True).order_by('-created_at')

    return render(request, 'index.html', {
        'page': 'task',
        'page_title': '任務',
        'tasks': tasks,
        'daily_tasks': daily_tasks,
    })


def meeting_list(request):
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

    return render(request, 'index.html', {
        'page': 'meeting',
        'page_title': '會議',
        'meetings': meetings,
    })

