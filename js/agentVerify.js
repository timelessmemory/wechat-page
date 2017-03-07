var ShowTax, agentVm, baseUrl, bdVm, byDealerVm, getWithYear, getWithYearAndMonth, html, sendEmailUrl, subject, switchTap, userId, _ref;

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

Vue.filter('to-currency', function(value) {
  return accounting.formatNumber(value);
});

subject = '';

html = '';

if ((_ref = util.queryMap) != null ? _ref.userId : void 0) {
  userId = util.queryMap.userId;
}

baseUrl = '/api/ufstrust/unimoney/web-unimoney-bill-list?userId=' + userId;

sendEmailUrl = '/api/ufstrust/unimoney/export-unimoney-report?userId=' + userId + '&subject=' + subject + '&html=' + html;

bdVm = new Vue({
  el: '#byDistributor',
  data: {
    originList: [],
    dataList: [],
    total: {
      count: 0,
      sum: 0
    },
    isShowloading: false,
    isShowRadio: false,
    taxList: [],
    disableAccountButton: false,
    disableTaxButton: false,
    whichList: 'accountList'
  },
  methods: {
    initData: function() {
      var month, quarter, url, year;
      this.isShowRadio = false;
      this.whichList = 'accountList';
      this.taxList = [];
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker').val(year + '年' + ' ' + '第' + quarter + '季度');
      $('#month-picker').val('請選擇');
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=distributor';
      return this.$http.get(url).then(function(response) {
        this.isShowRadio = ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        if (this.isShowRadio) {
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
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      $('#month-picker').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=distributor';
      return this.$http.get(url).then(function(response) {
        this.isShowRadio = ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        if (this.isShowRadio) {
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
        return;
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
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      $('#month-picker').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=distributor';
      return this.$http.get(url).then(function(response) {
        ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-tax').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        $('#quarter-picker').val($('#quarter-picker-tax').val());
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    },
    exportList: function() {
      var dateRange, emailUrl, month, title, tmpMonth, tmpQuarter, tmpYear, tquarter, tyear, year, yearMonth, yearQuarter, _self;
      _self = this;
      yearMonth = $('#month-picker').val();
      dateRange = '所有';
      year = 0;
      month = 0;
      if (yearMonth !== "請選擇") {
        tmpYear = yearMonth.split(' ')[0];
        tmpMonth = yearMonth.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        dateRange = year + '年';
        if (tmpMonth !== "請選擇") {
          month = tmpMonth.substring(0, tmpMonth.indexOf("月"));
          dateRange = year + '年' + month + '月';
        }
      }
      title = dateRange + '優利金對賬清單將傳送至以下電子信箱：' + '<br/>';
      yearQuarter = $('#quarter-picker').val();
      tyear = 0;
      tquarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        tyear = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          tquarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      if (agentVm.email !== '') {
        title += agentVm.email;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + agentVm.email + '&emailType=bill';
            if (month !== 0 && year !== 0) {
              month = month.length === 1 ? '0' + month : month;
              url = url + '&redeemMonth=' + year + '年' + month + '月';
            }
            _self.disableAccountButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableAccountButton = false;
            }, function(vm) {
              return vm.disableAccountButton = false;
            });
          },
          onCancel: function() {}
        });
        return;
      }
      this.disableAccountButton = true;
      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId;
      return this.$http.get(emailUrl).then(function(response) {
        this.disableAccountButton = false;
        title += response.data.email;
        return $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            agentVm.email = response.data.email;
            url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + agentVm.email + '&emailType=bill';
            if (month !== 0 && year !== 0) {
              month = month.length === 1 ? '0' + month : month;
              url = url + '&redeemMonth=' + year + '年' + month + '月';
            }
            _self.disableAccountButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableAccountButton = false;
            }, function(vm) {
              return vm.disableAccountButton = false;
            });
          },
          onCancel: function() {
            return agentVm.email = response.data.email;
          }
        });
      }, function(error) {
        this.disableAccountButton = false;
        return console.log(error);
      });
    },
    exportTaxList: function() {
      var dateRange, emailUrl, quarter, title, tmpQuarter, tmpYear, year, yearQuarter, _self;
      _self = this;
      yearQuarter = $('#quarter-picker-tax').val();
      dateRange = '所有';
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        dateRange = year + '年';
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
          dateRange = year + '年' + quarter + '季度';
        }
      }
      title = dateRange + '優利金補稅清單將傳送至以下電子信箱：' + '<br/>';
      if (agentVm.email !== '') {
        title += agentVm.email;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + agentVm.email + '&emailType=invoice';
            _self.disableTaxButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableTaxButton = false;
            }, function(vm) {
              return vm.disableTaxButton = false;
            });
          },
          onCancel: function() {}
        });
        return;
      }
      this.disableTaxButton = true;
      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId;
      return this.$http.get(emailUrl).then(function(response) {
        this.disableTaxButton = false;
        title += response.data.email;
        return $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            agentVm.email = response.data.email;
            url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + agentVm.email + '&emailType=invoice';
            _self.disableTaxButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableTaxButton = false;
            }, function(vm) {
              return vm.disableTaxButton = false;
            });
          },
          onCancel: function() {
            return agentVm.email = response.data.email;
          }
        });
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
        return '處理中..';
      } else {
        return '導出對賬清單至電子郵箱';
      }
    },
    taxText: function() {
      if (this.disableTaxButton) {
        return '處理中..';
      } else {
        return '導出補稅清單至電子郵箱';
      }
    },
    isAccountList: function() {
      var isAccountList;
      isAccountList = this.whichList === 'accountList' ? true : false;
      return isAccountList;
    },
    taxTotal: function() {
      var result, sum;
      sum = 0;
      result = {
        count: 0,
        sum: sum
      };
      if (this.taxList.length === 0) {
        return result;
      }
      this.taxList.map(function(item) {
        return sum += item.couponDenomination;
      });
      result = {
        count: this.taxList.length,
        sum: sum
      };
      return result;
    }
  }
});

