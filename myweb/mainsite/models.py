from django.db import models

class Task(models.Model):
    text = models.CharField(max_length=255) # 任務內容
    completed = models.BooleanField(default=False) # 是否完成
    is_daily = models.BooleanField(default=False)  # 用來區分每日任務
    created_at = models.DateTimeField(auto_now_add=True) # 建立時間

    def __str__(self):
        return self.text

class Meeting(models.Model):
    text = models.CharField(max_length=255) # 會議內容
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text

