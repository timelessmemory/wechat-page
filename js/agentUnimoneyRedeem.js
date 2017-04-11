var baseDealerUrl, baseUrl, csVM, expVM, getDealerId, hbcVM, isAllowSearchButton, loading, necgVM, page, perPage, switchTap, tbcVM, userId, _ref;

$("title")[0].innerText = "優利金核銷系統";

FastClick.attach(document.body);

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
  $.showTab($a);
  return $($a.context.hash).find('#searchBar').removeClass("weui-search-bar_focusing");
};

Vue.filter('to-currency', function(value) {
  return accounting.formatNumber(value);
});

getDealerId = function(dealerData, name) {
  var id;
  id = '';
  dealerData.map(function(item) {
    var key, _results;
    _results = [];
    for (key in item) {
      if (item[key].name === name) {
        _results.push(id = key);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });
  return id;
};

if ((_ref = util.queryMap) != null ? _ref.userId : void 0) {
  userId = util.queryMap.userId;
}

baseUrl = '/api/ufstrust/unimoney/web-unimoney-list?userId=' + userId;

baseDealerUrl = '/api/ufstrust/agent/redeemer-list?userId=' + userId;

perPage = 10;

page = 1;

loading = false;

isAllowSearchButton = false;

Vue.http.interceptors.push(function(request, next) {
  request.url = request.getUrl() + "&v=" + new Date().getTime();
  return next(function(response) {
    var result;
    if (response.body.code !== void 0) {
      if (response.url.indexOf(baseDealerUrl) !== -1) {
        result = {
          code: response.body.code,
          message: response.body.message,
          key: []
        };
      } else {
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
      }
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
    byWhat: 'distributor',
    total: {
      count: 0,
      sum: 0
    },
    dealers: [],
    isShowPicker: false,
    dealerData: []
  },
  methods: {
    quarterChange: function() {
      if (!this.isCheckPs) {
        return this.loadDealer();
      } else {
        return this.getData();
      }
    },
    getData: function() {
      var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
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
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      if (!this.isCheckPs) {
        dealer = getDealerId(this.dealerData, $('#productor-picker-to-checked').val());
        url = url + '&redeemerId=' + dealer;
      }
      this.isLoadMore = false;
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.toBeCheckedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      isAllowSearchButton = true;
      return this.getData();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.getData();
    },
    loadDealer: function() {
      var dealerUrl, quarter, tmpQuarter, tmpYear, year, yearQuarter;
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
      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1';
      return this.$http.get(dealerUrl).then(function(response) {
        var _self;
        _self = this;
        this.dealers = [];
        this.dealerData = response.data;
        response.data.map(function(item) {
          var key, _results;
          _results = [];
          for (key in item) {
            _results.push(_self.dealers.push(item[key].name));
          }
          return _results;
        });
        if (this.dealers.length > 0) {
          $('#productor-picker-to-checked').val(this.dealers[0]);
          $("#productor-picker-to-checked").productorPicker({
            title: "",
            changeEvent: this.getData,
            options: this.dealers
          });
          this.isShowPicker = true;
          return this.getData();
        } else {
          this.isShowPicker = false;
          this.toBeCheckedData = [];
          this.total.count = 0;
          return this.total.sum = 0;
        }
      }, function(error) {
        return console.log(error);
      });
    },
    loadData: function() {
      var quarter, url, year;
      year = 0;
      quarter = 0;
      $('#quarter-picker').val('全部');
      this.distributorName = "";
      this.byWhat = "distributor";
      page = 1;
      this.isLoadMore = false;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      return this.$http.get(url).then(function(response) {
        this.toBeCheckedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    }
  },
  computed: {
    isCheckPs: function() {
      var isCheckPs;
      isCheckPs = this.byWhat === 'distributor' ? true : false;
      return isCheckPs;
    }
  },
  watch: {
    byWhat: function(newValue) {
      if (newValue === 'distributor') {
        return this.getData();
      } else {
        return this.loadDealer();
      }
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
    byWhat: 'distributor',
    total: {
      count: 0,
      sum: 0
    },
    dealers: [],
    isShowPicker: false,
    dealerData: []
  },
  methods: {
    quarterChange: function() {
      if (!this.isCheckPs) {
        return this.loadDealer();
      } else {
        return this.getData();
      }
    },
    getData: function() {
      var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker-no-all').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      year = tmpYear.substring(0, tmpYear.indexOf("年"));
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      if (!this.isCheckPs) {
        dealer = getDealerId(this.dealerData, $('#productor-picker-have-checked').val());
        url = url + '&redeemerId=' + dealer;
      }
      this.isLoadMore = false;
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.haveBeenCheckedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    loadDealer: function() {
      var dealerUrl, quarter, tmpQuarter, tmpYear, year, yearQuarter;
      yearQuarter = $('#quarter-picker-no-all').val();
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
      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1';
      return this.$http.get(dealerUrl).then(function(response) {
        var _self;
        _self = this;
        this.dealers = [];
        this.dealerData = response.data;
        response.data.map(function(item) {
          var key, _results;
          _results = [];
          for (key in item) {
            _results.push(_self.dealers.push(item[key].name));
          }
          return _results;
        });
        if (this.dealers.length > 0) {
          $('#productor-picker-have-checked').val(this.dealers[0]);
          $("#productor-picker-have-checked").productorPicker({
            title: "",
            changeEvent: this.getData,
            options: this.dealers
          });
          this.isShowPicker = true;
          return this.getData();
        } else {
          this.isShowPicker = false;
          this.haveBeenCheckedData = [];
          this.total.count = 0;
          return this.total.sum = 0;
        }
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      isAllowSearchButton = true;
      return this.getData();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.getData();
    },
    loadData: function() {
      var month, quarter, url, year;
      this.distributorName = "";
      this.byWhat = "distributor";
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker-no-all').val(year + '年' + ' ' + '第' + quarter + '季度');
      page = 1;
      this.isLoadMore = false;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      return this.$http.get(url).then(function(response) {
        this.haveBeenCheckedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        return this.isShowloading = false;
      }, function(error) {
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
    isCheckPs: function() {
      var isCheckPs;
      isCheckPs = this.byWhat === 'distributor' ? true : false;
      return isCheckPs;
    }
  },
  watch: {
    byWhat: function(newValue) {
      if (newValue === 'distributor') {
        return this.getData();
      } else {
        return this.loadDealer();
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
    byWhat: 'distributor',
    total: {
      count: 0,
      sum: 0
    },
    dealers: [],
    isShowPicker: false,
    dealerData: []
  },
  methods: {
    quarterChange: function() {
      if (!this.isCheckPs) {
        return this.loadDealer();
      } else {
        return this.getData();
      }
    },
    getData: function() {
      var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
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
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      if (!this.isCheckPs) {
        dealer = getDealerId(this.dealerData, $('#productor-picker-not-exchanged').val());
        url = url + '&redeemerId=' + dealer;
      }
      this.isLoadMore = false;
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.notExchangedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    loadDealer: function() {
      var dealerUrl, quarter, tmpQuarter, tmpYear, year, yearQuarter;
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
      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1';
      return this.$http.get(dealerUrl).then(function(response) {
        var _self;
        _self = this;
        this.dealers = [];
        this.dealerData = response.data;
        response.data.map(function(item) {
          var key, _results;
          _results = [];
          for (key in item) {
            _results.push(_self.dealers.push(item[key].name));
          }
          return _results;
        });
        if (this.dealers.length > 0) {
          $('#productor-picker-not-exchanged').val(this.dealers[0]);
          $("#productor-picker-not-exchanged").productorPicker({
            title: "",
            changeEvent: this.getData,
            options: this.dealers
          });
          this.isShowPicker = true;
          return this.getData();
        } else {
          this.isShowPicker = false;
          this.notExchangedData = [];
          this.total.count = 0;
          return this.total.sum = 0;
        }
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      isAllowSearchButton = true;
      return this.getData();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.getData();
    },
    loadData: function() {
      var quarter, url, year;
      this.distributorName = "";
      this.byWhat = "distributor";
      year = 0;
      quarter = 0;
      $('#quarter-picker-not-exchanged').val('全部');
      page = 1;
      this.isLoadMore = false;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      return this.$http.get(url).then(function(response) {
        this.notExchangedData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    }
  },
  computed: {
    isCheckPs: function() {
      var isCheckPs;
      isCheckPs = this.byWhat === 'distributor' ? true : false;
      return isCheckPs;
    }
  },
  watch: {
    byWhat: function(newValue) {
      if (newValue === 'distributor') {
        return this.getData();
      } else {
        return this.loadDealer();
      }
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
    byWhat: 'distributor',
    total: {
      count: 0,
      sum: 0
    },
    dealers: [],
    isShowPicker: false,
    dealerData: []
  },
  methods: {
    quarterChange: function() {
      if (!this.isCheckPs) {
        return this.loadDealer();
      } else {
        return this.getData();
      }
    },
    getData: function() {
      var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker-expired').val();
      tmpYear = yearQuarter.split(' ')[0];
      tmpQuarter = yearQuarter.split(' ')[1];
      year = tmpYear.substring(0, tmpYear.indexOf("年"));
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      if (!this.isCheckPs) {
        dealer = getDealerId(this.dealerData, $('#productor-picker-expired').val());
        url = url + '&redeemerId=' + dealer;
      }
      this.isLoadMore = false;
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.expiredData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    loadDealer: function() {
      var dealerUrl, quarter, tmpQuarter, tmpYear, year, yearQuarter;
      yearQuarter = $('#quarter-picker-expired').val();
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
      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1';
      return this.$http.get(dealerUrl).then(function(response) {
        var _self;
        _self = this;
        this.dealers = [];
        this.dealerData = response.data;
        response.data.map(function(item) {
          var key, _results;
          _results = [];
          for (key in item) {
            _results.push(_self.dealers.push(item[key].name));
          }
          return _results;
        });
        if (this.dealers.length > 0) {
          $('#productor-picker-expired').val(this.dealers[0]);
          $("#productor-picker-expired").productorPicker({
            title: "",
            changeEvent: this.getData,
            options: this.dealers
          });
          this.isShowPicker = true;
          return this.getData();
        } else {
          this.isShowPicker = false;
          this.expiredData = [];
          this.total.count = 0;
          return this.total.sum = 0;
        }
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      isAllowSearchButton = true;
      return this.getData();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.getData();
    },
    loadData: function() {
      var month, quarter, url, year;
      this.distributorName = "";
      this.byWhat = "distributor";
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker-expired').val(year + '年' + ' ' + '第' + quarter + '季度');
      page = 1;
      this.isLoadMore = false;
      this.isShowloading = true;
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat;
      return this.$http.get(url).then(function(response) {
        this.expiredData = response.data.items;
        this.total.count = response.data.total.totalCount;
        this.total.sum = response.data.total.totalUnimoney;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    }
  },
  computed: {
    isCheckPs: function() {
      var isCheckPs;
      isCheckPs = this.byWhat === 'distributor' ? true : false;
      return isCheckPs;
    }
  },
  watch: {
    byWhat: function(newValue) {
      if (newValue === 'distributor') {
        return this.getData();
      } else {
        return this.loadDealer();
      }
    }
  }
});

csVM = new Vue({
  el: "#checkSystem",
  methods: {
    loadToBeChecked: function(e) {
      switchTap(e.currentTarget);
      return tbcVM.loadData();
    },
    loadHaveBeenChecked: function(e) {
      switchTap(e.currentTarget);
      return hbcVM.loadData();
    },
    loadNotExchanged: function(e) {
      switchTap(e.currentTarget);
      return necgVM.loadData();
    },
    loadExpired: function(e) {
      switchTap(e.currentTarget);
      return expVM.loadData();
    }
  }
});

tbcVM.loadData();

$("#toBeChecked").pullToRefresh().on("pull-to-refresh", function() {
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
  _self = $(this);
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
  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + tbcVM.byWhat;
  if (tbcVM.distributorName !== '') {
    url = url + '&searchKey=' + tbcVM.distributorName;
  }
  if (!tbcVM.isCheckPs) {
    dealer = getDealerId(tbcVM.dealerData, $('#productor-picker-to-checked').val());
    url = url + '&redeemerId=' + dealer;
  }
  tbcVM.isLoadMore = false;
  tbcVM.isShowloading = true;
  return tbcVM.$http.get(url).then(function(response) {
    tbcVM.isShowloading = false;
    tbcVM.toBeCheckedData = response.data.items;
    tbcVM.total.count = response.data.total.totalCount;
    tbcVM.total.sum = response.data.total.totalUnimoney;
    tbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#haveBeenChecked").pullToRefresh().on("pull-to-refresh", function() {
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker-no-all').val();
  tmpYear = yearQuarter.split(' ')[0];
  tmpQuarter = yearQuarter.split(' ')[1];
  year = tmpYear.substring(0, tmpYear.indexOf("年"));
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + hbcVM.byWhat;
  if (hbcVM.distributorName !== '') {
    url = url + '&searchKey=' + hbcVM.distributorName;
  }
  if (!hbcVM.isCheckPs) {
    dealer = getDealerId(hbcVM.dealerData, $('#productor-picker-have-checked').val());
    url = url + '&redeemerId=' + dealer;
  }
  hbcVM.isLoadMore = false;
  hbcVM.isShowloading = true;
  return hbcVM.$http.get(url).then(function(response) {
    hbcVM.isShowloading = false;
    hbcVM.haveBeenCheckedData = response.data.items;
    hbcVM.total.count = response.data.total.totalCount;
    hbcVM.total.sum = response.data.total.totalUnimoney;
    hbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#notExchanged").pullToRefresh().on("pull-to-refresh", function() {
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
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
  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + necgVM.byWhat;
  if (necgVM.distributorName !== '') {
    url = url + '&searchKey=' + necgVM.distributorName;
  }
  if (!necgVM.isCheckPs) {
    dealer = getDealerId(necgVM.dealerData, $('#productor-picker-not-exchanged').val());
    url = url + '&redeemerId=' + dealer;
  }
  necgVM.isLoadMore = false;
  necgVM.isShowloading = true;
  return necgVM.$http.get(url).then(function(response) {
    necgVM.isShowloading = false;
    necgVM.notExchangedData = response.data.items;
    necgVM.total.count = response.data.total.totalCount;
    necgVM.total.sum = response.data.total.totalUnimoney;
    necgVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#expired").pullToRefresh().on("pull-to-refresh", function() {
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker-expired').val();
  tmpYear = yearQuarter.split(' ')[0];
  tmpQuarter = yearQuarter.split(' ')[1];
  year = tmpYear.substring(0, tmpYear.indexOf("年"));
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"));
  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + expVM.byWhat;
  if (expVM.distributorName !== '') {
    url = url + '&searchKey=' + expVM.distributorName;
  }
  if (!expVM.isCheckPs) {
    dealer = getDealerId(expVM.dealerData, $('#productor-picker-expired').val());
    url = url + '&redeemerId=' + dealer;
  }
  expVM.isLoadMore = false;
  expVM.isShowloading = true;
  return expVM.$http.get(url).then(function(response) {
    expVM.isShowloading = false;
    expVM.expiredData = response.data.items;
    expVM.total.count = response.data.total.totalCount;
    expVM.total.sum = response.data.total.totalUnimoney;
    expVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#toBeChecked").infinite(20).on("infinite", function() {
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!tbcVM.isLoadMore) {
    return;
  }
  loading = true;
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
  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + tbcVM.byWhat;
  if (tbcVM.distributorName !== '') {
    url = url + '&searchKey=' + tbcVM.distributorName;
  }
  if (!tbcVM.isCheckPs) {
    dealer = getDealerId(tbcVM.dealerData, $('#productor-picker-to-checked').val());
    url = url + '&redeemerId=' + dealer;
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
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
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
  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + hbcVM.byWhat;
  if (hbcVM.distributorName !== '') {
    url = url + '&searchKey=' + hbcVM.distributorName;
  }
  if (!hbcVM.isCheckPs) {
    dealer = getDealerId(hbcVM.dealerData, $('#productor-picker-have-checked').val());
    url = url + '&redeemerId=' + dealer;
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
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
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
  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + necgVM.byWhat;
  if (necgVM.distributorName !== '') {
    url = url + '&searchKey=' + necgVM.distributorName;
  }
  if (!necgVM.isCheckPs) {
    dealer = getDealerId(necgVM.dealerData, $('#productor-picker-not-exchanged').val());
    url = url + '&redeemerId=' + dealer;
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
  var dealer, quarter, tmpQuarter, tmpYear, url, year, yearQuarter;
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
  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + expVM.byWhat;
  if (expVM.distributorName !== '') {
    url = url + '&searchKey=' + expVM.distributorName;
  }
  if (!expVM.isCheckPs) {
    dealer = getDealerId(expVM.dealerData, $('#productor-picker-expired').val());
    url = url + '&redeemerId=' + dealer;
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
