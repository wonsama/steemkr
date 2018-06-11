# steemkr
스팀잇 용 CLI (커맨드라인 툴)

![ss_accounts.png](https://raw.githubusercontent.com/wonsama/steemkr/master/images/ss_accounts.png)

# 사전작업

* [nodejs 설치](https://nodejs.org/) 에 접속하여 Download 를 한 이후 다음(next)를 계속 누름

# steemkr 설치방법

* 맥 : 터미널(terminal), 윈도우 : 실행 - cmd
* 이후 터미널(커맨드)창에서 `npm install -g steemkr` 와 같이 입력
* 맥(우분투 등)은 root 권한으로 설치 `sudo npm install -g steemkr`

# 사용방법

#### 환경변수 설정

* 나의 계정 정보를 미리 입력하여 다양한 기능을 처리(설정 안해도 되요, 물론 해당 기능은 못씀)
* 찜찜하다 싶은 분은 꼭 !! github 소스 참조후 설정 바랍니다.

```
(윈도우의 경우 : 내컴퓨터 - 속성 - 고급 시스템 설정 - 환경변수 )
(맥/리눅스 경우 : .profile 에 아래 2개값 추가 )

STEEM_AUTHOR : 계정명 
STEEM_KEY_POSTING : 포스팅키
```

> STEEM_AUTHOR, STEEM_KEY_POSTING 키 입력시 steemkr accounts 만 해도 계정 정보 확인 및 보상이 있을 경우 자동으로 보상을 청구함.
> (물론 찝찝하면 안쓰면되요 ^^ )

#### new 
* 일일 가격변동 확인 : `$ steemkr price <코인타입>`

#### old
* 계정 정보 확인 : `$ steemkr accounts <계정명>`
* 도움말 : `$ steemkr help`
* 버전 : `$ steemkr version`

# 소스

* [MIT 라이선스](https://ko.wikipedia.org/wiki/MIT_%ED%97%88%EA%B0%80%EC%84%9C) 입니다. 마음것 변형해서 사용하셔도 됩니다.
* [steemkr in GIT Hub](https://github.com/wonsama/steemkr)
* [steemkr in NPM Repository](https://www.npmjs.com/package/steemkr)

# 맺음말

* 현재는 테스트용인지라 명령어가 별로 없네요 ㅜㅜ
* 앞으로 조금씩 추가할 예정

# 업데이트 이력

* 0.1.0 price 명령 추가됨 : 가격 확인
* 0.0.1 최초작성
