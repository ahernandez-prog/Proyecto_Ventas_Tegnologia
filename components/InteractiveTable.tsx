import React from 'react';
import type { Transaction } from '../types';

interface InteractiveTableProps {
  data: Transaction[];
}

const InteractiveTable: React.FC<InteractiveTableProps> = ({ data }) => {
    // Definimos las clases CSS para los puntos de color
    const getMarginIndicatorColor = (margin: number) => {
        if (margin > 100) return 'bg-green-500'; // Margen alto
        if (margin > 0) return 'bg-yellow-400'; // Margen medio
        return 'bg-red-500'; // Margen bajo/negativo
    };

    return (
        <div className="overflow-x-auto relative shadow-md rounded-lg">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-100 uppercase bg-slate-700/50">
                    <tr>
                        <th scope="col" className="py-3 px-6">ID</th>
                        <th scope="col" className="py-3 px-6">Fecha</th>
                        <th scope="col" className="py-3 px-6">Producto</th>
                        <th scope="col" className="py-3 px-6">Cliente</th>
                        <th scope="col" className="py-3 px-6">Vendedor</th>
                        <th scope="col" className="py-3 px-6">Ingresos (€)</th>
                        <th scope="col" className="py-3 px-6">Margen (€)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-4 px-6 font-medium text-slate-100 whitespace-nowrap">{item.id}</td>
                            <td className="py-4 px-6">{item.date}</td>
                            <td className="py-4 px-6">{item.product}</td>
                            <td className="py-4 px-6">{item.customer}</td>
                            <td className="py-4 px-6">{item.seller}</td>
                            <td className="py-4 px-6 text-green-400">{item.revenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getMarginIndicatorColor(item.margin)}`}></div>
                                    {item.margin.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InteractiveTable;