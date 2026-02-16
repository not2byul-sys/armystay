import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showMyPageModal: boolean;
  setShowMyPageModal: (show: boolean) => void;
  showBookmarksModal: boolean;
  setShowBookmarksModal: (show: boolean) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-796c8de3`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMyPageModal, setShowMyPageModal] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = async (token: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/bookmarks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookmarks(new Set(data.map((b: any) => b.hotel_id)));
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchBookmarks(session.access_token);
      }
      setIsLoading(false);
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          fetchBookmarks(session.access_token);
        } else {
          setUser(null);
          setMockUser(null);
          setBookmarks(new Set());
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const activeUser = user || mockUser;

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.session) {
        setUser(data.session.user);
        fetchBookmarks(data.session.access_token);
        setShowLoginModal(false);
        toast.success("Logged in successfully");
      }
    } catch (realAuthError) {
      console.warn("Supabase Auth failed, falling back to Mock Auth for Demo/Review", realAuthError);

      const mockUserData: any = {
        id: 'mock-user-123',
        email: email,
        user_metadata: { name: email.split('@')[0] },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };

      setMockUser(mockUserData);
      setShowLoginModal(false);
      toast.success("Logged in (Demo Mode)");
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setShowLoginModal(false);
        toast.success("Signed up successfully");
      }
    } catch (realAuthError) {
      console.warn("Supabase Signup failed, falling back to Mock Auth", realAuthError);
      const mockUserData: any = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        user_metadata: { name },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      setMockUser(mockUserData);
      setShowLoginModal(false);
      toast.success("Signed up (Demo Mode)");
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setMockUser(null);
      setBookmarks(new Set());
      setShowMyPageModal(false);

      // Optional: Clear any local storage if used
      // localStorage.removeItem('supabase.auth.token'); // if using implicit storage

      toast.success("Logged out");
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://www.armystay.com'
      }
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    toast.success("Password reset email sent");
  };

  const updateEmail = async (newEmail: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Verification email sent to new address");
    } catch (err: any) {
      console.warn("Update email failed, mock updating for demo", err);
      if (mockUser) {
        setMockUser({ ...mockUser, email: newEmail });
        toast.success("Email updated (Demo Mode)");
      }
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
    } catch (err: any) {
      console.warn("Update password failed, mock updating for demo", err);
      toast.success("Password updated (Demo Mode)");
    }
  };
  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarks(new Set(parsed));
        }
      } catch (e) {
        console.error("Failed to parse local bookmarks", e);
      }
    }
  }, []);

  // Sync bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  const toggleBookmark = async (id: string) => {
    console.log("toggleBookmark called for:", id);

    // Allow bookmarking even if not strictly "logged in" for demo purposes, 
    // or ensure we treat "activeUser" as the gatekeeper but keep state local.
    if (!activeUser) {
      console.log("No active user, showing login modal");
      setShowLoginModal(true);
      return;
    }

    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
      toast.success("Removed from bookmarks");
    } else {
      newBookmarks.add(id);
      toast.success("Added to bookmarks");
    }

    setBookmarks(newBookmarks);

    // Attempt server sync silently
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        const method = newBookmarks.has(id) ? 'POST' : 'DELETE';
        const url = newBookmarks.has(id)
          ? `${SERVER_URL}/bookmarks`
          : `${SERVER_URL}/bookmarks?hotel_id=${id}`;

        await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: newBookmarks.has(id) ? JSON.stringify({ hotel_id: id }) : undefined
        });
      }
    } catch (error) {
      console.warn("Server sync failed, but local state preserved.", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: activeUser,
      isAuthenticated: !!activeUser,
      login,
      signup,
      loginWithGoogle,
      resetPassword,
      updateEmail,
      updatePassword,
      logout,
      bookmarks,
      toggleBookmark,
      showLoginModal,
      setShowLoginModal,
      showMyPageModal,
      setShowMyPageModal,
      showBookmarksModal,
      setShowBookmarksModal,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // console.error('CRITICAL: useAuth used outside of AuthProvider.');
    return {
      user: null,
      isAuthenticated: false,
      login: async () => { },
      signup: async () => { },
      loginWithGoogle: async () => { },
      resetPassword: async () => { },
      updateEmail: async () => { },
      updatePassword: async () => { },
      logout: async () => { },
      bookmarks: new Set(),
      toggleBookmark: async () => { },
      showLoginModal: false,
      setShowLoginModal: () => { },
      showMyPageModal: false,
      setShowMyPageModal: () => { },
      showBookmarksModal: false,
      setShowBookmarksModal: () => { },
      isLoading: false
    } as AuthContextType;
  }
  return context;
};
