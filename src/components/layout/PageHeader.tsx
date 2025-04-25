import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMoreOptions?: boolean;
  onMoreClick?: () => void;
}

export default function PageHeader({
  title,
  showBackButton = true,
  showMoreOptions = false,
  onMoreClick
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 w-full px-4 py-4 shadow-md bg-[#1A0B3E] text-white">
      <div className="flex items-center justify-between">
        {/* Back Button Area */}
        {showBackButton ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full transition-colors duration-200 ease-in-out hover:bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {/* Title */}
        <h1 className="text-xl font-semibold truncate px-2">
          {title}
        </h1>

        {/* More Options Button Area */}
        {showMoreOptions ? (
          <button
            onClick={onMoreClick}
            className="p-2 rounded-full transition-colors duration-200 ease-in-out hover:bg-white/10"
            aria-label="More options"
          >
            <MoreVertical className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  );
}

