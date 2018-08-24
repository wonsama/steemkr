# steemkr

## 스팀잇 용 CLI (커맨드라인 툴)

![ss_replies.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_replies.png)
<center>[ 그림 : 댓글정보 ]</center>

![ss_votedesc.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_votedesc.png)
<center>[ 그림 : 보팅정보 ]</center>

![ss_votegroup.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_votegroup.png)
<center>[ 그림 : 보팅그룹 ]</center>

![ss_scrappost.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_scrappost.png)
<center>[ 그림 : 스크랩 ]</center>

![ss_create.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_create.png)
<center>[ 그림 : 계정생성 ]</center>

![ss_history.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_history.png)
<center>[ 그림 : 글의 수정이력 및 정보확인 ]</center>

![ss_voteto.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_voteto.png)
<center>[ 그림 : 최근 N일간 보팅 이력 조회 ]</center>

![ss_convert.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_convert.png)
<center>[ 그림 : 내부거래소의 3.5일간 평단가 기준으로 SBD -> STEEM 변환 ]</center>

![ss_buysteem.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_buysteem.png)
<center>[ 그림 : 내부거래소를 통한 SBD -> STEEM 구매 ]</center>

![ss_buysbd.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_buysbd.png)
<center>[ 그림 : 내부거래소를 통한 STEEM -> SBD 구매 ]</center>

![ss_buycancel.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_buycancel.png)
<center>[ 그림 : 내부거래소 거래목록 조회 및 취소 ]</center>

![ss_resteem.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_resteem.png)
<center>[ 그림 : 리스팀, 7일(payout)이 지난 글 또한 가능 ]</center>

![ss_taglive.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_taglive.png)
<center>[ 그림 : 태그라이브, 태그기준 피드정보를 실시간으로 확인할 수 있다 ]</center>

![ss_powerup.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_powerup.png)
<center>[ 그림 : 스파업, 손쉽게 스파업을 할 수 있다 ]</center>

![ss_block.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_block.png)
<center>[ 그림 : 차단목록 (날 차단한 사람을 확인할 수 있다) ]</center>

![ss_feed.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_feed.png)
<center>[ 그림 : 피드보기 (내계정 포함 다른 계정의 피드 실시간으로 확인할 수 있다) ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_slb.png)
<center>[ 그림 : 스라벨 (글, 댓글 작성 갯수 및 시간대) ]</center>

![ss_price.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_price.png)
<center>[ 그림 : upbit 기준 코인가격 확인 ]</center>

![ss_accounts.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_accounts.png)
<center>[ 그림 : 계정 정보 확인 ]</center>

# 사전작업

