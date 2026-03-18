from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class MonthlyReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="monthly_reports")
    year = models.PositiveSmallIntegerField(validators=[MinValueValidator(2000)])
    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    title = models.CharField(max_length=100, blank=True, default="")
    note = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "year", "month"],
                name="uniq_monthly_report_user_year_month",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "year", "month"]),
        ]

    def __str__(self) -> str:
        return self.title or f"{self.year}-{self.month:02d}"

