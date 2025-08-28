import type { PipelineStage, Transaction } from './types';

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    title: 'Capa Bronze: Ingesta de Datos Crudos',
    description: 'Contiene los datos sin procesar, tal como llegan de la fuente. Se realiza la ingesta de datos históricos y diarios de ventas de tecnología (teléfonos, ordenadores, accesorios). El DAG está parametrizado para procesar fechas específicas.',
    color: 'border-amber-500',
    tasks: [
      'Ingesta de datos históricos y diarios desde GCS.',
      'Lectura de archivos CSV (ventas, devoluciones, maestros).',
      'Parametrización del DAG para ejecuciones por fecha.',
      'Almacenamiento de los datos brutos en BigQuery sin transformaciones mayores.'
    ]
  },
  {
    title: 'Capa Silver: Datos Limpios y Procesados en BigQuery',
    description: 'En esta capa se guardan los datos transformados y procesados. Es crucial limpiar errores, decidir qué columnas conservar y verificar que no se pierdan registros de ventas y devoluciones en el proceso.',
    color: 'border-slate-400',
    tasks: [
      'Filtrado para insertar solo ventas "Completadas" y devoluciones "Procesadas".',
      'Limpieza de errores: eliminación de duplicados y registros inconsistentes.',
      'Validación para asegurar que no se pierdan registros entre Bronze y Silver.',
      'Carga de los datos limpios en tablas estructuradas en BigQuery.'
    ]
  },
  {
    title: 'Capa Golden: Modelo Consolidado para Visualización',
    description: 'Se crea una única tabla con la información más relevante para el negocio, uniendo las tablas de la capa Silver. Esta tabla final es la que se utilizará para alimentar los dashboards y herramientas de BI.',
    color: 'border-yellow-400',
    tasks: [
      'Comprobación de registros duplicados en la tabla Golden antes de la inserción.',
      'Creación de la tabla final mediante JOINs de las tablas de la capa Silver.',
      'Verificación final para asegurar que no haya pérdida de registros desde Silver.',
      'La tabla Golden está lista para el análisis y la visualización.'
    ]
  }
];

export const ORCHESTRATION_GOVERNANCE = [
    {
        title: 'Orquestación con Airflow (Cloud Composer)',
        description: 'El pipeline se orquesta como un DAG en Airflow, permitiendo paralelizar tareas para que el flujo no sea lineal y optimizar tiempos. Se utilizan diversos operadores, no solo PythonOperator, para tareas específicas. Al finalizar la actualización de la capa Golden con éxito, una tarea final envía una notificación por correo electrónico a la dirección de Paula, informando la fecha, hora y el nombre de la responsable (Ana Belén).'
    },
    {
        title: 'Gobernanza y Calidad del Dato',
        description: 'Se establecen métricas y chequeos de calidad en cada etapa del pipeline. Las tablas en BigQuery son creadas manualmente mediante DDL para asegurar una estructura definida y controlada, evitando que el código del DAG las modifique. Esto garantiza la integridad y consistencia de los datos a lo largo del tiempo.'
    },
    {
        title: 'Optimización de Costes con Particionamiento',
        description: 'Para ahorrar costes y mejorar la velocidad de las consultas, las tablas más grandes (como las de la capa Silver) se particionan por fecha. Esto significa que BigQuery solo escanea los datos del día o rango de fechas solicitado, en lugar de la tabla completa, reduciendo drásticamente la cantidad de datos procesados y, por tanto, el coste de las operaciones.'
    }
];

