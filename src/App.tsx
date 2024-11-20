import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import Dashboard from './components/Dashboard';
import AddFeedDialog from './components/AddFeedDialog';
import AddCollectionDialog from './components/AddCollectionDialog';
import OllamaSettingsDialog from './components/OllamaSettingsDialog';

export default function App() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { articles, feeds, collections, fetchCollections, fetchFeeds, fetchFavorites, fetchAIArticles, fetchUserArticles, fetchOllamaSettings } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchCollections(),
        fetchFeeds(),
        fetchFavorites(),
        fetchAIArticles(),
        fetchUserArticles(),
        fetchOllamaSettings()
      ]);
    };
    fetchData();
  }, []);

  // Filter articles based on selection
  const filteredArticles = React.useMemo(() => {
    if (selectedFeedId) {
      return articles.filter(article => article.feedId === selectedFeedId);
    }
    
    if (selectedCollectionId === 'favorites') {
      return articles.filter(article => article.isFavorite);
    }

    if (selectedCollectionId === 'ai-articles') {
      return articles.filter(article => article.isAIArticle);
    }

    if (selectedCollectionId === 'my-articles') {
      return articles.filter(article => article.isUserCreated);
    }
    
    if (selectedCollectionId === 'all') {
      return [...articles].sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
    }
    
    if (selectedCollectionId) {
      const collectionFeeds = feeds.filter(feed => feed.collectionId === selectedCollectionId);
      return articles.filter(article => 
        collectionFeeds.some(feed => feed.id === article.feedId)
      );
    }
    
    return [];
  }, [selectedCollectionId, selectedFeedId, articles, feeds]);

  // Fetch RSS feed data
  useEffect(() => {
    const fetchRSSFeeds = async () => {
      const feedPromises = feeds.map(async (feed) => {
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
          const data = await response.json();
          
          if (data.status === 'ok') {
            const newArticles = data.items.map((item: any) => ({
              id: `${feed.id}-${item.guid || item.link || crypto.randomUUID()}`,
              feedId: feed.id,
              title: item.title,
              link: item.link,
              content: item.content || item.description,
              pubDate: new Date(item.pubDate),
              isRead: false,
              isFavorite: false,
              isAIArticle: false
            }));
            
            return newArticles;
          }
        } catch (error) {
          console.error(`Error fetching feed ${feed.url}:`, error);
        }
        return [];
      });

      const allArticles = await Promise.all(feedPromises);
      const flatArticles = allArticles.flat().filter(Boolean);
      useStore.getState().setArticles(flatArticles);
    };

    if (feeds.length > 0) {
      fetchRSSFeeds();
    }
  }, [feeds]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gray-100">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            onAddFeed={() => setIsAddFeedOpen(true)}
            onAddCollection={() => setIsAddCollectionOpen(true)}
            selectedCollectionId={selectedCollectionId}
            selectedFeedId={selectedFeedId}
            onSelectCollection={setSelectedCollectionId}
            onSelectFeed={setSelectedFeedId}
          />
          
          {selectedCollectionId === null && selectedFeedId === null ? (
            <Dashboard />
          ) : (
            <ArticleList articles={filteredArticles} />
          )}

          <AddFeedDialog
            isOpen={isAddFeedOpen}
            onClose={() => setIsAddFeedOpen(false)}
          />
          
          <AddCollectionDialog
            isOpen={isAddCollectionOpen}
            onClose={() => setIsAddCollectionOpen(false)}
          />

          <OllamaSettingsDialog
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}