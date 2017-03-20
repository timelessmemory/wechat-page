<div class="weui-tab unimoney-check-business">
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
    <div id="toBeChecked" class="weui-tab__bd-item bg-item weui-tab__bd-item--active weui-pull-to-refresh">

        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="radio-group">
          <label class="by-ps">
            <span>
              <input type="radio" id="a" name="byWhat" class="as-radio" value="distributor" v-model="byWhat">
              <label for="a"></label>
            </span>
            <span class="word">By盤商</span>
          </label>
          <label class="by-jxs">
            <span>
              <input type="radio" id="b" name="byWhat" class="as-radio" value="redeemer" v-model="byWhat">
              <label for="b"></label>
            </span>
            <span class="word">By經銷商</span>
          </label>
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
            <input type="text" id='quarter-picker' class="picker-custom"/>
        </div>

        <div class="search-div" text="經銷商" v-show="!isCheckPs && isShowPicker">
            <input type="text" id='productor-picker-to-checked' class="picker-custom"/>
        </div>

        <template v-if="toBeCheckedData.length > 0">
            <div class="total-desc">
            總家數:<span>{{total.count}}</span>家
            <br/>
            總金額:<span>${{total.sum | to-currency}}</span>
            </div>
        </template>

        <div class="weui-cells" style="margin-top: 0.2em;">
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
    </div>

    <div id="haveBeenChecked" class="weui-tab__bd-item bg-item">

        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="radio-group">
          <label class="by-ps">
            <span>
              <input type="radio" id="a" name="byWhat" class="as-radio" value="distributor" v-model="byWhat">
              <label for="a"></label>
            </span>
            <span class="word">By盤商</span>
          </label>
          <label class="by-jxs">
            <span>
              <input type="radio" id="b" name="byWhat" class="as-radio" value="redeemer" v-model="byWhat">
              <label for="b"></label>
            </span>
            <span class="word">By經銷商</span>
          </label>
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

        <div class="search-div" text="經銷商" v-show="!isCheckPs  && isShowPicker">
            <input type="text" id='productor-picker-have-checked' class="picker-custom"/>
        </div>

        <div class="total-desc" v-if="haveBeenCheckedData.length > 0">
        總家數:<span>{{total.count}}</span>家
        <br/>
        總金額:<span>${{total.sum | to-currency}}</span>
        </div>

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
          <div class="weui-loadmore weui-loadmore_line" v-if="haveBeenCheckedData.length == 0 && !isShowloading">
            <span class="weui-loadmore__tips">暫無數據</span>
          </div>
        </div>

        <div class="weui-loadmore" v-if="isShowloading">
          <i class="weui-loading"></i>
          <span class="weui-loadmore__tips">正在加載</span>
        </div>

        <div class="weui-loadmore" v-if="haveBeenCheckedData.length > 0 && isLoadMore">
          <i class="weui-loading"></i>
          <span class="weui-loadmore__tips">正在加載</span>
        </div>
    </div>

    <div id="notExchanged" class="weui-tab__bd-item bg-item">
        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="radio-group">
          <label class="by-ps">
            <span>
              <input type="radio" id="a" name="byWhat" class="as-radio" value="distributor" v-model="byWhat">
              <label for="a"></label>
            </span>
            <span class="word">By盤商</span>
          </label>
          <label class="by-jxs">
            <span>
              <input type="radio" id="b" name="byWhat" class="as-radio" value="redeemer" v-model="byWhat">
              <label for="b"></label>
            </span>
            <span class="word">By經銷商</span>
          </label>
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

        <div class="search-div" text="經銷商" v-show="!isCheckPs  && isShowPicker">
            <input type="text" id='productor-picker-not-exchanged' class="picker-custom"/>
        </div>

        <div class="total-desc" v-if="notExchangedData.length > 0">
        總家數:<span>{{total.count}}</span>家
        <br/>
        總金額:<span>${{total.sum | to-currency}}</span>
        </div>

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
          <div class="weui-loadmore weui-loadmore_line" v-if="notExchangedData.length == 0 && !isShowloading">
            <span class="weui-loadmore__tips">暫無數據</span>
          </div>
        </div>

        <div class="weui-loadmore" v-if="isShowloading">
          <i class="weui-loading"></i>
          <span class="weui-loadmore__tips">正在加載</span>
        </div>

        <div class="weui-loadmore" v-if="notExchangedData.length > 0 && isLoadMore">
          <i class="weui-loading"></i>
          <span class="weui-loadmore__tips">正在加載</span>
        </div>
    </div>

    <div id="expired" class="weui-tab__bd-item bg-item">
        <div class="weui-pull-to-refresh__layer">
          <div class='weui-pull-to-refresh__arrow'></div>
          <div class='weui-pull-to-refresh__preloader'></div>
          <div class="down">下拉刷新</div>
          <div class="up">釋放刷新</div>
          <div class="refresh">正在刷新</div>
        </div>

        <div class="radio-group">
          <label class="by-ps">
            <span>
              <input type="radio" id="a" name="byWhat" class="as-radio" value="distributor" v-model="byWhat">
              <label for="a"></label>
            </span>
            <span class="word">By盤商</span>
          </label>
          <label class="by-jxs">
            <span>
              <input type="radio" id="b" name="byWhat" class="as-radio" value="redeemer" v-model="byWhat">
              <label for="b"></label>
            </span>
            <span class="word">By經銷商</span>
          </label>
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

        <div class="search-div" text="經銷商" v-show="!isCheckPs  && isShowPicker">
            <input type="text" id='productor-picker-expired' class="picker-custom"/>
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

