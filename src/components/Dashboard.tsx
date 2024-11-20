import React, { useState } from 'react';
import { Rss, FolderOpen, Clock, Star, Brain } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { analyzeArticleContent } from '../lib/ollama';

const formatDate = (date: Date | string) => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      return 'Invalid date';
    }
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function Dashboard() {
  const { collections, feeds, articles, ollamaSettings, markAsAIArticle } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [totalToAnalyze, setTotalToAnalyze] = useState(0);

  const recentArticles = React.useMemo(() => {
    const uniqueArticles = [...articles].reduce((acc, article) => {
      if (!acc.some(a => a.link === article.link)) {
        acc.push(article);
      }
      return acc;
    }, [] as typeof articles);

    return uniqueArticles
      .sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return isValid(dateB) && isValid(dateA)
          ? dateB.getTime() - dateA.getTime()
          : 0;
      })
      .slice(0, 5);
  }, [articles]);

  const stats = [
    {
      label: 'RSS Feeds',
      value: feeds.length,
      icon: Rss,
      color: 'bg-blue-500',
    },
    {
      label: 'Collections',
      value: collections.length,
      icon: FolderOpen,
      color: 'bg-green-500',
    },
    {
      label: 'Articles',
      value: articles.length,
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      label: 'AI Articles',
      value: articles.filter(a => a.isAIArticle).length,
      icon: Brain,
      color: 'bg-indigo-500',
    },
  ];

  const handleBulkAnalysis = async () => {
    const unanalyzedArticles = articles.filter(article => !article.isAIArticle);
    if (unanalyzedArticles.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    setAnalyzedCount(0);
    setTotalToAnalyze(unanalyzedArticles.length);

    try {
      // Process articles in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < unanalyzedArticles.length; i += batchSize) {
        const batch = unanalyzedArticles.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (article) => {
            try {
              const isAIArticle = await analyzeArticleContent(
                article.title,
                article.content,
                ollamaSettings
              );
              if (isAIArticle) {
                await markAsAIArticle(article);
              }
              setAnalyzedCount(prev => prev + 1);
            } catch (error) {
              console.error(`Error analyzing article: ${article.title}`, error);
            }
          })
        );
      }
    } finally {
      setIsAnalyzing(false);
      setAnalyzedCount(0);
      setTotalToAnalyze(0);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Feed Reader</h1>
            <p className="text-gray-600">Stay updated with your favorite content in one place.</p>
          </div>
          <button
            onClick={handleBulkAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Brain className="w-5 h-5" />
            {isAnalyzing ? (
              <span>
                Analyzing... ({analyzedCount}/{totalToAnalyze})
              </span>
            ) : (
              <span>Analyze All Articles</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`${color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Collections Overview</h2>
            <div className="space-y-4">
              {collections.map((collection) => {
                const collectionFeeds = feeds.filter(f => f.collectionId === collection.id);
                return (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: collection.color }}
                      />
                      <span className="font-medium text-gray-900">{collection.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {collectionFeeds.length} {collectionFeeds.length === 1 ? 'feed' : 'feeds'}
                    </span>
                  </div>
                );
              })}
              {collections.length === 0 && (
                <p className="text-gray-500 text-center py-4">No collections yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h2>
            <div className="space-y-4">
              {recentArticles.map((article) => {
                const feed = feeds.find(f => f.id === article.feedId);
                return (
                  <div key={article.id} className="space-y-1">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-blue-600 font-medium line-clamp-1"
                    >
                      {article.title}
                    </a>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{feed?.title}</span>
                      <span>•</span>
                      <time>{formatDate(article.pubDate)}</time>
                      {article.isAIArticle && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-indigo-600">
                            <Brain className="w-4 h-4" />
                            AI Article
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {recentArticles.length === 0 && (
                <p className="text-gray-500 text-center py-4">No articles yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}