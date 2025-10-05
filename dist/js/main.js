var headerMargin = 0;

function sizeBg() {
  var bg = document.getElementsByClassName("body-img")[0];
  var introHeight = window.getComputedStyle(
    document.getElementById("intro")
  ).height;
  introHeight = parseInt(introHeight.substring(0, introHeight.length - 2));
  var header = document.getElementsByTagName("header")[0];
  var headerHeight = window.getComputedStyle(header).height;
  headerHeight = parseInt(headerHeight.substring(0, headerHeight.length - 2));

  var headerMargin = window.getComputedStyle(header).marginTop; //for tablets
  headerMargin = parseInt(headerMargin.substring(0, headerMargin.length - 2));

  var totalHeight = introHeight + headerHeight + headerMargin;
  bg.style.height = totalHeight + "px";
}

function resizeIntroDiv() {
  intro = document.getElementById("intro");
  if (intro != null) {
    header = document.getElementsByTagName("header")[0];
    headerMargin = window.getComputedStyle(header).marginTop;
    headerMargin = headerMargin.substring(0, headerMargin.length - 2);
    headerHeight = window.getComputedStyle(header).height;
    headerHeight = headerHeight.substring(0, headerHeight.length - 2);

    setIntroDivHeight(intro, window.innerHeight - headerMargin - headerHeight);
  }
}

var vidRatio = 16 / 9;
function resizeBgVideo() {
  var vid = document.getElementById("hero-share-video") || document.getElementById("share-video");
  if (vid != null) {
    var pageHeight = window.innerHeight;
    var pageWidth = window.innerWidth;
    if (pageWidth / pageHeight > vidRatio) {
      // ratio is wider than 16:9
      vid.style.width = "100%";
      vid.style.height = "auto";
      vid.style.marginLeft = "0";
    } else {
      var widthOfVideoAtHeight = pageHeight * vidRatio;
      var videoOverflow = widthOfVideoAtHeight - pageWidth;
      vid.style.width = "auto";
      vid.style.height = "100%";
      vid.style.marginLeft = -(videoOverflow / 2) + "px";
    }
  }
}

function setIntroDivHeight(div, height) {
  div.style.height = height + "px";
}

greetings = [
  "Hi",
  "Hello",
  "Greetings",
  "👋",
  "你好",
  "Hallå där",
  "Bonjour",
  "Hola",
  "Hallo",
];

function changeGreeting() {
  //for a later time
}

const pictures = document.querySelectorAll('[light-box]');
const state = { open: false };
let modalPic = null;
let placeholder = null;
pictures.forEach(picture => {
  picture.addEventListener('click', event => {
    if (!state.open) {
      lightboxImage(picture);
    }
  })
})


function lightboxImage(picture) {
  modalPic = picture.querySelector('img');
  modalPic.style.viewTransitionName = '--light-box-img';

  function mutate() {
    lightbox.innerHTML = picture.querySelector(':scope img').outerHTML;

    placeholder = placeholdImage(modalPic);
    modalPic.parentElement.appendChild(placeholder);
    modalPic.style.display = 'none';

    lightbox.showModal();
  }
  document.startViewTransition(mutate);
}

async function hideLightbox() {
  function mutate() {
    lightbox.close();
    modalPic.parentElement.removeChild(placeholder);
    modalPic.style.display = null;

    modalPic.style.viewTransitionName = null;
    lightbox.innerHTML = '';
  }

  await document.startViewTransition(mutate).updateCallbackDone;


  modalPic = null;
  placeholder = null;
}

function placeholdImage(img) {
  let placeholder = document.createElement('div')
  placeholder.style.width = img.clientWidth + 'px'
  placeholder.style.height = img.clientHeight + 'px'
  return placeholder
}

lightbox.addEventListener('beforetoggle', event => {
  if (event.newState === 'closed') {
    hideLightbox();
  }
  state.open = event.newState === 'open';
});

lightbox.addEventListener('click', function (event) {
  var rect = lightbox.getBoundingClientRect();
  var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
  if (!isInDialog) {
    hideLightbox();
  }
});