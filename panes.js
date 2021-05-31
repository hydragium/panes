// @hydragium/panes v0.0.1 | Nikola Stamatovic <nikola@otilito.com> | MIT
//TODO: refactor this 💩

import './polyfills.js';
import { hasClass, addClass, removeClass } from './utils.js';

export function Panes(params) {
  this.params = {};
  this.defaults = {
    pane_class: 'js-pane',
    pane_open_class: 'js-pane-open',
    pane_close_class: 'js-pane-close',
    pane_close_all_class: 'js-pane-close-all',
    data_source_class: 'js-pane-source',
    pane_id_attribute: 'data-pane-id',
    pane_body_class_prefix: 'js-pane-',
    data_fill_attribute: 'data-fill',
    data_source_attribute: 'data-source',
    show_next_item: true,
    pane_next_button_class: 'js-pane-next',
    pane_next_button_attribute: 'data-label-from-source',
    pane_next_button_label_class: 'js-pane-next-label',
    pane_animation_timeout: 550
  };

  this.__init__ = function() {
    this.parseParams(params);
    const self = this;

    function caseOpen(target, id) {
      if (!id) {
        id = target.getAttribute(self.params.pane_id_attribute);
      }

      if (!id) {
        return;
      }

      self.open(id, target);
    }

    function caseClose(target, id) {
      if (!id) {
        id = target.getAttribute(self.params.pane_id_attribute);
      }

      if (!id) {
        const pane = target.closest(`.${self.params.pane_class}`);
        id = pane.getAttribute('id');
      }

      self.close(id, true);
    }

    document.addEventListener('click', e => {
      const target = e.target;
      let id;

      if (target.nodeName === 'A') {
        id = target.getAttribute('href').replace(/^#/, '');
      }

      if (target.matches(`.${self.params.pane_open_class}`)) {
        e.preventDefault();
        caseOpen(target, id);
        return;
      }

      if (target.matches(`.${self.params.pane_close_class}`)) {
        e.preventDefault();
        caseClose(target, id);
        return;
      }

      if (target.matches(`.${self.params.pane_close_all_class}`)) {
        e.preventDefault();
        self.closeAll(true);
      }

      if (target.matches(`.${self.params.pane_next_button_class}`)) {
        e.preventDefault();
        id = target.closest(`.${self.params.pane_class}`).getAttribute('id');
        const old_target = document.querySelector(`[open][href="#${id}"],[open][${this.params.pane_id_attribute}="${id}"]`);
        const new_source = self.getNextSibling(old_target);

        if (!new_source) {
          self.close(id, true);
          return;
        }

        const new_target = new_source.querySelector(`.${self.params.pane_open_class}`);

        if (!new_target) {
          self.close(id, true);
          return;
        }

        self.close(id);

        setTimeout(function(){
          new_target.click();
        }, self.params.pane_animation_timeout);
      }
    }, false);
  }

  this.__init__();
}

Panes.prototype.parseParams = function(params) {
  if (!params) {
    this.params = this.defaults;
  } else {
    for (let k in this.defaults) {
      if (!params.hasOwnProperty(k)) {
        this.params[k] = this.defaults[k];
      }
    }
  }
};

Panes.prototype.closeAllOpenTargets = function(id) {
  const active_targets = document.querySelectorAll(`[open][href="#${id}"],[open][${this.params.pane_id_attribute}="${id}"]`);
  for (var i = 0; i < active_targets.length; i++) {
    const active_target = active_targets[i];
    active_target.removeAttribute('open');
  }
};

Panes.prototype.updateBodyClasses = function(id, remove) {
  if (remove) {
    removeClass(document.body, `${this.params.pane_body_class_prefix}-${id}`);
    removeClass(document.body, `${this.params.pane_body_class_prefix}-open`);
    return;
  }

  addClass(document.body, `${this.params.pane_body_class_prefix}-${id}`);
  addClass(document.body, `${this.params.pane_body_class_prefix}-open`);
};

Panes.prototype.getSourceFromTarget = function(target) {
  return target.closest(`.${this.params.data_source_class}`);
};

Panes.prototype.getNextSibling = function(target) {
  const source = this.getSourceFromTarget(target);

  let next_sibling = source.nextElementSibling;
  const items = source.parentElement.querySelectorAll(`.${this.params.data_source_class}`);

  if (!next_sibling) {
    if (items.length) {
      next_sibling = items[0];
    }
  }

  return next_sibling;
};

Panes.prototype.open = function(id, target) {
  const pane = document.getElementById(id);
  const source = this.getSourceFromTarget(target);
  target.setAttribute('open', '');

  if (source) {
    this.fill(pane, source);
  }

  if (this.params.show_next_item) {
    this.bindNext(pane, target);
  }

  pane.style.height = window.innerHeight; //cause iOS Safari bottom bar
  pane.setAttribute('open', '');
  this.updateBodyClasses(id);
  document.dispatchEvent(new Event('hydragium-disable-scroll'));
  pane.dispatchEvent(new Event('hydragium-pane-open'));
};

Panes.prototype.close = function(id, clear) {
  const pane = document.getElementById(id);
  pane.removeAttribute('open');
  pane.dispatchEvent(new Event('hydragium-pane-close'));

  if (clear) {
    this.updateBodyClasses(id, true);
    this.closeAllOpenTargets(id);
    document.dispatchEvent(new Event('hydragium-enable-scroll'));
  }
};

Panes.prototype.closeAll = function(clear) {
  const open_panes = document.querySelectorAll(`.${this.params.pane_class}[open]`);

  for (var i = 0; i < open_panes.length; i++) {
    const pane = open_panes[i];
    const id = pane.getAttribute('id');
    pane.removeAttribute('open');
    pane.dispatchEvent(new Event('hydragium-pane-close'));
    if (clear) {
      this.updateBodyClasses(id, true);
      this.closeAllOpenTargets(id);
    }
  }
  if (clear) {
    document.dispatchEvent(new Event('hydragium-enable-scroll'));
  }
};

// this was useful once
Panes.prototype.clear = function(pane) {
  const fields = pane.querySelectorAll(`[${this.params.data_fill_attribute}]`);

  if (!fields.length) {
    return;
  }

  for (var i = 0; i < fields.length; i++) {
    const field = fields[i];
    field.setAttribute('hidden', '');
  }
};

Panes.prototype.fill = function(pane, source) {
  if (!source) {
    return;
  }

  const fill_fields = pane.querySelectorAll(`[${this.params.data_fill_attribute}]`);
  const source_fields = source.querySelectorAll(`[${this.params.data_source_attribute}]`);

  if (!source_fields.length) {
    return;
  }

  var fill_map = {};

  for (var i = 0; i < fill_fields.length; i++) {
    const field = fill_fields[i];
    const field_name = field.getAttribute(this.params.data_fill_attribute);
    fill_map[field_name] = field;
  }

  var source_map = {};

  for (var i = 0; i < source_fields.length; i++) {
    var field = source_fields[i];
    var field_name = field.getAttribute(this.params.data_source_attribute);
    source_map[field_name] = field;
  }

  for (var field_name in fill_map) {
    var fill_field = fill_map[field_name];

    if (source_map.hasOwnProperty(field_name)) {
      var source_field = source_map[field_name];

      if (fill_field.nodeName === 'IMG') {
        fill_field.setAttribute('alt', source_field.getAttribute('alt'));
        fill_field.setAttribute('srcset', source_field.getAttribute('srcset'));
        fill_field.setAttribute('src', source_field.getAttribute('src'));
      } else if (fill_field.nodeName === 'A') {
        fill_field.setAttribute('href', source_field.getAttribute('href'));
        fill_field.setAttribute('target', source_field.getAttribute('target'));
        fill_field.innerHTML = source_field.innerHTML;
      } else {
        fill_field.innerHTML = source_field.innerHTML;
      }
      fill_field.removeAttribute('hidden');
    } else {
      fill_field.setAttribute('hidden', '');
    }
  }

  return source_map;
};

Panes.prototype.bindNext = function(pane, target) {
  const next_sibling = this.getNextSibling(target);
  const next_button = pane.querySelector(`.${this.params.pane_next_button_class}`);

  if (!next_sibling || !next_button) {
    next_button.remove();
    return;
  }

  const label_hook = next_button.getAttribute(`${this.params.pane_next_button_attribute}`);
  const label_value_element = next_sibling.querySelector(`[${this.params.data_source_attribute}="${label_hook}"]`);

  let dest = next_button.querySelector(`.${this.params.pane_next_button_label_class}`);
  if (!dest) {
    dest = next_button;
  }

  dest.innerHTML = label_value_element.innerHTML;
};
