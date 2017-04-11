$("title")[0].innerText = "優利金核銷系統"

FastClick.attach(document.body)

switchTap = (currentTarget)->
  tmpVM.isShowFoot = if $(currentTarget).attr("href") is "#toBeChecked" then true else false
  ITEM_ON = "weui-bar__item--on"
  $a = $(currentTarget)
  href = $a.attr "href"
  if $a.hasClass(ITEM_ON)
    return
  if not /^#/.test(href)
    return
  $.showTab($a)
  $($a.context.hash).find('#searchBar').removeClass("weui-search-bar_focusing")

Vue.filter('to-currency', (value) ->
  return accounting.formatNumber value
)

userId = util.queryMap.userId if util.queryMap?.userId
baseUrl = '/api/ufstrust/unimoney/web-unimoney-list?userId=' + userId
checkUrl = '/api/ufstrust/unimoney/redeem-unimoneys?userId=' + userId
perPage = 10
page = 1
loading = false
isAllowSearchButton = false

Vue.http.interceptors.push((request, next)->
  request.url = request.getUrl() + "&v=" + new Date().getTime()

  next((response)->

    if response.body.code isnt undefined
      result =
        code : response.body.code
        message : response.body.message
        items : []
        total :
          totalCount : 0
          totalUnimoney : 0
        _meta :
          currentPage : 1
          pageCount : 0

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

tbcVM = new Vue(
  el : '#toBeChecked'
  data :
    toBeCheckedData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "isRedeeming"
    count : 0
    sum : 0
    offCount : 0
    offSum : 0
  methods :
    check : (param) ->
      _self = this
      url = checkUrl + '&ids=' + param
      this.$http.get(url).then( (response)->
        if response.data.successCount is 1
          $.modal(
            title : ""
            text : "優利金核可成功!"
            buttons : [
              {
                text : "確認"
                onClick : ()->
                  if _self.toBeCheckedData.length <= perPage
                    _self.quarterChange()
                  else
                    _self.toBeCheckedData.map((item)->
                      if item.id is param
                        _self.offSum += item.couponDenomination
                        _self.toBeCheckedData.splice(_self.toBeCheckedData.indexOf(item), 1)
                    )
                    _self.offCount++
              }
            ]
          )
        else
          $.modal(
            title : ""
            text : "優利金核可失敗!"
            buttons : [
              {
                text : "確認"
              }
            ]
          )
      , (error)->
        console.log(error)
      )
    checkAll : ()->
      _self = this

      yearQuarter = $('#quarter-picker').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = checkUrl + '&redeemAll=1' + '&year=' + year + '&quarter=' + quarter
      this.$http.get(url).then( (response)->
        if response.data.successCount > 0
          $.modal(
            title : ""
            text : "優利金核可成功!"
            buttons : [
              {
                text : "確認"
                onClick : ()->
                  _self.quarterChange()
              }
            ]
          )
        else
          $.modal(
            title : ""
            text : "優利金核可失敗!"
            buttons : [
              {
                text : "確認"
              }
            ]
          )
      , (error)->
        console.log error
      )
    quarterChange : ()->
      this.offCount = 0
      this.offSum = 0
      page = 1
      yearQuarter = $('#quarter-picker').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.toBeCheckedData = response.data.items
          this.count = response.data.total.totalCount
          this.sum = response.data.total.totalUnimoney
          # if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
        (error)->
          console.log error
      )
    search : ()->
      isAllowSearchButton = true
      this.quarterChange()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.quarterChange()
    loadData: ()->
      this.distributorName = ""
      this.offCount = 0
      this.offSum = 0

      # year = new Date().getFullYear()
      # month = new Date().getMonth() + 1
      # quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      # $('#quarter-picker').val(year + '年' + ' ' + '第' + quarter + '季度')

      year = 0
      quarter = 0
      $('#quarter-picker').val('全部')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      this.$http.get(url).then(
        (response)->
          this.toBeCheckedData = response.data.items
          this.count = response.data.total.totalCount
          this.sum = response.data.total.totalUnimoney
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
    allowCheck: ()->
      return if new Date().getDate() > 25 then true else false
  computed:
    total: ()->
      return {
        "count" :  this.count - this.offCount
        "unimoney" : this.sum - this.offSum
      }
)

tmpVM = new Vue(
  el: '#tmp'
  data:
    isShowFoot : true
  computed:
    toBeCheckedData : ()->
      tbcVM.toBeCheckedData
    isShowloading : ()->
      tbcVM.isShowloading
  methods:
    allowCheck : ()->
      tbcVM.allowCheck()
    checkAll : ()->
      tbcVM.checkAll()
)

hbcVM = new Vue(
  el : '#haveBeenChecked'
  data :
    haveBeenCheckedData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "hadRedeemed"
    total :
      count : 0
      sum : 0
  methods :
    quarterChange : ()->
      page = 1
      yearQuarter = $('#quarter-picker-no-all').val()
      tmpYear = yearQuarter.split(' ')[0]
      tmpQuarter = yearQuarter.split(' ')[1]
      year = tmpYear.substring(0, tmpYear.indexOf "年" )
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.haveBeenCheckedData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker-no-all').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
        (error)->
          console.log error
      )
    search : ()->
      isAllowSearchButton = true
      this.quarterChange()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.quarterChange()
    loadData: ()->
      this.distributorName = ""

      year = new Date().getFullYear()
      month = new Date().getMonth() + 1
      quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      $('#quarter-picker-no-all').val(year + '年' + ' ' + '第' + quarter + '季度')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      this.$http.get(url).then(
        (response)->
          this.haveBeenCheckedData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker-no-all').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
    isMark: (param)->
      if param is '' or param is undefined
        return false
      if param.split('-')[2] > 25
        return true
      else
        return false
)

necgVM = new Vue(
  el : '#notExchanged'
  data :
    notExchangedData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "notRedeemed"
    total :
      count : 0
      sum : 0
  methods :
    quarterChange : ()->
      page = 1
      yearQuarter = $('#quarter-picker-not-exchanged').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.notExchangedData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker-not-exchanged').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
        (error)->
          console.log error
      )
    search : ()->
      isAllowSearchButton = true
      this.quarterChange()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.quarterChange()
    loadData: ()->
      this.distributorName = ""

      # year = new Date().getFullYear()
      # month = new Date().getMonth() + 1
      # quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      # $('#quarter-picker-not-exchanged').val(year + '年' + ' ' + '第' + quarter + '季度')

      year = 0
      quarter = 0
      $('#quarter-picker-not-exchanged').val('全部')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      this.$http.get(url).then(
        (response)->
          this.notExchangedData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker-not-exchanged').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
)

expVM = new Vue(
  el : '#expired'
  data :
    expiredData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "hadExpired"
    total :
      count : 0
      sum : 0
  methods :
    quarterChange : ()->
      page = 1
      yearQuarter = $('#quarter-picker-expired').val()
      tmpYear = yearQuarter.split(' ')[0]
      tmpQuarter = yearQuarter.split(' ')[1]
      year = tmpYear.substring(0, tmpYear.indexOf "年" )
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.expiredData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker-expired').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
        (error)->
          console.log error
      )
    search : ()->
      isAllowSearchButton = true
      this.quarterChange()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.quarterChange()
    loadData: ()->
      this.distributorName = ""

      year = new Date().getFullYear()
      month = new Date().getMonth() + 1
      quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      $('#quarter-picker-expired').val(year + '年' + ' ' + '第' + quarter + '季度')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
      this.$http.get(url).then(
        (response)->
          this.expiredData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker-expired').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
)

##tab-switch
csVM = new Vue(
  el: "#checkSystem"
  methods:
    loadToBeChecked: (e)->
      switchTap(e.currentTarget)
      tbcVM.loadData()
    loadHaveBeenChecked: (e)->
      switchTap(e.currentTarget)
      hbcVM.loadData()
    loadNotExchanged: (e)->
      switchTap(e.currentTarget)
      necgVM.loadData()
    loadExpired: (e)->
      switchTap(e.currentTarget)
      expVM.loadData()
)

tbcVM.loadData()

#pull-to-refresh
$("#toBeChecked").pullToRefresh().on("pull-to-refresh", ()->
  _self = $(this)
  tbcVM.offCount = 0
  tbcVM.offSum = 0
  page = 1
  yearQuarter = $('#quarter-picker').val()
  year = 0
  quarter = 0
  if yearQuarter isnt "全部"
    tmpYear = yearQuarter.split(' ')[0]
    tmpQuarter = yearQuarter.split(' ')[1]
    year = tmpYear.substring(0, tmpYear.indexOf "年" )
    if tmpQuarter isnt "全部"
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if tbcVM.distributorName isnt ''
    url = url + '&searchKey=' + tbcVM.distributorName
  tbcVM.isLoadMore = false
  tbcVM.isShowloading = true
  tbcVM.$http.get(url).then(
    (response)->
      tbcVM.isShowloading = false
      tbcVM.toBeCheckedData = response.data.items
      tbcVM.count = response.data.total.totalCount
      tbcVM.sum = response.data.total.totalUnimoney
      # if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
      #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
      tbcVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      _self.pullToRefreshDone()
    (error)->
      _self.pullToRefreshDone()
      console.log error
  )
)

$("#haveBeenChecked").pullToRefresh().on("pull-to-refresh", ()->
  _self = $(this)
  page = 1
  yearQuarter = $('#quarter-picker-no-all').val()
  tmpYear = yearQuarter.split(' ')[0]
  tmpQuarter = yearQuarter.split(' ')[1]
  year = tmpYear.substring(0, tmpYear.indexOf "年" )
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if hbcVM.distributorName isnt ''
    url = url + '&searchKey=' + hbcVM.distributorName
  hbcVM.isLoadMore = false
  hbcVM.isShowloading = true
  hbcVM.$http.get(url).then(
    (response)->
      hbcVM.isShowloading = false
      hbcVM.haveBeenCheckedData = response.data.items
      hbcVM.total.count = response.data.total.totalCount
      hbcVM.total.sum = response.data.total.totalUnimoney
      # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
      #   $('#quarter-picker-no-all').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
      hbcVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      _self.pullToRefreshDone()
    (error)->
      _self.pullToRefreshDone()
      console.log error
  )
)

$("#notExchanged").pullToRefresh().on("pull-to-refresh", ()->
  _self = $(this)
  page = 1
  yearQuarter = $('#quarter-picker-not-exchanged').val()
  year = 0
  quarter = 0
  if yearQuarter isnt "全部"
    tmpYear = yearQuarter.split(' ')[0]
    tmpQuarter = yearQuarter.split(' ')[1]
    year = tmpYear.substring(0, tmpYear.indexOf "年" )
    if tmpQuarter isnt "全部"
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if necgVM.distributorName isnt ''
    url = url + '&searchKey=' + necgVM.distributorName
  necgVM.isLoadMore = false
  necgVM.isShowloading = true
  necgVM.$http.get(url).then(
    (response)->
      necgVM.isShowloading = false
      necgVM.notExchangedData = response.data.items
      necgVM.total.count = response.data.total.totalCount
      necgVM.total.sum = response.data.total.totalUnimoney
      # if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
      #   $('#quarter-picker-not-exchanged').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
      necgVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      _self.pullToRefreshDone()
    (error)->
      _self.pullToRefreshDone()
      console.log error
  )
)

$("#expired").pullToRefresh().on("pull-to-refresh", ()->
  _self = $(this)
  page = 1
  yearQuarter = $('#quarter-picker-expired').val()
  tmpYear = yearQuarter.split(' ')[0]
  tmpQuarter = yearQuarter.split(' ')[1]
  year = tmpYear.substring(0, tmpYear.indexOf "年" )
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if expVM.distributorName isnt ''
    url = url + '&searchKey=' + expVM.distributorName
  expVM.isLoadMore = false
  expVM.isShowloading = true
  expVM.$http.get(url).then(
    (response)->
      expVM.isShowloading = false
      expVM.expiredData = response.data.items
      expVM.total.count = response.data.total.totalCount
      expVM.total.sum = response.data.total.totalUnimoney
      # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
      #   $('#quarter-picker-expired').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
      expVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      _self.pullToRefreshDone()
    (error)->
      _self.pullToRefreshDone()
      console.log error
  )
)


##load-more
$("#toBeChecked").infinite(20).on("infinite", ()->
  if loading
    return
  if not tbcVM.isLoadMore
    # $.toptip('沒有更多數據了', 1500, 'warning')
    return

  loading = true
  tbcVM.offCount = 0
  tbcVM.offSum = 0
  page += 1
  yearQuarter = $('#quarter-picker').val()
  year = 0
  quarter = 0
  if yearQuarter isnt "全部"
    tmpYear = yearQuarter.split(' ')[0]
    tmpQuarter = yearQuarter.split(' ')[1]
    year = tmpYear.substring(0, tmpYear.indexOf "年" )
    if tmpQuarter isnt "全部"
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if tbcVM.distributorName isnt ''
    url = url + '&searchKey=' + tbcVM.distributorName
  tbcVM.$http.get(url).then(
    (response)->
      tbcVM.toBeCheckedData.push.apply(tbcVM.toBeCheckedData, response.data.items)
      tbcVM.total.count = response.data.total.totalCount
      tbcVM.total.sum = response.data.total.totalUnimoney
      tbcVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      loading = false
    (error)->
      loading = false
      console.log error
  )
)

$("#haveBeenChecked").infinite(20).on("infinite", ()->
  if loading
    return
  if not hbcVM.isLoadMore
    # $.toptip('沒有更多數據了', 1500, 'warning')
    return

  loading = true
  page += 1
  yearQuarter = $('#quarter-picker-no-all').val()
  tmpYear = yearQuarter.split(' ')[0]
  tmpQuarter = yearQuarter.split(' ')[1]
  year = tmpYear.substring(0, tmpYear.indexOf "年" )
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if hbcVM.distributorName isnt ''
    url = url + '&searchKey=' + hbcVM.distributorName
  hbcVM.$http.get(url).then(
    (response)->
      hbcVM.haveBeenCheckedData.push.apply(hbcVM.haveBeenCheckedData, response.data.items)
      hbcVM.total.count = response.data.total.totalCount
      hbcVM.total.sum = response.data.total.totalUnimoney
      hbcVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      loading = false
    (error)->
      loading = false
      console.log error
  )
)

$("#notExchanged").infinite(20).on("infinite", ()->
  if loading
    return
  if not necgVM.isLoadMore
    # $.toptip('沒有更多數據了', 1500, 'warning')
    return

  loading = true
  page += 1
  yearQuarter = $('#quarter-picker-not-exchanged').val()
  year = 0
  quarter = 0
  if yearQuarter isnt "全部"
    tmpYear = yearQuarter.split(' ')[0]
    tmpQuarter = yearQuarter.split(' ')[1]
    year = tmpYear.substring(0, tmpYear.indexOf "年" )
    if tmpQuarter isnt "全部"
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if necgVM.distributorName isnt ''
    url = url + '&searchKey=' + necgVM.distributorName
  necgVM.$http.get(url).then(
    (response)->
      necgVM.notExchangedData.push.apply(necgVM.notExchangedData, response.data.items)
      necgVM.total.count = response.data.total.totalCount
      necgVM.total.sum = response.data.total.totalUnimoney
      necgVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      loading = false
    (error)->
      loading = false
      console.log error
  )
)

$("#expired").infinite(20).on("infinite", ()->
  if loading
    return
  if not expVM.isLoadMore
    # $.toptip('沒有更多數據了', 1500, 'warning')
    return

  loading = true
  page += 1
  yearQuarter = $('#quarter-picker-expired').val()
  tmpYear = yearQuarter.split(' ')[0]
  tmpQuarter = yearQuarter.split(' ')[1]
  year = tmpYear.substring(0, tmpYear.indexOf "年" )
  quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage
  if expVM.distributorName isnt ''
    url = url + '&searchKey=' + expVM.distributorName
  expVM.$http.get(url).then(
    (response)->
      expVM.expiredData.push.apply(expVM.expiredData, response.data.items)
      expVM.total.count = response.data.total.totalCount
      expVM.total.sum = response.data.total.totalUnimoney
      expVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      loading = false
    (error)->
      loading = false
      console.log error
  )
)

##picker-init
$("#quarter-picker").quarterPicker(
  title: ""
  changeEvent : tbcVM.quarterChange
)

$("#quarter-picker-no-all").quarterPickerNoAll(
  title: ""
  changeEvent : hbcVM.quarterChange
)

$("#quarter-picker-not-exchanged").quarterPicker(
  title: ""
  changeEvent : necgVM.quarterChange
)

$("#quarter-picker-expired").quarterPickerNoAll(
  title: ""
  changeEvent : expVM.quarterChange
)


