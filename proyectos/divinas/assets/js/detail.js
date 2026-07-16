document.addEventListener('DOMContentLoaded', () => {
  const photo = document.getElementById('kitPhoto');
  const lightbox = document.getElementById('lightbox');
  if (photo && lightbox) {
    photo.addEventListener('click', () => lightbox.classList.add('active'));
    lightbox.addEventListener('click', () => lightbox.classList.remove('active'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('active');
    });
  }
});
