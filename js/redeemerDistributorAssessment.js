var baseUrl, dmVM, userId, _ref;

$("title")[0].innerText = "盤商管理";

Vue.filter('to-currency', function(value) {
  return accounting.formatNumber(value);
});

if ((_ref = util.queryMap) != null ? _ref.userId : void 0) {
  userId = util.queryMap.userId;
}

baseUrl = '/api/ufstrust/redeemer/web-assessment-list?userId=' + userId;

Vue.http.interceptors.push(function(request, next) {
  return next(function(response) {
    var result;
    if (response.body.code !== void 0) {
      result = {
        code: response.body.code,
        message: response.body.message,
        items: []
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
    distributorName: ''
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
        this.dataList = response.data.items;
        if (response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          $('#quarter-picker').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
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
      url = baseUrl + '&year=' + year + '&quarter=' + quarter;
      if (this.distributorName !== '') {
        url = url + '&searchKey=' + this.distributorName;
      }
      return this.$http.get(url).then(function(response) {
        this.dataList = response.data.items;
        if (quarter !== 0 && response.data.items.length > 0 && response.data.items[0].quarter !== quarter) {
          return $('#quarter-picker').val(response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度');
        }
      }, function(error) {
        return console.log(error);
      });
    },
    search: function() {
      return this.quarterChange();
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
        getRate: (totalRate * 100 / count).toFixed(2) + '%'
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
