// In a real scenario, these would be different imports.
// For now, ensuring we have the imports.
import botMain from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import botDetective from '@/assets/1c413bccac94a45a38e7dde790a3aa8c525d334b.png'; 
import botMapa from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png'; 

export const getBotIcon = (key: string): string => {
  const icons: Record<string, string> = {
    'bot_mapa': botMapa,
    'bot_detective': botDetective, // Now points to the specific detective image
    'bot_judge': botDetective,     // Mapping judge to detective if they share the role visually
    'bot_default': botMain,
    'bot_profile': botMain
  };
  return icons[key] || botMain;
};
