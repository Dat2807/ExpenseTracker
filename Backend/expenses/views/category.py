from rest_framework import viewsets

from expenses.models import Category
from expenses.serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        qs = Category.objects.filter(user=self.request.user).order_by("type", "name")
        type_filter = self.request.query_params.get("type")
        if type_filter and type_filter.upper() in (Category.Type.INCOME, Category.Type.EXPENSE):
            qs = qs.filter(type=type_filter.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
