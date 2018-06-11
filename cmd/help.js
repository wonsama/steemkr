const menus = {
  main: `
    steemkr [command] <options>

    (메인)
    accounts ........... 입력받은 계정의 정보를 보여줌
    price .............. 오늘의 스팀 가격정보를 알려준다. (upbit 기준)

    (기타)
    version ............ steemkr의 버전 정보
    help ............... 도움말, help <options> 에서 options에 명령어를 입력하면 상세 도움말을 볼 수 있습니다

    $ steemkr help accounts ..... 계정관련 도움말을 볼 수 있습니다.
  `,

  price: `
    UPBIT 기준 오늘의 스팀 가격 정보를 chart를 통해 보여준다.

    $ steemkr price
  `,
  accounts: `
    * .env 파일에 ( STEEM_AUTHOR, STEEM_KEY_POSTING ) 값 설정시 reward 존재 시 자동으로 reward를 요청.
    * <name> 미설정 시 STEEM_AUTHOR 값이 존재하면 해당 정보를 우선적으로 읽어들인다.

    steemkr accounts ............ STEEM_AUTHOR 정보 기준으로 조회, STEEM_AUTHOR 설정값이 존재해야 됨 ( .env 또는 환경 변수 값 )
    steemkr accounts <name> ..... 입력받은 name 기준으로 조회

    $ steemkr accounts wonsama ........... wonsama 의 계정 정보를 보여준다.
  `,
}

module.exports = (param) => {

  if(param){
    console.log(menus[param] || menus.main);
  }else{
    console.log(menus.main);
  }

}