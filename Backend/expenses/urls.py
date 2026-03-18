from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, MonthlyCategoryBudgetViewSet, MonthlyReportViewSet, QuickNoteViewSet, TransactionViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("transactions", TransactionViewSet, basename="transaction")
router.register("budgets", MonthlyCategoryBudgetViewSet, basename="budget")
router.register("reports", MonthlyReportViewSet, basename="report")
router.register("quick-notes", QuickNoteViewSet, basename="quicknote")

app_name = "expenses"

urlpatterns = [
    path("", include(router.urls)),
]
