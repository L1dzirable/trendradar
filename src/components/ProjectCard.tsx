import { Rocket, Calendar, TrendingUp } from 'lucide-react';
import { Project, PROJECT_STAGES } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const currentStageIndex = PROJECT_STAGES.findIndex(s => s.value === project.current_stage);
  const progress = ((currentStageIndex + 1) / PROJECT_STAGES.length) * 100;
  const currentStageInfo = PROJECT_STAGES.find(s => s.value === project.current_stage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Started today';
    if (diffDays === 1) return 'Started yesterday';
    if (diffDays < 7) return `Started ${diffDays} days ago`;
    if (diffDays < 30) return `Started ${Math.floor(diffDays / 7)} weeks ago`;
    return `Started ${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(project.started_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <Rocket className="w-4 h-4" />
          <span className="text-sm font-medium">Active</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentStageInfo?.label}
          </span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {currentStageInfo?.description}
        </p>
      </div>

      {project.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.notes}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
        <TrendingUp className="w-4 h-4" />
        <span>View Details</span>
      </div>
    </div>
  );
}
