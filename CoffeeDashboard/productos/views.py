from django.shortcuts import render
from .models import Bebida, Pan, Tostada, Comida, Helado, Combo, Ingrediente

# Create your views here.
def index(request):
    template_data = {}
    template_data['title'] = 'Productos'
    template_data['bebidas'] = Bebida.objects.all()
    template_data['pans'] = Pan.objects.all()
    template_data['tostadas'] = Tostada.objects.all()
    template_data['comidas'] = Comida.objects.all()
    template_data['helados'] = Helado.objects.all()
    template_data['combos'] = Combo.objects.all()
    template_data['ingredientes'] = Ingrediente.objects.all()
    return render(request, 'productos/index.html', {'template_data': template_data})