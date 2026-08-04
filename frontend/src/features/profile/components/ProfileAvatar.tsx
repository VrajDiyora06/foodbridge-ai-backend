import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onAvatarChange?: (url: string) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  avatarUrl,
  size = 'lg',
  editable = false,
  onAvatarChange,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-28 h-28 text-3xl',
  }[size];

  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  const handleFilePrompt = () => {
    const newUrl = prompt('Enter Image URL for Avatar:', avatarUrl || '');
    if (newUrl && onAvatarChange) {
      onAvatarChange(newUrl);
    }
  };

  return (
    <div className="relative inline-block shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses} rounded-full object-cover border-4 border-white shadow-md`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black flex items-center justify-center border-4 border-white shadow-md`}
        >
          {getInitials(name || 'User')}
        </div>
      )}

      {editable && (
        <button
          type="button"
          onClick={handleFilePrompt}
          className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-full shadow-lg border-2 border-white transition-all cursor-pointer"
          title="Change Avatar URL"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
