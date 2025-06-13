from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Orden(models.Model):
    ESTADOS = (
        ('PENDIENTE', 'Pendiente'),
        ('SERVIDO', 'Servido'),
        ('PAGADO', 'Pagado'),
    )
    
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    status = models.CharField(
        max_length=10,
        choices=ESTADOS,
        default='PENDIENTE'
    )
    fecha_creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha_creado']
        verbose_name_plural = "Órdenes"
    
    def actualizar_total(self):
        self.total = sum(
            item.precio * item.cantidad 
            for item in self.productos.all()
        )
        self.save()
    
    def __str__(self):
        return f"Orden #{self.id} - ${self.total} ({self.get_status_display()})"

class Comensal(models.Model):
    comensal_id = models.AutoField(primary_key=True)
    orden = models.ForeignKey(
        Orden,
        on_delete=models.CASCADE,
        related_name='comensales'
    )
    nombre = models.CharField(max_length=100)

    @property
    def subtotal(self):
        total = Decimal('0.00')
        
        # Productos donde este comensal es el único
        productos_individuales = self.productos_individuales.all()
        for producto in productos_individuales:
            total += producto.precio * producto.cantidad
        
        # Productos compartidos (donde aparece en la relación ManyToMany)
        productos_compartidos = ProductoEnOrden.objects.filter(comensales=self)
        for producto in productos_compartidos:
            # Divide el costo proporcionalmente entre los comensales
            num_comensales = producto.comensales.count()
            if num_comensales > 0:
                total += (producto.precio * producto.cantidad) / num_comensales
        
        return total.quantize(Decimal('0.00'))
    
    def __str__(self):
        return f"{self.nombre} (Orden #{self.orden.id})"

class ProductoEnOrden(models.Model):
    EXTRAS_CHOICES = (
        ('QUESO', 'Queso extra'),
        ('AGUACATE', 'Aguacate extra'),
        ('JALAPENOS', 'Jalapeños'),
        ('SIN_GLUTEN', 'Sin gluten'),
    )
    
    orden = models.ForeignKey(
        Orden,
        on_delete=models.CASCADE,
        related_name='productos'
    )
    comensales = models.ManyToManyField(
        Comensal,
        related_name='productos_pedidos'
    )
    nombre = models.CharField(max_length=100)
    cantidad = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    extras = models.CharField(
        max_length=100,
        blank=True,
        help_text="Extras separados por comas"
    )
    
    @property
    def subtotal(self):
        return self.precio * self.cantidad / self.comensales.count() if self.comensales.count() > 0 else self.precio * self.cantidad
    
    def get_extras_display(self):
        return [extra.strip() for extra in self.extras.split(',')] if self.extras else []
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.orden.actualizar_total()
    
    def __str__(self):
        extras = f" con {self.extras}" if self.extras else ""
        return f"{self.cantidad}x {self.nombre}{extras} - ${self.subtotal}"