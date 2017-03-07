+ function($) {
  "use strict";

  $.fn.productorPicker = function(params) {

    var productorsData = [];
    var productor = [];
    if (params.options) {
      productor = params.options;
    }

    for(var i = 0; i < productor.length; i++) {
      var tmpPdr = {
        "name" : productor[i],
        "code" : i + "00"
      }
      productorsData.push(tmpPdr);
    }

    var defaults;
    var raw = productorsData;

    var toCode = function(raw, val) {
      var p;
      raw.map(function (t) {
        if (t.name === val) p = t;
      });

      return [p.code];
    }

    params = $.extend({}, defaults, params);

    return this.each(function() {
      var self = this;

      var provincesName = raw.map(function(d) {
        return d.name;
      });
      var provincesCode = raw.map(function(d) {
        return d.code;
      });

      var currentProvince = provincesName[0];

      var cols = [
        {
          displayValues: provincesName,
          textAlign: 'center',
          values: provincesCode,
          cssClass: "col-province"
        }
      ];

      var config = {

        cssClass: "city-picker",
        rotateEffect: false,
        formatValue: function (p, values, displayValues) {
          return displayValues.join(' ');
        },
        onChange: function (picker, values, displayValues) {
          var newProvince = picker.cols[0].displayValue;
          if(newProvince !== currentProvince) {
            currentProvince = newProvince;
            picker.updateValue();
            return false;
          }
          var len = (values[values.length-1] ? values.length - 1 : values.length - 2)
          $(self).attr('data-code', values[len]);
          $(self).attr('data-codes', values.join(','));
          if (params.onChange) {
            params.onChange.call(self, picker, values, displayValues);
          }
        },
        cols: cols,
        rawCitiesData : productorsData,
        toCode : toCode
      };

      if(!this) return;

      var p = $.extend({}, params, config);

      var val = $(this).val();

      p.value = toCode(raw, val);

      $(this).picker(p);
    });
  };

}($);
