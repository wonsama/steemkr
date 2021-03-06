const menus = {
  main: `
    steemkr [command] <options>

    (메인)
    replies / rp ............. 원문 글의 댓글 목록 정보를 보여준다
    votedesc / vd  ........... 보팅상세정보 - 입력받은 URL의 보팅 정보를 보여준다
    scrappost / sp  .......... 스크랩 포스팅 - 입력받은 URL 글을 스크래핑(일부) 후 포스팅
    votegroup / vg  .......... 보팅 트레인(한번에 부캐 계정모두 보팅하기)
    create / cr  ............. 부계정 생성하기
    history / hi  ............ 글의 수정 이력 및 정보 확인
    voteto / vo  ............. 최근 N일간 보팅 이력 조회
    convert / ct  ............ 내부거래소 평균 시세로 SBD 로 STEEM 을 3.5 일 후 교환 / 취소 불가
    buysteem / bm  ........... 내부거래소에서 SBD 로 STEEM 을 구매
    buysbd / bd  ............. 내부거래소에서 STEEM 으로 SBD 를 구매
    buyscancel / bc  ......... 내부거래소에 등록된 목록 확인 및 취소
    resteem / re  ............ 입력받은 주소 정보를 리스팀(리블로그) 한다. 7일이 지난 경우에도 가능
    taglive / tl  ............ 입력받은 태그의 실시간 피드정보를 확인할 수 있다. 10초 단위 목록 정보 갱신
    powerup / pw  ............ 내 계정의 스팀을 스팀파워로 전환한다(몽땅 한번에 전환함에 유의!)
    block / bl  .............. 입력받은 계정을 차단한 계정목록을 볼 수 있다.
    feed / fd ................ 입력받은 계정의 실시간 피드정보를 확인할 수 있다. 10초 단위 목록 정보 갱신
    slb / sl ................. 입력받은 계정 및 기간 기준 스팀잇 라이프 벨런스를 보여준다.(글 작성 시간대)
    accounts / ac ............ 입력받은 계정의 정보를 보여줌, posting키 설정 시 보상요청도가능
    price / pr ............... 오늘의 스팀 가격정보를 알려준다. (upbit 기준)

    (기타)
    version / vr ............ steemkr의 버전 정보
    help / hp ............... 도움말, help <options> 에서 options에 명령어를 입력하면 상세 도움말을 볼 수 있습니다
    
    $ steemkr help accounts ..... 계정관련 도움말을 볼 수 있습니다.
    $ steemkr hp accounts ....... (줄임 명령어 사용) 계정관련 도움말을 볼 수 있습니다.
  `,

  powerup: `
    $ steemkr powerup <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>

      * 계정의 스팀 파워업을 수행 합니다.

    $ steemkr powerup 계정명 엑티브키
    $ steemkr pw 계정명 엑티브키
  `,

  replies: `
    $ steemkr replies <URL> <AUTHOR:option>

      * 입력받은 <URL> 정보기준 댓글 정보를 출력한다 
      * <AUTHOR> 정보 입력시 해당 유저의 댓글만 출력한다 (아이디 일부만 넣어도 됨)

    $ steemkr replies 주소 필터링아이디(옵션)
    $ steemkr rp 주소 필터링아이디(옵션)
  `,

  votedesc: `
    $ steemkr votedesc <URL> <SBD_LIMIT>

      * 입력받은 <URL> 정보기준 보팅 정보를 출력한다 
      * <SBD_LIMIT> 기준으로 해당 금액 이하는 표시하지 않음
      * <SBD_LIMIT> 은 기본값이 0.001 이며 , 0으로 설정 시 모든 보팅 정보를 보여준다
      * 보팅 금액(rshare) 기준으로 정렬되어 표시됨

    $ steemkr votedesc 주소 SBD제한선(기본 0.001)
    $ steemkr vd 주소 SBD제한선(기본 0.001)
  `,

  scrappost: `
    $ steemkr scrappost <URL> <STEEM_SCRAP_AUTHOR> <STEEM_SCRAP_KEY_POSTING>

      * [유의사항] 주소란에 &가 포함되면 콘솔에서는 백그라운드로 동작함(이럴땐 주소를 ''로 감싸주면 됨)
      * 입력받은 <URL> 정보를 <STEEM_SCRAP_AUTHOR> 계정의 댓글로 기록한다 
      * 1일 1POST가 되며, 하위 댓글로 연속적으로 기록됨

    $ steemkr scrappost 주소 계정명 포스팅키
    $ steemkr sp 주소 계정명 포스팅키
  `,

  votegroup: `
    $ steemkr votegroup <URL> <VOTE_WEIGHT> <STEEM_AUTHOR> <STEEM_KEY_POSTING> <STEEM_VOTES_LIST>

      * 지정된 보팅목록(STEEM_VOTES_LIST) 기준으로 보팅 트레인(한번에 모든 계정 보팅)을 수행한다
      * 단, STEEM_VOTES_LIST 에 포함되는 목록은 반드시 모 계정에 POSTING_KEY가 위임 되어 있어야 됨에 유의

    $ steemkr votegroup 주소 보팅무게 계정명 포스팅키 위임계정목록
    $ steemkr vg 주소 보팅무게 계정명 포스팅키 위임계정목록
  `,

  create: `
    $ steemkr create <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>

      * 모계정의 스팀(3스팀 이상 필요)을 가지고 계정을 생성한다

    $ steemkr create 계정명 엑티브키
    $ steemkr hi 계정명 엑티브키
  `,

  history: `
    $ steemkr history <URL>

      * 글의 수정 이력 및 정보 확인

    $ steemkr history 글주소
    $ steemkr hi 글주소

    sample) steemkr history https://steemit.com/kr/@wonsama/steemitlove-hf20
  `,

  voteto: `
    $ steemkr voteto <STEEM_AUTHOR> <STEEM_VOTE_DAY-옵션,기본7일>

      * 최근 N일간 보팅 이력 조회

    $ steemkr voteto
    $ steemkr voteto 계정명
    $ steemkr voteto 계정명 조회일
    $ steemkr vo
    $ steemkr vo 계정명
    $ steemkr vo 계정명 조회일
  `,

  convert: `
    $ steemkr convert <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>

      * 내부거래소 평균 시세로 SBD 로 STEEM 을 3.5 일 후 교환 / 취소 불가

    $ steemkr convert
    $ steemkr convert 계정명 엑티브키
    $ steemkr ct
    $ steemkr ct 계정명 엑티브키
  `,

  buycancel: `
    $ steemkr buysbd <STEEM_AUTHOR> <STEEM_KEY_ACTIVE>

      * 내부거래소에 등록한 목록을 확인 / 취소 할 수 있다.

    $ steemkr buycancel
    $ steemkr buycancel 계정명 엑티브키
    $ steemkr bl
    $ steemkr bl 계정명 엑티브키
  `,

  buysbd: `
    $ steemkr buysbd <STEEM_AUTHOR> <STEEM_KEY_ACTIVE> <STEEM_ORDER_LIMIT-option>

      * STEEM 로 SBD 구매를 진행한다
      * STEEM 가 0 이상 있는 경우에만 진행 가능함

    $ steemkr buysbd
    $ steemkr buysbd 계정명 엑티브키
    $ steemkr bd
    $ steemkr bd 계정명 엑티브키
  `,

  buysteem: `
    $ steemkr buysteem <STEEM_AUTHOR> <STEEM_KEY_ACTIVE> <STEEM_ORDER_LIMIT-option>

      * SBD 로 STEEM 구매를 진행한다
      * SBD 가 0 이상 있는 경우에만 진행 가능함

    $ steemkr buysteem
    $ steemkr buysteem 계정명 엑티브키
    $ steemkr bm
    $ steemkr bm 계정명 엑티브키
  `,

  resteem: `
    $ steemkr resteem [REBLOG_URL] <STEEM_RESTEEM_AUTHOR> <STEEM_RESTEEM_KEY_POSTING>

      * [REBLOG_URL] 리블로그할 주소 정보
      * 예시) https://steemit.com/kr/@wonsama/kr-dev-krob
      * <STEEM_RESTEEM_AUTHOR> <STEEM_RESTEEM_KEY_POSTING> 를 별도로 입력 받으므로 부계정이 있는 경우 수월하게 리스팀을 수행할 수 있다.
      * payout(7일)이 지난 컨텐츠 또한 리블로깅이 가능

    $ steemkr resteem 스팀잇주소
    $ steemkr resteem 스팀잇주소 계정명 포스팅키
    $ steemkr re 스팀잇주소
    $ steemkr re 스팀잇주소 계정명 포스팅키
  `,

  taglive: `
    $ steemkr taglive <STEEM_TAG-default:kr>

      * 입력받은 태그의 실시간 피드정보를 확인
      * 태그 미 기입 시 기본값 kr

    $ steemkr taglive
    $ steemkr taglive kr
    $ steemkr tl
    $ steemkr tl kr
  `,

  block: `
    $ steemkr block <STEEM_AUTHOR>

      * 해당 아이디를 차단한 목록 정보를 확인할 수 있다.

    $ steemkr block
    $ steemkr block 계정명
    $ steemkr bl
    $ steemkr bl 계정명
  `,

  feed: `    
    $ steemkr feed <STEEM_AUTHOR>

      * <STEEM_AUTHOR> 기준으로 피드 목록을 실시간으로 조회한다
      * 10초 단위로 자동 갱신된 피드 정보를 표시한다

    $ steemkr feed
    $ steemkr feed 계정명
    $ steemkr fd
    $ steemkr fd 계정명
  `,

  price: `
    $ steemkr price <STEEM_PRICE_COIN>

      * UPBIT 기준 오늘의 스팀 가격 정보를 chart를 통해 보여준다.
      * <STEEM_PRICE_COIN> 에는 UPBIT 원화마켓에서 제공하는 코인 타입을 넣을 수 있다.

    $ steemkr price
    $ steemkr price STEEM
    $ steemkr pr
    $ steemkr pr EOS
  `,
  slb: `
    $ steemkr slb <STEEM_AUTHOR> <STEEM_SLB_DAY-option,default:7>

      * <STEEM_AUTHOR> 입력받은 계정 및 <STEEM_SLB_DAY> 기준 스팀잇 라이프 벨런스를 보여준다.(글 작성 시간대)

    $ steemkr slb
    $ steemkr slb 계정명
    $ steemkr slb 계정명 조회기간
    $ steemkr sl
    $ steemkr sl 계정명
    $ steemkr sl 계정명 조회기간
  `,
  accounts: `
    $ steemkr accounts <STEEM_AUTHOR> <STEEM_KEY_POSTING-option>

      * <STEEM_AUTHOR> 기준으로 정보를 조회한다
      * 환경 변수에 <STEEM_KEY_POSTING> 값이 설정되어 있는 경우 자동으로 reward를 청구한다

    $ steemkr accounts
    $ steemkr accounts 계정명
    $ steemkr accounts 계정명 포스팅키
    $ steemkr ac
    $ steemkr ac 계정명
    $ steemkr ac 계정명 포스팅키
  `,
}

module.exports = (param) => {

  if(param){
    console.log(menus[param] || menus.main);
  }else{
    console.log(menus.main);
  }

}