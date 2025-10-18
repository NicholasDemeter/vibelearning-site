import { useState, useEffect } from 'react';
import { contentManager, ContentStyle } from '@/lib/contentManager';

export const useContentStyle = () => {
  const [styles, setStyles] = useState<Record<string, ContentStyle>>({});

  useEffect(() => {
    const loadStyles = async () => {
      const content = await contentManager.getContent();
      const styleMap: Record<string, ContentStyle> = {};
      
      content.forEach(item => {
        if (item.style) {
          styleMap[item.key] = item.style;
        }
      });
      
      setStyles(styleMap);
    };
    
    loadStyles();

    // Listen for content updates
    const handleUpdate = () => loadStyles();
    window.addEventListener('contentUpdated', handleUpdate);
    
    return () => window.removeEventListener('contentUpdated', handleUpdate);
  }, []);

  const getStyle = (key: string): React.CSSProperties | undefined => {
    const style = styles[key];
    if (!style) return undefined;
    
    return {
      color: style.color,
      fontSize: style.fontSize,
      textAlign: style.textAlign as any,
      fontWeight: style.fontWeight,
    };
  };

  return { getStyle };
};
