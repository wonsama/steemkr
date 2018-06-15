# steemkr

## 스팀잇 용 CLI (커맨드라인 툴)

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_block.png)
<center>[그림 : 차단목록 (날 차단한 사람을 확인할 수 있다.) ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_feed.png)
<center>[그림 : 피드보기 (내계정 포함 다른 계정의 피드 실시간으로 확인할 수 있다.) ]</center>

![ss_slb.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_slb.png)
<center>[그림 : 스라벨 (글, 댓글 작성 갯수 및 시간대) ]</center>

![ss_price.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_price.png)
<center>[그림 : upbit 기준 코인가격 확인 ]</center>

![ss_accounts.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_accounts.png)
<center>[그림 : 계정 정보 확인]</center>

# 사전작업

* [nodejs 설치](https://nodejs.org/) 에 접속하여 Download 를 한 이후 다음(next)를 계속 누름

# steemkr 설치방법

* 맥 : 터미널(terminal), 윈도우 : 실행 - cmd
* 이후 터미널(커맨드)창에서 `npm install -g steemkr` 와 같이 입력
* 맥(우분투 등)은 root 권한으로 설치 `sudo npm install -g steemkr`

> 기존에 하신 분도 위와 같이 하면 자동으로 최신 버전을 업데이트 받습니다.

# 사용방법

#### 신규

* 차단목록 : `$ steemkr block <계정명>`
* 피드보기 : `$ steemkr feed <계정명>`

#### 기존

* 스라벨 : `$ steemkr slb <계정명> <일수:기본 - 7>`
* 일일 가격변동 확인 : `$ steemkr price <코인타입:기본 - STEEM>`
* 계정 정보 확인 : `$ steemkr accounts <계정명>`
* 도움말 : `$ steemkr help`
* 버전 : `$ steemkr version`

> 코인타입은 upbit에서 원화마켓에 존재하는 모든 것을 사용할 수 있습니다. (18.06.01일 기준)

#### 기타(환경변수 설정 - 옵션)

* STEEM_AUTHOR 값을 설정하는 경우 <계정명> 에 해당하는 부분이 자동으로 입력 됩니다.
* STEEM_KEY_POSTING 값을 설정하는 경우 <포스팅키> 에 해당하는 부분이 자동으로 입력 됩니다.
* STEEM_KEY_ACTIVE 값을 설정하는 경우 <액티브키> 에 해당하는 부분이 자동으로 입력 됩니다.
* accounts : STEEM_AUTHOR, STEEM_KEY_POSTING 설정 시 자동으로 reward를 청구함
* 설정 해도 되고 안해도 됨.(단,추후 추가되는 일부 기능을 사용할 수 없습니다.)


```
STEEM_AUTHOR : 계정명 
STEEM_KEY_POSTING : 포스팅키
```

# 소스

* [MIT 라이선스](https://ko.wikipedia.org/wiki/MIT_%ED%97%88%EA%B0%80%EC%84%9C) 입니다. 마음것 변형해서 사용하셔도 됩니다.
* [steemkr in GIT Hub](https://github.com/wonsama/steemkr)
* [steemkr in NPM Repository](https://www.npmjs.com/package/steemkr)

# 맺음말

* 나름 조금씩 추가되어가고 있네요. 
* 저 차단하신분 해제좀 ㅜㅜ 착하게 살께요 ~

# 업데이트 이력

* 0.3.0 block, feed 명령 추가됨 : 차단목록, 피드보기
* 0.2.0 slb 명령 추가됨 : 스라벨 (글, 댓글 작성 갯수 및 시간대)
* 0.1.0 price 명령 추가됨 : upbit 기준 코인가격 확인
* 0.0.1 accounts 명령 추가됨 : 최초작성
