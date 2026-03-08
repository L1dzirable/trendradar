import { Target, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface Competitor {
  name: string;
  description: string;
  url?: string;
}

interface CompetitorSnapshotProps {
  competitors?: Competitor[];
  onGenerate?: () => void;
  generating?: boolean;
}

export function CompetitorSnapshot({ competitors, onGenerate, generating }: CompetitorSnapshotProps) {
  const hasCompetitors = competitors && competitors.length > 0;
  const lowCompetition = competitors && competitors.length === 0;

  if (!hasCompetitors && !lowCompetition && !onGenerate) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Competitor Snapshot
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Market competition analysis
          </p>
        </div>
      </div>

      {!hasCompetitors && !lowCompetition ? (
        <div className="text-center py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Analyze the competitive landscape for this opportunity
          </p>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze Competition</span>
            )}
          </button>
        </div>
      ) : lowCompetition ? (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Low Competition Detected
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              This appears to be an early-stage opportunity with minimal direct competition. Great time to establish market presence.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {competitors!.map((competitor, index) => (
            <div
              key={index}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {competitor.name}
                </h4>
                {competitor.url && (
                  <a
                    href={competitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {competitor.description}
              </p>
            </div>
          ))}

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-semibold">Competitive Insight:</span> Study these competitors to identify gaps in their offerings and differentiate your solution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
