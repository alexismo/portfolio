const pictures = document.querySelectorAll('[light-box]');
const state = { open: false };
let modalPic = null;
let placeholder = null;
pictures.forEach((picture, i) => {

  picture.querySelector('img').style.viewTransitionName = `--light-box-img-${i}`;

  picture.addEventListener('click', event => {
    if (!state.open) {
      lightboxImage(picture);
    }
  })
})


function lightboxImage(picture) {
  modalPic = picture.querySelector('img');

  function mutateOpen() {

    document.styleSheets[0].insertRule(`
      ::view-transition-group(${modalPic.style.viewTransitionName}) {z-index: 2;}
    `);

    const clone = picture.querySelector(':scope img').cloneNode(true);
    clone.sizes = "100vw";
    lightbox.innerHTML = '';
    lightbox.appendChild(clone);

    placeholder = placeholdImage(modalPic);
    modalPic.parentElement.appendChild(placeholder);
    modalPic.style.display = 'none';

    lightbox.showModal();
  }
  document.startViewTransition(mutateOpen);
}

async function hideLightbox() {
  function mutateClose() {
    placeholder.remove();
    modalPic.style.display = null;

    lightbox.innerHTML = '';
    lightbox.close();
  }

  await document.startViewTransition(mutateClose).finished.then(() => {
    document.styleSheets[0].deleteRule(0);
  });

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

if ('closedBy' in HTMLDialogElement.prototype === false) {
  lightbox.addEventListener('click', function (event) {
    var rect = lightbox.getBoundingClientRect();
    var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    if (!isInDialog) {
      hideLightbox();
    }
  });
}