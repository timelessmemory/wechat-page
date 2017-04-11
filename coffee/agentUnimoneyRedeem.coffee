$("title")[0].innerText = "優利金核銷系統"

FastClick.attach(document.body)

switchTap = (currentTarget)->
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

getDealerId = (dealerData, name)->
  id = ''
  dealerData.map((item)->
    for key of item
      if item[key].name is name
        id = key
  )
  return id

userId = util.queryMap.userId if util.queryMap?.userId
baseUrl = '/api/ufstrust/unimoney/web-unimoney-list?userId=' + userId
baseDealerUrl = '/api/ufstrust/agent/redeemer-list?userId=' + userId
perPage = 10
page = 1
loading = false
isAllowSearchButton = false
# pbByWhat = "distributor"

Vue.http.interceptors.push((request, next)->
  request.url = request.getUrl() + "&v=" + new Date().getTime()
  next((response)->

    if response.body.code isnt undefined

      if response.url.indexOf(baseDealerUrl) isnt -1
        result =
          code : response.body.code
          message : response.body.message
          key : []
      else
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
    byWhat : 'distributor'
    total :
      count : 0
      sum : 0
    dealers : []
    isShowPicker : false
    dealerData : []
  methods :
    quarterChange : ()->
      if not this.isCheckPs
        this.loadDealer()
      else
        this.getData()
    getData : ()->
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
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      if not this.isCheckPs
        dealer = getDealerId(this.dealerData, $('#productor-picker-to-checked').val())
        url = url + '&redeemerId=' + dealer
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.toBeCheckedData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
        (error)->
          console.log error
      )
    search : ()->
      isAllowSearchButton = true
      this.getData()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.getData()
    loadDealer : ()->
      yearQuarter = $('#quarter-picker').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1'
      this.$http.get(dealerUrl).then(
        (response)->
          _self = this
          this.dealers = []
          this.dealerData = response.data
          response.data.map((item)->
            for key of item
              _self.dealers.push item[key].name
          )

          if this.dealers.length > 0
            $('#productor-picker-to-checked').val(this.dealers[0])
            $("#productor-picker-to-checked").productorPicker(
              title : ""
              changeEvent : this.getData
              options:this.dealers
            )
            this.isShowPicker = true
            this.getData()
          else
            this.isShowPicker = false
            this.toBeCheckedData = []
            this.total.count = 0
            this.total.sum = 0
        (error)->
          console.log(error)
      )
    loadData : ()->
      # $('#quarter-picker').val '全部'
      # this.distributorName = ""
      # this.isLoadMore = false
      # if this.byWhat is pbByWhat
      #   if pbByWhat is 'distributor'
      #     this.getData()
      #   else
      #     this.loadDealer()
      # else
      #   this.byWhat = pbByWhat

      year = 0
      quarter = 0
      $('#quarter-picker').val('全部')

      this.distributorName = ""
      # this.byWhat = pbByWhat
      this.byWhat = "distributor"
      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
      this.$http.get(url).then(
        (response)->
          this.toBeCheckedData = response.data.items
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          # if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
          #   $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
  computed :
    isCheckPs : ()->
      isCheckPs = if this.byWhat is 'distributor' then true else false
      return isCheckPs
  watch :
    byWhat : (newValue)->
      # pbByWhat = newValue
      if newValue is 'distributor'
        this.getData()
      else
        this.loadDealer()
)

hbcVM = new Vue(
  el : '#haveBeenChecked'
  data :
    haveBeenCheckedData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "hadRedeemed"
    byWhat : 'distributor'
    total :
      count : 0
      sum : 0
    dealers : []
    isShowPicker : false
    dealerData : []
  methods :
    quarterChange : ()->
      if not this.isCheckPs
        this.loadDealer()
      else
        this.getData()
    getData : ()->
      page = 1
      yearQuarter = $('#quarter-picker-no-all').val()
      tmpYear = yearQuarter.split(' ')[0]
      tmpQuarter = yearQuarter.split(' ')[1]
      year = tmpYear.substring(0, tmpYear.indexOf "年" )
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      if not this.isCheckPs
        dealer = getDealerId(this.dealerData, $('#productor-picker-have-checked').val())
        url = url + '&redeemerId=' + dealer
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
    loadDealer : ()->
      yearQuarter = $('#quarter-picker-no-all').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1'
      this.$http.get(dealerUrl).then(
        (response)->
          _self = this
          this.dealers = []
          this.dealerData = response.data
          response.data.map((item)->
            for key of item
              _self.dealers.push item[key].name
          )

          if this.dealers.length > 0
            $('#productor-picker-have-checked').val(this.dealers[0])
            $("#productor-picker-have-checked").productorPicker(
              title : ""
              changeEvent : this.getData
              options:this.dealers
            )
            this.isShowPicker = true
            this.getData()
          else
            this.isShowPicker = false
            this.haveBeenCheckedData = []
            this.total.count = 0
            this.total.sum = 0
        (error)->
          console.log(error)
      )
    search : ()->
      isAllowSearchButton = true
      this.getData()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.getData()
    loadData: ()->
      this.distributorName = ""
      this.byWhat = "distributor"
      # this.byWhat = pbByWhat

      year = new Date().getFullYear()
      month = new Date().getMonth() + 1
      quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      $('#quarter-picker-no-all').val(year + '年' + ' ' + '第' + quarter + '季度')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
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
  computed:
    isCheckPs : ()->
      isCheckPs = if this.byWhat is 'distributor' then true else false
      return isCheckPs
  watch :
    byWhat : (newValue)->
      # pbByWhat = newValue
      if newValue is 'distributor'
        this.getData()
      else
        this.loadDealer()
)

necgVM = new Vue(
  el : '#notExchanged'
  data :
    notExchangedData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "notRedeemed"
    byWhat : 'distributor'
    total :
      count : 0
      sum : 0
    dealers : []
    isShowPicker : false
    dealerData : []
  methods :
    quarterChange : ()->
      if not this.isCheckPs
        this.loadDealer()
      else
        this.getData()
    getData : ()->
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
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      if not this.isCheckPs
        dealer = getDealerId(this.dealerData, $('#productor-picker-not-exchanged').val())
        url = url + '&redeemerId=' + dealer
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
    loadDealer : ()->
      yearQuarter = $('#quarter-picker-not-exchanged').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1'
      this.$http.get(dealerUrl).then(
        (response)->
          _self = this
          this.dealers = []
          this.dealerData = response.data
          response.data.map((item)->
            for key of item
              _self.dealers.push item[key].name
          )

          if this.dealers.length > 0
            $('#productor-picker-not-exchanged').val(this.dealers[0])
            $("#productor-picker-not-exchanged").productorPicker(
              title : ""
              changeEvent : this.getData
              options:this.dealers
            )
            this.isShowPicker = true
            this.getData()
          else
            this.isShowPicker = false
            this.notExchangedData = []
            this.total.count = 0
            this.total.sum = 0
        (error)->
          console.log(error)
      )
    search : ()->
      isAllowSearchButton = true
      this.getData()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.getData()
    loadData: ()->
      this.distributorName = ""
      this.byWhat = "distributor"
      # this.byWhat = pbByWhat

      year = 0
      quarter = 0
      $('#quarter-picker-not-exchanged').val('全部')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
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
  computed:
    isCheckPs : ()->
      isCheckPs = if this.byWhat is 'distributor' then true else false
      return isCheckPs
  watch :
    byWhat : (newValue)->
      # pbByWhat = newValue
      if newValue is 'distributor'
        this.getData()
      else
        this.loadDealer()
)

expVM = new Vue(
  el : '#expired'
  data :
    expiredData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "hadExpired"
    byWhat : 'distributor'
    total :
      count : 0
      sum : 0
    dealers : []
    isShowPicker : false
    dealerData : []
  methods :
    quarterChange : ()->
      if not this.isCheckPs
        this.loadDealer()
      else
        this.getData()
    getData : ()->
      page = 1
      yearQuarter = $('#quarter-picker-expired').val()
      tmpYear = yearQuarter.split(' ')[0]
      tmpQuarter = yearQuarter.split(' ')[1]
      year = tmpYear.substring(0, tmpYear.indexOf "年" )
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      if not this.isCheckPs
        dealer = getDealerId(this.dealerData, $('#productor-picker-expired').val())
        url = url + '&redeemerId=' + dealer
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
    loadDealer : ()->
      yearQuarter = $('#quarter-picker-expired').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

      dealerUrl = baseDealerUrl + '&year=' + year + '&quarter=' + quarter + '&getRedeemers=1'
      this.$http.get(dealerUrl).then(
        (response)->
          _self = this
          this.dealers = []
          this.dealerData = response.data
          response.data.map((item)->
            for key of item
              _self.dealers.push item[key].name
          )

          if this.dealers.length > 0
            $('#productor-picker-expired').val(this.dealers[0])
            $("#productor-picker-expired").productorPicker(
              title : ""
              changeEvent : this.getData
              options:this.dealers
            )
            this.isShowPicker = true
            this.getData()
          else
            this.isShowPicker = false
            this.expiredData = []
            this.total.count = 0
            this.total.sum = 0
        (error)->
          console.log(error)
      )
    search : ()->
      isAllowSearchButton = true
      this.getData()
    blurSearch : ()->
      if isAllowSearchButton is true
        return
      this.getData()
    loadData: ()->
      this.distributorName = ""
      this.byWhat = "distributor"
      # this.byWhat = pbByWhat

      year = new Date().getFullYear()
      month = new Date().getMonth() + 1
      quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      $('#quarter-picker-expired').val(year + '年' + ' ' + '第' + quarter + '季度')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&type=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + this.byWhat
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
  computed:
    isCheckPs : ()->
      isCheckPs = if this.byWhat is 'distributor' then true else false
      return isCheckPs
  watch :
    byWhat : (newValue)->
      # pbByWhat = newValue
      if newValue is 'distributor'
        this.getData()
      else
        this.loadDealer()
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

  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + tbcVM.byWhat
  if tbcVM.distributorName isnt ''
    url = url + '&searchKey=' + tbcVM.distributorName
  if not tbcVM.isCheckPs
    dealer = getDealerId(tbcVM.dealerData, $('#productor-picker-to-checked').val())
    url = url + '&redeemerId=' + dealer
  tbcVM.isLoadMore = false
  tbcVM.isShowloading = true
  tbcVM.$http.get(url).then(
    (response)->
      tbcVM.isShowloading = false
      tbcVM.toBeCheckedData = response.data.items
      tbcVM.total.count = response.data.total.totalCount
      tbcVM.total.sum = response.data.total.totalUnimoney
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

  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + hbcVM.byWhat
  if hbcVM.distributorName isnt ''
    url = url + '&searchKey=' + hbcVM.distributorName
  if not hbcVM.isCheckPs
    dealer = getDealerId(hbcVM.dealerData, $('#productor-picker-have-checked').val())
    url = url + '&redeemerId=' + dealer
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

  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + necgVM.byWhat
  if necgVM.distributorName isnt ''
    url = url + '&searchKey=' + necgVM.distributorName
  if not necgVM.isCheckPs
    dealer = getDealerId(necgVM.dealerData, $('#productor-picker-not-exchanged').val())
    url = url + '&redeemerId=' + dealer
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

  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + expVM.byWhat
  if expVM.distributorName isnt ''
    url = url + '&searchKey=' + expVM.distributorName
  if not expVM.isCheckPs
    dealer = getDealerId(expVM.dealerData, $('#productor-picker-expired').val())
    url = url + '&redeemerId=' + dealer
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

  url = baseUrl + '&type=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + tbcVM.byWhat
  if tbcVM.distributorName isnt ''
    url = url + '&searchKey=' + tbcVM.distributorName
  if not tbcVM.isCheckPs
    dealer = getDealerId(tbcVM.dealerData, $('#productor-picker-to-checked').val())
    url = url + '&redeemerId=' + dealer
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

  url = baseUrl + '&type=' + hbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + hbcVM.byWhat
  if hbcVM.distributorName isnt ''
    url = url + '&searchKey=' + hbcVM.distributorName
  if not hbcVM.isCheckPs
    dealer = getDealerId(hbcVM.dealerData, $('#productor-picker-have-checked').val())
    url = url + '&redeemerId=' + dealer
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

  url = baseUrl + '&type=' + necgVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + necgVM.byWhat
  if necgVM.distributorName isnt ''
    url = url + '&searchKey=' + necgVM.distributorName
  if not necgVM.isCheckPs
    dealer = getDealerId(necgVM.dealerData, $('#productor-picker-not-exchanged').val())
    url = url + '&redeemerId=' + dealer
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

  url = baseUrl + '&type=' + expVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page + '&per-page=' + perPage + '&byRole=' + expVM.byWhat
  if expVM.distributorName isnt ''
    url = url + '&searchKey=' + expVM.distributorName
  if not expVM.isCheckPs
    dealer = getDealerId(expVM.dealerData, $('#productor-picker-expired').val())
    url = url + '&redeemerId=' + dealer
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

