<div id="distributorManagement" class="distributor-management-business">
    <div class="weui-search-bar" id="searchBar">
      <form class="weui-search-bar__form" v-on:submit.prevent="search()">
        <div class="weui-search-bar__box">
          <i class="weui-icon-search"></i>
          <input type="search" class="weui-search-bar__input" id="searchInput" @blur="blurSearch()" v-model="distributorName" placeholder="盘商名称">
          <a href="javascript:" class="weui-icon-clear" id="searchClear" @click="clear($event)"></a>
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

    <div class="search-div" v-cloak text="狀態" v-show="!isAllCheck">
        <input type="text" id='status-picker' class="picker-custom" value="全部"/>
    </div>

    <template v-if="dataList.length > 0 && !isShowloading">
        <div class="total-desc abstract-box" v-if="!isAllCheck" v-cloak>
            <div class="abstract-title">
                業績追蹤摘要
            </div>
            <div class="top-left">總家數&nbsp;:&nbsp;<span>{{total.count}}</span>&nbsp;家</div>
            <div class="bottom-left">總目標&nbsp;:&nbsp;<span>${{total.target | to-currency}}</span></div>
        </div>
        <div v-cloak class="total-desc abstract-box" v-if="isAllCheck">
            <div class="abstract-title">
                業績追蹤摘要
            </div>
            <div class="top-left">總家數&nbsp;:&nbsp;<span>{{total.count}}</span>&nbsp;家</div>
            <div class="margin-left">總目標&nbsp;:&nbsp;<span>${{total.target | to-currency}}</span></div>
            <div class="margin-left">總實績&nbsp;:&nbsp;<span>${{total.actual | to-currency}}</span></div>
            <div class="bottom-left">總業績達成率&nbsp;:&nbsp;<span>{{total.getRate}}</span></div>
        </div>
    </template>

    <div style="margin-top: 10px;padding-bottom: 10px;color: #333333;" v-if="isAllCheck && !isShowloading" v-cloak>
        <div class="weui-flex table-border-bottom table-border-top" v-if="dataList.length > 0">
          <div class="weui-flex__item table-border-right table-border-left table-title">盘商名稱</div>
          <div class="weui-flex__item table-border-right table-title">業績目標</div>
          <div class="weui-flex__item table-border-right table-title">業績實績</div>
          <div class="weui-flex__item table-border-right table-title">業績達成率</div>
          <div class="weui-flex__item table-border-right table-title">兌換經銷商</div>
        </div>
        <div class="weui-flex table-border-bottom table-item" v-for="item in dataList">
          <div class="weui-flex__item table-border-right table-border-left">{{item.distributor.name}}</div>
          <div class="weui-flex__item table-border-right">{{item.saleTarget | to-currency}}</div>
          <div class="weui-flex__item table-border-right">{{item.sales | to-currency}}</div>
          <div class="weui-flex__item table-border-right">{{(item.sales / item.saleTarget *100).toFixed(1)}}%</div>
          <div class="weui-flex__item table-border-right">{{item.distributorRelationship.redeemDistributor}}</div>
        </div>
        <template v-if="dataList.length == 0 && !isShowloading">
            <div class="weui-loadmore weui-loadmore_line">
              <span class="weui-loadmore__tips">暫無數據</span>
            </div>
        </template>
    </div>

    <div style="margin-top: 10px;padding-bottom: 10px;color: #333333;" v-cloak v-if="!isAllCheck && !isShowloading">
        <div class="weui-flex table-border-bottom table-border-top" v-if="dataList.length > 0">
          <div class="weui-flex__item table-border-right table-border-left table-title">盘商名稱</div>
          <div class="weui-flex__item table-border-right table-title">業績目標</div>
          <div class="weui-flex__item table-border-right table-title">兌換經銷商</div>
          <div class="weui-flex__item table-border-right table-title">狀態</div>
        </div>
        <div class="weui-flex table-border-bottom table-item" v-for="item in dataList">
          <div class="weui-flex__item table-border-right table-border-left">{{item.distributor.name}}</div>
          <div class="weui-flex__item table-border-right">{{item.saleTarget | to-currency}}</div>
          <div class="weui-flex__item table-border-right">{{item.distributorRelationship.redeemDistributor}}</div>
          <div class="weui-flex__item table-border-right" v-bind:class="{'mark' : item.state < 3}">{{item.state < 3 ? '未核可' : '已核可'}}</div>
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


