from django.conf import settings
from django.db import models


class QuickNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quick_notes")
    title = models.CharField(max_length=100, blank=True, default="")
    content = models.TextField()
    is_favorite = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "is_favorite"]),
        ]

    def __str__(self) -> str:
        return self.title or f"QuickNote {self.pk}"
