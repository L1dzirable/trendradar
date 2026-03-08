import { FileText, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface LandingPageCopy {
  hero_headline: string;
  hero_subheadline: string;
  problem_section: string;
  solution_section: string;
  key_features: string[];
  pricing_suggestion: string;
  cta: string;
}

interface LandingPageGeneratorProps {
  landingPageCopy?: LandingPageCopy;
  onGenerate?: () => void;
  generating?: boolean;
}

export function LandingPageGenerator({ landingPageCopy, onGenerate, generating }: LandingPageGeneratorProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const hasCopy = landingPageCopy && Object.keys(landingPageCopy).length > 0;

  async function copyToClipboard(text: string, section: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  function copyFullPage() {
    if (!landingPageCopy) return;

    const fullCopy = `
${landingPageCopy.hero_headline}

${landingPageCopy.hero_subheadline}

THE PROBLEM
${landingPageCopy.problem_section}

THE SOLUTION
${landingPageCopy.solution_section}

KEY FEATURES
${landingPageCopy.key_features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

PRICING
${landingPageCopy.pricing_suggestion}

${landingPageCopy.cta}
    `.trim();

    copyToClipboard(fullCopy, 'full');
  }

  if (!hasCopy && !onGenerate) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Landing Page Generator
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ready-to-use copy for your landing page
          </p>
        </div>
        {hasCopy && (
          <button
            onClick={copyFullPage}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            {copiedSection === 'full' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy All</span>
              </>
            )}
          </button>
        )}
      </div>

      {!hasCopy ? (
        <div className="text-center py-6">
          <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate professional landing page copy optimized for conversions
          </p>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Landing Page</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Hero Headline
              </h4>
              <button
                onClick={() => copyToClipboard(landingPageCopy!.hero_headline, 'headline')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === 'headline' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {landingPageCopy!.hero_headline}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Subheadline
              </h4>
              <button
                onClick={() => copyToClipboard(landingPageCopy!.hero_subheadline, 'subheadline')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === 'subheadline' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {landingPageCopy!.hero_subheadline}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Problem Section
              </h4>
              <button
                onClick={() => copyToClipboard(landingPageCopy!.problem_section, 'problem')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === 'problem' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {landingPageCopy!.problem_section}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Solution Section
              </h4>
              <button
                onClick={() => copyToClipboard(landingPageCopy!.solution_section, 'solution')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === 'solution' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {landingPageCopy!.solution_section}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Key Features
              </h4>
              <button
                onClick={() => copyToClipboard(landingPageCopy!.key_features.join('\n'), 'features')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === 'features' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <ul className="space-y-2">
              {landingPageCopy!.key_features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Pricing Suggestion
              </h4>
              <button
                onClick={() => copyToClipboard(landingPageCopy!.pricing_suggestion, 'pricing')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === 'pricing' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {landingPageCopy!.pricing_suggestion}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Call-to-Action
              </h4>
              <button
                onClick={() => copyToClipboard(landingPageCopy!.cta, 'cta')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === 'cta' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {landingPageCopy!.cta}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
