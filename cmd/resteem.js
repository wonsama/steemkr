const help = require('./help');
const {getLocalTime} = require('../util/wdate');
const {getInfoFromLink} = require('../util/wsteem');
const steem = require('steem');
const ora = require('ora');
const dateFormat = require('dateformat');

const REBLOG = 'reblog';
const FOLLOW = 'follow';

// 기본값
const STEEM_RESTEEM_AUTHOR = process.env.STEEM_RESTEEM_AUTHOR;
const STEEM_RESTEEM_KEY_POSTING = process.env.STEEM_RESTEEM_KEY_POSTING;

/*
* 리스팀을 수행한다
* 페이아웃기간(7일)이 지나도 리스팀 가능함
* @param link 주소정보 / 예시) https://steemit.com/kr/@wonsama/kr-dev-krob
* @param acc 리스팀 계정
* @param accPostingKey 리스팀 계정의 포스팅키
*/
async function resteem(link, acc, accPostingKey){

    const info = getInfoFromLink(link);
    const reblogJson = JSON.stringify([REBLOG, {
      account: acc,
      author: info.data.author,
      permlink: info.data.permlink
    }]);

    // 주소 정보 확인
    if(info.ok){
        // 현재(18.06.20) payout 발생 이후여도 리블로깅이 가능
        return steem.broadcast.customJsonAsync(accPostingKey, [], [acc], FOLLOW, reblogJson);
    }else{
        return Promise.reject(info.msg);
    } 
}

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
  // 초기화
  args = args?args:[];  // new 처리 하므로 return 처리 해야 됨에 유의

  // 1번째 : 주소 정보

  // 2번째 : 리스팀 할 계정
  if(args.length==1){
    if(STEEM_RESTEEM_AUTHOR){
      args.push(STEEM_RESTEEM_AUTHOR);
    }
  }

  // 3번째 : 리스팀 할 계정 포스팅키 
  if(args.length==2){
    if(STEEM_RESTEEM_KEY_POSTING){
      args.push(STEEM_RESTEEM_KEY_POSTING);
    }
  }

  return args;
}

module.exports = (args) => {

  // 파라미터 초기화
  args = initParams(args);

  // 입력 파라미터 유효성 검증 
  if(args.length!=3){
    console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
    help('resteem');
    return; 
  }

  // 작업 수행
  let mlink = args[0];
  let macc = args[1];
  let maccPostingKey = args[2];
  let spinner = ora().start('resteem 진행 중 입니다');

  resteem(mlink, macc, maccPostingKey)
  .then(results=>{
      spinner.succeed('resteem - 성공');
      console.log(`${mlink} 리스팀 되었습니다.`);
      console.log(`https://steemit.com/@${macc} 에서 확인 바랍니다.`);
  })
  .catch(e=>{

      spinner.fail('resteem - 실패');

      // 오류 출력
      const emsg = e.toString();
      if( emsg.indexOf('Account has already reblogged')>=0 ){
        console.error(`${mlink} 는 이미 리스팀 되었습니다.`);
        console.error(`https://steemit.com/@${macc} 에서 확인 바랍니다.`);
      }else if('unknown key:unknown key'){
        console.error(`입력 링크 [ ${mlink} ] 을(를) 확인 바랍니다. (존재하지 않는 링크 일 수 있습니다.)`);
      }
      else{
        console.error( `오류 메시지 : \n` );
        console.error( e );
      }


  });  
}