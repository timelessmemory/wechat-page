<div id="distributorManagement" class="distributor-management">
    <div class="weui-search-bar" id="searchBar">
      <form class="weui-search-bar__form" v-on:submit.prevent="search()">
        <div class="weui-search-bar__box">
          <i class="weui-icon-search"></i>
          <input type="search" class="weui-search-bar__input" id="searchInput" v-model="distributorName" placeholder="盘商名称">
          <a href="javascript:" class="weui-icon-clear" id="searchClear" @click="distributorName = ''"></a>
        </div>
        <label class="weui-search-bar__label" id="searchText">
          <i class="weui-icon-search"></i>
          <span>盤商名稱</span>
        </label>
      </form>
    </div>

    <div class="search-div" text="季度">
        <input type="text" id='quarter-picker' class="picker-custom"/>
    </div>

    <template v-if="dataList.length > 0">
        <div class="total-desc">
        總家數:<span>{{total.count}}</span>&nbsp;家
        <br/>
        總目標:<span>${{total.target | to-currency}}</span>
        <br/>
        總實績:<span>${{total.actual | to-currency}}</span>
        <br/>
        總業績達成率:<span>{{total.getRate}}</span>
        </div>
    </template>

    <div style="margin-top: 10px;padding-bottom: 10px;color: #333333;">
        <div class="weui-flex table-border-bottom table-border-top" v-if="dataList.length > 0">
          <div class="weui-flex__item table-border-right table-border-left table-title">盘商名稱</div>
          <div class="weui-flex__item table-border-right table-title">業績目標</div>
          <div class="weui-flex__item table-border-right table-title">業績實績</div>
          <div class="weui-flex__item table-border-right table-title">業績達成率</div>
        </div>
        <div class="weui-flex table-border-bottom table-item" v-for="item in dataList">
          <div class="weui-flex__item table-border-right table-border-left">{{item.distributor.name}}</div>
          <div class="weui-flex__item table-border-right">{{item.saleTarget | to-currency}}</div>
          <div class="weui-flex__item table-border-right">{{item.sales | to-currency}}</div>
          <div class="weui-flex__item table-border-right">{{(item.sales / item.saleTarget *100).toFixed(2)}}%</div>
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
</div>
