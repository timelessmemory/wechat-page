var baseUrl, checkUrl, csVM, expVM, hbcVM, loading, necgVM, page, perPage, switchTap, tbcVM, tmpVM, userId, _ref;

$("title")[0].innerText = "優利金核銷系統";

FastClick.attach(document.body);

switchTap = function(currentTarget) {
  var $a, ITEM_ON, href;
  tmpVM.isShowFoot = $(currentTarget).attr("href") === "#toBeChecked" ? true : false;
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

Vue.filter('to-currency', function(value) {
  return accounting.formatNumber(value);
});

if ((_ref = util.queryMap) != null ? _ref.userId : void 0) {
  userId = util.queryMap.userId;
}

baseUrl = '/api/ufstrust/unimoney/web-unimoney-list?userId=' + userId;

checkUrl = '/api/ufstrust/unimoney/redeem-unimoneys?userId=' + userId;

perPage = 10;

page = 1;

loading = false;

Vue.http.interceptors.push(function(request, next) {
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
        },
        _meta: {
          currentPage: 1,
          pageCount: 0
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

tbcVM = new Vue({
  el: '#toBeChecked',
  data: {
    toBeCheckedData: [],
    isShowloading: false,
    isLoadMore: false,
    distributorName: '',
    type: "isRedeeming",
    count: 0,
    sum: 0,
    offCount: 0,
    offSum: 0
  },
  methods: {
    check: function(param) {
      var url, _self;
      _self = this;
      url = checkUrl + '&ids=' + param;
      return this.$http.get(url).then(function(response) {
        if (response.data.successCount === 1) {
          return $.modal({
            title: "",
            text: "優利金核可成功!",
            buttons: [
              {
                text: "確認",
                onClick: function() {
                  if (_self.toBeCheckedData.length <= perPage) {
                    return _self.quarterChange();
                  } else {
                    _self.toBeCheckedData.map(function(item) {
                      if (item.id === param) {
                        _self.offSum += item.couponDenomination;
                        return _self.toBeCheckedData.splice(_self.toBeCheckedData.indexOf(item), 1);
                      }
                    });
                    return _self.offCount++;
                  }
                }
              }
            ]
          });
        } else {
          return $.modal({
            title: "",
            text: "優利金核可失敗!",
            buttons: [
              {
                text: "確認"
              }
            ]
          });
        }
      }, function(error) {
        return console.log(error);
      });
    },
    checkAll: function() {
      var url, _self;
      _self = this;
      url = checkUrl + '&redeemAll=1';
      return this.$http.get(url).then(function(response) {
        if (response.data.successCount > 0) {
          return $.modal({
            title: "",
            text: "優利金核可成功!",
            buttons: [
              {
                text: "確認",
                onClick: function() {
                  return _self.quarterChange();
                }
              }
            ]
          });
        } else {
          return $.modal({
            title: "",
            text: "優利金核可失敗!",
            buttons: [
              {
                text: "確認"
              }
            ]
          });
        }
      }, function(error) {
        return console.log(error);
      });
    },
    quarterChange: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      this.offCount = 0;
      this.offSum = 0;
      page = 1;
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
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      return this.$http.get(url).then(function(response) {
        this.toBeCheckedData = response.data.items;
        this.count = response.data.total.totalCount;
        this.sum = response.data.total.totalUnimoney;
        if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      return this.quarterChange();
    },
    loadData: function(taget) {
      var quarter, url, year;
      this.distributorName = "";
      this.offCount = 0;
      this.offSum = 0;
      year = 0;
      quarter = 0;
      $('#quarter-picker').val('全部');
      page = 1;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      return this.$http.get(url).then(function(response) {
        this.toBeCheckedData = response.data.items;
        this.count = response.data.total.totalCount;
        this.sum = response.data.total.totalUnimoney;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        this.isShowloading = false;
        if (taget) {
          return switchTap(taget);
        }
      }, function(error) {
        if (taget) {
          switchTap(taget);
        }
        return console.log(error);
      });
    },
    allowCheck: function() {
      if (new Date().getDate() > 25) {
        return true;
      } else {
        return false;
      }
    }
  },
  computed: {
    total: function() {
      return {
        "count": this.count - this.offCount,
        "unimoney": this.sum - this.offSum
      };
    }
  }
});

tmpVM = new Vue({
  el: '#tmp',
  data: {
    isShowFoot: true
  },
  computed: {
    toBeCheckedData: function() {
      return tbcVM.toBeCheckedData;
    }
  },
  methods: {
    allowCheck: function() {
      return tbcVM.allowCheck();
    },
    checkAll: function() {
      return tbcVM.checkAll();
    }
  }
});

hbcVM = new Vue({
  el: '#haveBeenChecked',
  data: {
    haveBeenCheckedData: [],
    isShowloading: false,
    isLoadMore: false,
    distributorName: '',
    type: "hadRedeemed",
    total: {
      count: 0,
      sum: 0
    }
  },
  methods: {
    quarterChange: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker-no-all').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      year = tmpYear.substring(0, tmpYear.indexOf("年"));
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      return this.$http.get(url).then(function(response) {
        this.haveBeenCheckedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-no-all').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      return this.quarterChange();
    },
    loadData: function(taget) {
      var month, quarter, url, year;
      this.distributorName = "";
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker-no-all').val(year + '年' + ' ' + '第' + quarter + '季度');
      page = 1;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      return this.$http.get(url).then(function(response) {
        this.haveBeenCheckedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-no-all').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        this.isShowloading = false;
        if (taget) {
          return switchTap(taget);
        }
      }, function(error) {
        if (taget) {
          switchTap(taget);
        }
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
  }
});

necgVM = new Vue({
  el: '#notExchanged',
  data: {
    notExchangedData: [],
    isShowloading: false,
    isLoadMore: false,
    distributorName: '',
    type: "notRedeemed",
    total: {
      count: 0,
      sum: 0
    }
  },
  methods: {
    quarterChange: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker-not-exchanged').val();
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
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      return this.$http.get(url).then(function(response) {
        this.notExchangedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-not-exchanged').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      return this.quarterChange();
    },
    loadData: function(taget) {
      var quarter, url, year;
      this.distributorName = "";
      year = 0;
      quarter = 0;
      $('#quarter-picker-not-exchanged').val('全部');
      page = 1;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      return this.$http.get(url).then(function(response) {
        this.notExchangedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        this.isShowloading = false;
        if (taget) {
          return switchTap(taget);
        }
      }, function(error) {
        if (taget) {
          switchTap(taget);
        }
        return console.log(error);
      });
    }
  }
});

expVM = new Vue({
  el: '#expired',
  data: {
    expiredData: [],
    isShowloading: false,
    isLoadMore: false,
    distributorName: '',
    type: "hadExpired",
    total: {
      count: 0,
      sum: 0
    }
  },
  methods: {
    quarterChange: function() {
      var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker-expired').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      year = tmpYear.substring(0, tmpYear.indexOf("年"));
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      return this.$http.get(url).then(function(response) {
        this.expiredData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-expired').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      return this.quarterChange();
    },
    loadData: function(taget) {
      var month, quarter, url, year;
      this.distributorName = "";
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker-expired').val(year + '年' + ' ' + '第' + quarter + '季度');
      page = 1;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
      return this.$http.get(url).then(function(response) {
        this.expiredData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker-expired').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        this.isShowloading = false;
        if (taget) {
          return switchTap(taget);
        }
      }, function(error) {
        if (taget) {
          switchTap(taget);
        }
        return console.log(error);
      });
    }
  }
});

csVM = new Vue({
  el: "#checkSystem",
  methods: {
    loadToBeChecked: function(e) {
      return tbcVM.loadData(e.currentTarget);
    },
    loadHaveBeenChecked: function(e) {
      return hbcVM.loadData(e.currentTarget);
    },
    loadNotExchanged: function(e) {
      return necgVM.loadData(e.currentTarget);
    },
    loadExpired: function(e) {
      return expVM.loadData(e.currentTarget);
    }
  }
});

tbcVM.loadData();

$("#toBeChecked").pullToRefresh().on("pull-to-refresh", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
  _self = $(this);
  tbcVM.offCount = 0;
  tbcVM.offSum = 0;
  page = 1;
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
  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (tbcVM.distributorName !== '') {
    url = url + '&searchKey=' + tbcVM.distributorName;
  }
  return tbcVM.$http.get(url).then(function(response) {
    tbcVM.toBeCheckedData = response.data.items;
    tbcVM.count = response.data.total.totalCount;
    tbcVM.sum = response.data.total.totalUnimoney;
    if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
      $('#quarter-picker').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
    }
    tbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#haveBeenChecked").pullToRefresh().on("pull-to-refresh", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker-no-all').val();
  tmpYear = yearQuarter.split(' ')[0];
  tmpQuarter = yearQuarter.split(' ')[1];
  year = tmpYear.substring(0, tmpYear.indexOf("年"));
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (hbcVM.distributorName !== '') {
    url = url + '&searchKey=' + hbcVM.distributorName;
  }
  return hbcVM.$http.get(url).then(function(response) {
    hbcVM.haveBeenCheckedData = response.data.items;
    hbcVM.total.count = response.data.total.totalCount;
    hbcVM.total.sum = response.data.total.totalUnimoney;
    if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
      $('#quarter-picker-no-all').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
    }
    hbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#notExchanged").pullToRefresh().on("pull-to-refresh", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker-not-exchanged').val();
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
  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (necgVM.distributorName !== '') {
    url = url + '&searchKey=' + necgVM.distributorName;
  }
  return necgVM.$http.get(url).then(function(response) {
    necgVM.notExchangedData = response.data.items;
    necgVM.total.count = response.data.total.totalCount;
    necgVM.total.sum = response.data.total.totalUnimoney;
    if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
      $('#quarter-picker-not-exchanged').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
    }
    necgVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#expired").pullToRefresh().on("pull-to-refresh", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker-expired').val();
  tmpYear = yearQuarter.split(' ')[0];
  tmpQuarter = yearQuarter.split(' ')[1];
  year = tmpYear.substring(0, tmpYear.indexOf("年"));
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (expVM.distributorName !== '') {
    url = url + '&searchKey=' + expVM.distributorName;
  }
  return expVM.$http.get(url).then(function(response) {
    expVM.expiredData = response.data.items;
    expVM.total.count = response.data.total.totalCount;
    expVM.total.sum = response.data.total.totalUnimoney;
    if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
      $('#quarter-picker-expired').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
    }
    expVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#toBeChecked").infinite(20).on("infinite", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!tbcVM.isLoadMore) {
    return;
  }
  loading = true;
  tbcVM.offCount = 0;
  tbcVM.offSum = 0;
  page += 1;
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
  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (tbcVM.distributorName !== '') {
    url = url + '&searchKey=' + tbcVM.distributorName;
  }
  return tbcVM.$http.get(url).then(function(response) {
    tbcVM.toBeCheckedData.push.apply(tbcVM.toBeCheckedData, response.data.items);
    tbcVM.total.count = response.data.total.totalCount;
    tbcVM.total.sum = response.data.total.totalUnimoney;
    tbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return loading = false;
  }, function(error) {
    loading = false;
    return console.log(error);
  });
});

$("#haveBeenChecked").infinite(20).on("infinite", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!hbcVM.isLoadMore) {
    return;
  }
  loading = true;
  page += 1;
  yearQuarter = $('#quarter-picker-no-all').val();
  tmpYear = yearQuarter.split(' ')[0];
  tmpQuarter = yearQuarter.split(' ')[1];
  year = tmpYear.substring(0, tmpYear.indexOf("年"));
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (hbcVM.distributorName !== '') {
    url = url + '&searchKey=' + hbcVM.distributorName;
  }
  return hbcVM.$http.get(url).then(function(response) {
    hbcVM.haveBeenCheckedData.push.apply(hbcVM.haveBeenCheckedData, response.data.items);
    hbcVM.total.count = response.data.total.totalCount;
    hbcVM.total.sum = response.data.total.totalUnimoney;
    hbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return loading = false;
  }, function(error) {
    loading = false;
    return console.log(error);
  });
});

$("#notExchanged").infinite(20).on("infinite", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!necgVM.isLoadMore) {
    return;
  }
  loading = true;
  page += 1;
  yearQuarter = $('#quarter-picker-not-exchanged').val();
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
  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (necgVM.distributorName !== '') {
    url = url + '&searchKey=' + necgVM.distributorName;
  }
  return necgVM.$http.get(url).then(function(response) {
    necgVM.notExchangedData.push.apply(necgVM.notExchangedData, response.data.items);
    necgVM.total.count = response.data.total.totalCount;
    necgVM.total.sum = response.data.total.totalUnimoney;
    necgVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return loading = false;
  }, function(error) {
    loading = false;
    return console.log(error);
  });
});

$("#expired").infinite(20).on("infinite", function() {
  var quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!expVM.isLoadMore) {
    return;
  }
  loading = true;
  page += 1;
  yearQuarter = $('#quarter-picker-expired').val();
  tmpYear = yearQuarter.split(' ')[0];
  tmpQuarter = yearQuarter.split(' ')[1];
  year = tmpYear.substring(0, tmpYear.indexOf("年"));
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage;
  if (expVM.distributorName !== '') {
    url = url + '&searchKey=' + expVM.distributorName;
  }
  return expVM.$http.get(url).then(function(response) {
    expVM.expiredData.push.apply(expVM.expiredData, response.data.items);
    expVM.total.count = response.data.total.totalCount;
    expVM.total.sum = response.data.total.totalUnimoney;
    expVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return loading = false;
  }, function(error) {
    loading = false;
    return console.log(error);
  });
});

$("#quarter-picker").quarterPicker({
  title: "",
  changeEvent: tbcVM.quarterChange
});

$("#quarter-picker-no-all").quarterPickerNoAll({
  title: "",
  changeEvent: hbcVM.quarterChange
});

$("#quarter-picker-not-exchanged").quarterPicker({
  title: "",
  changeEvent: necgVM.quarterChange
});

$("#quarter-picker-expired").quarterPickerNoAll({
  title: "",
  changeEvent: expVM.quarterChange
});
