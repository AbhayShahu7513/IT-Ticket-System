# myapp/urls.py
from django.urls import path
from .views import (
    TicketCreateView, TicketDetailView,
    CompanyListView, DepartmentListView, IssueCategoryListView
)

urlpatterns = [
    path('tickets/create/', TicketCreateView.as_view(), name='ticket-create'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    
    # Dynamic dropdown endpoints
    path('companies/', CompanyListView.as_view(), name='company-list'),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('categories/', IssueCategoryListView.as_view(), name='category-list'),
]