export const SQL_QUERIES = {
  silver_ddl: `-- DDL para crear la tabla Silver de ventas, particionada por día.
-- Esto se ejecuta una sola vez manualmente para definir la estructura.
CREATE TABLE \`project.dataset.silver_sales\` (
  transaction_id STRING,
  sale_date DATE,
  customer_id STRING,
  product_id STRING,
  seller_id STRING,
  quantity INT64,
  unit_price FLOAT64,
  discount FLOAT64,
  status STRING
)
PARTITION BY
  sale_date;
`,
  silver: `-- DML para la carga diaria de ventas a la capa Silver.
-- El particionamiento hace que este INSERT sea eficiente.
INSERT INTO \`project.dataset.silver_sales\` (transaction_id, sale_date, customer_id, product_id, seller_id, quantity, unit_price, discount, status)
SELECT
  id,
  CAST(date AS DATE),
  customer_id,
  product_id,
  seller_id,
  quantity,
  price,
  discount,
  status
FROM
  \`project.dataset.bronze_sales_raw\`
WHERE
  status = 'Completada'
  AND id NOT IN (SELECT transaction_id FROM \`project.dataset.silver_sales\`);
`,
  gold: `-- Construcción de la tabla Golden uniendo tablas de Silver.
-- Las consultas a silver_sales se beneficiarán del particionamiento si se filtra por fecha.
SELECT
  s.transaction_id,
  s.sale_date,
  c.full_name AS customer_name,
  p.product_name,
  cat.category_name,
  v.full_name AS seller_name,
  c.country,
  s.quantity,
  s.unit_price,
  s.discount,
  (s.quantity * s.unit_price) AS gross_revenue,
  (s.quantity * s.unit_price - s.discount) AS net_revenue,
  -- Lógica de cálculo de margen
  (s.quantity * s.unit_price - s.discount) - (p.product_cost * s.quantity) AS margin,
  CASE WHEN r.transaction_id IS NOT NULL THEN 'Devolución' ELSE 'Venta' END AS transaction_type
FROM
  \`project.dataset.silver_sales\` s
INNER JOIN \`project.dataset.silver_customers\` c ON s.customer_id = c.customer_id
INNER JOIN \`project.dataset.silver_products\` p ON s.product_id = p.product_id
INNER JOIN \`project.dataset.silver_sellers\` v ON s.seller_id = v.seller_id
LEFT JOIN \`project.dataset.silver_categories\` cat ON p.category_id = cat.category_id
LEFT JOIN \`project.dataset.silver_returns\` r ON s.transaction_id = r.original_transaction_id;
`
};

export const AIRFLOW_DAG_CODE = `import pendulum
from airflow.models.dag import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.email import EmailOperator
from airflow.operators.dummy import DummyOperator
from datetime import datetime
import pandas as pd
from google.cloud import bigquery
import os

# --- VARIABLES DE CONFIGURACIÓN PERSONALIZADAS ---
PROJECT_ID = 'ardent-quarter-454807-h6'
BUCKET_NAME = 'composer-bucket-west2'
DATASET_NAME = 'Datos_tecnologia_ab'
GOLDEN_DATASET = 'Datos_tecnologia_ab_golden'

# --- FUNCIONES DE TAREAS ETL ---

def _ingesta_y_limpieza_ventas_bronze(**kwargs):
    """Lee, limpia y filtra los datos de ventas para la capa Bronze."""
    # ... Lógica de la tarea ...
    pass

def _ingesta_y_limpieza_devoluciones_bronze(**kwargs):
    """Lee, limpia y filtra los datos de devoluciones para la capa Bronze."""
    # ... Lógica de la tarea ...
    pass

def _limpiar_y_cargar_maestras_silver(**kwargs):
    """Lee, limpia y carga las tablas maestras a la capa Silver."""
    # ... Lógica de la tarea ...
    pass

def _unificar_datos_golden(**kwargs):
    """Realiza los JOINs y la lógica de negocio para crear la tabla Golden."""
    # ... Lógica de la tarea ...
    pass

# --- DEFINICIÓN DEL DAG EN AIRFLOW ---
with DAG(
    dag_id='tecnologia_ab_dag_v1',
    start_date=pendulum.datetime(2025, 1, 1, tz="UTC"),
    schedule_interval='@daily',
    catchup=False,
    tags=['tecnologia', 'ab', 'golden'],
) as dag:
    
    start = DummyOperator(task_id='start')

    ingesta_ventas = PythonOperator(
        task_id='ingesta_limpieza_ventas_bronze',
        python_callable=_ingesta_y_limpieza_ventas_bronze,
    )
    
    ingesta_devoluciones = PythonOperator(
        task_id='ingesta_limpieza_devoluciones_bronze',
        python_callable=_ingesta_y_limpieza_devoluciones_bronze,
    )
    
    limpiar_cargar_maestras = PythonOperator(
        task_id='limpiar_y_cargar_maestras_silver',
        python_callable=_limpiar_y_cargar_maestras_silver,
    )

    unificar_golden = PythonOperator(
        task_id='unificar_datos_golden',
        python_callable=_unificar_datos_golden,
    )

    enviar_notificacion = EmailOperator(
        task_id='enviar_notificacion',
        to='p.cabrera@cloudanddelivery.es',
        subject='[AVISO] Pipeline de Datos de Tecnología Completado',
        html_content=f"""
            <h3>¡Proceso completado con éxito!</h3>
            <p>Se han insertado nuevos datos en la tabla Golden.</p>
            <p><b>Fecha de ejecución:</b> {datetime.now().strftime("%Y-%m-%d")}</p>
            <p><b>Hora de finalización:</b> {datetime.now().strftime("%H:%M:%S")}</p>
            <p><b>Responsable:</b> Ana Belén</p>
        """
    )

    # Definición del flujo con paralelización
    start >> [ingesta_ventas, ingesta_devoluciones, limpiar_cargar_maestras]
    [ingesta_ventas, ingesta_devoluciones, limpiar_cargar_maestras] >> unificar_golden
    unificar_golden >> enviar_notificacion
`;

