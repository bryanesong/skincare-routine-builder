'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from "./ui/button"

export default function ShareButton({ shareableId }: { shareableId: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleShare = () => {
    //this works even with localhost or if you are on a live browser
    const url = `${window.location.origin}/builds/${shareableId}`;
    
    // Try to use the Web Share API first if available
    if (navigator.share) {
      navigator.share({
        title: 'Check out this skincare routine',
        url: url
      }).catch(err => {
        // Fallback to clipboard if sharing fails
        copyToClipboard(url);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(url);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show "Copied!" state
        setCopied(true);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="lg" 
      className={`flex-1 transition-colors ${copied ? 'bg-green-100 text-green-700' : 'hover:text-green-500'}`}
      onClick={handleShare}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="h-5 w-5 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </>
      )}
    </Button>
  );
} 