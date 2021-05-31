// @hydragium/utils | Nikola Stamatovic <nikola@otilito.com> | MIT

export function hasClass(element, className) {
  if (element.classList) {
    return element.classList.contains(className);
  }
  return new RegExp('\\b'+ className+'\\b').test(element.className);
}

export function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
    return;
  }

  if (!hasClass(element, className)) {
    element.className += ' ' + className;
  }
}

export function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
    return;
  }

  element.className = element.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
}

export function toogleClass(element, className) {
  if (hasClass(element, className)) {
    removeClass(element, className);
  } else {
    addClass(element, className);
  }
}

export function intersectionObserver(elements, onIntersecting, threshold) {
  if (threshold === undefined || threshold === null) {
    threshold = 0.01;
  }

  if (window.hasOwnProperty('IntersectionObserver')) {
    const observer = new IntersectionObserver((entries, observer) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        if (entry.isIntersecting) {
          if (onIntersecting) {
            onIntersecting(entry);
          }
        }
      }
    }, {
      threshold: threshold
    });

    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      observer.observe(elem);
    }
    return observer;
  }
  return null;
}
