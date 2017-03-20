<div class="weui-tab unimoney-check">
  <div class="weui-navbar" id="checkSystem">
    <a class="weui-navbar__item weui-bar__item--on" href="#toBeChecked" @click="loadToBeChecked($event)">
      待核可
    </a>
    <a class="weui-navbar__item" href="#haveBeenChecked" @click="loadHaveBeenChecked($event)">
      已核可
    </a>
    <a class="weui-navbar__item" href="#notExchanged" @click="loadNotExchanged($event)">
      未兌換
    </a>
    <a class="weui-navbar__item" href="#expired" @click="loadExpired($event)">
      已過期
    </a>
  </div>

  <div class="weui-tab__bd">
    <div ontouchstart="" id="toBeChecked" class="weui-tab__bd-item bg-item weui-tab__bd-item--active weui-pull-to-refresh" style="height: 98%;">

        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="tooltip">
        貼心提醒：待核可之優利金請於每月25日前核可完畢，確保優利金兌換完成。
        </div>

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

        <template v-if="toBeCheckedData.length > 0">
            <div class="total-desc">
            總家數:<span>{{total.count}}</span>家
            <br/>
            總金額:<span>${{total.unimoney | to-currency}}</span>
            </div>
        </template>

        <div class="weui-cells" style="margin-top: 0.2rem;margin-bottom: 2rem;">
          <div class="weui-cell" v-for="item in toBeCheckedData">
            <div class="weui-cell__hd"><img src="/webapp/build/ufstrust/images/medal.png"></div>
            <div class="weui-cell__bd">
              <p>優利金${{item.couponDenomination | to-currency}}</p>
              <div class="row-cell">
                  <div class="col-cell">盤商名稱</div>
                  <div class="col-cell">{{item.distributor.name}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請核可日期</div>
                  <div class="col-cell">{{item.createdAt}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">有效日期</div>
                  <div class="col-cell">{{item.expireAt.split(" ")[0]}}</div>
              </div>
            </div>
            <div class="weui-cell__ft">
                <button class="weui-btn weui-btn_default" :class="{'weui-btn_disabled' : allowCheck()}" :disabled="allowCheck()" v-on:click.stop="check(item.id)">核可</button>
            </div>
          </div>
          <template v-if="toBeCheckedData.length == 0 && !isShowloading">
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

        <template v-if="toBeCheckedData.length > 0 && isLoadMore">
            <div class="weui-loadmore">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>

        <!-- <template v-if="toBeCheckedData.length > 0">
            <div class="check-all">
                <button class="weui-btn weui-btn_default all-button" :class="{'weui-btn_disabled' : allowCheck()}" :disabled="allowCheck()" @click="checkAll()">全部核可</button>
            </div>
        </template> -->
    </div>

    <div id="tmp" v-if="toBeCheckedData.length > 0 && isShowFoot">
        <div class="check-all">
            <button class="weui-btn weui-btn_default all-button" :class="{'weui-btn_disabled' : allowCheck()}" :disabled="allowCheck()" @click="checkAll()">全部核可</button>
        </div>
    </div>

    <div id="haveBeenChecked" class="weui-tab__bd-item bg-item">

        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="weui-search-bar top-distance" id="searchBar">
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
            <input type="text" id='quarter-picker-no-all' class="picker-custom"/>
        </div>

        <template v-if="haveBeenCheckedData.length > 0">
            <div class="total-desc">
            總家數:<span>{{total.count}}</span>家
            <br/>
            總金額:<span>${{total.sum | to-currency}}</span>
            </div>
        </template>

        <div class="weui-cells" style="margin-top: 0.2em;">
          <div class="weui-cell" v-for="item in haveBeenCheckedData">
            <div class="weui-cell__hd"><img src="/webapp/build/ufstrust/images/medal.png"></div>
            <div class="weui-cell__bd">
              <p>優利金${{item.couponDenomination | to-currency}}</p>
              <div class="row-cell">
                  <div class="col-cell">盤商名稱</div>
                  <div class="col-cell">{{item.distributor.name}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請核可日期</div>
                  <div class="col-cell">{{item.createdAt}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">核可日期</div>
                  <div class="col-cell" :class="{'mark': isMark(item.redeemAt.split(' ')[0])}">{{item.redeemAt.split(" ")[0]}}</div>
              </div>
            </div>
          </div>
          <template v-if="haveBeenCheckedData.length == 0 && !isShowloading">
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

        <template v-if="haveBeenCheckedData.length > 0 && isLoadMore">
            <div class="weui-loadmore">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>
    </div>

    <div id="notExchanged" class="weui-tab__bd-item bg-item">
        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="weui-search-bar top-distance" id="searchBar">
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
            <input type="text" id='quarter-picker-not-exchanged' class="picker-custom"/>
        </div>

        <template v-if="notExchangedData.length > 0">
            <div class="total-desc">
            總家數:<span>{{total.count}}</span>家
            <br/>
            總金額:<span>${{total.sum | to-currency}}</span>
            </div>
        </template>

        <div class="weui-cells" style="margin-top: 0.2em;">
          <div class="weui-cell" v-for="item in notExchangedData">
            <div class="weui-cell__hd"><img src="/webapp/build/ufstrust/images/medal.png"></div>
            <div class="weui-cell__bd">
              <p>優利金${{item.couponDenomination | to-currency}}</p>
              <div class="row-cell">
                  <div class="col-cell">盤商名稱</div>
                  <div class="col-cell">{{item.distributor.name}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">有效日期</div>
                  <div class="col-cell">{{item.expireAt.split(" ")[0]}}</div>
              </div>
            </div>
          </div>
          <template v-if="notExchangedData.length == 0 && !isShowloading">
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

        <template v-if="notExchangedData.length > 0 && isLoadMore">
            <div class="weui-loadmore">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>
    </div>

    <div id="expired" class="weui-tab__bd-item bg-item">
        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="weui-search-bar top-distance" id="searchBar">
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
            <input type="text" id='quarter-picker-expired' class="picker-custom"/>
        </div>

        <div class="total-desc" v-if="expiredData.length > 0">
        總家數:<span>{{total.count}}</span>家
        <br/>
        總金額:<span>${{total.sum | to-currency}}</span>
        </div>

        <div class="weui-cells" style="margin-top: 0.2em;">
          <div class="weui-cell" v-for="item in expiredData">
            <div class="weui-cell__hd"><img src="/webapp/build/ufstrust/images/medal.png"></div>
            <div class="weui-cell__bd">
              <p>優利金${{item.couponDenomination | to-currency}}</p>
              <div class="row-cell">
                  <div class="col-cell">盤商名稱</div>
                  <div class="col-cell">{{item.distributor.name}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">有效日期</div>
                  <div class="col-cell">{{item.expireAt.split(" ")[0]}}</div>
              </div>
            </div>
          </div>
          <div class="weui-loadmore weui-loadmore_line" v-if="expiredData.length == 0 && !isShowloading">
            <span class="weui-loadmore__tips">暫無數據</span>
          </div>
        </div>

        <div class="weui-loadmore" v-if="isShowloading">
          <i class="weui-loading"></i>
          <span class="weui-loadmore__tips">正在加載</span>
        </div>

        <div class="weui-loadmore" v-if="expiredData.length > 0 && isLoadMore">
          <i class="weui-loading"></i>
          <span class="weui-loadmore__tips">正在加載</span>
        </div>
    </div>
  </div>
</div>

