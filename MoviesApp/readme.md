# MoviesApp
*EN DESARROLLO*
## Descripción
MoviesApp es una aplicación para la gestión de las películas que has visto usando una API externa: https://developer.themoviedb.org/ para el acceso a una base de datos amplia de peliculas

## BACKEND
## Requisitos Previos
- **Node.js** (versión 20 o superior)
- **Docker** y **Docker Compose**
- **Git**

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/sezgox/MISC.git
cd MoviesApp/PELIS_BACK
```
### 2. Instalar las dependencias
```bash
npm install
```
### 3. Ejecutar el contenedor de la base de datos
Para ejecutar el contenedor de la base de datos, utiliza Docker Compose. Puedes ejecutar el siguiente comando:

```bash
docker-compose up -d
```
### 4. Levantar el backend
Para iniciar el backend, ejecuta el siguiente comando:

```bash
npm run dev
```
Si deseas modificar el código y quieres que los cambios se reflejen automáticamente, puedes utilizar el siguiente comando para ver los cambios en tiempo real:
```bash
npm run typescript
```
## Endpoints

### USERS
- **POST** `http://localhost:3005/auth`  
  Recibe `username` y `password` como parámetros para registrar un nuevo usuario.

- **POST** `http://localhost:3005/auth/login`  
  Requiere los mismos parámetros (`username` y `password`) para iniciar sesión.

### MOVIES

### Obtener todas las películas
- **GET** `http://localhost:3005/movies`  
  Obtiene una lista de todas las películas.

### Buscar una película
- **GET** `http://localhost:3005/movies/search`  
  Permite buscar películas basadas en criterios específicos. Los parámetros de búsqueda pueden incluir títulos, géneros, etc.

### Obtener película por ID
- **GET** `http://localhost:3005/movies/movie/:id`  
  Obtiene los detalles de una película específica utilizando su `id`. 

### Obtener géneros de películas
- **GET** `http://localhost:3005/movies/genres`  
  Recupera la lista de géneros disponibles para las películas.

### Obtener lista de películas vistas
- **GET** `http://localhost:3005/movies/watched/:username`  
  Obtiene la lista de películas que un usuario específico ha visto.

### Añadir película a la lista de vistas
- **PUT** `http://localhost:3005/movies/watched/:username`  
  Agrega una película a la lista de vistas del usuario especificado. Se espera que el cuerpo de la solicitud contenga los detalles de la película.

### Eliminar película de la lista de vistas
- **DELETE** `http://localhost:3005/movies/watched/:username/:mid`  
  Elimina una película específica de la lista de vistas del usuario, utilizando su nombre de usuario (`username`) y el `mid` (id de la película).




## FRONTEND
## Requisitos Previos
- **Angular** (versión 17 o superior)
  
Para instalar las dependencias del frontend y levantar la aplicación, ejecuta los siguientes comandos:

```bash
cd MoviesApp/PELIS_FRONT
npm install
ng serve
```
Luego, abre tu navegador y dirígete a http://localhost:4200 para acceder a la aplicación.
