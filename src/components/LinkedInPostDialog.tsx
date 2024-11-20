import React, { useState, useEffect } from 'react';
import { X, Copy, RefreshCw, Linkedin, Settings2, MessageSquare } from 'lucide-react';
import { Article, LinkedInPostParams } from '../types';
import { useStore } from '../store/useStore';
import { generateLinkedInPost } from '../lib/ollama';
import LinkedInPostChat from './LinkedInPostChat';

interface LinkedInPostDialogProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_POST_PARAMS: LinkedInPostParams = {
  tone: 'professional',
  audience: 'Technology professionals',
  industry: 'Technology',
  keyMessage: 'Share industry insights',
  includeHashtags: true,
  includeCallToAction: true,
};

export default function LinkedInPostDialog({
                                             article,
                                             isOpen,
                                             onClose,
                                           }: LinkedInPostDialogProps) {
  const { ollamaSettings, fetchLinkedInPosts, saveLinkedInPost } = useStore();
  const [post, setPost] = useState('');
  const [postId, setPostId] = useState<string | null>(null);
  const [postParams, setPostParams] = useState<LinkedInPostParams>(DEFAULT_POST_PARAMS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadExistingPosts = async () => {
      try {
        if (isOpen && article.id) {
          const posts = await fetchLinkedInPosts(article.id);
          if (!mounted) return;

          if (posts && posts.length > 0) {
            const latestPost = posts[0];
            setPost(latestPost.content || '');
            setPostId(latestPost.id);
            setPostParams(latestPost.params || DEFAULT_POST_PARAMS);
          } else {
            setPost('');
            setPostId(null);
            setPostParams(DEFAULT_POST_PARAMS);
          }
          setError(null);
        }
      } catch (error) {
        console.error('Error loading existing posts:', error);
        if (mounted) {
          setError('Failed to load existing posts. Creating a new one.');
          setPost('');
          setPostId(null);
          setPostParams(DEFAULT_POST_PARAMS);
        }
      }
    };

    loadExistingPosts();

    return () => {
      mounted = false;
    };
  }, [isOpen, article.id, fetchLinkedInPosts]);

  const handleGeneratePost = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const generatedPost = await generateLinkedInPost(
        article.title,
        article.content,
        ollamaSettings,
        postParams
      );
      const newPostId = await saveLinkedInPost(article.id, generatedPost, postParams);
      setPost(generatedPost);
      setPostId(newPostId);
    } catch (error) {
      console.error('Error generating post:', error);
      setError('Failed to generate LinkedIn post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(post);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="absolute inset-y-0 right-0 w-[800px] bg-white shadow-xl flex">
        <div className={`flex-1 flex flex-col ${showChat ? 'w-1/2' : 'w-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">LinkedIn Post Generator</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={showChat ? 'Hide chat' : 'Show chat'}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Post Settings</h3>
                  <button
                    onClick={() => setPostParams(DEFAULT_POST_PARAMS)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Reset to Default
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tone
                    </label>
                    <select
                      value={postParams.tone}
                      onChange={(e) => setPostParams(prev => ({ ...prev, tone: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="technical">Technical</option>
                      <option value="storytelling">Storytelling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={postParams.audience}
                      onChange={(e) => setPostParams(prev => ({ ...prev, audience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={postParams.industry}
                      onChange={(e) => setPostParams(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Message
                    </label>
                    <input
                      type="text"
                      value={postParams.keyMessage}
                      onChange={(e) => setPostParams(prev => ({ ...prev, keyMessage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={postParams.includeHashtags}
                      onChange={(e) => setPostParams(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include Hashtags</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={postParams.includeCallToAction}
                      onChange={(e) => setPostParams(prev => ({ ...prev, includeCallToAction: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include Call-to-Action</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Post</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGeneratePost}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>
                    {post && (
                      <button
                        onClick={handleCopyToClipboard}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="relative min-h-[200px] p-4 bg-gray-50 rounded-lg">
                  {post ? (
                    <div className="whitespace-pre-wrap">{post}</div>
                  ) : (
                    <div className="text-gray-500">
                      Click "Generate" to create a LinkedIn post based on your settings
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showChat && postId && (
          <div className="w-1/2 border-l border-gray-200 h-full">
            <LinkedInPostChat
              post={post}
              postId={postId}
              onUpdatePost={setPost}
              settings={ollamaSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
}