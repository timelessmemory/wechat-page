$("title")[0].innerText = "業績追蹤系統"

Vue.filter('to-currency', (value) ->
  return accounting.formatNumber value
)

userId = util.queryMap.userId if util.queryMap?.userId
baseUrl = '/api/ufstrust/agent/web-assessment-list?userId=' + userId

dmVM = new Vue(
  el : '#distributorManagement'
  data :
    dataList : []
    isShowloading : false
    distributorName : ''
    isAllCheck : false
  methods :
    initData : ()->
      year = new Date().getFullYear()
      month = new Date().getMonth() + 1
      quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      $('#quarter-picker').val(year + '年' + ' ' + '第' + quarter + '季度')

      this.isShowloading = true
      url = baseUrl + '&year=' + year + '&quarter=' + quarter
      this.$http.get(url).then(
        (response)->
          if response.data.type is 'target'
            this.isAllCheck = false
          else
            this.isAllCheck = true
          this.dataList = response.data.items
          if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
            $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isShowloading = false
        (error)->
          console.log error
      )
    quarterChange : ()->
      yearQuarter = $('#quarter-picker').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&year=' + year + '&quarter=' + quarter
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.$http.get(url).then(
        (response)->
          if response.data.type is 'target'
            this.isAllCheck = false
          else
            this.isAllCheck = true
          this.dataList = response.data.items
          if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
            $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          $('#status-picker').val '全部'
        (error)->
          console.log error
      )
    search : ()->
      yearQuarter = $('#quarter-picker').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&year=' + year + '&quarter=' + quarter
      if not this.isAllCheck and $('#status-picker').val() isnt '全部'
        status = if $('#status-picker').val() is '已核可' then 3 else '1,2'
        url += '&targetStatus=' + status
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.$http.get(url).then(
        (response)->
          if response.data.type is 'target'
            this.isAllCheck = false
          else
            this.isAllCheck = true
          this.dataList = response.data.items
          if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
            $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
        (error)->
          console.log error
      )
    statusChange : ()->
      this.search()
  computed :
    total : ()->
      count = this.dataList.length
      target = 0
      actual = 0
      totalRate = 0

      this.dataList.map((item)->
        target += item.saleTarget
        actual += item.sales
        totalRate += item.sales / item.saleTarget
      )

      result =
        count : count
        target : target
        actual : actual
        getRate : (totalRate * 100 / count).toFixed(2) + '%'
      return result
)

dmVM.initData()

$("#quarter-picker").quarterPickerNoAll(
  title: "季度"
  changeEvent : dmVM.quarterChange
)

$("#status-picker").statusPicker(
  title: ""
  changeEvent : dmVM.statusChange
)
