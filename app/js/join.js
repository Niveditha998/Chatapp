// app/js/join.js
document.getElementById('join-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const room = document.getElementById('room').value.trim();
  if (!username || !room) return;

  // redirect with query params
  window.location.href = `/chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(room)}`;
});
