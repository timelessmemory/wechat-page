<div class="weui-tab unimoney-verify-account" id="verifySystem">

  <template v-if="isShowTax">
      <div class="weui-navbar">
        <a class="weui-navbar__item weui-bar__item--on" href="#verifyAccount" @click="loadVerifyAccount($event)">
          對賬清單
        </a>
        <a class="weui-navbar__item" href="#payTax" @click="loadPayTax($event)">
          補稅清單
        </a>
      </div>
  </template>

  <div class="weui-tab__bd">
    <div id="verifyAccount" ontouchstart="" class="weui-tab__bd-item bg-item weui-tab__bd-item--active" style="height: 92%;">

        <div class="search-div" text="季度">
            <input type="text" id='quarter-picker' class="picker-custom"/>
        </div>

        <div class="search-div" text="核可月份">
            <input type="text" id='month-picker' class="picker-custom"/>
        </div>

        <template v-if="dataList.length > 0">
            <div class="total-desc">
            總家數:<span>{{total.count}}</span>&nbsp;家
            <br/>
            總金額:<span>${{total.sum | to-currency}}</span>
            </div>
        </template>

        <div style="color: #333333;padding-bottom: 3em;">
            <div class="weui-flex table-border-bottom table-border-top" v-if="dataList.length > 0">
              <div class="weui-flex__item table-border-right table-border-left table-title">盘商名稱</div>
              <div class="weui-flex__item table-border-right table-title">奖励金额</div>
              <div class="weui-flex__item table-border-right table-title">核可日期</div>
            </div>
            <div class="weui-flex table-border-bottom table-item" v-for="item in dataList">
              <div class="weui-flex__item table-border-right table-border-left">{{item.distributor.name}}</div>
              <div class="weui-flex__item table-border-right">{{item.couponDenomination | to-currency}}</div>
              <div class="weui-flex__item table-border-right" :class="{'mark': isMark(item.redeemAt.split(' ')[0])}">{{item.isRedeemed == false ? (item.redeemStatus == 'isRedeeming' ? '已申請' : '未申請') : item.redeemAt.split(' ')[0]}}</div>
            </div>
            <template v-if="dataList.length == 0 && !isShowloading">
                <div class="weui-loadmore weui-loadmore_line">
                  <span class="weui-loadmore__tips">暫無數據</span>
                </div>
            </template>
        </div>

        <template v-if="isShowloading">
            <div class="weui-loadmore">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>

        <template v-if="dataList.length > 0">
            <div class="export-list">
                <button :class="{'weui-btn_disabled' : disableAccountButton}" :disabled="disableAccountButton" v-on:click="exportList()" class="weui-btn weui-btn_default bottom-button">{{accountText}}</button>
            </div>
        </template>
    </div>

    <div id="payTax" class="weui-tab__bd-item bg-item" style="height: 92%;">
        <div class="search-div" text="季度">
            <input type="text" id='quarter-picker-tax' class="picker-custom"/>
        </div>

        <div style="color: #333333;padding-bottom: 3em;">
            <div class="weui-flex table-border-bottom table-border-top" v-if="taxList.length > 0">
              <div class="weui-flex__item table-border-right table-border-left table-title">盘商名稱</div>
              <div class="weui-flex__item table-border-right table-title">奖励金额</div>
              <div class="weui-flex__item table-border-right table-title">5%補稅額</div>
            </div>
            <div class="weui-flex table-border-bottom table-item" v-for="item in taxList">
              <div class="weui-flex__item table-border-right table-border-left">{{item.distributor.name}}</div>
              <div class="weui-flex__item table-border-right">{{item.couponDenomination | to-currency}}</div>
              <div class="weui-flex__item table-border-right">{{item.invoiceValue | to-currency}}</div>
            </div>
            <template v-if="taxList.length == 0 && !isShowloading">
                <div class="weui-loadmore weui-loadmore_line">
                  <span class="weui-loadmore__tips">暫無數據</span>
                </div>
            </template>
        </div>

        <template v-if="isShowloading">
            <div class="weui-loadmore">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>

        <div class="remark">
            <div>備註：</div>
            <div>1.優利金5%補稅額清單爲每季所有需要補稅額的盤商清單。</div>
            <div>2.每季5%補稅總額將兌換等值聯合利華飲食策劃產品並該季優利金同時發放。</div>
        </div>

        <template v-if="taxList.length > 0">
            <div class="export-list">
                <button :class="{'weui-btn_disabled' : disableTaxButton}" :disabled="disableTaxButton" v-on:click="exportTaxList()" class="weui-btn weui-btn_default bottom-button">{{taxText}}</button>
            </div>
        </template>
    </div>
  </div>
</div>
