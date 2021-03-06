$("title")[0].innerText = "業績追蹤系統"

Vue.filter('to-currency', (value) ->
  return accounting.formatNumber value
)

userId = util.queryMap.userId if util.queryMap?.userId
baseUrl = '/api/ufstrust/agent/web-assessment-list?userId=' + userId
isAllowSearchButton = false

Vue.http.interceptors.push((request, next)->
  request.url = request.getUrl() + "&v=" + new Date().getTime()
  next((response)->

    if response.body.code isnt undefined
      result =
        code : response.body.code
        message : response.body.message
        items : []
        type : 'assessment'

      response.body = result

      $.modal(
        title: ""
        text: "errorCode:" + response.body.code + ", " + response.body.message
        buttons: [
          {
            text: "確認"
          }
        ]
      )

    return response
  )
)

dmVM = new Vue(
  el : '#distributorManagement'
  data :
    dataList : []
    isShowloading : false
    distributorName : ''
    isAllCheck : true
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
          this.isShowloading = false
          this.dataList = response.data.items
          if response.data.type is 'target'
            this.isAllCheck = false
            if response.data.items.length is 0 and response.data.type is 'target'
              $.modal(
                title: ""
                text: "當前季度目標尚未全部核可"
                buttons: [
                  {
                    text: "確認"
                  }
                ]
              )
          else
            this.isAllCheck = true
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
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
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          $('#status-picker').val '全部'
          this.dataList = response.data.items
          this.isShowloading = false
          if response.data.type is 'target'
            this.isAllCheck = false
            if response.data.items.length is 0 and response.data.type is 'target'
              $.modal(
                title: ""
                text: "當前季度目標尚未全部核可"
                buttons: [
                  {
                    text: "確認"
                  }
                ]
              )
          else
            this.isAllCheck = true
          # if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
        (error)->
          console.log error
      )
    commonSearch : ()->
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
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.dataList = response.data.items
          if response.data.type is 'target'
            this.isAllCheck = false
            if response.data.items.length is 0 and response.data.type is 'target'
              $.modal(
                title: ""
                text: "當前季度目標尚未全部核可"
                buttons: [
                  {
                    text: "確認"
                  }
                ]
              )
          else
            this.isAllCheck = true
          # if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
        (error)->
          console.log error
      )
    statusChange : ()->
      this.commonSearch()
    search : ()->
      isAllowSearchButton = true
      this.commonSearch()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.commonSearch()
    clear : (e)->
      $input = $(e.target).parents(".weui-search-bar").find(".weui-search-bar__input")
      if $input.val()
        $input.val("").focus()
      this.distributorName = ''
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
        getRate : (totalRate * 100 / count).toFixed(1) + '%'
      return result
)

dmVM.initData()

$("#quarter-picker").quarterPickerNoAll(
  title: ""
  changeEvent : dmVM.quarterChange
)

$("#status-picker").statusPicker(
  title: ""
  changeEvent : dmVM.statusChange
)
