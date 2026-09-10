export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string;
  location: string | null;
  website: string | null;
  is_verified: boolean;
  is_premium: boolean;
  badge_hacker: boolean;
  badge_star: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[];
  media_type: string;
  song_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  profiles?: Profile;
  is_liked?: boolean;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  text_overlay: string | null;
  background_color: string | null;
  expires_at: string;
  created_at: string;
  profiles?: Profile;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
  other_participant?: Profile | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string;
  file_name: string | null;
  file_size: number | null;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface AIConversation {
  id: string;
  user_id: string;
  model: string;
  lola_mode: string | null;
  title: string | null;
  created_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  is_code: boolean;
  code_language: string | null;
  media_url: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  category: string;
  is_paid: boolean;
  price: number;
  pdf_url: string;
  cover_url: string | null;
  views_count: number;
  likes_count: number;
  created_by: string | null;
  created_at: string;
  is_favorite?: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface YouTuber {
  id: string;
  name: string;
  channel_id: string;
  subscribers: number;
  video_count: number;
  country: string;
  category: string;
  thumbnail: string;
  description: string;
}

export interface TikToker {
  id: string;
  name: string;
  username: string;
  followers: number;
  video_count: number;
  country: string;
  thumbnail: string;
  description: string;
}
