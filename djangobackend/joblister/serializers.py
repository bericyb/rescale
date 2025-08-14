from rest_framework import serializers
from .models import Job, JobStatus

class JobSerializer(serializers.ModelSerializer):
    current_status = serializers.SerializerMethodField()
    statuses = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ['id', 'name', 'created_at', 'updated_at', 'current_status', 'statuses']
    
    def get_current_status(self, obj):
        latest_status = obj.statuses.order_by('-timestamp').first()
        if latest_status:
            return {
                'status_type': latest_status.status_type,
                'timestamp': latest_status.timestamp
            }
        return None
    
    def get_statuses(self, obj):
        return [
            {
                'id': status.id,
                'status_type': status.status_type,
                'timestamp': status.timestamp
            }
            for status in obj.statuses.order_by('timestamp')
        ]

class JobStatusSerializer(serializers.ModelSerializer):

    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())

    class Meta:
        model = JobStatus
        fields = '__all__'
