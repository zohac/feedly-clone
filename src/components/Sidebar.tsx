import React, { useState } from 'react';
import { Plus, Rss, Star, Newspaper, MoreVertical, Trash2, LayoutDashboard, PenSquare, Brain, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import EditCollectionDialog from './EditCollectionDialog';
import ConfirmDialog from './ConfirmDialog';
import CreateArticleDialog from './CreateArticleDialog';
import { Collection, Feed } from '../types';

interface SidebarProps {
  onAddFeed: () => void;
  onAddCollection: () => void;
  selectedCollectionId: string | null;
  selectedFeedId: string | null;
  onSelectCollection: (id: string | null) => void;
  onSelectFeed: (id: string | null) => void;
}

export default function Sidebar({
  onAddFeed,
  onAddCollection,
  selectedCollectionId,
  selectedFeedId,
  onSelectCollection,
  onSelectFeed,
}: SidebarProps) {
  const { collections, feeds, articles, deleteCollection, deleteFeed } = useStore();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [feedMenuOpen, setFeedMenuOpen] = useState<string | null>(null);
  const [deletingFeed, setDeletingFeed] = useState<Feed | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  
  const favoriteCount = articles.filter(article => article.isFavorite).length;
  const aiArticleCount = articles.filter(article => article.isAIArticle).length;
  const myArticlesCount = articles.filter(article => article.isUserCreated).length;

  const handleDeleteCollection = async (collection: Collection) => {
    await deleteCollection(collection.id);
    if (selectedCollectionId === collection.id) {
      onSelectCollection(null);
      onSelectFeed(null);
    }
  };

  const handleDeleteFeed = async (feed: Feed) => {
    await deleteFeed(feed.id);
    if (selectedFeedId === feed.id) {
      onSelectFeed(null);
    }
  };

  return (
    <div className="w-64 bg-gray-50 h-screen p-4 border-r border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateArticleOpen(true)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Create Article"
          >
            <PenSquare className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onAddFeed}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Add Feed"
          >
            <Rss className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onAddCollection}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Add Collection"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <nav className="space-y-1">
        <button
          onClick={() => {
            onSelectCollection(null);
            onSelectFeed(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            selectedCollectionId === null && selectedFeedId === null
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            onSelectCollection('all');
            onSelectFeed(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            selectedCollectionId === 'all'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span>All Articles</span>
        </button>

        <button
          onClick={() => {
            onSelectCollection('my-articles');
            onSelectFeed(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            selectedCollectionId === 'my-articles'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>My Articles</span>
          {myArticlesCount > 0 && (
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-0.5 text-xs rounded-full">
              {myArticlesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onSelectCollection('favorites');
            onSelectFeed(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            selectedCollectionId === 'favorites'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Star className="w-5 h-5" />
          <span>Favorites</span>
          {favoriteCount > 0 && (
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-0.5 text-xs rounded-full">
              {favoriteCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onSelectCollection('ai-articles');
            onSelectFeed(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            selectedCollectionId === 'ai-articles'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Brain className="w-5 h-5" />
          <span>AI Articles</span>
          {aiArticleCount > 0 && (
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-0.5 text-xs rounded-full">
              {aiArticleCount}
            </span>
          )}
        </button>

        <div className="pt-4">
          <div className="px-3 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Collections
          </div>
          <div className="space-y-1">
            {collections.map((collection) => (
              <div key={collection.id} className="relative">
                <div className="flex items-center">
                  <div
                    onClick={() => {
                      onSelectCollection(collection.id);
                      onSelectFeed(null);
                    }}
                    className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      selectedCollectionId === collection.id && !selectedFeedId
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: collection.color }}
                    />
                    <span>{collection.name}</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === collection.id ? null : collection.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === collection.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            setEditingCollection(collection);
                            setMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeletingCollection(collection);
                            setMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6 space-y-1">
                  {feeds
                    .filter((feed) => feed.collectionId === collection.id)
                    .map((feed) => (
                      <div key={feed.id} className="relative flex items-center">
                        <div
                          onClick={() => {
                            onSelectCollection(collection.id);
                            onSelectFeed(feed.id);
                          }}
                          className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            selectedFeedId === feed.id
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Rss className="w-4 h-4" />
                          <span className="truncate">{feed.title}</span>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeedMenuOpen(feedMenuOpen === feed.id ? null : feed.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {feedMenuOpen === feed.id && (
                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  setDeletingFeed(feed);
                                  setFeedMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <CreateArticleDialog
        isOpen={isCreateArticleOpen}
        onClose={() => setIsCreateArticleOpen(false)}
      />

      {editingCollection && (
        <EditCollectionDialog
          isOpen={true}
          onClose={() => setEditingCollection(null)}
          collection={editingCollection}
        />
      )}

      {deletingCollection && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingCollection(null)}
          onConfirm={() => handleDeleteCollection(deletingCollection)}
          title="Delete Collection"
          message={`Are you sure you want to delete "${deletingCollection.name}"? This will also remove all feeds in this collection.`}
          confirmLabel="Delete"
          isDangerous
        />
      )}

      {deletingFeed && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingFeed(null)}
          onConfirm={() => handleDeleteFeed(deletingFeed)}
          title="Delete Feed"
          message={`Are you sure you want to delete "${deletingFeed.title}"?`}
          confirmLabel="Delete"
          isDangerous
        />
      )}
    </div>
  );
}