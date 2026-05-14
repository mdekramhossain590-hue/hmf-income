import { MessageCircle, Video } from 'lucide-react';

export const JOBS = [
  { id: 1, title: 'FB Like', type: 'Social Task', reward: 5, icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-100', link: 'https://facebook.com', description: 'Like our facebook page in the link below and submit a screenshot.' },
  { id: 2, title: 'Subscribe', type: 'Micro Job', reward: 10, icon: Video, color: 'text-red-500', bg: 'bg-red-100', link: 'https://youtube.com', description: 'Subscribe to our YouTube channel.' },
  { id: 3, title: 'Share Post', type: 'Social Task', reward: 3, icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-100', link: 'https://facebook.com', description: 'Share our latest post publicly.' },
  { id: 4, title: 'Comment', type: 'Micro Job', reward: 2, icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-100', link: 'https://instagram.com', description: 'Leave a positive comment on our post.' },
  { id: 5, title: 'App Install', type: 'Installation', reward: 15, icon: Video, color: 'text-orange-500', bg: 'bg-orange-100', link: 'https://play.google.com', description: 'Install the app and submit your username.' },
];
