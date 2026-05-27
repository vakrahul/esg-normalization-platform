from django.core.management.base import BaseCommand

from apps.core.services import get_default_organization, reset_demo_ingestion


class Command(BaseCommand):
    help = "Delete all import batches and normalized activities for the default organization."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Skip confirmation prompt.",
        )

    def handle(self, *args, **options):
        org = get_default_organization()
        if not options["no_input"]:
            confirm = input(
                f"This will delete ALL ingested data for '{org.name}'. Type yes to continue: "
            )
            if confirm.strip().lower() != "yes":
                self.stdout.write(self.style.WARNING("Aborted."))
                return

        deleted = reset_demo_ingestion(org)
        self.stdout.write(
            self.style.SUCCESS(f"Cleared demo data for {org.name} ({deleted} related rows).")
        )
