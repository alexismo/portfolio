const pictures = document.querySelectorAll('[light-box]');
const state = { open: false };
let modalPic = null;
let placeholder = null;

// Set unique viewTransitionName for each image
pictures.forEach((picture, i) => {
  const img = picture.querySelector('img');
  if (img) {
    img.style.viewTransitionName = `--light-box-img-${i}`;
  }

  picture.addEventListener('click', event => {
    if (!state.open) {
      lightboxImage(picture);
    }
  })
})


function lightboxImage(picture) {
  modalPic = picture.querySelector('img');
  const transitionName = modalPic.style.getPropertyValue('view-transition-name');

  function mutate() {
    // Add z-index rule to make transitioning element appear on top
    document.styleSheets[0].insertRule(
      `::view-transition-group(${transitionName}) { z-index: 3; }`
    );

    lightbox.innerHTML = picture.querySelector(':scope img').outerHTML;
    
    // Ensure the lightbox image has the same viewTransitionName as the original
    const lightboxImg = lightbox.querySelector('img');
    if (lightboxImg) {
      lightboxImg.style.viewTransitionName = transitionName;
    }

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
    // Restore element visibility first
    if (modalPic) {
      modalPic.style.display = null;
    }
    if (placeholder && placeholder.parentElement) {
      placeholder.parentElement.removeChild(placeholder);
    }

    // Then close and clear
    lightbox.innerHTML = '';
    lightbox.close();
  }

  if (document.startViewTransition) {
    await document.startViewTransition(mutate).updateCallbackDone;
  } else {
    mutate();
  }

  // Clean up the z-index rule
  if (document.styleSheets[0].cssRules.length > 0) {
    document.styleSheets[0].deleteRule(0);
  }

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