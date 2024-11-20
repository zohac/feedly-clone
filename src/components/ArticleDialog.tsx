import React, { useState } from 'react';
import { X, ExternalLink, Star, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import { Article } from '../types';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';

interface ArticleDialogProps {
  article: Article;
  feed?: { title: string };
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleDialog({ article, feed, isOpen, onClose }: ArticleDialogProps) {
  const { toggleArticleRead, toggleArticleFavorite } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const extractFirstImage = (content: string): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const img = doc.querySelector('img');
    return img?.src || null;
  };

  const featuredImage = extractFirstImage(article.content);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className={`bg-white rounded-lg w-full flex flex-col transition-all duration-300 ${
          isFullscreen ? 'h-screen m-0 rounded-none' : 'max-w-4xl h-[90vh]'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              title="Open original article"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {featuredImage && (
            <div className="w-full h-64 md:h-96 bg-gray-100">
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
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {feed && (
                    <>
                      <span>{feed.title}</span>
                      <span>•</span>
                    </>
                  )}
                  <time>{formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}</time>
                </div>
              </div>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              <div className="mt-8 pt-8 border-t border-gray-200">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <span>Read full article on {feed?.title}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}