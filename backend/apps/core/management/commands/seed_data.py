import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from apps.core.models import DataSource
from apps.core.services import get_default_organization


def ensure_org_sources(org):
    for source_type, method in [
        (DataSource.SOURCE_SAP, DataSource.METHOD_CSV),
        (DataSource.SOURCE_UTILITY, DataSource.METHOD_CSV),
        (DataSource.SOURCE_TRAVEL, DataSource.METHOD_API),
    ]:
        DataSource.objects.get_or_create(
            organization=org,
            source_type=source_type,
            defaults={"ingestion_method": method},
        )


class Command(BaseCommand):
    help = "Seed default data sources and analyst user."

    def add_arguments(self, parser):
        parser.add_argument("--username", default=os.getenv("ANALYST_USERNAME", "analyst"))
        parser.add_argument("--password", default=os.getenv("ANALYST_PASSWORD", "analyst123"))

    def handle(self, *args, **options):
        org = get_default_organization()
        ensure_org_sources(org)

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=options["username"],
            defaults={"email": f"{options['username']}@breathe-esg.local"},
        )
        user.set_password(options["password"])
        user.is_staff = True
        user.save()
        Token.objects.get_or_create(user=user)
        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} user '{user.username}'"))
