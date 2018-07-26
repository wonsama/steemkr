const help = require('./help');
let {getInfoFromLink} = require('../util/wutil');
const {to} = require('../util/wutil');

const steem = require('steem');
const ora = require('ora');

// 기본값
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_POSTING = process.env.STEEM_KEY_POSTING;
const STEEM_VOTES_LIST = process.env.STEEM_VOTES_LIST;

// STEEM_VOTES_LIST 에 해당하는 목록은 모두 POSTING 권한을 받아야 됨에 유의
// SEE : https://steemit.com/kr/@wonsama/5vgvgt-kr-dev

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
	// 초기화
	args = args?args:[];	// new 처리 하므로 return 처리 해야 됨에 유의

	// 1번째 : 링크 - 필수입력 
	
	// 2번째 : 보팅파워 (없으면 10000=100%)
	if(args.length==1){
    args.push(10000);
	}

  // 3번째 : 계정
  if(args.length==2){
    if(STEEM_AUTHOR){
      args.push(STEEM_AUTHOR);
    }
  }

  // 4번째 : 포스팅키
  if(args.length==3){
    if(STEEM_KEY_POSTING){
      args.push(STEEM_KEY_POSTING);
    }
  }

  // 5번째 : 위임된 계정 목록
  if(args.length==4){
    if(STEEM_VOTES_LIST){
      args.push(STEEM_VOTES_LIST);
    }
  }

	return args;
}

/*
* 비동기 작업을 수행한다
* @param link 보팅할 주소 
* @param weight 보팅 무게(-10000 ~ 10000)
* @param account 나의 계정명
* @param wif 나의 포스팅키
* @param vlist 위임된 계정목록
*/ 
let spinner;
async function processAsyc(link, weight, account, wif, vlist){

  let err;
  let operations = [];
  
  // 주소 정보 추출
  const info = getInfoFromLink(link);
  if(!info.ok){
    return Promise.reject(`check : ${info}`);
  }
  const author = info.data.author;
  const permlink = info.data.permlink;

  // 투표 대리인 목록 정보 로딩 및 명령목록(operations) 생성 
  const votes = vlist.split(',');
  for(let voter of votes){
    let _voter = voter.trim();
    if(_voter!=''){
      operations.push([
      'vote',
        {
          voter : _voter,
          author : author,
          permlink : permlink,
          weight : weight
        } 
      ]);
    }
  }

  // 보팅 목록 정보를 정리하여 전송처리
  let pvote;
  spinner = ora().start('broadcast operations');
  [err,pvote] = await to(steem.broadcast.sendAsync({ operations: operations, extensions: [] },{ posting: wif }));
  if(!err){
    spinner.succeed();
  }

  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  return Promise.resolve(pvote);
}

module.exports = (args)=>{

  // 파라미터 초기화
  args = initParams(args);

  // 입력 파라미터 유효성 검증 
  if(args.length<5){
    console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
    help('votegroup');
    return; 
  }

  let link = args[0];     // 보팅할 주소 
  let weight = args[1];   // 보팅 무게( -10000 ~ 10000 ) 사이의 값, -는 다운보팅
  let account = args[2];  // 계정 
  let wif = args[3];      // 포스팅 키
  let vlist = args[4];    // 보팅 위임 아이디 목록 

  processAsyc(link, weight, account, wif, vlist)
  .then(res=>{

    // 처리 정보를 화면에 출력한다
    console.log(`____________________________________________________________`);
    console.log(res);
    console.log(`____________________________________________________________`);
  })
  .catch(e=>{
    console.log(`____________________________________________________________`);
    console.error(e);
    console.log(`____________________________________________________________`);
    console.error('오류가 발생 했습니다.위쪽 라인을 참조 바랍니다.');
    console.log(`____________________________________________________________`);
  });
};