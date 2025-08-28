
import React, { useState } from 'react';
import { PIPELINE_STAGES, SQL_QUERIES, SAMPLE_DATA, KEY_METRICS, ORCHESTRATION_GOVERNANCE, AIRFLOW_DAG_CODE, CLOUDBUILD_YAML_CODE } from './constants';
import type { PipelineStage, Transaction } from './types';
import PipelineStageCard from './components/PipelineStageCard';
import CodeBlock from './components/CodeBlock';
import InteractiveTable from './components/InteractiveTable';
import { DatabaseIcon, ArrowDownIcon, ChartBarIcon, SqlIcon, DashboardIcon, CogIcon, ShieldCheckIcon, CodeBracketIcon, BuildingBlocksIcon, CodeBracketSquareIcon } from './components/IconComponents';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

type View = 'architecture' | 'implementation';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('architecture');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  const revenueByCategory = SAMPLE_DATA.reduce((acc: { [key: string]: number }, item: Transaction) => {
    if (item.type === 'Venta') {
      acc[item.category] = (acc[item.category] || 0) + item.revenue;
    }
    return acc;
  }, {});
  
  const revenueByCategoryData = Object.keys(revenueByCategory).map(category => ({
    name: category,
    ingresos: parseFloat(revenueByCategory[category].toFixed(2))
  }));

  const transactionsByCountry = SAMPLE_DATA.reduce((acc: { [key: string]: number }, item: Transaction) => {
    acc[item.country] = (acc[item.country] || 0) + 1;
    return acc;
  }, {});

  const transactionsByCountryData = Object.keys(transactionsByCountry).map(country => ({
    name: country,
    value: transactionsByCountry[country]
  }));
  
  const sellerPerformance = SAMPLE_DATA.reduce((acc: { [key: string]: { totalRevenue: number, salesCount: number } }, item: Transaction) => {
    if (item.type === 'Venta') {
        if (!acc[item.seller]) {
            acc[item.seller] = { totalRevenue: 0, salesCount: 0 };
        }
        acc[item.seller].totalRevenue += item.revenue;
        acc[item.seller].salesCount += 1;
    }
    return acc;
    }, {});

    const sellerPerformanceData = Object.keys(sellerPerformance).map(seller => ({
        name: seller.split(' ').slice(0, 2).join(' '), // Shorten name for chart
        ingresos: parseFloat(sellerPerformance[seller].totalRevenue.toFixed(2)),
        ventas: sellerPerformance[seller].salesCount
    })).sort((a, b) => b.ingresos - a.ingresos);


  const marginOverTime = SAMPLE_DATA.reduce((acc: { [key: string]: number }, item: Transaction) => {
    const month = item.date.substring(0, 7); // Asumiendo formato YYYY-MM-DD
    acc[month] = (acc[month] || 0) + item.margin;
    return acc;
  }, {});

  const marginOverTimeData = Object.keys(marginOverTime).sort().map(month => ({
    name: month,
    margen: parseFloat(marginOverTime[month].toFixed(2))
  }));

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
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-3"><DashboardIcon />Dashboard de Análisis (Datos Golden)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Ingresos Brutos (sin dto.)</h4>
                        <p className="text-3xl font-bold text-sky-400">{KEY_METRICS.totalGrossRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                     <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Ingresos Netos (con dto.)</h4>
                        <p className="text-3xl font-bold text-green-400">{KEY_METRICS.totalRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Importe Devoluciones</h4>
                        <p className="text-3xl font-bold text-red-400">{KEY_METRICS.totalReturnsAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h4 className="text-slate-400 text-sm font-medium">Margen Total</h4>
                        <p className="text-3xl font-bold text-amber-400">{KEY_METRICS.totalMargin.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h4 className="text-xl font-semibold mb-4 text-slate-200">Ingresos por Categoría</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueByCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => `€${value.toLocaleString('es-ES')}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} formatter={(value: number) => `${value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`} />
                        <Legend />
                        <Bar dataKey="ingresos" fill="#22d3ee" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h4 className="text-xl font-semibold mb-4 text-slate-200">Transacciones por País</h4>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={transactionsByCountryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {transactionsByCountryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                          <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
                   <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
                     <h4 className="text-xl font-semibold mb-4 text-slate-200">Rendimiento por Vendedor</h4>
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={sellerPerformanceData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `€${value/1000}k`} />
                              <YAxis type="category" dataKey="name" stroke="#9ca3af" width={120} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} 
                                formatter={(value: number, name: string) => name === 'ingresos' ? `${value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}` : value}
                              />
                              <Legend />
                              <Bar dataKey="ingresos" fill="#22d3ee" name="Ingresos Totales" />
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
                        <Line type="monotone" dataKey="margen" stroke="#22d3ee" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                  <h4 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2"><ChartBarIcon />Datos de Transacciones (Capa Golden)</h4>
                  <InteractiveTable data={SAMPLE_DATA} />
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