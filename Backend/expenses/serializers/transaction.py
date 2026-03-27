from rest_framework import serializers

from expenses.models import MonthlyReport, Transaction


class TransactionSerializer(serializers.ModelSerializer):
    report_year = serializers.IntegerField(source="report.year", read_only=True)
    report_month = serializers.IntegerField(source="report.month", read_only=True)

    class Meta:
        model = Transaction
        fields = (
            "id",
            "report",
            "report_year",
            "report_month",
            "category",
            "amount",
            "date",
            "description",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "report_year", "report_month", "created_at", "updated_at")

    def validate_report(self, value: MonthlyReport):
        request = self.context.get("request")
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Report does not belong to current user.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        report: MonthlyReport | None = attrs.get("report") or getattr(self.instance, "report", None)
        date = attrs.get("date") or getattr(self.instance, "date", None)
        if report and date:
            if date.year != report.year or date.month != report.month:
                raise serializers.ValidationError(
                    {"date": "Date must be within the selected report month."}
                )
        return attrs

