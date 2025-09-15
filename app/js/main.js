// app/js/main.js
const socket = io();

const joinScreen = document.getElementById('join-screen');
const joinForm = document.getElementById('join-form');
const chatScreen = document.getElementById('chat-screen');
const messagesEl = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const typingEl = document.getElementById('typing');
const userListEl = document.getElementById('user-list');

let username, room;

joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  username = document.getElementById('username').value.trim();
  room = document.getElementById('room').value.trim();
  if (!username || !room) return;

  // hide join, show chat
  joinScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');

  socket.emit('joinRoom', { username, room });
});

// Receive message history
socket.on('messageHistory', (history) => {
  history.forEach(renderMessage);
  scrollToBottom();
});

// submit chat
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  socket.emit('chatMessage', text);
  input.value = '';
  socket.emit('typing', false);
});

// typing
input.addEventListener('input', () => {
  const isTyping = input.value.length > 0;
  socket.emit('typing', isTyping);
});

// receive messages
socket.on('message', (msg) => {
  renderMessage(msg);
  scrollToBottom();
});

// typing indicator
socket.on('typing', (data) => {
  typingEl.textContent = data.isTyping ? `${escapeHtml(data.user)} is typing...` : '';
});

// update user list
socket.on('roomUsers', (users) => {
  userListEl.innerHTML = '';
  users.forEach((u) => {
    const li = document.createElement('li');
    li.textContent = u.username;
    userListEl.appendChild(li);
  });
});

// helpers
function renderMessage(msg) {
  const li = document.createElement('li');
  li.className = 'message';
  const time = new Date(msg.time).toLocaleTimeString();
  li.innerHTML = `<span class="meta">${escapeHtml(msg.user)} <small>${time}</small></span>
                  <p class="text">${escapeHtml(msg.text)}</p>`;
  messagesEl.appendChild(li);
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}
