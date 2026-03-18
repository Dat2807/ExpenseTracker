from rest_framework import serializers

from expenses.models import MonthlyCategoryBudget, MonthlyReport


class MonthlyCategoryBudgetSerializer(serializers.ModelSerializer):
    report_year = serializers.IntegerField(source="report.year", read_only=True)
    report_month = serializers.IntegerField(source="report.month", read_only=True)

    class Meta:
        model = MonthlyCategoryBudget
        fields = (
            "id",
            "report",
            "report_year",
            "report_month",
            "category",
            "planned_amount",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "report_year", "report_month", "created_at", "updated_at")

    def validate_report(self, value: MonthlyReport):
        request = self.context.get("request")
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Report does not belong to current user.")
        return value
