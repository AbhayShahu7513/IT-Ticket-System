# myapp/views.py
from rest_framework.generics import CreateAPIView, RetrieveAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Ticket, Company, Department, IssueCategory
from .serializers import TicketSerializer, CompanySerializer, DepartmentSerializer, IssueCategorySerializer

class TicketCreateView(CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    parser_classes = (MultiPartParser, FormParser)

class TicketDetailView(RetrieveAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    lookup_field = 'pk'

# Dropdown data endpoints
class CompanyListView(ListAPIView):
    queryset = Company.objects.filter(is_active=True)
    serializer_class = CompanySerializer

class DepartmentListView(ListAPIView):
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer

class IssueCategoryListView(ListAPIView):
    queryset = IssueCategory.objects.filter(is_active=True)
    serializer_class = IssueCategorySerializer