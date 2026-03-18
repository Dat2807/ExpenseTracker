from rest_framework import viewsets

from expenses.models import Category, Transaction
from expenses.serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        qs = (
            Transaction.objects.filter(user=self.request.user)
            .select_related("category", "report")
            .order_by("-date", "-id")
        )
        report_id = self.request.query_params.get("report")
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")
        category_id = self.request.query_params.get("category")
        type_filter = self.request.query_params.get("type")  # INCOME | EXPENSE
        if report_id:
            qs = qs.filter(report_id=report_id)
        if year:
            qs = qs.filter(report__year=int(year))
        if month:
            qs = qs.filter(report__month=int(month))
        if category_id:
            qs = qs.filter(category_id=category_id)
        if type_filter and type_filter.upper() in (Category.Type.INCOME, Category.Type.EXPENSE):
            qs = qs.filter(category__type=type_filter.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
