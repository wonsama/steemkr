# steemkr

## 스팀잇 용 CLI (커맨드라인 툴)

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_buysteem.png)
<center>[ 그림 : 내부거래소를 통한 SBD -> STEEM 구매 ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_buysbd.png)
<center>[ 그림 : 내부거래소를 통한 STEEM -> SBD 구매 ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_buycancel.png)
<center>[ 그림 : 내부거래소 거래목록 조회 및 취소 ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_resteem.png)
<center>[ 그림 : 리스팀, 7일(payout)이 지난 글 또한 가능 ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_taglive.png)
<center>[ 그림 : 태그라이브, 태그기준 피드정보를 실시간으로 확인할 수 있다 ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_powerup.png)
<center>[ 그림 : 스파업, 손쉽게 스파업을 할 수 있다 ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_block.png)
<center>[ 그림 : 차단목록 (날 차단한 사람을 확인할 수 있다) ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_feed.png)
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

* 스팀구매(bm) : `$ steemkr buysteem <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 스달구매(bd) : `$ steemkr buysbd <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`
* 구매확인취소(bc) : `$ steemkr buycancel <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>`

#### 기존

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
* STEEM_KEY_ACTIVE 를 사용하는 명령어는 꼭 __확인 후 사용__ 하기 바랍니다.
* 설정방법 : 네이버/구글에서 `환경변수 설정방법` 으로 검색하여 확인 바랍니다.

# 설정 가능한 환경변수 종류

#### 신규

* N/A

#### 기존

* STEEM_RESTEEM_AUTHOR 리스팀 작가(유저명) 정보가 자동으로 입력됩니다.
* STEEM_RESTEEM_KEY_POSTING 값을 설정하는 경우 리스팀 작가(유저) 포스팅 키값이 자동으로 입력됩니다.
* STEEM_AUTHOR 작가(유저명) 정보가 자동으로 입력됩니다.
* STEEM_KEY_POSTING 값을 설정하는 경우 포스팅 키값이 자동으로 입력됩니다.
* STEEM_KEY_ACTIVE 값을 설정하는 경우 엑티브 키값이 자동으로 입력됩니다.
* STEEM_PRICE_COIN 값을 설정하는 경우 코인타입이 자동으로 입력됩니다.
* STEEM_SLB_DAY 값을 설정하는 경우 스라벨 기본 조회일자가 자동으로 입력됩니다.
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

#### 0.6.0

* buysteem, buysbd, buycancel
  * buysteem : 내부거래소에서 SBD 로 STEEM 구매처리
  * buysbd : 내부거래소에서 STEEM 으로 SBD 구매처리
  * buycancel : 주문목록 확인 및 취소
* [변경이력 자세히 보기](https://raw.githubusercontent.com/wonsama/steemkr/master/HISTORY.md)

# 개발 로드맵

1. cli(커맨드라인인터페이스) 기반 스팀잇 메소드 구현
1. 소스 리펙토링 : 커맨드명, 소스정리, API 외부 노출 등
1. localization (영문, 한글) 적용 => 영문 기반으로 탈바꿈, 소스주석 포함
1. electron 기반 Desktop App 제작
1. android 기반 Mobile App 제작 

# 맺음말

* 내부거래소를 최저가 또는 최고가로 빠르게 구매 처리를 할 수 있도록 구현 ! (물론 원하는 가격으로 설정가능)