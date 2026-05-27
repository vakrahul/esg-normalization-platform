from django.db.models.signals import pre_save
from django.dispatch import receiver

from apps.normalization.models import NormalizedActivity


@receiver(pre_save, sender=NormalizedActivity)
def prevent_locked_activity_mutation(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        previous = NormalizedActivity.objects.get(pk=instance.pk)
    except NormalizedActivity.DoesNotExist:
        return
    if previous.locked_for_audit and (
        previous.review_status != instance.review_status
        or previous.locked_for_audit != instance.locked_for_audit
        or previous.quantity != instance.quantity
        or previous.spend_amount != instance.spend_amount
        or previous.metadata != instance.metadata
    ):
        from django.core.exceptions import ValidationError

        raise ValidationError("Locked activities cannot be modified.")
