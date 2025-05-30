export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.warn('Toast container not found. Creating one.');
    const newContainer = document.createElement('div');
    newContainer.id = 'toast-container';
    document.body.appendChild(newContainer);
    return showToast(message, type, duration); // Retry with new container
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;

  // Apply type-specific styling
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#10B981'; // Tailwind green-500
      break;
    case 'error':
      toast.style.backgroundColor = '#EF4444'; // Tailwind red-500
      break;
    case 'warning':
      toast.style.backgroundColor = '#F59E0B'; // Tailwind amber-500
      break;
    case 'info':
    default:
      toast.style.backgroundColor = '#3B82F6'; // Tailwind blue-500
      break;
  }
  
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode === container) { // Check if still child before removing
          container.removeChild(toast);
      }
    });
  }, duration);
}
