
import { useState, useRef } from "react";
import { Image, Smile, MapPin, Music, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/layout/AuthProvider";
import { getInitials } from "@/utils";
import { toast } from "sonner";

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 5) {
      toast.error("Maximum 5 fichiers");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      const mediaUrls: string[] = [];

      // Upload des médias
      for (const file of mediaFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("posts")
          .getPublicUrl(fileName);

        mediaUrls.push(publicUrl);
      }

      // Créer le post
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim() || null,
        media_urls: mediaUrls,
        media_type: mediaUrls.length > 0 ? (mediaUrls.length > 1 ? "mixed" : fileType(mediaFiles[0])) : "text",
      });

      if (error) throw error;

      toast.success("Publication créée !");
      setContent("");
      setMediaFiles([]);
      setMediaPreviews([]);
      onPostCreated();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la publication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileType = (file: File): string => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "mixed";
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-3">
      <div className="glass-card p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">{getInitials(user?.display_name || "M")}</span>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              className="w-full bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none min-h-[60px]"
              rows={2}
            />
          </div>
        </div>

        {/* Prévisualisation des médias */}
        {mediaPreviews.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={preview}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-white/5 text-green-400 transition-all"
            >
              <img className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-yellow-400 transition-all">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-red-400 transition-all">
              <MapPin className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-purple-400 transition-all">
              <Music className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Publier
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
