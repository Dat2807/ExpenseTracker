from django.core.validators import MinValueValidator
from django.db import models

from .category import Category
from .report import MonthlyReport


class Transaction(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="transactions")
    report = models.ForeignKey(
        MonthlyReport,
        on_delete=models.CASCADE,
        related_name="transactions",
        null=True,
        blank=True,
    )
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    date = models.DateField()
    description = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "report", "date"]),
            models.Index(fields=["user", "report", "category", "date"]),
        ]

    def __str__(self) -> str:
        return f"{self.date} {self.amount} ({self.category_id})"
