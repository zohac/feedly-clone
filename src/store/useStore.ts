import { create } from 'zustand';
import {
  collection as firestoreCollection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Collection, Feed, Article, OllamaSettings, LinkedInPost, ChatMessage, ChatConversation } from '../types';
import { DEFAULT_AI_PROMPT } from '../lib/ollama';

interface AppState {
  collections: Collection[];
  feeds: Feed[];
  articles: Article[];
  favorites: { [key: string]: boolean };
  aiArticles: { [key: string]: boolean };
  linkedInPosts: LinkedInPost[];
  ollamaSettings: OllamaSettings;
  addCollection: (collection: Collection) => Promise<void>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  addFeed: (feed: Feed) => Promise<void>;
  setArticles: (articles: Article[]) => void;
  toggleArticleRead: (articleId: string) => void;
  toggleArticleFavorite: (article: Article) => Promise<void>;
  markAsAIArticle: (article: Article) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  deleteFeed: (feedId: string) => Promise<void>;
  fetchCollections: () => Promise<void>;
  fetchFeeds: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchAIArticles: () => Promise<void>;
  createArticle: (article: Partial<Article>) => Promise<void>;
  fetchUserArticles: () => Promise<void>;
  deleteArticle: (articleId: string) => Promise<void>;
  updateOllamaSettings: (settings: OllamaSettings) => Promise<void>;
  fetchOllamaSettings: () => Promise<void>;
  fetchLinkedInPosts: (articleId: string) => Promise<LinkedInPost[]>;
  saveLinkedInPost: (articleId: string, content: string, params: any) => Promise<string>;
  saveChatMessage: (postId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  fetchChatConversation: (postId: string) => Promise<ChatConversation | null>;
}

const DEFAULT_OLLAMA_SETTINGS: OllamaSettings = {
  model: 'mistral',
  temperature: 0.1,
  maxTokens: 2048,
  prompt: DEFAULT_AI_PROMPT
};

export const useStore = create<AppState>((set, get) => ({
  collections: [],
  feeds: [],
  articles: [],
  favorites: {},
  aiArticles: {},
  linkedInPosts: [],
  ollamaSettings: DEFAULT_OLLAMA_SETTINGS,

  addCollection: async (newCollection: Collection) => {
    const docRef = await addDoc(firestoreCollection(db, 'collections'), newCollection);
    const collectionWithId = { ...newCollection, id: docRef.id };
    set((state) => ({
      collections: [...state.collections, collectionWithId],
    }));
  },

  updateCollection: async (id: string, updates: Partial<Collection>) => {
    const docRef = doc(db, 'collections', id);
    await updateDoc(docRef, updates);
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === id ? { ...collection, ...updates } : collection
      ),
    }));
  },

  addFeed: async (feed: Feed) => {
    const docRef = await addDoc(firestoreCollection(db, 'feeds'), feed);
    const newFeed = { ...feed, id: docRef.id };
    set((state) => ({
      feeds: [...state.feeds, newFeed],
    }));
  },

  setArticles: (articles: Article[]) => {
    set((state) => {
      const uniqueArticles = [...articles, ...state.articles].reduce((acc, article) => {
        if (!acc.some(a => a.link === article.link)) {
          acc.push(article);
        }
        return acc;
      }, [] as Article[]);

      const articlesWithStatus = uniqueArticles.map(article => ({
        ...article,
        isFavorite: state.favorites[article.link] || false,
        isAIArticle: state.aiArticles[article.link] || false
      }));

      return { articles: articlesWithStatus };
    });
  },

  toggleArticleRead: (articleId: string) => {
    set((state) => ({
      articles: state.articles.map((a) =>
        a.id === articleId ? { ...a, isRead: !a.isRead } : a
      ),
    }));
  },

  toggleArticleFavorite: async (article: Article) => {
    const { link, title, content, pubDate } = article;
    const newFavoriteStatus = !article.isFavorite;

    const favoriteRef = doc(db, 'favorites', encodeURIComponent(link));
    if (newFavoriteStatus) {
      await setDoc(favoriteRef, {
        link,
        title,
        content,
        pubDate,
        timestamp: new Date()
      });
    } else {
      await deleteDoc(favoriteRef);
    }

    set((state) => ({
      favorites: {
        ...state.favorites,
        [link]: newFavoriteStatus
      },
      articles: state.articles.map((a) =>
        a.link === link ? { ...a, isFavorite: newFavoriteStatus } : a
      ),
    }));
  },

  markAsAIArticle: async (article: Article) => {
    const { link, title, content, pubDate } = article;
    const aiArticleRef = doc(db, 'ai-articles', encodeURIComponent(link));

    await setDoc(aiArticleRef, {
      link,
      title,
      content,
      pubDate,
      timestamp: new Date()
    });

    set((state) => ({
      aiArticles: {
        ...state.aiArticles,
        [link]: true
      },
      articles: state.articles.map((a) =>
        a.link === link ? { ...a, isAIArticle: true } : a
      ),
    }));
  },

  deleteCollection: async (collectionId: string) => {
    await deleteDoc(doc(db, 'collections', collectionId));
    const feedsQuery = query(firestoreCollection(db, 'feeds'), where('collectionId', '==', collectionId));
    const feedsSnapshot = await getDocs(feedsQuery);
    feedsSnapshot.forEach(async (feedDoc) => {
      await deleteDoc(feedDoc.ref);
    });
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== collectionId),
      feeds: state.feeds.filter((f) => f.collectionId !== collectionId),
      articles: state.articles.filter((a) =>
        !state.feeds.find(f => f.collectionId === collectionId && f.id === a.feedId)
      ),
    }));
  },

  deleteFeed: async (feedId: string) => {
    await deleteDoc(doc(db, 'feeds', feedId));
    set((state) => ({
      feeds: state.feeds.filter((f) => f.id !== feedId),
      articles: state.articles.filter((a) => a.feedId !== feedId),
    }));
  },

  fetchCollections: async () => {
    const querySnapshot = await getDocs(firestoreCollection(db, 'collections'));
    const collections = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Collection));
    set({ collections });
  },

  fetchFeeds: async () => {
    const querySnapshot = await getDocs(firestoreCollection(db, 'feeds'));
    const feeds = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Feed));
    set({ feeds });
  },

  fetchFavorites: async () => {
    const querySnapshot = await getDocs(firestoreCollection(db, 'favorites'));
    const favorites: { [key: string]: boolean } = {};
    querySnapshot.docs.forEach(doc => {
      favorites[decodeURIComponent(doc.id)] = true;
    });
    set({ favorites });
  },

  fetchAIArticles: async () => {
    const querySnapshot = await getDocs(firestoreCollection(db, 'ai-articles'));
    const aiArticles: { [key: string]: boolean } = {};
    querySnapshot.docs.forEach(doc => {
      aiArticles[decodeURIComponent(doc.id)] = true;
    });
    set({ aiArticles });
  },

  createArticle: async (article: Partial<Article>) => {
    const docRef = await addDoc(firestoreCollection(db, 'user-articles'), {
      ...article,
      timestamp: new Date(),
    });

    const newArticle = {
      ...article,
      id: docRef.id,
      feedId: 'user',
    } as Article;

    set((state) => ({
      articles: [...state.articles, newArticle],
    }));
  },

  fetchUserArticles: async () => {
    const querySnapshot = await getDocs(firestoreCollection(db, 'user-articles'));
    const userArticles = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      feedId: 'user',
    } as Article));

    set((state) => ({
      articles: [...state.articles, ...userArticles],
    }));
  },

  deleteArticle: async (articleId: string) => {
    await deleteDoc(doc(db, 'user-articles', articleId));
    set((state) => ({
      articles: state.articles.filter((a) => a.id !== articleId),
    }));
  },

  updateOllamaSettings: async (settings: OllamaSettings) => {
    const settingsRef = doc(db, 'settings', 'ollama');
    await setDoc(settingsRef, settings);
    set({ ollamaSettings: settings });
  },

  fetchOllamaSettings: async () => {
    const settingsRef = doc(db, 'settings', 'ollama');
    const settingsDoc = await getDoc(settingsRef);
    if (settingsDoc.exists()) {
      set({ ollamaSettings: settingsDoc.data() as OllamaSettings });
    } else {
      await setDoc(settingsRef, DEFAULT_OLLAMA_SETTINGS);
      set({ ollamaSettings: DEFAULT_OLLAMA_SETTINGS });
    }
  },

  fetchLinkedInPosts: async (articleId: string) => {
    try {
      const q = query(
        firestoreCollection(db, 'linkedin-posts'),
        where('articleId', '==', articleId),
        orderBy('createdAt', 'desc')
      );

      try {
        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LinkedInPost[];

        set(state => ({
          linkedInPosts: [...state.linkedInPosts, ...posts]
        }));

        return posts;
      } catch (error: any) {
        if (error.code === 'failed-precondition') {
          const basicQuery = query(
            firestoreCollection(db, 'linkedin-posts'),
            where('articleId', '==', articleId)
          );

          const snapshot = await getDocs(basicQuery);
          const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as LinkedInPost[];

          posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          set(state => ({
            linkedInPosts: [...state.linkedInPosts, ...posts]
          }));

          return posts;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching LinkedIn posts:', error);
      return [];
    }
  },

  saveLinkedInPost: async (articleId: string, content: string, params: any) => {
    const post = {
      articleId,
      content,
      params,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(firestoreCollection(db, 'linkedin-posts'), post);
    return docRef.id;
  },

  saveChatMessage: async (postId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const chatRef = doc(db, 'chat-conversations', postId);
    const chatDoc = await getDoc(chatRef);

    const newMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    if (chatDoc.exists()) {
      const conversation = chatDoc.data() as ChatConversation;
      await updateDoc(chatRef, {
        messages: [...conversation.messages, newMessage],
        updatedAt: new Date()
      });
    } else {
      await setDoc(chatRef, {
        id: postId,
        linkedInPostId: postId,
        messages: [newMessage],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    set(state => ({
      chatConversations: {
        ...state.chatConversations,
        [postId]: {
          ...state.chatConversations?.[postId],
          messages: [...(state.chatConversations?.[postId]?.messages || []), newMessage]
        }
      }
    }));
  },

  fetchChatConversation: async (postId: string) => {
    const chatRef = doc(db, 'chat-conversations', postId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const conversation = chatDoc.data() as ChatConversation;
      return conversation;
    }

    return null;
  }
}));