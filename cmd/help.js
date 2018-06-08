const menus = {
  main: `
    steemkr [command] <options>

    accounts ........... 입력받은 계정의 정보를 보여줌
    version ............ steemkr의 버전 정보
    help ............... 도움말, help <options> 에서 options에 명령어를 입력하면 상세 도움말을 볼 수 있습니다

    $ steemkr help accounts ..... 계정관련 도움말을 볼 수 있습니다.
  `,

  accounts: `
    steemkr accounts <names>

    $ steemkr accounts wonsama ........... wonsama 의 계정 정보를 보여준다.
    $ steemkr accounts wonsama clayop .... wonsama, clayop의 계정 정보를 보여준다. (여러명 입력 가능)
  `,
}

module.exports = (param) => {

  if(param){
    console.log(menus[param] || menus.main);
  }else{
    console.log(menus.main);
  }

}