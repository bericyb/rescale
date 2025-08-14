# Django REST API Documentation

## Overview
This is a Django REST Framework API for managing jobs and their status tracking. The application follows a clean architecture with separate models for jobs and job statuses, allowing for comprehensive job lifecycle management.

## Project Structure

```
djangobackend/
├── backend/                 # Django project settings
│   ├── settings.py         # Main configuration file
│   ├── urls.py            # Root URL configuration
│   ├── wsgi.py            # WSGI application entry point
│   └── asgi.py            # ASGI application entry point
├── joblister/              # Main application
│   ├── models.py          # Data models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   ├── admin.py           # Django admin configuration
│   ├── apps.py            # App configuration
│   ├── tests.py           # Unit tests
│   └── migrations/        # Database migrations
├── requirements.txt        # Python dependencies
├── manage.py              # Django management script
└── Dockerfile             # Docker configuration
```

## Technology Stack

- **Framework**: Django 5.2.5
- **API**: Django REST Framework 3.16.1
- **Database**: PostgreSQL (psycopg 3.2.9)
- **CORS**: django-cors-headers 4.7.0
- **Containerization**: Docker

## Database Configuration

The application is configured to use PostgreSQL with the following settings:
- **Database Name**: `backend_db`
- **User**: `user`
- **Password**: `password`
- **Host**: Configurable via `DB_HOST` environment variable (defaults to `localhost`)
- **Port**: `5432`

## Data Models

### Job Model
Located in `joblister/models.py:4-8`

```python
class Job(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Fields:**
- `id`: Primary key (auto-incrementing)
- `name`: Job name (max 255 characters)
- `created_at`: Timestamp when job was created (auto-generated)
- `updated_at`: Timestamp when job was last updated (auto-updated)

### JobStatus Model
Located in `joblister/models.py:16-24`

```python
class JobStatus(models.Model):
    id = models.AutoField(primary_key=True)
    job = models.ForeignKey(Job, related_name='statuses', on_delete=models.CASCADE)
    status_type = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    timestamp = models.DateTimeField(auto_now_add=True)
```

**Fields:**
- `id`: Primary key (auto-incrementing)
- `job`: Foreign key to Job model with cascade delete
- `status_type`: Status enum (PENDING, RUNNING, COMPLETED, FAILED)
- `timestamp`: When the status was created (auto-generated)

### Status Choices
Located in `joblister/models.py:10-14`

```python
class Status(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    RUNNING = 'RUNNING', 'Running'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'
```

## API Endpoints

The API is configured with Django REST Framework's `DefaultRouter` and includes pagination (10 items per page).

### Base URL
All API endpoints are prefixed with `/api/`

### Jobs Endpoint

**Base URL**: `/api/jobs/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/` | List all jobs (paginated, ordered by created_at desc) |
| POST | `/api/jobs/` | Create a new job |
| GET | `/api/jobs/{id}/` | Retrieve a specific job by ID |
| PUT | `/api/jobs/{id}/` | Update a specific job |
| PATCH | `/api/jobs/{id}/` | Partially update a specific job |
| DELETE | `/api/jobs/{id}/` | Delete a specific job |

### Job Statuses Endpoint

**Base URL**: `/api/jobstatuses/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobstatuses/` | List all job statuses (paginated, ordered by timestamp) |
| POST | `/api/jobstatuses/` | Create a new job status |
| GET | `/api/jobstatuses/{id}/` | Retrieve a specific job status by ID |
| PUT | `/api/jobstatuses/{id}/` | Update a specific job status |
| PATCH | `/api/jobstatuses/{id}/` | Partially update a specific job status |
| DELETE | `/api/jobstatuses/{id}/` | Delete a specific job status |

## Serializers

### JobSerializer
Located in `joblister/serializers.py:4-8`
- Serializes all fields of the Job model
- Uses `ModelSerializer` for automatic field generation

### JobStatusSerializer
Located in `joblister/serializers.py:10-16`
- Serializes all fields of the JobStatus model
- Includes `PrimaryKeyRelatedField` for job relationship
- Validates job existence through queryset

## ViewSets

### JobViewSet
Located in `joblister/views.py:6-11`
- Extends `ModelViewSet` for full CRUD operations
- Orders jobs by creation date (newest first)
- Uses `JobSerializer` for data serialization

### JobStatusViewSet
Located in `joblister/views.py:13-18`
- Extends `ModelViewSet` for full CRUD operations
- Orders job statuses by timestamp (oldest first)
- Uses `JobStatusSerializer` for data serialization

## Configuration

### REST Framework Settings
Located in `backend/settings.py:31-38`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}
```

**Key Features:**
- No authentication required (open API)
- Pagination enabled with 10 items per page
- All permissions allowed

### CORS Configuration
- `CORS_ALLOW_ALL_ORIGINS = True` - Allows requests from any origin
- CORS middleware is properly configured in the middleware stack

## Security Considerations

⚠️ **Development Configuration**: This application is currently configured for development with:
- `DEBUG = True`
- No authentication required
- CORS allowing all origins
- Hardcoded secret key

**For production deployment, ensure:**
- Set `DEBUG = False`
- Configure proper authentication
- Restrict CORS origins
- Use environment variables for sensitive settings
- Configure HTTPS

## Database Relationships

The application implements a one-to-many relationship:
- One `Job` can have multiple `JobStatus` records
- `JobStatus` records are accessed via the `statuses` related name
- Deleting a `Job` cascades to delete all associated `JobStatus` records

## Usage Examples

### Creating a Job
```bash
POST /api/jobs/
{
    "name": "Data Processing Job"
}
```

### Adding a Status to a Job
```bash
POST /api/jobstatuses/
{
    "job": 1,
    "status_type": "RUNNING"
}
```

### Retrieving Job with Statuses
The API returns jobs with their IDs, which can be used to query related statuses through the `/api/jobstatuses/` endpoint filtered by job ID.

## Development Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Configure PostgreSQL database
3. Run migrations: `python manage.py migrate`
4. Start development server: `python manage.py runserver`

The API will be available at `http://localhost:8000/api/`