* [nodejs 설치](https://nodejs.org/) 에 접속하여 Download 를 한 이후 다음(next)를 계속 누름

# steemkr 설치방법

* 맥 : 터미널(terminal), 윈도우 : 실행 - cmd
* 이후 터미널(커맨드)창에서 `npm install -g steemkr` 와 같이 입력
* 맥(우분투 등)은 root 권한으로 설치 `sudo npm install -g steemkr`

> 기존에 하신 분도 위와 같이 하면 자동으로 최신 버전을 업데이트 받습니다.

# 사용방법

#### 신규

* 댓글정보(rp) : `$ steemkr replies <URL> <AUTHOR:option>`

#### 기존

* 보팅정보(vd) : `$ steemkr votedesc <URL> <SBD:option>`
* 스크랩(sp) : `$ steemkr scrappost <URL> <STEEM_SCRAP_AUTHOR> <STEEM_SCRAP_KEY_POSTING>`
* 보팅그룹(vg) : `$ steemkr votegroup <URL> <VOTE_WEIGHT> <STEEM_AUTHOR> <STEEM_KEY_POSTING> <STEEM_VOTES_LIST>`
> STEEM_VOTES_LIST 에 해당하는 목록은 모두 POSTING 권한을 위임 받아야 됨에 유의
> 참조링크 : https://steemit.com/kr/@wonsama/5vgvgt-kr-dev
* 계정생성(cr) : `$ steemkr create <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 수정이력조회(hi) : `$ steemkr history <URL>`
* 보팅조회(vo) : `$ steemkr voteto <STEEM_AUTHOR> <STEEM_VOTE_DAY-옵션,기본7일>`
* 컨버트(ct) : `$ steemkr convert <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 스팀구매(bm) : `$ steemkr buysteem <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 스달구매(bd) : `$ steemkr buysbd <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 구매확인취소(bc) : `$ steemkr buycancel <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 리스팀(re) : `$ steemkr resteem [RESTEEM_URL] <STEEM_RESTEEM_AUTHOR> <STEEM_RESTEEM_KEY_POSTING>`
* 태그라이브(tl) : `$ steemkr taglive <STEEM_TAG>`
* 스파업(pw) : `$ steemkr powerup <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 차단목록(bl) : `$ steemkr block <STEEM_AUTHOR>`
* 피드보기(fd) : `$ steemkr feed <STEEM_AUTHOR>`
* 스라벨(sl) : `$ steemkr slb <STEEM_AUTHOR> <STEEM_SLB_DAY-옵션,기본7일>`
* 일일 가격변동 확인(pr) : `$ steemkr price <STEEM_PRICE_COIN-기본:STEEM>`
* 계정 정보 확인(ac) : `$ steemkr accounts <STEEM_AUTHOR> <STEEM_KEY_POSTING-옵션>`
* 도움말(hp) : `$ steemkr help`
* 버전(vr) : `$ steemkr version`

> 코인타입은 upbit에서 원화마켓에 존재하는 모든 것을 사용할 수 있습니다. (18.06.01일 기준)
> 계정정보에서 포스팅키 입력 시 자동으로 보상(reward)를 청구합니다

# 환경변수

* 설정하는 경우 값을 입력하지 않아도 매칭되는 값이 자동으로 입력 됩니다.
* STEEM_KEY_POSTING, STEEM_KEY_ACTIVE 를 사용하는 명령어는 꼭 __확인 후 사용__ 하기 바랍니다.
* 설정방법 : 네이버/구글에서 `환경변수 설정방법` 으로 검색하여 확인 바랍니다.

# 설정 가능한 환경변수 종류

#### 신규

* N/A

#### 기존

* STEEM_SCRAP_AUTHOR 스크랩용 계정명 
* STEEM_SCRAP_KEY_POSTING 스크랩용 계정명 포스팅키
* STEEM_VOTES_LIST 보팅 그룹목록(포스팅키 위임이 된 계정들)이 자동적으로 입력됩니다.(콤마 구분)
* STEEM_VOTE_DAY 값을 설정하는 경우 보팅조회(voteto) 기본 조회일자가 자동으로 입력됩니다.
* STEEM_RESTEEM_AUTHOR 리스팀 작가(유저명) 정보가 자동으로 입력됩니다.
* STEEM_RESTEEM_KEY_POSTING 값을 설정하는 경우 리스팀 작가(유저) 포스팅 키값이 자동으로 입력됩니다.
* STEEM_AUTHOR 작가(유저명) 정보가 자동으로 입력됩니다.
* STEEM_KEY_POSTING 값을 설정하는 경우 포스팅 키값이 자동으로 입력됩니다.
* STEEM_KEY_ACTIVE 값을 설정하는 경우 엑티브 키값이 자동으로 입력됩니다.
* STEEM_PRICE_COIN 값을 설정하는 경우 코인타입이 자동으로 입력됩니다.
* STEEM_SLB_DAY 값을 설정하는 경우 스라벨(slb) 기본 조회일자가 자동으로 입력됩니다.
* STEEM_TAG 값을 설정하는 경우 태그 값이 자동으로 입력됩니다. 

# 소스

* [MIT 라이선스](https://ko.wikipedia.org/wiki/MIT_%ED%97%88%EA%B0%80%EC%84%9C) 입니다. 마음것 변형해서 사용하셔도 됩니다.
* [steemkr in GIT Hub](https://github.com/wonsama/steemkr)
* [steemkr in NPM Repository](https://www.npmjs.com/package/steemkr)

# 경고

* posting key / active key 사용 시 외부 노출된 곳에서(PC방 등) 사용하지 않기 바랍니다.
* posting key / active key 는 steemit api 서버 이외 타 서버로 절대 전송하지 않습니다. [steemkr in GIT Hub 소스 참조](https://github.com/wonsama/steemkr)
* 위에 명시한 GITHub 또는 NPM 저장소 이외에서 받은 소스는 꼭 확인 후 사용 바랍니다.
* 의심스러운 경우에는 post, active 키를 사용하는 명령어(스달/스팀 전송, 보팅, 스파업 등)는 사용하지 않기를 권장드립니다.
* 위 사항을 무시한 채 사용시 발생되는 책임은 본인에게 있음을 알립니다.

# 최근 업데이트 이력

#### 0.14.0

* replies : 댓글 목록 정보를 가져온다. (아이디기준 필터링 가능
* [변경이력 자세히 보기](https://raw.githubusercontent.com/wonsama/steemkr/master/HISTORY.md)

# 개발 로드맵

1. cli(커맨드라인인터페이스) 기반 스팀잇 메소드 구현
1. 소스 리펙토링 : 커맨드명, 소스정리, API 외부 노출 등
1. localization (영문, 한글) 적용 => 영문 기반으로 탈바꿈, 소스주석 포함
1. electron 기반 Desktop App 제작
1. android 기반 Mobile App 제작 

# 맺음말

* 지속적으로 개발하즈아 ~

---

<div class='text-right'>
<strong>이전 관련 글은 #w-dev 태그를 통해 확인하실 수 있습니다. </strong>
<br>
<strong>오늘도 행복한 하루 되세요 from @wonsama</strong>
</div>