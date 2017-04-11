var baseUrl, dmVM, isAllowSearchButton, userId, _ref;

$("title")[0].innerText = "業績追蹤系統";

Vue.filter('to-currency', function(value) {
  return accounting.formatNumber(value);
});

if ((_ref = util.queryMap) != null ? _ref.userId : void 0) {
  userId = util.queryMap.userId;
}

baseUrl = '/api/ufstrust/agent/web-assessment-list?userId=' + userId;

isAllowSearchButton = false;

Vue.http.interceptors.push(function(request, next) {
  request.url = request.getUrl() + "&v=" + new Date().getTime();
  return next(function(response) {
    var result;
    if (response.body.code !== void 0) {
      result = {
        code: response.body.code,
        message: response.body.message,
        items: [],
        type: 'assessment'
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

dmVM = new Vue({
  el: '#distributorManagement',
  data: {
    dataList: [],
    isShowloading: false,
    distributorName: '',
    isAllCheck: true
  },
  methods: {
    initData: function() {
      var month, quarter, url, year;
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
      quarter = month % 3 === 0 ? month / 3 : Math.floor(month / 3) + 1;
      $('#quarter-picker').val(year + '年' + ' ' + '第' + quarter + '季度');
      this.isShowloading = true;
      url = baseUrl + '&year=' + year + '&quarter=' + quarter;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.dataList = response.data.items;
        if (response.data.type === 'target') {
          this.isAllCheck = false;
          if (response.data.items.length === 0 && response.data.type === 'target') {
            return $.modal({
              title: "",
              text: "當前季度目標尚未全部核可",
              buttons: [
                {
                  text: "確認"
                }
              ]
            });
          }
        } else {
          return this.isAllCheck = true;
        }
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
      url = baseUrl + '&year=' + year + '&quarter=' + quarter;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        $('#status-picker').val('全部');
        this.dataList = response.data.items;
        this.isShowloading = false;
        if (response.data.type === 'target') {
          this.isAllCheck = false;
          if (response.data.items.length === 0 && response.data.type === 'target') {
            return $.modal({
              title: "",
              text: "當前季度目標尚未全部核可",
              buttons: [
                {
                  text: "確認"
                }
              ]
            });
          }
        } else {
          return this.isAllCheck = true;
        }
      }, function(error) {
        return console.log(error);
      });
    },
    commonSearch: function() {
      var quarter, status, tmpQuarter, tmpYear, url, year, yearQuarter;
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
      url = baseUrl + '&year=' + year + '&quarter=' + quarter;
      if (!this.isAllCheck && $('#status-picker').val() !== '全部') {
        status = $('#status-picker').val() === '已核可' ? 3 : '1,2';
        url += '&targetStatus=' + status;
      }
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      this.isShowloading = true;
      return this.$http.get(url).then(function(response) {
        this.isShowloading = false;
        this.dataList = response.data.items;
        if (response.data.type === 'target') {
          this.isAllCheck = false;
          if (response.data.items.length === 0 && response.data.type === 'target') {
            return $.modal({
              title: "",
              text: "當前季度目標尚未全部核可",
              buttons: [
                {
                  text: "確認"
                }
              ]
            });
          }
        } else {
          return this.isAllCheck = true;
        }
      }, function(error) {
        return console.log(error);
      });
    },
    statusChange: function() {
      return this.commonSearch();
    },
    search: function() {
      isAllowSearchButton = true;
      return this.commonSearch();
    },
    blurSearch: function() {
      if (isAllowSearchButton === true) {
        return;
      }
      return this.commonSearch();
    },
    clear: function(e) {
      var $input;
      $input = $(e.target).parents(".weui-search-bar").find(".weui-search-bar__input");
      if ($input.val()) {
        $input.val("").focus();
      }
      return this.distributorName = '';
    }
  },
  computed: {
    total: function() {
      var actual, count, result, target, totalRate;
      count = this.dataList.length;
      target = 0;
      actual = 0;
      totalRate = 0;
      this.dataList.map(function(item) {
        target += item.saleTarget;
        actual += item.sales;
        return totalRate += item.sales / item.saleTarget;
      });
      result = {
        count: count,
        target: target,
        actual: actual,
        getRate: (totalRate * 100 / count).toFixed(1) + '%'
      };
      return result;
    }
  }
});

dmVM.initData();

$("#quarter-picker").quarterPickerNoAll({
  title: "",
  changeEvent: dmVM.quarterChange
});

$("#status-picker").statusPicker({
  title: "",
  changeEvent: dmVM.statusChange
});
