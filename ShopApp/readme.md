# ShopApp
## Descripción
ShopApp es una aplicación para negocios y usarios que quieran vender y comprar respectivamente.

## Requisitos Previos
### Base de datos:
- **Docker** y **Docker Compose**

```bash
cd SHOP_BACK
docker compose up -d
echo "DATABASE_URL='postgresql://klkmanin:S3cret@localhost:5432/ebayCopyDB?schema=public'" >> .env
echo "SECRET_KEY='klkmanito'" >> .env
```
## Pruebas de Pago
Para probar el pago con tarjeta, puede utilizar la siguiente tarjeta de prueba:

- **Número de tarjeta:** 4242 4242 4242 4242
- **CVC:** Cualquier número de 3 dígitos
- **Fecha de expiración:** Cualquier fecha futura

También puede consultar otras tarjetas de prueba en la documentación oficial de Stripe: [Stripe Testing](https://docs.stripe.com/testing?testing-method=card-numbers).
