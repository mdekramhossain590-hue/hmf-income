export const playTapSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

export const playSuccessSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

export const playErrorSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};
