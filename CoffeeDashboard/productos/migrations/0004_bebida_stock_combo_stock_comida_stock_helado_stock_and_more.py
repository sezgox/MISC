# Generated by Django 5.1.5 on 2025-06-05 21:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('productos', '0003_remove_tostada_tipo_tostada'),
    ]

    operations = [
        migrations.AddField(
            model_name='bebida',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='combo',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='comida',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='helado',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='tostada',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
