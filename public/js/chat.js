const socket = io();

/* ELEMENTS TO USE */
const $msgForm = document.querySelector('#msg-form');
const $msgFormIn = $msgForm.querySelector('input');
const $msgFormBtn = $msgForm.querySelector('button');
const $sendLocBtn = document.querySelector('#send-loc');
const $msgs = document.querySelector('#msgs');
const $lockBtn = document.querySelector('#lock');

/* TEMPLATES */
/*innerHTML property is for html elements and we want it for html contained inside for our template(this comment need to be removed)*/
const msgTemplate = document.querySelector('#msg-template').innerHTML;
const locTemplate = document.querySelector('#loc-template').innerHTML;
const sdbrTemplate = document.querySelector('#sidebar-template').innerHTML;

/* OPTIONS */
/*object is returned that has keyname as property and value in querystring 
parse takes the querystring(location.search)*/
const { username, room } = Qs.parse(
  location.search /*QS*/,
  { ignoreQueryPrefix: true } /*OptionsObj(default-false) removes'?'*/
);

const autoscroll = () => {
  //NEW MESSAGE ELEMENT
  /*lastElementChild property is gonna grab the last element as a child which is new msgs*/
  const $newMsg = $msgs.lastElementChild;

  // HEIGHT OF THE NEW MESSAGE
  /*global getComputedStyle which is made available to us by browser
  This functions get the styles set so when styling gets updated it won't broke the code
  To get the margin bottom value of new msg*/
  const newMsgStyles = getComputedStyle($newMsg);
  /*convert style(in px) to number to pass that to offsetHeight*/
  const newMsgMargin = parseInt(newMsgStyles.marginBottom);
  const newMsgHeight = $newMsg.offsetHeight + newMsgMargin;

  // VISIBLE HEIGHT(visible in screen)
  const visibleHeight = $msgs.offsetHeight;

  // HEIGHT OF MESSAGES CONTAINER
  /*scrollHeight is the total height we're able to scroll through*/
  const containerHeight = $msgs.scrollHeight;

  // HOW FAR HAVE I SCROLLED?
  /*scrollTop gives the amount of distance we've scrolled from the top as a number
  OR the distance between the top of the content and the top of the scrollbar
  + scrollbar's height = visibleHeight*/
  const scrollOffset = $msgs.scrollTop + visibleHeight;

  // TO FIGURE OUT WHETHER TO SCROLL TO THE BOTTOM OR NOT(IF WE ARE SCROLLING UP)
  /*this should be determined before the new msg was added in 
  scrollOffset = bottom*/
  if (containerHeight - newMsgHeight <= scrollOffset) {
    // are we at the bottom when new msg arrives? yes then scroll down else no scrolling
    $msgs.scrollTop = $msgs.scrollHeight;
  }
};

socket.on('message', message => {
  console.log(message);
  const html = Mustache.render(msgTemplate, {
    // key:value-> key will be things accessing in template here message
    /*this data will be passed to template and dynamic messages is done...*/
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  /*insertAdjac... method allows us to insert other html adjacent to the elements we've selected in this case #msgs*/
  $msgs.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('locMessage', message => {
  console.log(message);
  const html = Mustache.render(locTemplate, {
    username: message.username,
    location: message.url,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });

  $msgs.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sdbrTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$msgForm.addEventListener('submit', e => {
  e.preventDefault();
  // disable
  /*disables form once it is submitted */
  $msgFormBtn.setAttribute(
    'disabled' /*attributeName*/,
    'disabled' /*attributeValue*/
  );
  /*e.target to get the form then 
.elements to get that particular elements*/
  const msg = e.target.elements.msg.value;
  //const msg = document.querySelector('msg').value;
  /*syntax to acknowledge:
  socket.emit('sendMessage', data1, data2,..., ackowledged event) */
  socket.emit('sendMessage', msg, error => {
    /*This is going to run when the event is acknowledged */
    /*An acknologement is the client getting notified that the event was received and processed 
    and the code that's going to run is provided as the last argument to emit. */
    // enable
    $msgFormBtn.removeAttribute('disabled' /*attributeName*/);
    $msgFormIn.value = '';
    $msgFormIn.focus();

    if (error) {
      // return
      console.log(error);
      alert(error);
    }

    console.log('Message delivered!!');
  });
});

$sendLocBtn.addEventListener('click', () => {
  /*if navigator.geolocation exists then users
   have support for these if this doesn't exists 
   then they don't have support for it*/
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!!');
  }

  /*getCurrentPosition is an asynchronous, it 
  takes a little time to get the location, it 
  currently doesn't support the promise API.
   so promises or async await can't be used*/
  /*position object contains the info we wanna share */
  $sendLocBtn.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocBtn.removeAttribute('disabled');
        console.log('Location shared!!');
      }
    );
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = 'room.html';
  }
});

/*Lock Function*/
$lockBtn.addEventListener('click', () => {
  let btnText = $lockBtn.textContent.toString();
  console.log(btnText);
  $lockBtn.setAttribute('disabled', 'disabled');
  socket.emit('lock', btnText, () => {
    $lockBtn.removeAttribute('disabled');
  });
});

socket.on('lockedStateChanged', state => {
  console.log('state: ', state);
  if (state) {
    $lockBtn.textContent = 'Unlock';
  } else {
    $lockBtn.textContent = 'Lock';
  }
});
