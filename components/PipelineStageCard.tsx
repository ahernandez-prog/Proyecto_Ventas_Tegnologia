
import React from 'react';
import type { PipelineStage } from '../types';
import { CheckCircleIcon } from './IconComponents';

type PipelineStageCardProps = Omit<PipelineStage, 'tasks'> & { tasks: string[] };

const PipelineStageCard: React.FC<PipelineStageCardProps> = ({ title, description, tasks, color }) => {
  return (
    <div className={`w-full max-w-3xl bg-slate-800/50 rounded-lg border-l-4 ${color} p-6 shadow-lg transition-all duration-300 hover:shadow-cyan-500/10 hover:bg-slate-800`}>
      <h3 className="text-2xl font-bold mb-2 text-slate-100">{title}</h3>
      <p className="text-slate-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {tasks.map((task, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
            <span className="text-slate-300">{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PipelineStageCard;
