
export interface PipelineStage {
  title: string;
  description: string;
  tasks: string[];
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  customer: string;
  seller: string;
  product: string;
  category: string;
  revenue: number; // Ingresos Netos (con descuento)
  grossRevenue: number; // Ingresos Brutos (sin descuento)
  margin: number;
  type: 'Venta' | 'Devolución';
  country: string;
}
