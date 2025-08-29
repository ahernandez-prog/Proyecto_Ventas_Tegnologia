import React, { useState, useEffect, useMemo } from 'react';
import { PIPELINE_STAGES, SQL_QUERIES, SAMPLE_DATA, ORCHESTRATION_GOVERNANCE, AIRFLOW_DAG_CODE, CLOUDBUILD_YAML_CODE } from './constants';
import type { PipelineStage, Transaction } from './types';
import PipelineStageCard from './components/PipelineStageCard';
import CodeBlock from './components/CodeBlock';
import InteractiveTable from './components/InteractiveTable';
import { DatabaseIcon, ArrowDownIcon, ChartBarIcon, SqlIcon, DashboardIcon, CogIcon, ShieldCheckIcon, CodeBracketIcon, BuildingBlocksIcon, CodeBracketSquareIcon } from './components/IconComponents';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

type View = 'architecture' | 'implementation';

// He movido la lógica de negocio a un custom hook o funciones para mayor claridad.
const useFilteredData = () => {
  const [data, setData] = useState<Transaction[]>([]);

  useEffect(() => {
    // Filtramos los datos una sola vez al cargar el componente para optimizar
    const filtered = SAMPLE_DATA.filter(item => item.country === 'España');
    setData(filtered);
  }, []);

  // Usamos useMemo para memorizar los cálculos y evitar recálculos innecesarios
  const calculatedData = useMemo(() => {
    // KPIs de Rentabilidad
    const totalSales = data.filter(item => item.type === 'Venta');
    const totalReturns = data.filter(item => item.type === 'Devolución');
    const netRevenue = totalSales.reduce((sum, item) => sum + item.revenue, 0);
    const totalMargin = totalSales.reduce((sum, item) => sum + item.margin, 0);
    const avgMarginPercentage = netRevenue > 0 ? (totalMargin / netRevenue) * 100 : 0;
    const returnRate = totalSales.length > 0 ? (totalReturns.length / totalSales.length) * 100 : 0;

    // Gráfico de Contribución al Margen por Categoría
    const marginByCategory = totalSales.reduce((acc: { [key: string]: number }, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.margin;
      return acc;
    }, {});
    const marginByCategoryData = Object.keys(marginByCategory).map(category => ({
      name: category,
      margen: parseFloat(marginByCategory[category].toFixed(2))
    }));

    // Gráfico de Top 5 Vendedores por Margen de Ganancia
    const sellerPerformance = totalSales.reduce((acc: { [key: string]: number }, item) => {
      acc[item.seller] = (acc[item.seller] || 0) + item.margin;
      return acc;
    }, {});
    const top5SellersByMargin = Object.entries(sellerPerformance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([seller, margin]) => ({
        name: seller.split(' ').slice(0, 2).join(' '),
        margen: parseFloat(margin.toFixed(2))
      }));
      
    // Gráfico de Top 5 Clientes por Margen de Ganancia
    const customerPerformance = totalSales.reduce((acc: { [key: string]: number }, item) => {
        acc[item.customer] = (acc[item.customer] || 0) + item.margin;
        return acc;
    }, {});
    const top5CustomersByMargin = Object.entries(customerPerformance)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([customer, margin]) => ({
            name: customer,
            margen: parseFloat(margin.toFixed(2))
        }));

    // Gráfico de Ventas por Ciudad (España)
    const salesByCity = totalSales.reduce((acc: { [key: string]: number }, item) => {
        if (item.city) {
            acc[item.city] = (acc[item.city] || 0) + 1;
        }
        return acc;
    }, {});

    const salesByCityData = Object.keys(salesByCity).map(city => ({
        name: city,
        value: salesByCity[city]
    }));
      
    // Gráfico de Evolución del Margen Mensual (para datos de España)
    const marginOverTime = totalSales.reduce((acc: { [key: string]: number }, item) => {
        const month = item.date.substring(0, 7);
        acc[month] = (acc[month] || 0) + item.margin;
        return acc;
    }, {});
    const marginOverTimeData = Object.keys(marginOverTime).sort().map(month => ({
        name: month,
        margen: parseFloat(marginOverTime[month].toFixed(2))
    }));

    return {
      netRevenue,
      totalMargin,
      avgMarginPercentage,
      returnRate,
      marginByCategoryData,
      top5SellersByMargin,
      top5CustomersByMargin,
      salesByCityData,
      marginOverTimeData,
    };
  }, [data]);
  
  return { ...calculatedData, filteredData: data };
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('architecture');
  const { 
    filteredData,
    netRevenue,
    totalMargin,
    avgMarginPercentage,
    returnRate,
    marginByCategoryData,
    top5SellersByMargin,
    top5CustomersByMargin,
    salesByCityData,
    marginOverTimeData,
  } = useFilteredData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6384', '#36A2EB'];
  const PIE_COLORS = ['#60a5fa', '#34d399', '#facc15', '#fb923c', '#c084fc', '#f472b6', '#a5f3fc'];

  const ViewSwitcher = () => (
    <div className="mb-10 flex justify-center border-b border-slate-700">
      <button 
        onClick={() => setActiveView('architecture')}
        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${activeView === 'architecture' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
      >
        <BuildingBlocksIcon className="w-5 h-5" />
        Vista de Arquitectura (Paula)
      </button>
      <button 
        onClick={() => setActiveView('implementation')}
        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${activeView === 'implementation' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
      >
        <CodeBracketSquareIcon className="w-5 h-5" />
        Vista de Implementación (Carlos)
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
            Ventas de Tecnología
          </h1>
          <p className="text-lg text-slate-400">
            Visualizador Interactivo de Pipeline de Datos
          </p>
        </header>

        <main>
          <ViewSwitcher />

          {activeView === 'architecture' && (
            <>
              {/* Pipeline Flow Section */}
              <section id="pipeline-flow" className="mb-16">
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-3"><DatabaseIcon />Flujo del Pipeline</h2>
                <div className="relative flex flex-col items-center gap-8">
                  {PIPELINE_STAGES.map((stage: PipelineStage, index: number) => (
                    <React.Fragment key={stage.title}>
                      <PipelineStageCard 
                        title={stage.title}
                        description={stage.description}
                        tasks={stage.tasks}
                        color={stage.color}
                      />
                      {index < PIPELINE_STAGES.length - 1 && (
                        <ArrowDownIcon className="text-slate-600 w-8 h-8 my-2" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </section>

              {/* Orchestration & Governance Section */}
              <section id="orchestration-governance" className="mb-16">
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-3"><CogIcon />Orquestación y Gobernanza</h2>
                <div className="space-y-8">
                    {ORCHESTRATION_GOVERNANCE.map(item => (
                        <div key={item.title} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2 mb-3"><ShieldCheckIcon />{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
              </section>

              {/* Dashboard Section */}
              <section id="dashboard">
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-3"><DashboardIcon />Dashboard de Rentabilidad (Datos de España)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Ingresos Netos (Ventas)</h4>
                        <p className="text-3xl font-bold text-green-400">{netRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                     <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Margen Total (Ventas)</h4>
                        <p className="text-3xl font-bold text-amber-400">{totalMargin.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Margen Promedio (%)</h4>
                        <p className="text-3xl font-bold text-blue-400">{avgMarginPercentage.toFixed(2)}%</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Tasa de Devolución (%)</h4>
                        <p className="text-3xl font-bold text-red-400">{returnRate.toFixed(2)}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h4 className="text-xl font-semibold mb-4 text-slate-200">Contribución al Margen por Categoría</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={marginByCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => `€${value.toLocaleString('es-ES')}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} formatter={(value: number) => `${value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`} />
                        <Legend />
                        <Bar dataKey="margen" fill="#facc15" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h4 className="text-xl font-semibold mb-4 text-slate-200">Ventas por Ciudad (España)</h4>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={salesByCityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {salesByCityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                          <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
                   <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
                     <h4 className="text-xl font-semibold mb-4 text-slate-200">Top 5 Vendedores por Margen de Ganancia</h4>
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={top5SellersByMargin} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `€${value/1000}k`} />
                              <YAxis type="category" dataKey="name" stroke="#9ca3af" width={120} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} 
                                formatter={(value: number) => `${value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`}
                              />
                              <Legend />
                              <Bar dataKey="margen" fill="#22d3ee" name="Margen Total" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
                     <h4 className="text-xl font-semibold mb-4 text-slate-200">Top 5 Clientes por Margen de Ganancia</h4>
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={top5CustomersByMargin} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `€${value/1000}k`} />
                              <YAxis type="category" dataKey="name" stroke="#9ca3af" width={120} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} 
                                formatter={(value: number) => `${value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`}
                              />
                              <Legend />
                              <Bar dataKey="margen" fill="#4ade80" name="Margen Total" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                   <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
                    <h4 className="text-xl font-semibold mb-4 text-slate-200">Evolución del Margen Mensual</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={marginOverTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => `€${value.toLocaleString('es-ES')}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} formatter={(value: number) => `${value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`} />
                        <Legend />
                        <Line type="monotone" dataKey="margen" stroke="#facc15" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                  <h4 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2"><ChartBarIcon />Datos de Transacciones (Capa Golden)</h4>
                  <InteractiveTable data={filteredData} />
                </div>
              </section>
            </>
          )}

          {activeView === 'implementation' && (
            <>
              {/* SQL Examples Section */}
              <section id="sql-examples" className="mb-16">
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-3"><SqlIcon />Lógica de Transformación (Equivalente en SQL)</h2>
                <div className="space-y-10">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-slate-200">DDL: Creación de Tabla Silver Optimizada</h3>
                    <CodeBlock code={SQL_QUERIES.silver_ddl} language="sql" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-slate-200">DML: Carga a Capa Silver</h3>
                    <CodeBlock code={SQL_QUERIES.silver} language="sql" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-slate-200">DML: Consolidación de Negocio en Capa Golden</h3>
                    <CodeBlock code={SQL_QUERIES.gold} language="sql" />
                  </div>
                </div>
              </section>
              
              {/* Orchestration & Deployment Code Section */}
              <section id="code-examples" className="mb-16">
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-3"><CodeBracketIcon />Código de Orquestación y Despliegue</h2>
                <div className="space-y-10">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-slate-200">DAG de Airflow (tecnologia_ab_daily_run)</h3>
                    <CodeBlock code={AIRFLOW_DAG_CODE} language="python" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-slate-200">Despliegue con Cloud Build (cloudbuild.yaml)</h3>
                    <CodeBlock code={CLOUDBUILD_YAML_CODE} language="yaml" />
                  </div>
                </div>
              </section>
            </>
          )}

        </main>

        <footer className="text-center mt-16 text-slate-500 text-sm">
          <p>Construido con React, TypeScript y Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;