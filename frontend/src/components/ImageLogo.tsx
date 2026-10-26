import React from "react";

interface ImageLogoProps {
  src?: string; // Allow dynamic images
  alt?: string; // Custom alt text
  size?: number;
  className?: string;
}

export const ImageLogo: React.FC<ImageLogoProps> = ({ 
  src = "/logo_black_crop.png", // Default image 
  alt = "Logo", 
  size = 50, 
  className 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
};
