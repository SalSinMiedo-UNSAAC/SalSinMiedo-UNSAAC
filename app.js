document.addEventListener('DOMContentLoaded', () => {
  // Navigation interaction
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Upload button simulation
  const uploadBtn = document.querySelector('.upload .btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      alert('Simulando análisis de documento... (Característica MVP)');
      uploadBtn.innerText = 'Analizando...';
      setTimeout(() => {
        uploadBtn.innerText = 'Documento Válido ✅';
        uploadBtn.style.background = '#12b886';
      }, 1500);
    });
  }
});
