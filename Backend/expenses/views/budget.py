from rest_framework import viewsets

from expenses.models import MonthlyCategoryBudget
from expenses.serializers import MonthlyCategoryBudgetSerializer


class MonthlyCategoryBudgetViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyCategoryBudgetSerializer

    def get_queryset(self):
        qs = (
            MonthlyCategoryBudget.objects.filter(user=self.request.user)
            .select_related("category", "report")
            .order_by("report__year", "report__month", "category__name")
        )
        report_id = self.request.query_params.get("report")
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")
        if report_id:
            qs = qs.filter(report_id=report_id)
        if year:
            qs = qs.filter(report__year=int(year))
        if month:
            qs = qs.filter(report__month=int(month))
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
