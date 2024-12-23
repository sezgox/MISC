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
