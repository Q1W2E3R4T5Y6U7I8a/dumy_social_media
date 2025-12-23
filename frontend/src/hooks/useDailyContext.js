import { useState, useEffect } from 'react';
import quotes from '../data/quotes.json';

const useDailyContent = () => {
  const [dayCount, setDayCount] = useState(1);
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    setDayCount(day);

    const quoteIndex = day % quotes.length;
    const selectedQuote = quotes[quoteIndex];
    setQuote(selectedQuote.text || '');
    setAuthor(selectedQuote.author || ''); 

    // tu pourrait changer l'id du l'image si tu veux correspondant pour chaque jour, id du citation
    //const imageId = (day % 366) + 1;
    const imageId = Math.floor(Math.random() * 1000) + 1;
    const imageUrl = `https://picsum.photos/id/${imageId}/1024/1024`;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      setBackgroundImage(imageUrl);
      setIsLoading(false);
    };

    img.onerror = () => {
      setBackgroundImage('https://picsum.photos/id/1/1024/1024');
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  return { 
    dayCount, 
    quote, 
    author,
    backgroundImage,
    isLoading 
  };
};

export default useDailyContent;