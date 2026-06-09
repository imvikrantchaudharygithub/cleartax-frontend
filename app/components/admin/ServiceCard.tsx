'use client';

import { Edit, Trash2, IndianRupee, Globe, EyeOff } from 'lucide-react';
import { Service } from '@/app/types/services';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onPublish?: (service: Service) => void;
  onUnpublish?: (service: Service) => void;
}

export default function ServiceCard({ service, onEdit, onDelete, onPublish, onUnpublish }: ServiceCardProps) {
  const isDraft = service.status === 'draft';

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border transition-colors hover:border-gray-600 ${
        isDraft ? 'border-amber-500/50' : 'border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 p-2 bg-primary/20 rounded-lg">
          <service.icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-white break-words line-clamp-2">{service.title}</h3>
            {isDraft && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                Draft · not live
              </span>
            )}
          </div>
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
          {isDraft && onPublish && (
            <button
              onClick={() => onPublish(service)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-gray-700 rounded transition-colors"
              title="Publish to the public site"
            >
              <Globe className="w-4 h-4" />
              Publish
            </button>
          )}
          {!isDraft && onUnpublish && (
            <button
              onClick={() => onUnpublish(service)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-gray-700 rounded transition-colors"
              title="Unpublish (remove from the public site, keep as draft)"
            >
              <EyeOff className="w-4 h-4" />
              Unpublish
            </button>
          )}
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
