$("title")[0].innerText = "門市陳列佈置申請"

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

getYearQuarterFromPicker = (yearQuarter)->
  year = 0
  quarter = 0
  if yearQuarter isnt "全部"
    tmpYear = yearQuarter.split(' ')[0]
    tmpQuarter = yearQuarter.split(' ')[1]
    year = tmpYear.substring(0, tmpYear.indexOf "年" )
    if tmpQuarter isnt "全部"
      quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
  return {
    year : year
    quarter : quarter
  }

showDialog = (id)->
  mask = '#' + id + ' ' + '.weui-mask'
  dialog = '#' + id + ' ' + '.weui-dialog'
  $(mask).addClass("weui-mask--visible")
  $(dialog).addClass("weui-dialog--visible")

hideDialog = (id)->
  mask = '#' + id + ' ' + '.weui-mask'
  dialog = '#' + id + ' ' + '.weui-dialog'
  $(mask).removeClass("weui-mask--visible")
  $(dialog).removeClass("weui-dialog--visible")

Vue.http.interceptors.push((request, next)->
  request.url = request.getUrl() + "&v=" + new Date().getTime()
  next((response)->

    if response.body.code isnt undefined
      result =
        code : response.body.code
        message : response.body.message
        items : []
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

perPage = 10
page = 1
userId = util.queryMap.userId if util.queryMap?.userId
baseUrl = '/api/game/apply-competition/agent-competition-list?userId=' + userId + '&per-page=' + perPage
confirmUrl = '/api/game/apply-competition/participate?userId=' + userId
loading = false
isAllowSearchButton = false

tbcVM = new Vue(
  el : '#toBeConfirmed'
  data :
    toBeConfirmedData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "toBeDetermined"
    currentDistributor : ''
    currentId : ''
    joins : []
  methods :
    confirm : (id, distributorName) ->
      this.currentDistributor = distributorName
      this.currentId = id
      this.joins = []
      showDialog('joinWhich')
    chooseDialogCancel : ()->
      hideDialog('joinWhich')
    chooseDialogConfrim : ()->
      if this.joins.length is 0
        hideDialog('joinWhich')
        return
      url = confirmUrl + '&competitionStatus=participateIn' + '&distributorId=' + this.currentId + '&competitionType=' + this.joins.toString()
      this.$http.get(url).then(
        (response)->
          hideDialog('joinWhich')
        (error)->
          console.log error
          hideDialog('joinWhich')
      )
    quarterChange : ()->
      page = 1
      yearQuarter = $('#quarter-picker').val()
      yearQuarter = getYearQuarterFromPicker(yearQuarter)
      year = yearQuarter.year
      quarter = yearQuarter.quarter

      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.toBeConfirmedData = response.data.items
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

      year = 0
      quarter = 0
      $('#quarter-picker').val('全部')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
      this.$http.get(url).then(
        (response)->
          this.toBeConfirmedData = response.data.items
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
)

confirmedVM = new Vue(
  el : '#confirmed'
  data :
    confirmedData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "participateIn"
  methods :
    quarterChange : ()->
      page = 1
      yearQuarter = $('#quarter-picker-confirmed').val()
      yearQuarter = getYearQuarterFromPicker(yearQuarter)
      year = yearQuarter.year
      quarter = yearQuarter.quarter

      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.confirmedData = response.data.items
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

      year = 0
      quarter = 0
      $('#quarter-picker-confirmed').val('全部')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
      this.$http.get(url).then(
        (response)->
          this.confirmedData = response.data.items
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
)

confirmedNotVM = new Vue(
  el : '#confirmedNot'
  data :
    confirmedNotData : []
    isShowloading : false
    isLoadMore : false
    distributorName : ''
    type : "notParticipateIn"
  methods :
    quarterChange : ()->
      page = 1
      yearQuarter = $('#quarter-picker-confirmed-not').val()
      yearQuarter = getYearQuarterFromPicker(yearQuarter)
      year = yearQuarter.year
      quarter = yearQuarter.quarter

      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
      if this.distributorName isnt ''
        url = url + '&searchKey=' + this.distributorName
      this.isLoadMore = false
      this.isShowloading = true
      this.$http.get(url).then(
        (response)->
          this.isShowloading = false
          this.confirmedNotData = response.data.items
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

      year = 0
      quarter = 0
      $('#quarter-picker-confirmed-not').val('全部')

      page = 1

      this.isLoadMore = false
      this.isShowloading = true
      url = baseUrl + '&competitionStatus=' + this.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
      this.$http.get(url).then(
        (response)->
          this.confirmedNotData = response.data.items
          this.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
          this.isShowloading = false
        (error)->
          console.log error
      )
)

##tab-switch
cdVM = new Vue(
  el: "#competitionDisplay"
  methods:
    loadToBeConfirmed: (e)->
      switchTap(e.currentTarget)
      tbcVM.loadData()
    loadConfirmed: (e)->
      switchTap(e.currentTarget)
      confirmedVM.loadData()
    loadconfirmedNot: (e)->
      switchTap(e.currentTarget)
      confirmedNotVM.loadData()
)

tbcVM.loadData()

#pull-to-refresh
$("#toBeConfirmed").pullToRefresh().on("pull-to-refresh", ()->
  _self = $(this)
  page = 1
  yearQuarter = $('#quarter-picker').val()
  yearQuarter = getYearQuarterFromPicker(yearQuarter)
  year = yearQuarter.year
  quarter = yearQuarter.quarter

  url = baseUrl + '&competitionStatus=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
  if tbcVM.distributorName isnt ''
    url = url + '&searchKey=' + tbcVM.distributorName
  tbcVM.isLoadMore = false
  tbcVM.isShowloading = true
  tbcVM.$http.get(url).then(
    (response)->
      tbcVM.isShowloading = false
      tbcVM.toBeConfirmedData = response.data.items
      tbcVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      _self.pullToRefreshDone()
    (error)->
      _self.pullToRefreshDone()
      console.log error
  )
)

$("#confirmed").pullToRefresh().on("pull-to-refresh", ()->
  _self = $(this)
  page = 1
  yearQuarter = $('#quarter-picker-confirmed').val()
  yearQuarter = getYearQuarterFromPicker(yearQuarter)
  year = yearQuarter.year
  quarter = yearQuarter.quarter

  url = baseUrl + '&competitionStatus=' + confirmedVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
  if confirmedVM.distributorName isnt ''
    url = url + '&searchKey=' + confirmedVM.distributorName
  confirmedVM.isLoadMore = false
  confirmedVM.isShowloading = true
  confirmedVM.$http.get(url).then(
    (response)->
      confirmedVM.isShowloading = false
      confirmedVM.confirmedData = response.data.items
      confirmedVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      _self.pullToRefreshDone()
    (error)->
      _self.pullToRefreshDone()
      console.log error
  )
)

$("#confirmedNot").pullToRefresh().on("pull-to-refresh", ()->
  _self = $(this)
  page = 1
  yearQuarter = $('#quarter-picker-confirmed-not').val()
  yearQuarter = getYearQuarterFromPicker(yearQuarter)
  year = yearQuarter.year
  quarter = yearQuarter.quarter

  url = baseUrl + '&competitionStatus=' + confirmedNotVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
  if confirmedNotVM.distributorName isnt ''
    url = url + '&searchKey=' + confirmedNotVM.distributorName
  confirmedNotVM.isLoadMore = false
  confirmedNotVM.isShowloading = true
  confirmedNotVM.$http.get(url).then(
    (response)->
      confirmedNotVM.isShowloading = false
      confirmedNotVM.confirmedNotData = response.data.items
      confirmedNotVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      _self.pullToRefreshDone()
    (error)->
      _self.pullToRefreshDone()
      console.log error
  )
)

##load-more
$("#toBeConfirmed").infinite(20).on("infinite", ()->
  if loading
    return

  if not tbcVM.isLoadMore
    return

  loading = true
  page += 1
  yearQuarter = $('#quarter-picker').val()
  yearQuarter = getYearQuarterFromPicker(yearQuarter)
  year = yearQuarter.year
  quarter = yearQuarter.quarter

  url = baseUrl + '&competitionStatus=' + tbcVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
  if tbcVM.distributorName isnt ''
    url = url + '&searchKey=' + tbcVM.distributorName
  tbcVM.$http.get(url).then(
    (response)->
      tbcVM.toBeConfirmedData.push.apply(tbcVM.toBeConfirmedData, response.data.items)
      tbcVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      loading = false
    (error)->
      loading = false
      console.log error
  )
)

$("#confirmed").infinite(20).on("infinite", ()->
  if loading
    return

  if not confirmedVM.isLoadMore
    return

  loading = true
  page += 1
  yearQuarter = $('#quarter-picker-confirmed').val()
  yearQuarter = getYearQuarterFromPicker(yearQuarter)
  year = yearQuarter.year
  quarter = yearQuarter.quarter

  url = baseUrl + '&competitionStatus=' + confirmedVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
  if confirmedVM.distributorName isnt ''
    url = url + '&searchKey=' + confirmedVM.distributorName
  confirmedVM.$http.get(url).then(
    (response)->
      confirmedVM.confirmedData.push.apply(confirmedVM.confirmedData, response.data.items)
      confirmedVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
      loading = false
    (error)->
      loading = false
      console.log error
  )
)

$("#confirmedNot").infinite(20).on("infinite", ()->
  if loading
    return

  if not confirmedNotVM.isLoadMore
    return

  loading = true
  page += 1
  yearQuarter = $('#quarter-picker-confirmed-not').val()
  yearQuarter = getYearQuarterFromPicker(yearQuarter)
  year = yearQuarter.year
  quarter = yearQuarter.quarter

  url = baseUrl + '&competitionStatus=' + confirmedNotVM.type + '&year=' + year + '&quarter=' + quarter + '&page=' + page
  if confirmedNotVM.distributorName isnt ''
    url = url + '&searchKey=' + tbcVM.distributorName
  confirmedNotVM.$http.get(url).then(
    (response)->
      confirmedNotVM.confirmedNotData.push.apply(confirmedNotVM.confirmedNotData, response.data.items)
      confirmedNotVM.isLoadMore = if response.data._meta.currentPage < response.data._meta.pageCount then true else false
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

$("#quarter-picker-confirmed").quarterPicker(
  title: ""
  changeEvent : confirmedVM.quarterChange
)

$("#quarter-picker-confirmed-not").quarterPicker(
  title: ""
  changeEvent : confirmedNotVM.quarterChange
)
