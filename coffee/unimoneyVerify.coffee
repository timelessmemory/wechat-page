$("title")[0].innerText = "優利金對賬系統"

switchTap = (currentTarget)->
  ITEM_ON = "weui-bar__item--on"
  $a = $(currentTarget)
  href = $a.attr "href"
  if $a.hasClass(ITEM_ON)
    return
  if not /^#/.test(href)
    return
  $.showTab($a)

ShowTax = (items, taxItems)->
  flag = false
  items.map((item)->
    if not item.isOpenInvoice
      flag = true
      taxItems.push(item)
  )
  return flag

getWithYear = (items, year)->
  result = []
  items.map((item)->
    if item.year + '' is year
      result.push(item)
  )
  return result

getWithYearAndMonth = (items, year, month)->
  if month.length is 1
    month = '0' + month
  result = []
  items.map((item)->
    if item.year + '' is year and item.redeemAt.split(' ')[0].split('-')[1] is month
      result.push(item)
  )
  return result

Vue.filter('to-currency', (value) ->
  return accounting.formatNumber value
)

subject = ''
html = ''
userId = util.queryMap.userId if util.queryMap?.userId
baseUrl = '/api/ufstrust/unimoney/web-unimoney-bill-list?userId=' + userId
sendEmailUrl = '/api/ufstrust/unimoney/export-unimoney-report?userId=' + userId + '&subject=' + subject + '&html=' + html

