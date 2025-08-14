#!/bin/bash

# Wait for database to be ready
python manage.py migrate --noinput

# Run the server
python manage.py runserver 0.0.0.0:8000