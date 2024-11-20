import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AddFeedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Yellow
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export default function AddFeedDialog({ isOpen, onClose }: AddFeedDialogProps) {
  const [url, setUrl] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const { collections, addFeed, addCollection } = useStore();

  if (!isOpen) return null;

  const handleCreateCollection = () => {
    const newCollection = {
      id: crypto.randomUUID(),
      name: newCollectionName,
      color: selectedColor,
    };
    addCollection(newCollection);
    setSelectedCollection(newCollection.id);
    setIsCreatingCollection(false);
    setNewCollectionName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        addFeed({
          id: crypto.randomUUID(),
          title: data.feed.title,
          url,
          collectionId: selectedCollection,
          lastFetched: new Date(),
        });
        onClose();
      }
    } catch (error) {
      console.error('Error adding feed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Feed</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              RSS Feed URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {!isCreatingCollection ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="collection"
                  className="block text-sm font-medium text-gray-700"
                >
                  Collection
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  New Collection
                </button>
              </div>
              <select
                id="collection"
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-4 border-t border-b border-gray-200 py-4">
              <div>
                <label
                  htmlFor="collectionName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Collection Name
                </label>
                <input
                  type="text"
                  id="collectionName"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(false)}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Collection
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}