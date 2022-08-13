class Utils {
  
  static fireEvent(node, eventName) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    let doc;
    if (node.ownerDocument) {
      doc = node.ownerDocument;
    } else if (node.nodeType === 9) {
      // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
      doc = node;
    } else {
      throw new Error(`Invalid node passed to fireEvent: ${node.id}`);
    }

    if (node.dispatchEvent) {
      // Gecko-style approach (now the standard) takes more work
      let eventClass = '';

      // Different events have different event classes. If this switch statement can't
      // map an eventName to an eventClass, the event firing is going to fail.
      switch (eventName) {
        case 'click': // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
        case 'mousedown':
        case 'mouseup':
          eventClass = 'MouseEvents';
          break;
        case 'input':
        case 'focus':
        case 'focusout':
        case 'change':
        case 'blur':
        case 'select':
        case 'transitionrun':
        case 'transitionstart':
        case 'transitioncancel':
        case 'transitionend':
        case 'load':
          eventClass = 'HTMLEvents';
          break;

        default:
          throw new Error(`fireEvent: Couldn't find an event class for event ${eventName}.`);
      }
      const event = doc.createEvent(eventClass);
      event.initEvent(eventName, true, true); // All events created as bubbling and cancelable.

      event.synthetic = true; // allow detection of synthetic events
      // The second parameter says go ahead with the default action
      node.dispatchEvent(event, true);
    } else if (node.fireEvent) {
      // IE-old school style, you can drop this if you don't need to support IE8 and
      // lower
      const event = doc.createEventObject();
      event.synthetic = true; // allow detection of synthetic events
      node.fireEvent(`on${eventName}`, event);
    }
  }

  static convertNodeListToArray(nodeList) {
    if (Array.from) {
      return Array.from(nodeList);
    }
    return Array.prototype.slice.call(nodeList);
  }

  /**
   * Wrap the target into wrapper
   * @param {HTMLElement} wrapper - wrap element
   * @param {HTMLElement} target - node element will be wrapped
   * */
  static wrap(wrapper, target) {
    try {
      target.parentNode.insertBefore(wrapper, target);
      wrapper.appendChild(target);
      return wrapper;
    } catch (error) {
      return error;
    }
  }

  static unWrap(wrapper) {
    const docFrag = document.createDocumentFragment();
    while (wrapper.firstChild) {
      const child = wrapper.removeChild(wrapper.firstChild);
      docFrag.appendChild(child);
    }

    wrapper.parentNode.replaceChild(docFrag, wrapper);
  }

  static getScrollbarWidth() {
    // Creating invisible container
    try {
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll'; // forcing scrollbar to appear
      outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
      document.body.appendChild(outer);

      // Creating inner element and placing it in the container
      const inner = document.createElement('div');
      outer.appendChild(inner);

      // Calculating difference between container's full width and the child width
      const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

      // Removing temporary elements from the DOM
      outer.parentNode.removeChild(outer);

      return scrollbarWidth;
    } catch (error) {
      // console.log(error);
      return 0;
    }
  }

  static ajaxRequest(request) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(request.method || 'GET', request.url);
      if (request.headers) {
        Object
          .keys(request.headers)
          .forEach((key) => {
            xhr.setRequestHeader(key, request.headers[key]);
          });
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(`${xhr.status} ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error(`${xhr.status}:${xhr.statusText}`));
      xhr.send(request.body);
    });
  }

  static async loadTemplate(file) {
    if (window.templateCache) {
      const cache = window.templateCache.filter(x => x.name === file);
      if (cache[0]) return cache[0].data;
    }

    try {
      const data = await Utils.ajaxRequest({
        method: 'GET',
        url: file,
      });

      if (window.templateCache === undefined) window.templateCache = [];
      window.templateCache.push({
        name: file,
        data,
      });
      return data;
    } catch (error) {
      return '';
    }
  }

  static processTemplate(source, data) {
    const template = Handlebars.compile(source);

    return template(data);
  }

  static prepend(target, source) {
    try {
      return target.insertBefore(source, target.firstChild);
    } catch (error) {
      return error;
    }
  }

  static insertAfter(target, source) {
    try {
      return target.parentElement.insertBefore(source, target.nextSibling);
    } catch (error) {
      return error;
    }
  }

  static getElementStyle(element, property) {
    if (!property) {
      return window.getComputedStyle(element, null);
    }
    return window.getComputedStyle(element, null).getPropertyValue(property);
  }

  static getSelectors(selector) {
    const _arr = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;

    let els = Utils.convertNodeListToArray(_arr);
    if (els.length === 0 && typeof selector !== 'string') {
      els = [_arr];
    }

    return els;
  }
}

export default Utils;

export const { fireEvent } = Utils;
export const { getScrollbarWidth } = Utils;
export const { convertNodeListToArray } = Utils;
export const { ajaxRequest } = Utils;
export const { loadTemplate } = Utils;
export const { processTemplate } = Utils;
export const { wrap } = Utils;
export const { unWrap } = Utils;
export const { prepend } = Utils;
export const { insertAfter } = Utils;
export const { getElementStyle } = Utils;
export const { getSelectors } = Utils;