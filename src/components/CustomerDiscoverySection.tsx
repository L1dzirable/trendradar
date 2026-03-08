import { Users, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CustomerDiscoveryData {
  reddit: Array<{ name: string; url: string; members?: string }>;
  twitter: Array<{ query: string; url: string }>;
  communities: Array<{ name: string; url: string; platform: string }>;
  forums: Array<{ name: string; url: string }>;
}

interface CustomerDiscoverySectionProps {
  data?: CustomerDiscoveryData;
  onGenerate?: () => void;
  generating?: boolean;
}

export function CustomerDiscoverySection({ data, onGenerate, generating }: CustomerDiscoverySectionProps) {
  const hasData = data && (
    data.reddit.length > 0 ||
    data.twitter.length > 0 ||
    data.communities.length > 0 ||
    data.forums.length > 0
  );

  if (!hasData && !onGenerate) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Customer Discovery
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Find where your potential customers are
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Discover where potential customers are already discussing this problem
          </p>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Find Customers</span>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data!.reddit.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-orange-500">r/</span> Reddit Communities
              </h4>
              <div className="space-y-2">
                {data!.reddit.map((community, index) => (
                  <a
                    key={index}
                    href={community.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                        {community.name}
                      </div>
                      {community.members && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {community.members}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {data!.twitter.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-blue-500">𝕏</span> Twitter Discussions
              </h4>
              <div className="space-y-2">
                {data!.twitter.map((discussion, index) => (
                  <a
                    key={index}
                    href={discussion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all group"
                  >
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500">
                      {discussion.query}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {data!.communities.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Online Communities
              </h4>
              <div className="space-y-2">
                {data!.communities.map((community, index) => (
                  <a
                    key={index}
                    href={community.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-500">
                        {community.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {community.platform}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {data!.forums.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Forums & Groups
              </h4>
              <div className="space-y-2">
                {data!.forums.map((forum, index) => (
                  <a
                    key={index}
                    href={forum.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all group"
                  >
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-500">
                      {forum.name}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
