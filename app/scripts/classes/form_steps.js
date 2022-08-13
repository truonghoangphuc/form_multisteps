import { convertNodeListToArray, insertAfter, getSelectors } from './utilities';

const _prevSteps = (instance) => {
  let _active = instance.data.active;
  
  if (_active > 0) {
    const _activeStep = instance.elements.steps[_active];

    if (typeof instance.setting.events.beforePrevPage === 'function') instance.setting.events.beforePrevPage(instance);

    _activeStep.classList.remove('show');
    instance.elements.steps[_active-1].classList.add('show');
    instance.data.active--;

    if (typeof instance.setting.events.afterPrevPage === 'function') instance.setting.events.afterPrevPage(instance);
  }
}

const _nextSteps = (instance) => {
  let _active = instance.data.active;
  
  if (_active < instance.elements.steps.length - 1) {
    const _activeStep = instance.elements.steps[_active];

    if (typeof instance.setting.events.beforeNextPage === 'function') instance.setting.events.beforeNextPage(instance);

    _activeStep.classList.remove('show');
    instance.elements.steps[_active+1].classList.add('show');
    instance.data.active++;

    if (typeof instance.setting.events.afterNextPage === 'function') instance.setting.events.afterNextPage(instance);
  }
}

const _clickHandle = (instance, e) => {
  const _el = e.target;
  if (_el.classList.contains('btn-prev')) {
    e.preventDefault();
    e.stopPropagation();
    _prevSteps(instance);
  } else if (_el.classList.contains('btn-next')) {
    e.preventDefault();
    e.stopPropagation();
    _nextSteps(instance);
  } else if (_el.classList.contains('btn-reset')) {
    e.preventDefault();
    e.stopPropagation();
    location.reload();
  }
}

function _bindEvents(instance) {
  if (window.thpFormSteps !== undefined && window.thpFormSteps.length) {
    window.thpFormSteps.map((x) => {
      if (x.element === instance.elements.element) {
        instance.elements.element.removeEventListener('click', x.eventHandle);
        instance.elements.element.addEventListener('click', x.eventHandle);
      }
      return x;
    });
  } else {    
    instance.elements.element.addEventListener('click', e => _clickHandle(instance, e));
  }
}

function _bindPublicMethod(instance) {
  const obj = instance;

  obj.goNext = () => {
    _nextSteps(obj);
  };

  obj.goPrev = () => {
    _prevSteps(obj);
  };

  obj.destroy = () => {
    const _arr = [];
    window.thpFormSteps.map((x) => {
      if (x.element === obj.elements.element) {
        obj.elements.element.removeEventListener('click', x.eventHandle);
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.thpFormSteps = _arr;
  };

}

class FormSteps {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when current index instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-thp-steps]',
      events: {
        initialized() {},
        initializedAll() {},
        beforePrevPage() {},
        afterPrevPage() {},
        beforeNextPage() {},
        afterNextPage() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = getSelectors(setting.selector);

    if (window.thpFormSteps === undefined) window.thpFormSteps = [];
    els.map((x) => {
      const obj = {};
      const s = Object.assign({}, $this.setting, x.dataset || {});

      obj.setting = s;

      obj.elements = {
        element: x,
        steps: convertNodeListToArray(x.querySelectorAll('.form-steps__item'))
      };

      obj.data = {
        active: 0
      };

      _bindEvents(obj);
      _bindPublicMethod(obj);

      window.thpFormSteps.push({
        element: x,
        eventHandle: _clickHandle.bind(null, obj),
      });

      $this.instances.push(obj);

      if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
      return obj;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default FormSteps;