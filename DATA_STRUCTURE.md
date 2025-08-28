# Estructura de los Ficheros CSV (Capa Bronze)

Basado en la lógica del pipeline, el código de transformación SQL y las descripciones del proyecto, esta es la estructura deducida de los ficheros CSV que actúan como fuente de datos en la capa Bronze.

## 1. Tablas Maestras (Master Data)

Estos ficheros contienen datos dimensionales que no suelen cambiar con frecuencia.

### `datos_master_clientes.csv`
Contiene la información de los clientes.

| Columna | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `customer_id` | String | Identificador único del cliente. | `CUST-001` |
| `full_name` | String | Nombre completo del cliente. | `Cliente A` |
| `country` | String | País de residencia del cliente. | `España` |
| `phone` | String | Número de teléfono (puede tener prefijos como `+34`). | `+34-123456789` |

### `datos_master_vendedores.csv`
Contiene la información de los vendedores.

| Columna | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `seller_id` | String | Identificador único del vendedor. | `SELL-01` |
| `full_name` | String | Nombre completo del vendedor. | `Ana García` |

### `datos_master_productos.csv`
Catálogo de productos.

| Columna | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `product_id` | String | Identificador único del producto. | `PROD-101` |
| `product_name` | String | Nombre del producto. | `Smartphone X1` |
| `product_cost` | Number | Coste de adquisición del producto para la empresa. | `600` |
| `category_id` | String | FK que referencia a la tabla de categorías. | `CAT-01` |

### `datos_master_categorias.csv`
Catálogo de categorías de productos.

| Columna | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `category_id` | String | Identificador único de la categoría. | `CAT-01` |
| `category_name`| String | Nombre de la categoría. | `Teléfonos` |

## 2. Tablas Transaccionales (Transactional Data)

Estos ficheros contienen los datos de las operaciones diarias. Se generan ficheros nuevos para cada día.

### `datos_YYYY_MM_DD_ventas_bronze.csv`
Datos crudos de las ventas diarias.

| Columna | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `id` | String | Identificador único de la transacción de venta. | `a1b2c3d4` |
| `date` | String | Fecha de la venta en formato `YYYY-MM-DD`. | `2024-05-01` |
| `customer_id` | String | FK que referencia al cliente. | `CUST-001` |
| `product_id` | String | FK que referencia al producto. | `PROD-101` |
| `seller_id` | String | FK que referencia al vendedor. | `SELL-01` |
| `quantity` | Integer | Número de unidades vendidas. | `1` |
| `price` | Number | Precio unitario del producto (precio de lista). | `800` |
| `discount` | Number | Descuento aplicado sobre el total. | `50` |
| `status` | String | Estado de la venta. Se filtra por `Completada`. | `Completada` |

### `datos_YYYY_MM_DD_devoluciones_bronze.csv`
Datos crudos de las devoluciones diarias.

| Columna | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `return_id` | String | Identificador único de la devolución. | `RET-a1b2c3d4` |
| `original_transaction_id` | String | ID de la venta original que se está devolviendo. | `a1b2c3d4` |
| `return_date` | String | Fecha de la devolución. | `2024-05-15` |
| `reason` | String | Motivo de la devolución. | `Producto defectuoso` |
| `status` | String | Estado de la devolución. Se filtra por `Procesada`. | `Procesada` |
