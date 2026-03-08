import React, { useState } from 'react';
import { Check, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { AuthModal } from '../components/AuthModal';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:opacity-70 transition-opacity"
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export const PricingPage: React.FC = () => {
  const { user, subscription } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUpgradeClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const faqs: FAQItemProps[] = [
    {
      question: "How does the free plan work?",
      answer: "The free plan gives you 3 opportunity scans per day. Your scan count resets at midnight (UTC). No credit card required to start."
    },
    {
      question: "Can I cancel my Pro subscription anytime?",
      answer: "Yes, absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have Pro access until the end of your billing period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe."
    },
    {
      question: "What happens if I downgrade from Pro to Free?",
      answer: "Your Pro features will remain active until the end of your current billing period. After that, you'll return to the free plan with 3 scans per day. Your saved favorites and data will be preserved."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with TrendRadar Pro, contact us within 14 days of your purchase for a full refund."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use Stripe for payment processing, which is PCI-DSS compliant and trusted by millions of businesses worldwide. We never store your credit card information on our servers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start for free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-16 sm:mb-24">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Perfect for getting started with trend discovery</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">3 opportunity scans per day</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">AI-powered trend analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Basic market insights</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Email support</span>
              </li>
            </ul>

            <button
              disabled={user && !subscription}
              className="w-full py-3 px-6 rounded-lg font-semibold transition-all bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {user && !subscription ? 'Current Plan' : 'Get Started Free'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-blue-500 relative transform hover:scale-105 transition-transform">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-gray-900 text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-white">$19</span>
                <span className="text-blue-200 ml-2">/month</span>
              </div>
              <p className="text-blue-100">Everything you need to stay ahead of trends</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Zap className="w-5 h-5 text-yellow-300 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">Unlimited opportunity scans</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Advanced AI analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Save unlimited favorites</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">PDF export functionality</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Detailed market insights</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Priority email support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Cancel anytime</span>
              </li>
            </ul>

            <button
              onClick={handleUpgradeClick}
              disabled={user && subscription?.status === 'active'}
              className="w-full py-3 px-6 rounded-lg font-semibold transition-all bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              {user && subscription?.status === 'active' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 sm:mt-24 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 sm:p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to discover your next big opportunity?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs and businesses using TrendRadar to stay ahead of the curve.
            </p>
            <button
              onClick={handleUpgradeClick}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};
