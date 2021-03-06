#### 0.14.5

* scrappost : 펌링크 생성규칙 보완

#### 0.14.4

* help : 누락된 설명 replies 추가됨

#### 0.14.3

* account : https://steemdb.com/ 사이트가 다운되는 경우가 예외처리 추가됨

#### 0.14.2

* account : 보상청구 로직 수정

> 설정값(STEEM_AUTHOR,STEEM_KEY_POSTING)이 존재하는 경우에는 입력받은 작가와 계정이 동일한 경우에만 동작하도록 함, 반대로 설정 값이 없으면 계정과 포스팅키를 입력받으면 보상을 청구하도록 함

```
let isClaim = true;
  if(STEEM_AUTHOR && STEEM_KEY_POSTING){
    if(STEEM_AUTHOR!=account){
      isClaim=false;
    }
  }

  if(isClaim && account && wif){
    // DO CLAIM REWARD
  }
```

#### 0.14.1

* powerup : 메뉴얼 안나오던 문제 수정 ( 제보 : @dakeshi 님 ) 

#### 0.14.0

* replies : 댓글 목록 정보를 가져온다. (아이디기준 필터링 가능)


#### 0.13.1

* account : info 출력기능 추가됨
* library : wnumber 추가 됨

#### 0.13.0

* votedesc : 입력받은 링크 정보를 기준으로 보팅 정보를 확인할 수 있도록 함.

#### 0.12.6

* votedesc : 작업중

#### 0.12.4

* scrappost : 기본 파서 성능향상 / 오픈그래프가 없는 경우 title과 body에서 정보 추출

#### 0.12.3

* account : 팔로워, 팔로잉 정보 추가

#### 0.12.2

* account : 소스튜닝 promise.all 로 속도 개선

#### 0.12.1

* account : 소스코드 튜닝, 보팅파워 출력정보 추가(보팅파워, 보팅가치)

#### 0.12.0

* scrappost : 링크주소 기반 포스팅, 스크랩을 손쉽게 하기위함.(부캐 개정에 설정하길 권장)

#### 0.11.1

* remove delegator info : 링크 깨짐
* minor bug fix

#### 0.11.0

* votegroup : 보팅 위임을 통해서 보팅그룹으로 보팅하기 ! (보팅트레인)

#### 0.10.0

* create : 계정생성 기능 추가 ( 3 steem 필요 -> 추후 변경 될 수 있음 )

#### 0.9.2

* 버그수정 help 누락 추가 등

#### 0.9.1

* 버전 정보 오류 수정

#### 0.9.0

* history : 입력받은 해당 글 주소의 정보 및 수정 이력을 확인할 수 있습니다.

#### 0.8.2

* history : (테스트 중)

#### 0.8.1

* accounts : follower 정보 추가됨 / busy.org에서 mvest 확인 땜시 (25billion)

#### 0.8.0

* voteto : 보팅이력 정보를 조회할 수 있습니다.

#### 0.7.0

* convert : 3.5일 후 sbd => steem 을 시세 평균가로 교환
* accounts : 소스코드 정리 / 임대, 임차 정보 추가됨

#### 0.6.4

* convert : (테스트 중) 신규 추가 - 3.5일 후 sbd => steem 을 시세 평균가로 교환
* initParams 공통적으로 추가 / interface 형태로 
* accounts 에 delegate 정보가 있는 경우 상세 정보를 보여주도록 함
* accounts 소스코드 정리 / 임대, 임차 정보 추가됨

#### 0.6.3

* account : 프로필사진 경로 수정

#### 0.6.2

* slb : 버그수정 ( special thank you for stylegold )

#### 0.6.1

* 설명 등 마이너 추가

#### 0.6.0

* buysteem, buysbd, buycancel
  * buysteem : 내부거래소에서 SBD 로 STEEM 구매처리
  * buysbd : 내부거래소에서 STEEM 으로 SBD 구매처리
  * buycancel : 주문목록 확인 및 취소

#### 0.5.2

* 작업진행중
  * buysteem : 내부거래소에서 SBD로 STEEM 구매처리
  * buycancel : 주문목록 확인 및 취소

#### 0.5.1

* 리드미 수정

# 0.5.0

* reblog
  * 7일이 지난 글또한 리블로깅 가능
  * 설정값(STEEM_REBLOG_AUTHOR, STEEM_REBLOG_KEY_POSTING)을 지정하면 내계정 또는 타계정으로(부계정) 리블로깅 가능
* 입력 파라미터 점검로직 수정

#### 0.4.1

* feed, taglive 컨텐츠 로딩 실패 시 재로딩 처리 추가
* 소개 이미지 교체

# 0.4.0

* powerup, taglive 명령 추가됨
  * 단축명령(2자리) 추가됨
  * 설명서(help) 업데이트

# 0.3.0

* block, feed 명령 추가됨

# 0.2.0

* slb 명령 추가

# 0.1.0

* price 명령 추가

# 0.0.1

* 최초작성
* accounts 명령 추가