vsVm = new Vue(
  el : '#verifySystem'
  data :
    originList : []
    dataList : []
    total :
      count : 0
      sum : 0
    isShowloading : false
    isShowTax : false
    taxList : []
    disableAccountButton : false
    disableTaxButton : false
    email : ''
  methods :
    loadVerifyAccount : (e)->
      switchTap e.currentTarget
    loadPayTax: (e)->
      switchTap(e.currentTarget)
    initData : ()->
      this.taxList = []
      year = new Date().getFullYear()
      month = new Date().getMonth() + 1
      quarter = if month % 3 is 0 then month / 3 else Math.floor(month / 3) + 1
      $('#quarter-picker').val(year + '年' + ' ' + '第' + quarter + '季度')
      $('#month-picker').val('請選擇')
      this.isShowloading = true

      url = baseUrl + '&year=' + year + '&quarter=' + quarter
      this.$http.get(url).then(
        (response)->
          this.isShowTax = ShowTax(response.data.items, this.taxList)
          this.dataList = response.data.items
          this.originList = response.data.items.concat([])
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          if response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
            $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          if this.isShowTax
            $('#quarter-picker-tax').val($('#quarter-picker').val())
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

      $('#month-picker').val('請選擇')
      this.dataList = []
      this.taxList = []
      this.isShowloading = true

      url = baseUrl + '&year=' + year + '&quarter=' + quarter
      this.$http.get(url).then(
        (response)->
          this.isShowTax = ShowTax(response.data.items, this.taxList)
          this.dataList = response.data.items
          this.originList = response.data.items.concat([])
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
            $('#quarter-picker').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          if this.isShowTax
            $('#quarter-picker-tax').val($('#quarter-picker').val())
          this.isShowloading = false
        (error)->
          console.log error
      )
    monthChange : ()->
      yearMonth = $('#month-picker').val()
      year = 0
      month = 0
      if yearMonth isnt "請選擇"
        tmpYear = yearMonth.split(' ')[0]
        tmpMonth = yearMonth.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpMonth isnt "請選擇"
          month = tmpMonth.substring(0, tmpMonth.indexOf("月"))
      if year is 0 and month is 0
        return
      if year isnt 0 and month is 0
        this.dataList = getWithYear(this.originList, year)
      if year isnt 0 and month isnt 0
        this.dataList = getWithYearAndMonth(this.originList, year, month)
    quarterChangeTax : ()->
      yearQuarter = $('#quarter-picker-tax').val()
      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

      $('#month-picker').val('請選擇')
      this.dataList = []
      this.taxList = []
      this.isShowloading = true

      url = baseUrl + '&year=' + year + '&quarter=' + quarter
      this.$http.get(url).then(
        (response)->
          ShowTax(response.data.items, this.taxList)
          this.dataList = response.data.items
          this.originList = response.data.items.concat([])
          this.total.count = response.data.total.totalCount
          this.total.sum = response.data.total.totalUnimoney
          if quarter isnt 0 and response.data.items.length > 0 and response.data.items[0].quarter isnt quarter
            $('#quarter-picker-tax').val response.data.items[0].year + '年' + ' ' + '第' + response.data.items[0].quarter + '季度'
          $('#quarter-picker').val($('#quarter-picker-tax').val())
          this.isShowloading = false
        (error)->
          console.log error
      )
    exportList : ()->
      _self = this
      yearMonth = $('#month-picker').val()
      dateRange = '所有'

      year = 0
      month = 0
      if yearMonth isnt "請選擇"
        tmpYear = yearMonth.split(' ')[0]
        tmpMonth = yearMonth.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        dateRange = year + '年'
        if tmpMonth isnt "請選擇"
          month = tmpMonth.substring(0, tmpMonth.indexOf("月"))
          dateRange = year + '年' + month + '月'

      title = dateRange + '優利金對賬清單將傳送至以下電子信箱：' + '<br/>'

      yearQuarter = $('#quarter-picker').val()
      tyear = 0
      tquarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        tyear = tmpYear.substring(0, tmpYear.indexOf "年" )
        if tmpQuarter isnt "全部"
          tquarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))

      if this.email isnt ''
        title += this.email
        $.confirm(
          title: title
          text: '如需更改電子信箱，請聯繫您的專屬業務'
          onOK: () ->
            url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + _self.email + '&emailType=bill'

            if month isnt 0 and year isnt 0
              month = if month.length is 1 then '0' + month else month
              url = url + '&redeemMonth=' + year + '年' + month + '月'

            _self.disableAccountButton = true
            _self.sendEmail(url, (response, vm)->
              vm.disableAccountButton = false
            , (vm)->
              vm.disableAccountButton = false
            )
          onCancel: ()->
        )
        return

      this.disableAccountButton = true

      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId
      this.$http.get(emailUrl).then(
        (response)->
          this.disableAccountButton = false
          title += response.data.email

          $.confirm(
            title: title
            text: '如需更改電子信箱，請聯繫您的專屬業務'
            onOK: () ->
              _self.email = response.data.email
              url = sendEmailUrl + '&year=' + tyear + '&quarter=' + tquarter + '&to=' + _self.email + '&emailType=bill'

              if month isnt 0 and year isnt 0
                month = if month.length is 1 then '0' + month else month
                url = url + '&redeemMonth=' + year + '年' + month + '月'

              _self.disableAccountButton = true
              _self.sendEmail(url, (response, vm)->
                vm.disableAccountButton = false
              , (vm)->
                vm.disableAccountButton = false
              )
            onCancel: ()->
              _self.email = response.data.email
          )
        (error)->
          this.disableAccountButton = false
          console.log error
      )
    exportTaxList : ()->
      _self = this
      yearQuarter = $('#quarter-picker-tax').val()
      dateRange = '所有'

      year = 0
      quarter = 0
      if yearQuarter isnt "全部"
        tmpYear = yearQuarter.split(' ')[0]
        tmpQuarter = yearQuarter.split(' ')[1]
        year = tmpYear.substring(0, tmpYear.indexOf "年" )
        dateRange = year + '年'
        if tmpQuarter isnt "全部"
          quarter = tmpQuarter.substring(tmpQuarter.indexOf("第") + 1, tmpQuarter.indexOf("季度"))
          dateRange = year + '年' + quarter + '季度'

      title = dateRange + '優利金補稅清單將傳送至以下電子信箱：' + '<br/>'

      if this.email isnt ''
        title += this.email
        $.confirm(
          title: title
          text: '如需更改電子信箱，請聯繫您的專屬業務'
          onOK: () ->
            url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + _self.email + '&emailType=invoice'
            _self.disableTaxButton = true
            _self.sendEmail(url, (response, vm)->
              vm.disableTaxButton = false
            , (vm)->
              vm.disableTaxButton = false
            )
          onCancel: ()->
        )
        return

      this.disableTaxButton = true

      emailUrl = '/api/ufstrust/trust-user/get-trust-user-info?userId=' + userId
      this.$http.get(emailUrl).then(
        (response)->
          this.disableTaxButton = false
          title += response.data.email

          $.confirm(
            title: title
            text: '如需更改電子信箱，請聯繫您的專屬業務'
            onOK: () ->
              _self.email = response.data.email
              url = sendEmailUrl + '&year=' + year + '&quarter=' + quarter + '&to=' + _self.email + '&emailType=invoice'
              _self.disableTaxButton = true
              _self.sendEmail(url, (response, vm)->
                vm.disableTaxButton = false
              , (vm)->
                vm.disableTaxButton = false
              )
            onCancel: ()->
              _self.email = response.data.email
          )
        (error)->
          this.disableTaxButton = false
          console.log error
      )
    sendEmail : (url, callback, failBack)->
      this.$http.get(url).then(
        (response)->
          callback(response, this)
        (error)->
          failBack(this)
          console.log error
      )
    isMark: (param)->
      if param is '' or param is undefined
        return false
      if param.split('-')[2] > 25
        return true
      else
        return false
  computed :
    accountText : ()->
      if this.disableAccountButton
        return '處理中..'
      else
        return '導出對賬清單至電子郵箱'
    taxText : ()->
      if this.disableTaxButton
        return '處理中..'
      else
        return '導出補稅清單至電子郵箱'
)

vsVm.initData()

$("#quarter-picker").quarterPicker(
  title: "季度"
  changeEvent : vsVm.quarterChange
)

$("#month-picker").monthPicker(
  title: "核可月份"
  changeEvent : vsVm.monthChange
)

$("#quarter-picker-tax").quarterPicker(
  title: "季度"
  changeEvent : vsVm.quarterChangeTax
)
