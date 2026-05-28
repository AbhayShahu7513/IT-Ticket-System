# myapp/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver

# ---------- Dynamic dropdown models (Admin editable) ----------
class Company(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class IssueCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


# ---------- Ticket model (stores selected values as strings) ----------
class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Closed', 'Closed'),
    ]

    ticket_no = models.CharField(max_length=20, unique=True, blank=True, editable=False)
    your_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)          # stores the name from Department
    issue_category = models.CharField(max_length=100)      # stores the name from IssueCategory
    issue_description = models.TextField()
    issue_image = models.ImageField(upload_to='ticket_images/', blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    company = models.CharField(max_length=100)             # stores the name from Company
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validate that selected values exist in respective active models"""
        if not Department.objects.filter(name=self.department, is_active=True).exists():
            raise ValidationError({'department': f'Department "{self.department}" does not exist.'})
        if not IssueCategory.objects.filter(name=self.issue_category, is_active=True).exists():
            raise ValidationError({'issue_category': f'Category "{self.issue_category}" does not exist.'})
        if not Company.objects.filter(name=self.company, is_active=True).exists():
            raise ValidationError({'company': f'Company "{self.company}" does not exist.'})

    def save(self, *args, **kwargs):
        self.full_clean()   # run validation before saving
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_no} - {self.your_name}"


# Auto-generate ticket number after creation
@receiver(post_save, sender=Ticket)
def set_ticket_number(sender, instance, created, **kwargs):
    if created and not instance.ticket_no:
        instance.ticket_no = f"TKT-{instance.pk:04d}"
        instance.save(update_fields=['ticket_no'])