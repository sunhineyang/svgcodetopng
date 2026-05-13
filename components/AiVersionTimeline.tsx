'use client';

import { SvgVersion } from '../utils/ai-svg/types';
import { RotateCcw, History } from 'lucide-react';

interface AiVersionTimelineProps {
  versions: SvgVersion[];
  onRollback: (versionId: string) => void;
}

export default function AiVersionTimeline({
  versions,
  onRollback,
}: AiVersionTimelineProps) {
  if (versions.length <= 1) {
    return null;
  }

  const currentIndex = versions.findIndex((v) => v.isCurrent);

  return (
    <div className="flex items-center gap-2 py-2 overflow-x-auto">
      <History className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <div className="flex items-center gap-2">
        {versions.map((version, index) => (
          <button
            key={version.id}
            onClick={() => onRollback(version.id)}
            className={`
              flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-xs
              transition-all duration-200
              ${
                version.isCurrent
                  ? 'bg-blue-500 text-white'
                  : index < currentIndex
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-400'
              }
            `}
            title={version.description}
          >
            <span>v{index + 1}</span>
            {!version.isCurrent && index < currentIndex && (
              <RotateCcw className="w-3 h-3 ml-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
