from rest_framework import viewsets

from expenses.models import MonthlyReport
from expenses.serializers import MonthlyReportSerializer


class MonthlyReportViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyReportSerializer

    def get_queryset(self):
        qs = MonthlyReport.objects.filter(user=self.request.user).order_by("-year", "-month")
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

