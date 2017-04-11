var ShowTax, baseUrl, customShowConfirmAccount, customShowConfirmTax, getWithYear, getWithYearAndMonth, sendEmailUrl, switchTap, userId, vsVm, _ref;

$("title")[0].innerText = "優利金對賬系統";

switchTap = function(currentTarget) {
  var $a, ITEM_ON, href;
  ITEM_ON = "weui-bar__item--on";
  $a = $(currentTarget);
  href = $a.attr("href");
  if ($a.hasClass(ITEM_ON)) {
    return;
  }
  if (!/^#/.test(href)) {
    return;
  }
  return $.showTab($a);
};

ShowTax = function(items, taxItems) {
  var flag;
  flag = false;
  items.map(function(item) {
    if (!item.isOpenInvoice) {
      flag = true;
      return taxItems.push(item);
    }
  });
  return flag;
};

getWithYear = function(items, year) {
  var result;
  result = [];
  items.map(function(item) {
    if (item.year + '' === year) {
      return result.push(item);
    }
  });
  return result;
};

getWithYearAndMonth = function(items, year, month) {
  var result;
  if (month.length === 1) {
    month = '0' + month;
  }
  result = [];
  items.map(function(item) {
    if (item.year + '' === year && item.redeemAt.split(' ')[0].split('-')[1] === month) {
      return result.push(item);
    }
  });
  return result;
};

customShowConfirmAccount = function(context) {
  $('.weui-dialog.weui-confirm.weui-dialog--visible').hide();
  return window.setTimeout(function() {
    $('.weui-dialog.weui-confirm.weui-dialog--visible').fadeIn(100);
    return context.disableAccountButton = false;
  }, 500);
};

customShowConfirmTax = function(context) {
  $('.weui-dialog.weui-confirm.weui-dialog--visible').hide();
  return window.setTimeout(function() {
    $('.weui-dialog.weui-confirm.weui-dialog--visible').fadeIn(100);
    return context.disableTaxButton = false;
  }, 500);
};

Vue.filter('to-currency', function(value) {
  return accounting.formatNumber(value);
});

if ((_ref = util.queryMap) != null ? _ref.userId : void 0) {
  userId = util.queryMap.userId;
}

baseUrl = '/api/ufstrust/unimoney/web-unimoney-bill-list?userId=' + userId;

sendEmailUrl = '/api/ufstrust/unimoney/export-unimoney-report?userId=' + userId;

Vue.http.interceptors.push(function(request, next) {
  request.url = request.getUrl() + "&v=" + new Date().getTime();
  return next(function(response) {
    var result;
    if (response.body.code !== void 0) {
      result = {
        code: response.body.code,
        message: response.body.message,
        items: [],
        total: {
          totalCount: 0,
          totalUnimoney: 0
        }
      };
      response.body = result;
      $.modal({
        title: "",
        text: "errorCode:" + response.body.code + ", " + response.body.message,
        buttons: [
          {
            text: "確認"
          }
        ]
      });
    }
    return response;
  });
});

