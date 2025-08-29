# Proyecto: Visualizador de Pipeline de Ventas de Tecnología

Este proyecto es una aplicación web interactiva diseñada para visualizar y explicar un pipeline de datos ETL (Extraer, Transformar y Cargar) de extremo a extremo. Utiliza datos de ventas de tecnología como caso de estudio y demuestra la implementación de la **arquitectura Medallion (Bronze, Silver, Gold)**, un estándar en la industria de la ingeniería de datos.

La aplicación está pensada para dos audiencias principales:
1.  **Perfiles de Negocio (Paula):** Para entender el flujo de datos a alto nivel, el valor que aporta cada etapa y explorar los resultados finales en un dashboard interactivo.
2.  **Perfiles Técnicos (Carlos):** Para inspeccionar los detalles de la implementación, incluyendo ejemplos de código para las transformaciones (SQL), la orquestación (Airflow) y el despliegue (Cloud Build).

---

## 🚀 ¡Lanza el Visualizador Ahora!

Haz clic en el siguiente enlace para abrir y ejecutar la aplicación directamente en tu navegador. No requiere instalación.

**[Abrir Visualizador en StackBlitz](https://stackblitz.com/github/ahernandez-prog/Proyecto_Ventas_Tegnologia)**

> **Nota:** ¡Puedes lanzar el visualizador directamente en tu navegador! Si es la primera vez que usas StackBlitz, es posible que te pida iniciar sesión con tu cuenta de GitHub para sincronizar el entorno.

---

## ✨ Características Principales

### 1. Vista Dual (Arquitectura vs. Implementación)
La aplicación permite cambiar entre dos vistas distintas para adaptar la información al perfil del usuario:

- **Vista de Arquitectura:** Un recorrido visual por las capas Bronze, Silver y Gold, explicaciones sobre la gobernanza de datos y un completo dashboard de BI con KPIs y gráficos.
- **Vista de Implementación:** Acceso a los fragmentos de código clave que impulsan el pipeline, incluyendo DDL para la creación de tablas, el DAG de Airflow y el script de CI/CD.

### 2. Dashboard Interactivo
La capa Golden se materializa en un dashboard con:
- **KPIs clave:** Ingresos netos, margen total, importe de devoluciones, etc.
- **Gráficos dinámicos:** Ingresos por categoría, transacciones por país, rendimiento de vendedores y evolución del margen.
- **Tabla de Datos Transaccionales:** Una tabla con todas las transacciones consolidadas, con funcionalidad de búsqueda y filtrado en tiempo real.

### 3. Conceptos de Ingeniería de Datos Visualizados
- **Arquitectura Medallion:** Explicación clara del propósito de las capas Bronze (GCS), Silver (BigQuery) y Gold (BigQuery).
- **Orquestación y Notificación:** Muestra un DAG de Airflow real que incluye tareas paralelizadas y validaciones de calidad de datos.
- **Optimización de Costes:** Explica e ilustra el concepto de **particionamiento de tablas** en BigQuery para mejorar el rendimiento y reducir costes.
- **CI/CD para Datos:** Presenta un ejemplo de `cloudbuild.yaml` para automatizar el despliegue de los DAGs a producción.

---
## 🏛️ Arquitectura del Pipeline

Este proyecto implementa una arquitectura Medallion moderna y optimizada en costes:
