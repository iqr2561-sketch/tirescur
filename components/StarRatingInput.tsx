import React from 'react';

interface StarRatingInputProps {
  value: number;
  onChange: (newValue: number) => void;
  maxStars?: number;
  ariaLabel?: string;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  maxStars = 5,
  ariaLabel = 'Valoración del producto',
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | undefined>(undefined);

  const handleClick = (starIndex: number) => {
    onChange(starIndex + 1);
  };

  const handleMouseEnter = (starIndex: number) => {
    setHoverValue(starIndex + 1);
  };

  const handleMouseLeave = () => {
    setHoverValue(undefined);
  };

  const displayValue = hoverValue !== undefined ? hoverValue : value;

  return (
    <div className="flex items-center" role="slider" aria-label={ariaLabel} aria-valuenow={value} aria-valuemin={0} aria-valuemax={maxStars}>
      {[...Array(maxStars)].map((_, i) => (
        <svg
          key={i}
          className={`h-6 w-6 cursor-pointer transition-colors duration-150 ${
            displayValue > i ? 'text-yellow-400' : 'text-gray-300'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          role="option"
          aria-selected={displayValue > i}
          aria-label={`${i + 1} estrellas`}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRatingInput;