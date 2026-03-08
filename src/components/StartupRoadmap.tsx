import { Calendar, CheckCircle, Circle, Loader2 } from 'lucide-react';

interface RoadmapItem {
  day: number;
  title: string;
  description: string;
  completed?: boolean;
}

interface StartupRoadmapProps {
  roadmap?: RoadmapItem[];
  onGenerate?: () => void;
  generating?: boolean;
}

export function StartupRoadmap({ roadmap, onGenerate, generating }: StartupRoadmapProps) {
  const hasRoadmap = roadmap && roadmap.length > 0;

  const defaultRoadmap: RoadmapItem[] = [
    {
      day: 1,
      title: 'Validate Idea',
      description: 'Research market demand and validate problem-solution fit'
    },
    {
      day: 2,
      title: 'Find Early Users',
      description: 'Identify and reach out to potential customers in target communities'
    },
    {
      day: 3,
      title: 'Define MVP',
      description: 'Outline core features and minimum requirements for launch'
    },
    {
      day: 7,
      title: 'Launch MVP',
      description: 'Release initial version to early users and gather feedback'
    },
    {
      day: 14,
      title: 'Collect Feedback',
      description: 'Analyze user behavior and iterate based on feedback'
    },
    {
      day: 30,
      title: 'First Revenue',
      description: 'Implement monetization and acquire first paying customers'
    }
  ];

  const displayRoadmap = hasRoadmap ? roadmap : defaultRoadmap;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            30-Day Startup Roadmap
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your path from idea to first revenue
          </p>
        </div>
      </div>

      {!hasRoadmap && onGenerate ? (
        <div className="text-center py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate a personalized roadmap tailored to this specific opportunity
          </p>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Custom Roadmap</span>
            )}
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-500" />

          <div className="space-y-6">
            {displayRoadmap.map((item, index) => (
              <div key={index} className="relative flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full flex items-center justify-center z-10">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded">
                        Day {item.day}
                      </span>
                      {item.completed && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasRoadmap && !onGenerate && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <span className="font-semibold">Pro Tip:</span> This is a general roadmap. Start a project to get a customized plan with AI-powered milestones.
          </p>
        </div>
      )}
    </div>
  );
}
