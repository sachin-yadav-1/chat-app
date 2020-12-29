const socket = io();

// DOM ELEMENTS
const msgForm = document.getElementById('msg-form');
const msgInput = document.getElementById('msg-input');
const btnMsgSend = document.getElementById('msg-send');
const btnSendLocation = document.getElementById('send-location');
const msgContainer = document.getElementById('msg-container');

// Templates
const msgTemplate = document.getElementById('msg-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // New Msg Element
  const newMessage = msgContainer.lastElementChild;

  // Height of New Message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom, 10);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = msgContainer.offsetHeight;

  // Height of messages container
  const containerHeight = msgContainer.scrollHeight;

  // How far I scrolled?
  const scrollOffset = msgContainer.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
};

// Event Listeners
// Text Message
socket.on('message', (msg) => {
  // Mustache allows us to render html dynamically
  // Mustache file is included in html file
  // render method is called using 2 args:
  // 1. Message template that we set in our html in script tag
  // 2. Object with all the values that we want to access in out html
  const html = Mustache.render(msgTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('hh:mm a'),
  });

  msgContainer.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

// Location Message
socket.on('locationMessage', (msg) => {
  const html = Mustache.render(locationTemplate, {
    username: msg.username,
    locationLink: msg.url,
    createdAt: moment(msg.createdAt).format('hh:mm a'),
  });

  msgContainer.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

// Send Message
msgForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Disable until the message is sent
  btnMsgSend.setAttribute('disabled', 'disabled');

  // Get input message
  const message = msgInput.value;

  // Emit and event to send location
  // Callback function for acknowledgments
  // Server will recieve this callback function and call it to acknowledge
  socket.emit('sendMessage', message, (err) => {
    // Re-enable
    btnMsgSend.removeAttribute('disabled');

    // Clear and set focus
    msgInput.value = '';
    msgInput.focus();

    if (err) {
      return console.log(err);
    }
  });
});

// Send Location
btnSendLocation.addEventListener('click', () => {
  // Temporarily Disable btn
  btnSendLocation.setAttribute('disabled', 'disabled');

  // If geoLocation API is NOT supported in the browser
  if (!navigator.geolocation)
    return alert('Geolocation is not supported by your browser');

  // Get current coordinates from current position
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    // Emit and event to send location
    // Callback function for acknowledgments
    // Server will recieve this callback function and call it to acknowledge
    socket.emit('sendLocation', { latitude, longitude }, () => {
      // Re-enable btn
      btnSendLocation.removeAttribute('disabled');
    });
  });
});

// Join Chat
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

// On Room
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  document.getElementById('sidebar').innerHTML = html;
});
