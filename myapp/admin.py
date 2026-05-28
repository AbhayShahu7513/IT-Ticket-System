# myapp/admin.py
from django.contrib import admin
from .models import Ticket, Company, Department, IssueCategory

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name',)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name',)

@admin.register(IssueCategory)
class IssueCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name',)

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_no', 'your_name', 'company', 'department', 'priority', 'status', 'created_at')
    list_filter = ('priority', 'status', 'company', 'department')
    search_fields = ('ticket_no', 'your_name')