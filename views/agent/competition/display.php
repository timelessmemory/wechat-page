<div class="weui-tab competition-display">
  <div class="weui-navbar" id="competitionDisplay">
    <a class="weui-navbar__item weui-bar__item--on" href="#toBeConfirmed" @click="loadToBeConfirmed($event)">
      待確定
    </a>
    <a class="weui-navbar__item" href="#confirmed" @click="loadConfirmed($event)">
      參賽
    </a>
    <a class="weui-navbar__item" href="#confirmedNot" @click="loadconfirmedNot($event)">
      不參賽
    </a>
  </div>

  <div class="weui-tab__bd">
    <div ontouchstart="" id="toBeConfirmed" class="weui-tab__bd-item bg-item weui-tab__bd-item--active weui-pull-to-refresh">

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
              <input type="search" class="weui-search-bar__input" id="searchInput" v-model="distributorName" @blur="blurSearch()" placeholder="盘商名称">
              <a href="javascript:" class="weui-icon-clear" id="searchClear" @click="distributorName = ''"></a>
            </div>
            <label class="weui-search-bar__label" id="searchText">
              <i class="weui-icon-search"></i>
              <span>盤商名稱</span>
            </label>
          </form>
        </div>

        <div class="search-div" text="時間">
            <input type="text" id='quarter-picker' class="picker-custom"/>
        </div>

        <template v-cloak v-if="toBeConfirmedData.length > 0 && !isShowloading">
            <div class="total-desc abstract-box">
                <div class="abstract-title">
                    門市陳列佈置申請摘要
                </div>
                <div class="top-left">總家數&nbsp;:<span>&nbsp;{{toBeConfirmedData.length}}</span>&nbsp;家</div>
            </div>
        </template>

        <div class="weui-cells" style="margin-top: 0.2rem;margin-bottom: 3rem;">
          <div class="weui-cell" v-for="item in toBeConfirmedData" v-cloak v-show="!isShowloading">
            <div class="weui-cell__bd">
              <p>{{item.distributorName}}</p>
              <div class="row-cell">
                  <div class="col-cell">&nbsp;</div>
                  <div class="col-cell">&nbsp;</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請物品 : {{item.toolkit.toString()}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請日期 : {{item.applyTime.split(" ")[0]}}</div>
              </div>
            </div>
            <div class="weui-cell__ft">
                <button class="weui-btn weui-btn_default"  v-on:click.stop="confirm(item.id, item.distributorName)">參賽</button>
            </div>
          </div>
          <template v-if="toBeConfirmedData.length == 0 && !isShowloading">
              <div class="weui-loadmore weui-loadmore_line">
                <span class="weui-loadmore__tips">暫無數據</span>
              </div>
          </template>
        </div>

        <div id="joinWhich">
            <div class="weui-mask"></div>
            <div class="weui-dialog">
                <div class="weui-dialog__hd"><strong class="weui-dialog__title">參與活動類型</strong></div>
                <div class="weui-dialog__bd" style="text-align:left;color:black;height: 8.8rem;">
                    <p>盤商：{{currentDistributor}}</p>
                    <div class="checkbox-group">
                        <label class="checkbox">
                            <input type="checkbox" id="a" v-model="joins" name="joinWhich" class="as-checkbox" value="brand">
                            <a></a>
                            <span class="word">品牌專區</span>
                        </label>
                        <br/>
                        <label class="checkbox">
                            <input type="checkbox" id="b" v-model="joins" name="joinWhich" class="as-checkbox" value="category">
                            <a></a>
                            <span class="word">品類專區</span>
                        </label>
                    </div>
                </div>
                <div class="weui-dialog__ft">
                    <a @click="chooseDialogCancel()" class="weui-dialog__btn weui-dialog__btn_default">取消</a>
                    <a @click="chooseDialogConfrim()" style="color:black;" class="weui-dialog__btn weui-dialog__btn_primary">確定</a>
                </div>
            </div>
        </div>

        <template v-if="isShowloading">
            <div class="weui-loadmore load-align">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>

        <template v-if="toBeConfirmedData.length > 0 && isLoadMore">
            <div class="weui-loadmore" style="position: relative;top: -1.5rem;">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>
    </div>

    <div id="confirmed" class="weui-tab__bd-item bg-item">

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
              <input type="search" class="weui-search-bar__input" id="searchInput" v-model="distributorName" @blur="blurSearch()" placeholder="盘商名称">
              <a href="javascript:" class="weui-icon-clear" id="searchClear" @click="distributorName = ''"></a>
            </div>
            <label class="weui-search-bar__label" id="searchText">
              <i class="weui-icon-search"></i>
              <span>盤商名稱</span>
            </label>
          </form>
        </div>

        <div class="search-div" text="時間">
            <input type="text" id='quarter-picker-confirmed' class="picker-custom"/>
        </div>

        <template v-cloak v-if="confirmedData.length > 0 && !isShowloading">
            <div class="total-desc abstract-box">
                <div class="abstract-title">
                    門市陳列佈置申請摘要
                </div>
                <div class="top-left">總家數&nbsp;:&nbsp;<span>{{confirmedData.length}}</span>&nbsp;家</div>
            </div>
        </template>

        <div class="weui-cells" style="margin-top: 0.2em;">
          <div class="weui-cell" v-cloak v-for="item in confirmedData" v-show="!isShowloading">
            <div class="weui-cell__bd">
              <p>{{item.distributorName}}</p>
              <div class="row-cell">
                  <div class="col-cell">&nbsp;</div>
                  <div class="col-cell">&nbsp;</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請物品 : {{item.toolkit.toString()}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請日期 : {{item.applyTime.split(" ")[0]}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">確認時間 : {{item.updatedAt.split(" ")[0]}}</div>
              </div>
            </div>
          </div>
          <template v-if="confirmedData.length == 0 && !isShowloading">
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

        <template v-if="confirmedData.length > 0 && isLoadMore">
            <div class="weui-loadmore">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>
    </div>

    <div id="confirmedNot" class="weui-tab__bd-item bg-item">
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
              <input type="search" class="weui-search-bar__input" id="searchInput" v-model="distributorName" @blur="blurSearch()" placeholder="盘商名称">
              <a href="javascript:" class="weui-icon-clear" id="searchClear" @click="distributorName = ''"></a>
            </div>
            <label class="weui-search-bar__label" id="searchText">
              <i class="weui-icon-search"></i>
              <span>盤商名稱</span>
            </label>
          </form>
        </div>

        <div class="search-div" text="時間">
            <input type="text" id='quarter-picker-confirmed-not' class="picker-custom"/>
        </div>

        <template v-cloak v-if="confirmedNotData.length > 0 && !isShowloading">
            <div class="total-desc abstract-box">
                <div class="abstract-title">
                    門市陳列佈置申請摘要
                </div>
                <div class="top-left">總家數&nbsp;:&nbsp;<span>{{confirmedNotData.length}}</span>&nbsp;家</div>
            </div>
        </template>

        <div class="weui-cells" style="margin-top: 0.2em;">
          <div class="weui-cell" v-cloak v-for="item in confirmedNotData" v-show="!isShowloading">
            <div class="weui-cell__bd">
              <p>{{item.distributorName}}</p>
              <div class="row-cell">
                  <div class="col-cell">&nbsp;</div>
                  <div class="col-cell">&nbsp;</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請物品 : {{item.toolkit.toString()}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">申請日期 : {{item.applyTime.split(" ")[0]}}</div>
              </div>
              <div class="row-cell">
                  <div class="col-cell">確認時間 : {{item.updatedAt.split(" ")[0]}}</div>
              </div>
            </div>
          </div>
          <template v-if="confirmedNotData.length == 0 && !isShowloading">
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

        <template v-if="confirmedNotData.length > 0 && isLoadMore">
            <div class="weui-loadmore">
              <i class="weui-loading"></i>
              <span class="weui-loadmore__tips">正在加載</span>
            </div>
        </template>
    </div>
  </div>
</div>


