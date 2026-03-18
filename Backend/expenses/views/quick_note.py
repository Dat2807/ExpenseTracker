from rest_framework import viewsets

from expenses.models import QuickNote
from expenses.serializers import QuickNoteSerializer


class QuickNoteViewSet(viewsets.ModelViewSet):
    serializer_class = QuickNoteSerializer

    def get_queryset(self):
        return QuickNote.objects.filter(user=self.request.user).order_by("-is_favorite", "-updated_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
