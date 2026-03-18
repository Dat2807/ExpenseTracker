from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from .category import Category
from .report import MonthlyReport


class MonthlyCategoryBudget(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="monthly_budgets")
    report = models.ForeignKey(
        MonthlyReport,
        on_delete=models.CASCADE,
        related_name="budgets",
        null=True,
        blank=True,
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="monthly_budgets")
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "report", "category"],
                name="uniq_budget_user_category_year_month",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "report"]),
        ]

    def clean(self):
        super().clean()
        if self.category_id and self.category.type != Category.Type.EXPENSE:
            raise ValidationError({"category": "Budget only applies to EXPENSE categories."})

    def __str__(self) -> str:
        return f"{self.user_id} {self.category_id} report={self.report_id}: {self.planned_amount}"
