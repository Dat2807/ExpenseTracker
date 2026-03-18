from rest_framework import serializers

from expenses.models import MonthlyReport


class MonthlyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyReport
        fields = ("id", "year", "month", "title", "note", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

