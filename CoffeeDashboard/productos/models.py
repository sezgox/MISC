from django.db import models

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    imagen = models.ImageField(upload_to='productos/')
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    disponible = models.BooleanField(default=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"

class Bebida(Producto):
    TAMANOS = [
        ('TAZA', 'Taza'),
        ('LATA', 'Lata 33cl'),
        ('BOTELLA', 'Botella 50cl'),
    ]
    TIPOS = [
        ('CAFE', 'Café'),
        ('REFRESCO', 'Refresco'),
        ('AGUA', 'Agua'),
    ]
    
    tamaño = models.CharField(max_length=10, choices=TAMANOS)
    tipo_bebida = models.CharField(max_length=10, choices=TIPOS)
    stock = models.PositiveIntegerField(default=0)


class Pan(Producto):
    ingredientes = models.ManyToManyField('Ingrediente')
    stock = models.PositiveIntegerField(default=0)

    def disponible(self):
        return self.stock > 0

class Ingrediente(models.Model):
    nombre = models.CharField(max_length=50)
    es_alergeno = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre

class Tostada(Producto):
    ingredientes = models.ManyToManyField(Ingrediente)
    pan = models.BooleanField(default=True)

class Comida(Producto):
    ingredientes = models.ManyToManyField(Ingrediente)
    pan = models.BooleanField(default=False)

class Helado(Producto):
    SABORES = [
        ('VAINILLA', 'Vainilla'),
        ('CHOCOLATE', 'Chocolate'),
        ('FRESA', 'Fresa'),
    ]
    TAMANOS = [
        ('PEQUE', 'Taza pequeña'),
        ('GRANDE', 'Taza grande'),
        ('CONO', 'Cono'),
    ]
    
    sabor = models.CharField(max_length=10, choices=SABORES)
    tamaño = models.CharField(max_length=10, choices=TAMANOS)

class Combo(Producto):
    bebidas = models.ManyToManyField(Bebida)
    comida = models.ForeignKey(Comida, on_delete=models.SET_NULL, null=True, blank=True)
    tostada = models.ForeignKey(Tostada, on_delete=models.SET_NULL, null=True, blank=True)
    helado = models.ForeignKey(Helado, on_delete=models.SET_NULL, null=True, blank=True)
