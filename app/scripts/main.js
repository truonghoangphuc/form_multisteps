import "../styles/styles.scss";

import Validation from "./classes/validation";
import FormSteps from "./classes/form_steps";

import { convertNodeListToArray } from "./classes/utilities";

document.addEventListener("DOMContentLoaded", (e) => {
  const [formSteps] = new FormSteps({
    events: {
      afterNextPage(instance) {
        if (instance.data.active == 2) {
          const _form = instance.elements.steps[instance.data.active];
          const _target = _form.querySelector('#summaryEl');
          const _template = _form.querySelector('#summary').innerHTML;
          const _html = _template.replace('${name}',_data.name).replace('${age}',_data.age).replace('${live}',_data.live).replace('${package}',_data.package).replace('${premium}',_data.premium);
          _target.innerHTML = _html;
        }
      }
    }
  });

  const _outputEl = document.querySelector('#output');
  const _outputSafe = document.querySelector('#safe');
  const _outputSSafe = document.querySelector('#superSafe');
  const _data = {};

  const _updatePremium = (ageValue, currencyValue, rateValue, packageValue) => {
    const premiumStandard = 10 * ageValue * rateValue;
    const premium = 10 * ageValue * packageValue * rateValue;
    const addSafe = premiumStandard * .5;
    const addSuperSafe = premiumStandard * .75;

    _outputSafe.innerHTML = _outputSafe.dataset.template.replace("${addSafe}", `${addSafe}${currencyValue}` );
    _outputSSafe.innerHTML = _outputSSafe.dataset.template.replace("${addSuperSafe}", `${addSuperSafe}${currencyValue}`);
    _outputEl.innerHTML = `${_outputEl.dataset.template.replace("${premium}", premium)}${currencyValue}`;    
    _data.premium = `${premium}${currencyValue}`;
  }

  const _validation = new Validation({
    events: {
      initialized(e) {                
        const _form = e.elements.form;
        const _name = _form.querySelector('[name="field_name"]');
        const _age = _form.querySelector('[name="field_age"]');
        const _currency = _form.querySelector('[name="field_live"]');
        const _packages = convertNodeListToArray(_form.querySelectorAll('[name="field_package"]'));        
        let  _ageValue = parseInt(_age.value);
        let  _currencyValue = _currency.value;
        let  _rateValue = _form.querySelector('[name="field_live"] option[value="'+ _currencyValue +'"]').dataset.rate;
        let  _packageValue = _packages.filter(x => x.checked)[0].value;

        _data.live = _form.querySelector('[name="field_live"] option[value="'+ _currencyValue +'"]').innerText;
        _data.name = _name.value;
        console.log(_packages.filter(x => x.checked)[0]);
        _data.package = _packages.filter(x => x.checked)[0].dataset.name;
        
        _form.addEventListener("input", (e) => {
          if (e.target === _age) {
            _ageValue = parseInt(_age.value);
            if (!Number.isNaN(_ageValue)) {            
              if (!_age.classList.contains('invalid')) {                
                _packageValue = _packages.filter(x => x.checked)[0].value;
                _updatePremium(_ageValue, _currencyValue, _rateValue, _packageValue);
                _data.age = _ageValue;
              }            
            }
          }

          if (e.target === _name) {
            _data.name = _name.value;
          }
        });

        _currency.addEventListener("change", (e) => {
          if (!Number.isNaN(parseInt(_age.value)) && !_age.classList.contains('invalid')) {
            _currencyValue = _currency.value;
            _rateValue = _form.querySelector('[name="field_live"] option[value="'+ _currencyValue +'"]').dataset.rate;
            _packageValue = _packages.filter(x => x.checked)[0].value;
            _updatePremium(_ageValue, _currencyValue, _rateValue, _packageValue);
            _data.live = _form.querySelector('[name="field_live"] option[value="'+ _currencyValue +'"]').innerText;
          }
        });

        convertNodeListToArray(_packages).map(x => x.addEventListener("change", (e) => {
          if (!Number.isNaN(parseInt(_age.value)) && !_age.classList.contains('invalid')) {
            const _package = _packages.filter(x => x.checked)[0];
            _packageValue = _package.value;
            const _packageName = _package.dataset.name;
            _updatePremium(_ageValue, _currencyValue, _rateValue, _packageValue);
            _data.package = _packageName;
          }
        }));
      },
      doSuccess(e) {  
        const _form = e.elements.form;
        const _age = _form.querySelector('[name="field_age"]');
        const _ageValue = parseInt(_age.value);

        if (_ageValue > 100) {
          location.replace('./page-2_error.html');
        } else {
          formSteps.goNext();
        }
      }
    }
  });
});