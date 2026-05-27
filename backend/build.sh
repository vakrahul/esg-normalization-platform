#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
export USE_SQLITE="${USE_SQLITE:-true}"
python manage.py check --deploy
python manage.py collectstatic --noinput
python manage.py migrate --noinput
python manage.py seed_data
