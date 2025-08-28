
import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';

interface InteractiveTableProps {
  data: Transaction[];
}

const InteractiveTable: React.FC<InteractiveTableProps> = ({ data }) => {
  const [filter, setFilter] = useState('');

  const filteredData = useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    if (!lowercasedFilter) {
      return data;
    }
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [data, filter]);

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filtrar transacciones..."
        className="w-full max-w-xs mb-4 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              <th scope="col" className="px-6 py-3">Cliente</th>
              <th scope="col" className="px-6 py-3">Vendedor</th>
              <th scope="col" className="px-6 py-3">Producto</th>
              <th scope="col" className="px-6 py-3">Categoría</th>
              <th scope="col" className="px-6 py-3">Ingresos Brutos</th>
              <th scope="col" className="px-6 py-3">Ingresos Netos</th>
              <th scope="col" className="px-6 py-3">Margen</th>
              <th scope="col" className="px-6 py-3">Tipo</th>
              <th scope="col" className="px-6 py-3">País</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                <td className="px-6 py-4">{item.date}</td>
                <td className="px-6 py-4 font-medium text-slate-200">{item.customer}</td>
                <td className="px-6 py-4">{item.seller}</td>
                <td className="px-6 py-4">{item.product}</td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4">{item.grossRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td className="px-6 py-4">{item.revenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td className={`px-6 py-4 font-medium ${item.margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>{item.margin.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.type === 'Venta' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">{item.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {filteredData.length === 0 && (
          <p className="text-center py-8 text-slate-500">No se encontraron resultados.</p>
        )}
    </div>
  );
};

export default InteractiveTable;
