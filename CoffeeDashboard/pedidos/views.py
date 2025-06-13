from venv import logger
from django.shortcuts import redirect, render
from .models import Orden, Comensal, ProductoEnOrden

# Create your views here.
def index(request):
    if request.method == 'POST':
        orden = Orden.objects.create()
        print(f"Orden creada - ID: {orden.id}")  # Esto aparecerá en la consola
        return redirect('pedidos.index')
    else:
        template_data = {}
        template_data['title'] = 'Pedidos Pendientes'
        template_data['ordenes'] = Orden.objects.exclude(status='PAGADO').order_by('-fecha_creado')
        template_data['productos'] = ProductoEnOrden.objects.exclude(orden__status='PAGADO').order_by('-orden__fecha_creado')
        print(f"Ordenes encontradas: {template_data['ordenes'][0]}")
        return render(request, 'pedidos/index.html', {'template_data': template_data})
    
def comensal(request, orden_id, comensal_id=None):
    if request.method == 'POST' and request.POST.get('action') == 'add':
        comensal = Comensal.objects.create(orden_id=orden_id)
        print(f"Comensal agregado - ID: {comensal.comensal_id}")  # Esto aparecerá en la consola
        return redirect('pedidos.index')
    elif request.method == 'POST' and request.POST.get('action') == 'delete':
        comensal = Comensal.objects.get(comensal_id=comensal_id)
        comensal.delete()

        print(f"Comensal eliminado - ID: {comensal.comensal_id}")  # Esto aparecerá en la consola
        return redirect('pedidos.index')
    else:
        return redirect('pedidos.index')

def producto(request, orden_id, comensal_id=None):
    if request.method == 'POST' and request.POST.get('action') == 'add':