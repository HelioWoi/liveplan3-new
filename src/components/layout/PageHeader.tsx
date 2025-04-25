import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMoreOptions?: boolean;
  onMoreClick?: () => void;
}

// Define colors based on the image for easy reuse and modification
const headerColors = {
  background: 'bg-[#312075]', // Deep purple from the image background
  text: 'text-white',
  accent: '#7C3AED', // Brighter purple accent (like the button in the image)
  accentHoverBg: 'hover:bg-[#7C3AED]/20', // Accent color with low opacity for hover
};

export default function PageHeader({
  title,
  showBackButton = true,
  showMoreOptions = false,
  onMoreClick
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    // Main header container: Apply background, text color, and optional bottom rounding/shadow
    <div className={`${headerColors.background} ${headerColors.text} rounded-b-2xl shadow-lg`}>
      {/* 
        Padding container. 
        NOTE: Consider adding top padding for the status bar ('pt-safe' if using safe-area utilities, or adjust pt value).
        Using pt-6 pb-4 for a balanced look.
      */}
      <div className="px-4 pt-6 pb-4">
        {/* Flex container for aligning items */}
        <div className="flex items-center justify-between h-10"> {/* Added fixed height for consistency */}
          
          {/* Back Button */}
          {showBackButton ? (
            <button
              onClick={() => navigate(-1)}
              // Style: padding, rounded, transition, and accent hover effect
              className={`p-2 ${headerColors.accentHoverBg} rounded-full transition-colors duration-200 ease-in-out`}
              aria-label="Go back" // Accessibility improvement
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          ) : (
            // Placeholder div to maintain title centering when back button is hidden
            <div className="w-10 h-10"></div> // Matches button size (p-2 * 2 + icon width)
          )}
          
          {/* Title: Centered, bold, slightly smaller for typical mobile header, truncates long text */}
          <h1 className="text-xl font-semibold text-center flex-grow mx-2 truncate">
            {title}
          </h1>
          
          {/* More Options Button */}
          {showMoreOptions ? (
            <button
              onClick={onMoreClick}
               // Style: padding, rounded, transition, and accent hover effect
              className={`p-2 ${headerColors.accentHoverBg} rounded-full transition-colors duration-200 ease-in-out`}
              aria-label="More options" // Accessibility improvement
            >
              <MoreVertical className="h-6 w-6" />
            </button>
          ) : (
             // Placeholder div to maintain title centering when more options are hidden
             <div className="w-10 h-10"></div> // Matches button size
          )}
        </div>
      </div>
    </div>
  );
}

// --- Tailwind CSS Color Notes ---
// If you haven't configured these specific hex codes in your tailwind.config.js,
// Tailwind JIT (Just-In-Time) mode will generate them automatically.
// If you're not using JIT mode or prefer named colors, you might add them to your config:
/*
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'header-purple': '#312075',
        'header-accent': '#7C3AED',
      },
    },
  },
  // ... other config
}

// Then you could use:
// bg-header-purple, text-white, hover:bg-header-accent/20 
*/
