from django.db import models

# Create your models here.
class Job(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Status(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    RUNNING = 'RUNNING', 'Running'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'

class JobStatus(models.Model):
    id = models.AutoField(primary_key=True)
    job = models.ForeignKey(Job, related_name='statuses', on_delete=models.CASCADE)
    status_type = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    timestamp = models.DateTimeField(auto_now_add=True)