byDealerVm = new Vue({
  el: '#byDealer',
  data: {
    originList: [],
    dataList: [],
    total: {
      count: 0,
      sum: 0
    },
    isShowloading: false,
    isShowRadio: false,
    taxList: [],
    disableAccountButton: false,
    disableTaxButton: false,
    whichList: 'accountList'
  },
  methods: {
    initData: function() {
      var month, quarter, year;
      this.isShowRadio = false;
      this.whichList = 'accountList';
      this.taxList = [];
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker-by-dealer').val(year + '年' + ' ' + '第' + quarter + '季度');
      $('#month-picker-by-dealer').val('請選擇');
      this.isShowloading = true;
      return this.loadDealer(year, quarter, function(year, quarter, _self) {
        var url;
        url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=redeemer&redeemerName=' + $('#productor-picker').val();
        return _self.$http.get(url).then(function(response) {
          this.isShowRadio = ShowTax(response.data.items, this.taxList);
          this.dataList = response.data.items;
          this.originList = response.data.items.concat([]);
          this.total.count = response.data.total.totalCount;
          this.total.sum = response.data.total.totalUnimoney;
          if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
            $('#quarter-picker-by-dealer').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
          }
          if (this.isShowRadio) {
            $('#quarter-picker-tax-by-dealer').val($('#quarter-picker-by-dealer').val());
          }
          return this.isShowloading = false;
        }, function(error) {
          return console.log(error);
        });
      });
    },
    loadDealer: function(year, quarter, callback) {
      var dealerUrl;
      dealerUrl = '/api/ufstrust/agent/redeemer-list?userId=' + userId + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1';
      return this.$http.get(dealerUrl).then(function(response) {
        var dealers, key, values;
        values = [];
        for (key in response.data) {
          values = response.data[key];
        }
        dealers = [];
        values.map(function(item) {
          return dealers.push(item.name);
        });
        $('#productor-picker').val(dealers[0]);
        $("#productor-picker").productorPicker({
          title: "經銷商",
          changeEvent: this.prodctorChange,
          options: dealers
        });
        $('#productor-picker-tax').val(dealers[0]);
        $("#productor-picker-tax").productorPicker({
          title: "經銷商",
          changeEvent: this.prodctorChangeTax,
          options: dealers
        });
        return callback(year, quarter, this);
      }, function(error) {
        return console.log(error);
      });
    },
    quarterChange: function() {
      var quarter, tmpQuarter, tmpYear, year, yearQuarter;
      yearQuarter = $('#quarter-picker-by-dealer').val();
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      $('#month-picker-by-dealer').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      return this.loadDealer(year, quarter, function(year, quarter, _self) {
        var url;
        url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=redeemer&redeemerName=' + $('#productor-picker').val();
        return _self.$http.get(url).then(function(response) {
          this.isShowRadio = ShowTax(response.data.items, this.taxList);
          this.dataList = response.data.items;
          this.originList = response.data.items.concat([]);
          this.total.count = response.data.total.totalCount;
          this.total.sum = response.data.total.totalUnimoney;
          if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
            $('#quarter-picker-by-dealer').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
          }
          if (this.isShowRadio) {
            $('#quarter-picker-tax-by-dealer').val($('#quarter-picker-by-dealer').val());
          }
          return this.isShowloading = false;
        }, function(error) {
          return console.log(error);
        });
      });
    },
    prodctorChange: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      yearQuarter = $('#quarter-picker-by-dealer').val();
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      $('#month-picker-by-dealer').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=redeemer&redeemerName=' + $('#productor-picker').val();
      return this.$http.get(url).then(function(response) {
        this.isShowRadio = ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-by-dealer').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        if (this.isShowRadio) {
          $('#quarter-picker-tax-by-dealer').val($('#quarter-picker-by-dealer').val());
          $("#productor-picker-tax").val($("#productor-picker").val());
        }
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    },
    monthChange: function() {
      var month, tmpMonth, tmpYear, year, yearMonth;
      yearMonth = $('#month-picker-by-dealer').val();
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
        return;
      }
      if (year !== 0 && month === 0) {
        this.dataList = getWithYear(this.originList, year);
      }
      if (year !== 0 && month !== 0) {
        return this.dataList = getWithYearAndMonth(this.originList, year, month);
      }
    },
    quarterChangeTax: function() {
      var quarter, tmpQuarter, tmpYear, year, yearQuarter;
      yearQuarter = $('#quarter-picker-tax-by-dealer').val();
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      $('#month-picker-by-dealer').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      return this.loadDealer(year, quarter, function(year, quarter, _self) {
        var url;
        url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=redeemer&redeemerName=' + $('#productor-picker-tax').val();
        return _self.$http.get(url).then(function(response) {
          ShowTax(response.data.items, this.taxList);
          this.dataList = response.data.items;
          this.originList = response.data.items.concat([]);
          this.total.count = response.data.total.totalCount;
          this.total.sum = response.data.total.totalUnimoney;
          if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
            $('#quarter-picker-tax-by-dealer').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
          }
          $('#quarter-picker-by-dealer').val($('#quarter-picker-tax-by-dealer').val());
          return this.isShowloading = false;
        }, function(error) {
          return console.log(error);
        });
      });
    },
    prodctorChangeTax: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      yearQuarter = $('#quarter-picker-tax-by-dealer').val();
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      $('#month-picker-by-dealer').val('請選擇');
      this.dataList = [];
      this.taxList = [];
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter + '&byRole=redeemer&redeemerName=' + $('#productor-picker').val();
      return this.$http.get(url).then(function(response) {
        ShowTax(response.data.items, this.taxList);
        this.dataList = response.data.items;
        this.originList = response.data.items.concat([]);
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-tax-by-dealer').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        $('#quarter-picker-by-dealer').val($('#quarter-picker-tax-by-dealer').val());
        $("#productor-picker").val($("#productor-picker-tax").val());
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    },
    exportList: function() {
      var dateRange, emailUrl, month, title, tmpMonth, tmpQuarter, tmpYear, tquarter, tyear, year, yearMonth, yearQuarter, _self;
      _self = this;
      yearMonth = $('#month-picker-by-dealer').val();
      dateRange = '所有';
      year = 0;
      month = 0;
      if (yearMonth !== "請選擇") {
        tmpYear = yearMonth.split(' ')[0];
        tmpMonth = yearMonth.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        dateRange = year + '年';
        if (tmpMonth !== "請選擇") {
          month = tmpMonth.substring(0, tmpMonth.indexOf("月"));
          dateRange = year + '年' + month + '月';
        }
      }
      title = dateRange + '優利金對賬清單將傳送至以下電子信箱：' + '<br/>';
      yearQuarter = $('#quarter-picker-by-dealer').val();
      tyear = 0;
      tquarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        tyear = tmpYear.substring(0, tmpYear.indexOf("年"));
        if (tmpQuarter !== "全部") {
          tquarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
        }
      }
      if (agentVm.email !== '') {
        title += agentVm.email;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + agentVm.email + '&emailType=bill';
            if (month !== 0 && year !== 0) {
              month = month.length === 1 ? '0' + month : month;
              url = url + '&redeemMonth=' + year + '年' + month + '月';
            }
            _self.disableAccountButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableAccountButton = false;
            }, function(vm) {
              return vm.disableAccountButton = false;
            });
          },
          onCancel: function() {}
        });
        return;
      }
      this.disableAccountButton = true;
      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId;
      return this.$http.get(emailUrl).then(function(response) {
        this.disableAccountButton = false;
        title += response.data.email;
        return $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            agentVm.email = response.data.email;
            url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + agentVm.email + '&emailType=bill';
            if (month !== 0 && year !== 0) {
              month = month.length === 1 ? '0' + month : month;
              url = url + '&redeemMonth=' + year + '年' + month + '月';
            }
            _self.disableAccountButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableAccountButton = false;
            }, function(vm) {
              return vm.disableAccountButton = false;
            });
          },
          onCancel: function() {
            return agentVm.email = response.data.email;
          }
        });
      }, function(error) {
        this.disableAccountButton = false;
        return console.log(error);
      });
    },
    exportTaxList: function() {
      var dateRange, emailUrl, quarter, title, tmpQuarter, tmpYear, year, yearQuarter, _self;
      _self = this;
      yearQuarter = $('#quarter-picker-tax-by-dealer').val();
      dateRange = '所有';
      year = 0;
      quarter = 0;
      if (yearQuarter !== "全部") {
        tmpYear = yearQuarter.split(' ')[0];
        tmpQuarter = yearQuarter.split(' ')[1];
        year = tmpYear.substring(0, tmpYear.indexOf("年"));
        dateRange = year + '年';
        if (tmpQuarter !== "全部") {
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
          dateRange = year + '年' + quarter + '季度';
        }
      }
      title = dateRange + '優利金補稅清單將傳送至以下電子信箱：' + '<br/>';
      if (agentVm.email !== '') {
        title += agentVm.email;
        $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + agentVm.email + '&emailType=invoice';
            _self.disableTaxButton = true;
            return _self.sendEmail(url, function(response, vm) {
              return vm.disableTaxButton = false;
            }, function(vm) {
              return vm.disableTaxButton = false;
            });
          },
          onCancel: function() {}
        });
        return;
      }
      this.disableTaxButton = true;
      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId;
      return this.$http.get(emailUrl).then(function(response) {
        this.disableTaxButton = false;
        title += response.data.email;
        return $.confirm({
          title: title,
          text: '如需更改電子信箱，請聯繫行銷部Daisy Chiu',
          onOK: function() {
            var url;
            agentVm.email = response.data.email;
            url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + agentVm.email + '&emailType=invoice';
            _self.disableTaxButton = true;
            _self.sendEmail(url, function(response, vm) {
              return vm.disableTaxButton = false;
            }, function(vm) {
              return vm.disableTaxButton = false;
            });
            ({
              onCancel: function() {}
            });
            return agentVm.email = response.data.email;
          }
        });
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
        return '處理中..';
      } else {
        return '導出對賬清單至電子郵箱';
      }
    },
    taxText: function() {
      if (this.disableTaxButton) {
        return '處理中..';
      } else {
        return '導出補稅清單至電子郵箱';
      }
    },
    isAccountList: function() {
      var isAccountList;
      isAccountList = this.whichList === 'accountList' ? true : false;
      return isAccountList;
    },
    taxTotal: function() {
      var result, sum;
      sum = 0;
      result = {
        count: 0,
        sum: sum
      };
      if (this.taxList.length === 0) {
        return result;
      }
      this.taxList.map(function(item) {
        return sum += item.couponDenomination;
      });
      result = {
        count: this.taxList.length,
        sum: sum
      };
      return result;
    }
  }
});

agentVm = new Vue({
  el: '#agentAccount',
  data: {
    email: ''
  },
  methods: {
    loadDistributor: function(e) {
      switchTap(e.currentTarget);
      return bdVm.initData();
    },
    loadDealer: function(e) {
      switchTap(e.currentTarget);
      return byDealerVm.initData();
    }
  }
});

bdVm.initData();

$("#quarter-picker").quarterPicker({
  title: "季度",
  changeEvent: bdVm.quarterChange
});

$("#month-picker").monthPicker({
  title: "核可月份",
  changeEvent: bdVm.monthChange
});

$("#quarter-picker-tax").quarterPicker({
  title: "季度",
  changeEvent: bdVm.quarterChangeTax
});

$("#quarter-picker-by-dealer").quarterPicker({
  title: "季度",
  changeEvent: byDealerVm.quarterChange
});

$("#month-picker-by-dealer").monthPicker({
  title: "核可月份",
  changeEvent: byDealerVm.monthChange
});

$("#quarter-picker-tax-by-dealer").quarterPicker({
  title: "季度",
  changeEvent: byDealerVm.quarterChangeTax
});
