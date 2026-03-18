from rest_framework import serializers

from expenses.models import QuickNote


class QuickNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickNote
        fields = ("id", "title", "content", "is_favorite", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
