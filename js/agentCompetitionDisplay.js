var baseUrl, cdVM, confirmUrl, confirmedNotVM, confirmedVM, getYearQuarterFromPicker, hideDialog, isAllowSearchButton, loading, page, perPage, showDialog, switchTap, tbcVM, userId, _ref;

$("title")[0].innerText = "門市陳列佈置申請";

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

getYearQuarterFromPicker = function(yearQuarter) {
  var quarter, tmpQuarter, tmpYear, year;
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
  return {
    year: year,
    quarter: quarter
  };
};

showDialog = function(id) {
  var dialog, mask;
  mask = '#' + id + ' ' + '.weui-mask';
  dialog = '#' + id + ' ' + '.weui-dialog';
  $(mask).addClass("weui-mask--visible");
  return $(dialog).addClass("weui-dialog--visible");
};

hideDialog = function(id) {
  var dialog, mask;
  mask = '#' + id + ' ' + '.weui-mask';
  dialog = '#' + id + ' ' + '.weui-dialog';
  $(mask).removeClass("weui-mask--visible");
  return $(dialog).removeClass("weui-dialog--visible");
};

Vue.http.interceptors.push(function(request, next) {
  request.url = request.getUrl() + "&v=" + new Date().getTime();
  return next(function(response) {
    var result;
    if (response.body.code !== void 0) {
      result = {
        code: response.body.code,
        message: response.body.message,
        items: [],
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

perPage = 10;

page = 1;

if ((_ref = util.queryMap) != null ? _ref.userId : void 0) {
  userId = util.queryMap.userId;
}

baseUrl = '/api/game/apply-competition/agent-competition-list?userId=' + userId + '&per-page=' + perPage;

confirmUrl = '/api/game/apply-competition/participate?userId=' + userId;

loading = false;

isAllowSearchButton = false;

tbcVM = new Vue({
  el: '#toBeConfirmed',
  data: {
    toBeConfirmedData: [],
    isShowloading: false,
    isLoadMore: false,
    distributorName: '',
    type: "toBeDetermined",
    currentDistributor: '',
    currentId: '',
    joins: []
  },
  methods: {
    confirm: function(id, distributorName) {
      this.currentDistributor = distributorName;
      this.currentId = id;
      this.joins = [];
      return showDialog('joinWhich');
    },
    chooseDialogCancel: function() {
      return hideDialog('joinWhich');
    },
    chooseDialogConfrim: function() {
      var url;
      if (this.joins.length === 0) {
        hideDialog('joinWhich');
        return;
      }
      url = confirmUrl + '&competitionStatus=participateIn' + '&distributorId=' + this.currentId + '&competitionType=' + this.joins.toString();
      return this.$http.get(url).then(function(response) {
        return hideDialog('joinWhich');
      }, function(error) {
        console.log(error);
        return hideDialog('joinWhich');
      });
    },
    quarterChange: function() {
      var quarter, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker').val();
      yearQuarter = getYearQuarterFromPicker(yearQuarter);
      year = yearQuarter.year;
      quarter = yearQuarter.quarter;
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      this.isLoadMore = false;
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.toBeConfirmedData = response.data.items;
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      isAllowSearchButton = true;
      return this.quarterChange();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.quarterChange();
    },
    loadData: function() {
      var quarter, url, year;
      this.distributorName = "";
      year = 0;
      quarter = 0;
      $('#quarter-picker').val('全部');
      page = 1;
      this.isLoadMore = false;
      this.isShowloading = true;
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
      return this.$http.get(url).then(function(response) {
        this.toBeConfirmedData = response.data.items;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    }
  }
});

confirmedVM = new Vue({
  el: '#confirmed',
  data: {
    confirmedData: [],
    isShowloading: false,
    isLoadMore: false,
    distributorName: '',
    type: "participateIn"
  },
  methods: {
    quarterChange: function() {
      var quarter, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker-confirmed').val();
      yearQuarter = getYearQuarterFromPicker(yearQuarter);
      year = yearQuarter.year;
      quarter = yearQuarter.quarter;
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      this.isLoadMore = false;
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.confirmedData = response.data.items;
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      isAllowSearchButton = true;
      return this.quarterChange();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.quarterChange();
    },
    loadData: function() {
      var quarter, url, year;
      this.distributorName = "";
      year = 0;
      quarter = 0;
      $('#quarter-picker-confirmed').val('全部');
      page = 1;
      this.isLoadMore = false;
      this.isShowloading = true;
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
      return this.$http.get(url).then(function(response) {
        this.confirmedData = response.data.items;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    }
  }
});

confirmedNotVM = new Vue({
  el: '#confirmedNot',
  data: {
    confirmedNotData: [],
    isShowloading: false,
    isLoadMore: false,
    distributorName: '',
    type: "notParticipateIn"
  },
  methods: {
    quarterChange: function() {
      var quarter, url, year, yearQuarter;
      page = 1;
      yearQuarter = $('#quarter-picker-confirmed-not').val();
      yearQuarter = getYearQuarterFromPicker(yearQuarter);
      year = yearQuarter.year;
      quarter = yearQuarter.quarter;
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      this.isLoadMore = false;
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.confirmedNotData = response.data.items;
        return this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      isAllowSearchButton = true;
      return this.quarterChange();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.quarterChange();
    },
    loadData: function() {
      var quarter, url, year;
      this.distributorName = "";
      year = 0;
      quarter = 0;
      $('#quarter-picker-confirmed-not').val('全部');
      page = 1;
      this.isLoadMore = false;
      this.isShowloading = true;
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
      return this.$http.get(url).then(function(response) {
        this.confirmedNotData = response.data.items;
        this.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
        return this.isShowloading = false;
      }, function(error) {
        return console.log(error);
      });
    }
  }
});

cdVM = new Vue({
  el: "#competitionDisplay",
  methods: {
    loadToBeConfirmed: function(e) {
      switchTap(e.currentTarget);
      return tbcVM.loadData();
    },
    loadConfirmed: function(e) {
      switchTap(e.currentTarget);
      return confirmedVM.loadData();
    },
    loadconfirmedNot: function(e) {
      switchTap(e.currentTarget);
      return confirmedNotVM.loadData();
    }
  }
});

tbcVM.loadData();

$("#toBeConfirmed").pullToRefresh().on("pull-to-refresh", function() {
  var quarter, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker').val();
  yearQuarter = getYearQuarterFromPicker(yearQuarter);
  year = yearQuarter.year;
  quarter = yearQuarter.quarter;
  url = baseUrl + '&competitionStatus=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
  if (tbcVM.distributorName !== '') {
    url = url + '&searchKey=' + tbcVM.distributorName;
  }
  tbcVM.isLoadMore = false;
  tbcVM.isShowloading = true;
  return tbcVM.$http.get(url).then(function(response) {
    tbcVM.isShowloading = false;
    tbcVM.toBeConfirmedData = response.data.items;
    tbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#confirmed").pullToRefresh().on("pull-to-refresh", function() {
  var quarter, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker-confirmed').val();
  yearQuarter = getYearQuarterFromPicker(yearQuarter);
  year = yearQuarter.year;
  quarter = yearQuarter.quarter;
  url = baseUrl + '&competitionStatus=' + confirmedVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
  if (confirmedVM.distributorName !== '') {
    url = url + '&searchKey=' + confirmedVM.distributorName;
  }
  confirmedVM.isLoadMore = false;
  confirmedVM.isShowloading = true;
  return confirmedVM.$http.get(url).then(function(response) {
    confirmedVM.isShowloading = false;
    confirmedVM.confirmedData = response.data.items;
    confirmedVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#confirmedNot").pullToRefresh().on("pull-to-refresh", function() {
  var quarter, url, year, yearQuarter, _self;
  _self = $(this);
  page = 1;
  yearQuarter = $('#quarter-picker-confirmed-not').val();
  yearQuarter = getYearQuarterFromPicker(yearQuarter);
  year = yearQuarter.year;
  quarter = yearQuarter.quarter;
  url = baseUrl + '&competitionStatus=' + confirmedNotVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
  if (confirmedNotVM.distributorName !== '') {
    url = url + '&searchKey=' + confirmedNotVM.distributorName;
  }
  confirmedNotVM.isLoadMore = false;
  confirmedNotVM.isShowloading = true;
  return confirmedNotVM.$http.get(url).then(function(response) {
    confirmedNotVM.isShowloading = false;
    confirmedNotVM.confirmedNotData = response.data.items;
    confirmedNotVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return _self.pullToRefreshDone();
  }, function(error) {
    _self.pullToRefreshDone();
    return console.log(error);
  });
});

$("#toBeConfirmed").infinite(20).on("infinite", function() {
  var quarter, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!tbcVM.isLoadMore) {
    return;
  }
  loading = true;
  page += 1;
  yearQuarter = $('#quarter-picker').val();
  yearQuarter = getYearQuarterFromPicker(yearQuarter);
  year = yearQuarter.year;
  quarter = yearQuarter.quarter;
  url = baseUrl + '&competitionStatus=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
  if (tbcVM.distributorName !== '') {
    url = url + '&searchKey=' + tbcVM.distributorName;
  }
  return tbcVM.$http.get(url).then(function(response) {
    tbcVM.toBeConfirmedData.push.apply(tbcVM.toBeConfirmedData, response.data.items);
    tbcVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return loading = false;
  }, function(error) {
    loading = false;
    return console.log(error);
  });
});

$("#confirmed").infinite(20).on("infinite", function() {
  var quarter, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!confirmedVM.isLoadMore) {
    return;
  }
  loading = true;
  page += 1;
  yearQuarter = $('#quarter-picker-confirmed').val();
  yearQuarter = getYearQuarterFromPicker(yearQuarter);
  year = yearQuarter.year;
  quarter = yearQuarter.quarter;
  url = baseUrl + '&competitionStatus=' + confirmedVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
  if (confirmedVM.distributorName !== '') {
    url = url + '&searchKey=' + confirmedVM.distributorName;
  }
  return confirmedVM.$http.get(url).then(function(response) {
    confirmedVM.confirmedData.push.apply(confirmedVM.confirmedData, response.data.items);
    confirmedVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
    return loading = false;
  }, function(error) {
    loading = false;
    return console.log(error);
  });
});

$("#confirmedNot").infinite(20).on("infinite", function() {
  var quarter, url, year, yearQuarter;
  if (loading) {
    return;
  }
  if (!confirmedNotVM.isLoadMore) {
    return;
  }
  loading = true;
  page += 1;
  yearQuarter = $('#quarter-picker-confirmed-not').val();
  yearQuarter = getYearQuarterFromPicker(yearQuarter);
  year = yearQuarter.year;
  quarter = yearQuarter.quarter;
  url = baseUrl + '&competitionStatus=' + confirmedNotVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page;
  if (confirmedNotVM.distributorName !== '') {
    url = url + '&searchKey=' + tbcVM.distributorName;
  }
  return confirmedNotVM.$http.get(url).then(function(response) {
    confirmedNotVM.confirmedNotData.push.apply(confirmedNotVM.confirmedNotData, response.data.items);
    confirmedNotVM.isLoadMore = response.data._meta.currentPage < response.data._meta.pageCount ? true : false;
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

$("#quarter-picker-confirmed").quarterPicker({
  title: "",
  changeEvent: confirmedVM.quarterChange
});

$("#quarter-picker-confirmed-not").quarterPicker({
  title: "",
  changeEvent: confirmedNotVM.quarterChange
});
