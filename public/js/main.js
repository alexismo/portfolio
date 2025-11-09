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
  
  if (document.startViewTransition) {
    document.startViewTransition(mutate);
  } else {
    mutate();
  }
}

async function hideLightbox() {
  function mutate() {
    lightbox.close();
    modalPic.parentElement.removeChild(placeholder);
    modalPic.style.display = null;

    lightbox.innerHTML = '';
  }

  if (document.startViewTransition) {
    await document.startViewTransition(mutate).updateCallbackDone;
  } else {
    mutate();
  }

  modalPic.style.viewTransitionName = null;
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