export const CLOUDBUILD_YAML_CODE = `steps:
- name: 'gcr.io/cloud-builders/gsutil'
  args:
  - '-m'
  - 'rsync'
  - '-r'
  - '-c'
  - '-d'
  - '.'
  - 'gs://<your-composer-bucket-name>/dags/ab_tecnologia'
  # Sincroniza el directorio local con la carpeta específica de Ana Belén en el bucket de DAGs.
  # -r: recursivo
  # -c: compara checksums para evitar subir archivos sin cambios
  # -d: elimina archivos en destino que no existen en origen

# Este trigger se conecta al repositorio de GitHub y se ejecuta en cada push a la rama 'main'.
`;


// Helper function to generate random data
const generateRandomData = (): Transaction[] => {
  const customers = ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D'];
  const sellers = ['Ana García', 'Carlos Herreros', 'Marina Sanz', 'Emma Torres'];
  const products = [
    { name: 'Smartphone X1', category: 'Teléfonos', cost: 600, price: 800 },
    { name: 'Laptop Pro', category: 'Ordenadores', cost: 1100, price: 1500 },
    { name: 'Auriculares Z', category: 'Accesorios', cost: 80, price: 150 },
    { name: 'Tablet S', category: 'Tablets', cost: 400, price: 600 },
  ];
  const countries = ['España', 'México', 'Argentina', 'Colombia'];
  const data: Transaction[] = [];

  for (let i = 0; i < 50; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 2) + 1;
    const grossRevenue = product.price * quantity;
    const discount = Math.random() > 0.7 ? grossRevenue * 0.1 : 0;
    const revenue = grossRevenue - discount;
    const margin = revenue - (product.cost * quantity);
    const isReturn = Math.random() > 0.9;
    
    const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    if (isReturn) {
        data.push({
            id: `RET-${i.toString().padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            customer: customers[Math.floor(Math.random() * customers.length)],
            seller: sellers[Math.floor(Math.random() * sellers.length)],
            product: product.name,
            category: product.category,
            revenue: -revenue,
            grossRevenue: -grossRevenue,
            margin: -margin,
            type: 'Devolución',
            country: countries[Math.floor(Math.random() * countries.length)],
        });
    } else {
        data.push({
            id: i.toString().padStart(4, '0'),
            date: date.toISOString().split('T')[0],
            customer: customers[Math.floor(Math.random() * customers.length)],
            seller: sellers[Math.floor(Math.random() * sellers.length)],
            product: product.name,
            category: product.category,
            revenue: revenue,
            grossRevenue: grossRevenue,
            margin: margin,
            type: 'Venta',
            country: countries[Math.floor(Math.random() * countries.length)],
        });
    }
  }
  return data;
};

export const SAMPLE_DATA: Transaction[] = generateRandomData();


// Calculate Key Metrics
const totalGrossRevenue = SAMPLE_DATA.filter(d => d.type === 'Venta').reduce((sum, item) => sum + item.grossRevenue, 0);
const totalRevenue = SAMPLE_DATA.reduce((sum, item) => sum + item.revenue, 0);
const totalReturnsAmount = SAMPLE_DATA.filter(d => d.type === 'Devolución').reduce((sum, item) => sum + item.revenue, 0);
const totalMargin = SAMPLE_DATA.reduce((sum, item) => sum + item.margin, 0);

export const KEY_METRICS = {
  totalGrossRevenue,
  totalRevenue,
  totalReturnsAmount,
  totalMargin,
};