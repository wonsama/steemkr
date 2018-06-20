const menus = {
  main: `
    steemkr [command] <options>

    (메인)
    resteem / re  ........... 입력받은 주소 정보를 리스팀(리블로그) 한다. 7일이 지난 경우에도 가능
    taglive / tl  ........... 입력받은 태그의 실시간 피드정보를 확인할 수 있다. 10초 단위 목록 정보 갱신
    powerup / pw  ........... 내 계정의 스팀을 스팀파워로 전환한다(몽땅 한번에 전환함에 유의!)
    block / bl  ............. 입력받은 계정을 차단한 계정목록을 볼 수 있다.
    feed / fd ............... 입력받은 계정의 실시간 피드정보를 확인할 수 있다. 10초 단위 목록 정보 갱신
    slb / sl ................ 입력받은 계정 및 기간 기준 스팀잇 라이프 벨런스를 보여준다.(글 작성 시간대)
    accounts / ac ........... 입력받은 계정의 정보를 보여줌
    price / pr .............. 오늘의 스팀 가격정보를 알려준다. (upbit 기준)

    (기타)
    version / vr ............ steemkr의 버전 정보
    help / hp ............... 도움말, help <options> 에서 options에 명령어를 입력하면 상세 도움말을 볼 수 있습니다

    (비고)

    <키값> .................... 설정값에서 해당 '키값' 기준으로 로딩합니다
    [값] ...................... 반드시 필수로 입력 받아야 됩니다. 설정값에 설정 불가

    $ steemkr help accounts ..... 계정관련 도움말을 볼 수 있습니다.
  `,

  resteem: `
    $ steemkr resteem [REBLOG_URL] <STEEM_RESTEEM_AUTHOR> <STEEM_RESTEEM_KEY_POSTING>

      * [REBLOG_URL] 리블로그할 주소 정보
      * 예시) https://steemit.com/kr/@wonsama/kr-dev-krob
      * <STEEM_RESTEEM_AUTHOR> <STEEM_RESTEEM_KEY_POSTING> 를 별도로 입력 받으므로 부계정이 있는 경우 수월하게 리스팀을 수행할 수 있다.
      * payout(7일)이 지난 컨텐츠 또한 리블로깅이 가능

    $ steemkr resteem https://steemit.com/kr/@wonsama/kr-dev-krob 
      ... 설정값(STEEM_RESTEEM_AUTHOR, STEEM_RESTEEM_KEY_POSTING) 정보를 기준으로 리블로깅을 한다
      
    $ steemkr re https://steemit.com/kr/@wonsama/kr-dev-krob wonsama 5J1234abcd123h801eh123rf 
      ... 입력받은 주소를 wonsama 계정으로 리블로깅 한다.
  `,

  taglive: `
    $ steemkr taglive <STEEM_TAG-default:kr>

      * <STEEM_TAG> 입력받은 태그의 실시간 피드정보를 확인

    $ steemkr taglive ....................... 환경변수에 설정된 STEEM_TAG 값을 기준으로 없는 경우 기본값 kr 로 조회
    $ steemkr taglive kr .................... kr 태그의 실시간 컨텐츠 정보를 로드한다
    $ steemkr tl kr ......................... kr 태그의 실시간 컨텐츠 정보를 로드한다
  `,

  block: `
    $ steemkr block <STEEM_AUTHOR>

      * <STEEM_AUTHOR> 기준으로 해당 아이디를 차단한 목록 정보를 확인할 수 있다.

    $ steemkr block ....................... 환경변수에 설정된 STEEM_AUTHOR 값을 기준으로 조회
    $ steemkr block wonsama ............... wonsama 를 블록한 아이디 목록 정보를 보여준다
    $ steemkr bl wonsama .................. wonsama 를 블록한 아이디 목록 정보를 보여준다
  `,

  feed: `    
    $ steemkr feed <STEEM_AUTHOR>

      * <STEEM_AUTHOR> 기준으로 피드 목록을 실시간으로 조회한다
      * 10초 단위로 자동 갱신된 피드 정보를 표시한다

    $ steemkr feed ....................... 환경변수에 설정된 STEEM_AUTHOR 값을 기준으로 조회
    $ steemkr feed wonsama ............... wonsama 의 피드 정보를 보여준다.
    $ steemkr fd wonsama ................. wonsama 의 피드 정보를 보여준다.
  `,

  price: `
    $ steemkr price <STEEM_PRICE_COIN>

      * UPBIT 기준 오늘의 스팀 가격 정보를 chart를 통해 보여준다.
      * <STEEM_PRICE_COIN> 에는 UPBIT 원화마켓에서 제공하는 코인 타입을 넣을 수 있다.

    $ steemkr price ..................... 환경변수에 설정된 <STEEM_PRICE_COIN> 값을 기준으로 조회
    $ steemkr price STEEM ............... 스팀 가격을 조회한다
    $ steemkr pr EOS .................... 이오스 가격을 조회한다 
  `,
  slb: `
    $ steemkr slb <STEEM_AUTHOR> <STEEM_SLB_DAY-option,default:7>

      * <STEEM_AUTHOR> 입력받은 계정 및 <STEEM_SLB_DAY> 기준 스팀잇 라이프 벨런스를 보여준다.(글 작성 시간대)

    $ steemkr slb ................... 환경변수에 설정된 STEEM_AUTHOR 값을 기준으로 조회
    $ steemkr slb wonsama 30 ........ wonsama 의 30일간 스라벨 정보를 보여준다.
    $ steemkr sl wonsama 7 .......... wonsama 의 7일간 스라벨 정보를 보여준다.
  `,
  accounts: `
    $ steemkr accounts <STEEM_AUTHOR> <STEEM_KEY_POSTING-option>

      * <STEEM_AUTHOR> 기준으로 정보를 조회한다
      * 환경 변수에 <STEEM_KEY_POSTING> 값이 설정되어 있는 경우 자동으로 reward를 청구한다

    $ steemkr accounts ................... 환경변수에 설정된 STEEM_AUTHOR 값을 기준으로 조회
    $ steemkr accounts wonsama ........... wonsama 의 계정 정보를 보여준다.
    $ steemkr ac wonsama ................. wonsama 의 계정 정보를 보여준다.
  `,
}

module.exports = (param) => {

  if(param){
    console.log(menus[param] || menus.main);
  }else{
    console.log(menus.main);
  }

}