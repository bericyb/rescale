from rest_framework import viewsets
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from rest_framework import status
from .models import Job, JobStatus, Status
from .serializers import JobSerializer

class JobCursorPagination(CursorPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    ordering = '-created_at'

class JobViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing job instances with cursor pagination.
    """
    serializer_class = JobSerializer
    pagination_class = JobCursorPagination
    
    def get_queryset(self):
        return Job.objects.prefetch_related('statuses').order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.save()
        
        # Create initial PENDING status
        JobStatus.objects.create(
            job=job,
            status_type=Status.PENDING
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def partial_update(self, request, *args, **kwargs):
        job = self.get_object()
        status_updated = False
        
        # Create new job status if status_type is provided
        if 'status_type' in request.data:
            status_type = request.data['status_type']
            # Validate status_type is valid
            if status_type in [choice[0] for choice in Status.choices]:
                JobStatus.objects.create(
                    job=job,
                    status_type=status_type
                )
                status_updated = True
            else:
                return Response(
                    {'error': f'Invalid status_type. Must be one of: {[choice[0] for choice in Status.choices]}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update job fields (excluding status_type since it's not a job field)
        job_data = {k: v for k, v in request.data.items() if k != 'status_type'}
        
        # If status was updated but no other fields, force update to trigger updated_at
        if status_updated and not job_data:
            job.save(update_fields=['updated_at'])
        else:
            # Normal update flow
            serializer = self.get_serializer(job, data=job_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        
        # Return updated job data
        serializer = self.get_serializer(job)
        return Response(serializer.data)

