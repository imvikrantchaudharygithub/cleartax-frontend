'use client';

import { Edit, Trash2, IndianRupee } from 'lucide-react';
import { Service } from '@/app/types/services';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 p-2 bg-primary/20 rounded-lg">
          <service.icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="font-semibold text-white mb-1 break-words line-clamp-2">{service.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{service.shortDescription}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-300">
            <IndianRupee className="w-4 h-4" />
            <span>
              {service.price.min.toLocaleString()} - {service.price.max.toLocaleString()}
            </span>
          </div>
          <span className="text-gray-400">{service.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(service)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

