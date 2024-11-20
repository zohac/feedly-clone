import React, { useState } from 'react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { Star, BookOpen, ExternalLink, Rss, ArrowUpDown, ChevronDown, ChevronUp, Brain, Linkedin } from 'lucide-react';
import { Article } from '../types';
import { useStore } from '../store/useStore';
import ArticleDialog from './ArticleDialog';
import LinkedInPostDialog from './LinkedInPostDialog';
import { analyzeArticleContent } from '../lib/ollama';

interface ArticleListProps {
  articles: Article[];
}

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

const extractFirstImage = (content: string): string | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const img = doc.querySelector('img');
  return img?.src || null;
};

const CONTENT_PREVIEW_LENGTH = 300;

const truncateContent = (content: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const textContent = doc.body.textContent || '';

  if (textContent.length <= CONTENT_PREVIEW_LENGTH) {
    return content;
  }

  return textContent.slice(0, CONTENT_PREVIEW_LENGTH) + '...';
};

const shouldShowAccordion = (content: string): boolean => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const textContent = doc.body.textContent || '';
  return textContent.length > CONTENT_PREVIEW_LENGTH;
};

export default function ArticleList({ articles }: ArticleListProps) {
  const { toggleArticleRead, toggleArticleFavorite, markAsAIArticle, feeds, ollamaSettings } = useStore();
  const [sortBy, setSortBy] = useState<'date' | 'feed'>('date');
  const [expandedArticles, setExpandedArticles] = useState<{ [key: string]: boolean }>({});
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [linkedInArticle, setLinkedInArticle] = useState<Article | null>(null);
  const [analyzingArticles, setAnalyzingArticles] = useState<{ [key: string]: boolean }>({});

  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const handleAnalyzeAI = async (article: Article) => {
    if (article.isAIArticle) return;

    setAnalyzingArticles(prev => ({ ...prev, [article.id]: true }));
    try {
      const isAIArticle = await analyzeArticleContent(
        article.title,
        article.content,
        ollamaSettings
      );
      if (isAIArticle) {
        await markAsAIArticle(article);
      }
    } finally {
      setAnalyzingArticles(prev => ({ ...prev, [article.id]: false }));
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      return isValid(dateB) && isValid(dateA)
        ? dateB.getTime() - dateA.getTime()
        : 0;
    } else {
      const feedA = feeds.find(f => f.id === a.feedId)?.title || '';
      const feedB = feeds.find(f => f.id === b.feedId)?.title || '';
      return feedA.localeCompare(feedB);
    }
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-end mb-6">
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'feed')}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="feed">Sort by Feed</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-8">
          {sortedArticles.map((article) => {
            const featuredImage = extractFirstImage(article.content);
            const feed = feeds.find(f => f.id === article.feedId);
            const isExpanded = expandedArticles[article.id];
            const needsAccordion = shouldShowAccordion(article.content);
            const isAnalyzing = analyzingArticles[article.id];

            return (
              <article
                key={article.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
                  article.isRead ? 'opacity-60' : ''
                }`}
              >
                {featuredImage && (
                  <div className="relative w-full h-64 bg-gray-100">
                    <img
                      src={featuredImage}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleArticleFavorite(article)}
                        className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                          article.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                        title={article.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleArticleRead(article.id)}
                        className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                          article.isRead ? 'text-blue-500' : 'text-gray-400'
                        }`}
                        title={article.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        <BookOpen className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAnalyzeAI(article)}
                        disabled={isAnalyzing || article.isAIArticle}
                        className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                          article.isAIArticle ? 'text-purple-500' :
                            isAnalyzing ? 'text-purple-500 animate-pulse' : 'text-gray-400'
                        }`}
                        title={article.isAIArticle ? 'AI Article' : 'Analyze for AI content'}
                      >
                        <Brain className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setLinkedInArticle(article)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors text-[#0A66C2]"
                        title="Generate LinkedIn post"
                      >
                        <Linkedin className="w-5 h-5" />
                      </button>
                    </div>
                    <time className="text-sm text-gray-500">
                      {formatDate(article.pubDate)}
                    </time>
                  </div>
                  {feed && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                      <Rss className="w-4 h-4" />
                      <span>{feed.title}</span>
                    </div>
                  )}
                  <h2 className="text-xl font-semibold mb-3 group">
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="hover:text-blue-600 inline-flex items-center gap-2"
                    >
                      {article.title}
                    </button>
                  </h2>
                  <div className="space-y-4">
                    <div
                      className={`prose prose-sm max-w-none text-gray-600 ${
                        !isExpanded && needsAccordion ? 'line-clamp-3' : ''
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: article.content.replace(/<img[^>]*>/g, '')
                      }}
                    />
                    {needsAccordion && (
                      <button
                        onClick={() => toggleArticleExpansion(article.id)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {selectedArticle && (
          <ArticleDialog
            article={selectedArticle}
            feed={feeds.find(f => f.id === selectedArticle.feedId)}
            isOpen={true}
            onClose={() => setSelectedArticle(null)}
          />
        )}

        {linkedInArticle && (
          <LinkedInPostDialog
            article={linkedInArticle}
            isOpen={true}
            onClose={() => setLinkedInArticle(null)}
          />
        )}
      </div>
    </div>
  );
}