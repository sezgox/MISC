from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path('', views.index, name='pedidos.index'),
    path('<int:orden_id>/comensal/', views.comensal, name='pedidos.comensal'),
    path('<int:orden_id>/comensal/<int:comensal_id>/', views.comensal, name='pedidos.comensal.action'),
    path('<int:orden_id>/compartido/', views.comensal, name='pedidos.compartido'),

]