vsVm = new Vue({
  el: '#verifySystem',
  data: {
    originList: [],
    dataList: [],
    total: {
      count: 0,
      sum: 0
    },
    isShowloading: false,
    isShowTax: false,
    taxList: [],
    disableAccountButton: false,
    disableTaxButton: false,
    email: ''
  },
  methods: {
    loadVerifyAccount: function(e) {
      return switchTap(e.currentTarget);
    },
    loadPayTax: function(e) {
      return switchTap(e.currentTarget);
    },
    initData: function() {
      var month, quarter, url, year;
      this.taxList = [];
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker').val(year + '年' + ' ' + '第' + quarter + '季度');
      $('#month-picker').val('請選擇');
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter;
      return this.$http.get(url).then(function(response) {
        this.isShowTax = ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (this.isShowTax) {
          $('#quarter-picker-tax').val($('#quarter-picker').val());
        }
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    },
    quarterChange: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      yearQuarter = $('#quarter-picker').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      year = tmpYear.substring(0, tmpYear.indexOf("年"));
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      $('#month-picker').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter;
      return this.$http.get(url).then(function(response) {
        this.isShowTax = ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (this.isShowTax) {
          $('#quarter-picker-tax').val($('#quarter-picker').val());
        }
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    },
    monthChange: function() {
      var month, tmpMonth, tmpYear, year, yearMonth;
      yearMonth = $('#month-picker').val();
      year = 0;
      month = 0;
      if (yearMonth !== "請選擇") {
        tmpYear = yearMonth.split(' ')[0];
        tmpMonth = yearMonth.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpMonth !== "請選擇") {
          month = tmpMonth.substring(0, tmpMonth.indexOf("月"));
        }
      }
      if (year === 0 && month === 0) {
        this.dataList = this.originList;
      }
      if (year !== 0 && month === 0) {
        this.dataList = getWithYear(this.originList, year);
      }
      if (year !== 0 && month !== 0) {
        return this.dataList = getWithYearAndMonth(this.originList, year, month);
      }
    },
    quarterChangeTax: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      yearQuarter = $('#quarter-picker-tax').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      year = tmpYear.substring(0, tmpYear.indexOf("年"));
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      $('#month-picker').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter;
      return this.$http.get(url).then(function(response) {
        ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        $('#quarter-picker').val($('#quarter-picker-tax').val());
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    },
    exportList: function() {
      var dateRange, emailUrl, month, title, tmpMonth, tmpQuarter, tmpYear, tquarter, tyear, year, yearMonth, yearQuarter, _self;
      _self = this;
      yearQuarter = $('#quarter-picker').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      tyear = tmpYear.substring(0, tmpYear.indexOf("年"));
      tquarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      dateRange = tyear + '年' + '第' + tquarter + "季度";
      yearMonth = $('#month-picker').val();
      year = 0;
      month = 0;
      if (yearMonth !== "請選擇") {
        tmpYear = yearMonth.split(' ')[0];
        tmpMonth = yearMonth.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        dateRange = year + '年';
        if (tmpMonth !== "請選擇") {
          month = tmpMonth.substring(0, tmpMonth.indexOf("月"));
          month = month.length === 1 ? '0' + month : month;
          dateRange = year + '年' + month + '月';
        }
      }
      title = dateRange + '優利金對賬清單將傳送至以下電子信箱：' + '<br/>';
      if (this.email !== '') {
        title += this.email;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫您的專屬業務',
          onOK: function() {
            var url;
            url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + _self.email + '&emailType=bill';
            if (month !== 0 && year !== 0) {
              url = url + '&redeemMonth=' + year + '-' + month;
            }
            if (month === 0 && year !== 0) {
              url = url + '&redeemMonth=' + year + '-all';
            }
            _self.disableAccountButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableAccountButton = true;
            }, function(vm) {
              return vm.disableAccountButton = true;
            });
          },
          onCancel: function() {}
        });
        customShowConfirmAccount(this);
        return;
      }
      this.disableAccountButton = true;
      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId;
      return this.$http.get(emailUrl).then(function(response) {
        title += response.data.sendEmail;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫您的專屬業務',
          onOK: function() {
            var url;
            _self.email = response.data.sendEmail;
            url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + _self.email + '&emailType=bill';
            if (month !== 0 && year !== 0) {
              url = url + '&redeemMonth=' + year + '-' + month;
            }
            if (month === 0 && year !== 0) {
              url = url + '&redeemMonth=' + year + '-all';
            }
            _self.disableAccountButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableAccountButton = true;
            }, function(vm) {
              return vm.disableAccountButton = true;
            });
          },
          onCancel: function() {
            return _self.email = response.data.sendEmail;
          }
        });
        return customShowConfirmAccount(this);
      }, function(error) {
        this.disableAccountButton = false;
        return console.log(error);
      });
    },
    exportTaxList: function() {
      var dateRange, emailUrl, quarter, title, tmpQuarter, tmpYear, year, yearQuarter, _self;
      _self = this;
      yearQuarter = $('#quarter-picker-tax').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      year = tmpYear.substring(0, tmpYear.indexOf("年"));
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      dateRange = year + '年' + '第' + quarter + '季度';
      title = dateRange + '優利金搭贈清單將傳送至以下電子信箱：' + '<br/>';
      if (this.email !== '') {
        title += this.email;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫您的專屬業務',
          onOK: function() {
            var url;
            url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + _self.email + '&emailType=invoice';
            _self.disableTaxButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableTaxButton = true;
            }, function(vm) {
              return vm.disableTaxButton = true;
            });
          },
          onCancel: function() {}
        });
        customShowConfirmTax(this);
        return;
      }
      this.disableTaxButton = true;
      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId;
      return this.$http.get(emailUrl).then(function(response) {
        title += response.data.sendEmail;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫您的專屬業務',
          onOK: function() {
            var url;
            _self.email = response.data.sendEmail;
            url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + _self.email + '&emailType=invoice';
            _self.disableTaxButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableTaxButton = true;
            }, function(vm) {
              return vm.disableTaxButton = true;
            });
          },
          onCancel: function() {
            return _self.email = response.data.sendEmail;
          }
        });
        return customShowConfirmTax(this);
      }, function(error) {
        this.disableTaxButton = false;
        return console.log(error);
      });
    },
    sendEmail: function(url, callback, failBack) {
      return this.$http.get(url).then(function(response) {
        return callback(response, this);
      }, function(error) {
        failBack(this);
        return console.log(error);
      });
    },
    isMark: function(param) {
      if (param === '' || param === void 0) {
        return false;
      }
      if (param.split('-')[2] > 25) {
        return true;
      } else {
        return false;
      }
    }
  },
  computed: {
    accountText: function() {
      if (this.disableAccountButton) {
        return '導出對賬清單至電子郵箱';
      } else {
        return '導出對賬清單至電子郵箱';
      }
    },
    taxText: function() {
      if (this.disableTaxButton) {
        return '導出搭贈清單至電子郵箱';
      } else {
        return '導出搭贈清單至電子郵箱';
      }
    }
  }
});

vsVm.initData();

$("#quarter-picker").quarterPickerNoAll({
  title: "",
  changeEvent: vsVm.quarterChange
});

$("#month-picker").monthPicker({
  title: "",
  changeEvent: vsVm.monthChange
});

$("#quarter-picker-tax").quarterPickerNoAll({
  title: "",
  changeEvent: vsVm.quarterChangeTax
});
