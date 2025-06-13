from django.contrib import admin
from .models import *

@admin.register(Bebida)
class BebidaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo_bebida', 'tamaño', 'precio')
    list_filter = ('tipo_bebida', 'tamaño')

@admin.register(Pan)
class PanAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'disponible')
    filter_horizontal = ('ingredientes',)

@admin.register(Tostada)
class TostadaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'pan', 'precio')
    filter_horizontal = ('ingredientes',)

@admin.register(Comida)
class ComidaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'pan')
    filter_horizontal = ('ingredientes',)

@admin.register(Helado)
class HeladoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'sabor', 'tamaño', 'precio')

@admin.register(Combo)
class ComboAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio')
    filter_horizontal = ('bebidas',)

@admin.register(Ingrediente)
class IngredienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'es_alergeno')
    list_filter = ('es_alergeno',)