const help = require('./help');
const {getVotes} = require('../util/wsteem');

const ora = require('ora');

const MIN_VOTE_SBD = 0.001;

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
	// 초기화
	args = args?args:[];	// new 처리 하므로 return 처리 해야 됨에 유의

  // 1번째 : 링크 - 필수입력 
  
  // 2번째 : 최소 보팅금액
  if(args.length==1){
    args.push(MIN_VOTE_SBD);
  }

	return args;
}

/*
* 비동기 작업을 수행한다
* @param account 계정명
* @param days 조회 일자
*/ 
let spinner;
module.exports = (args)=>{

	// 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length<1){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('votedesc');
		return;	
	}

	// 비동기 작업을 수행한다
	let link = args[0];
  let sbdOver = args[1];

  spinner = ora().start('loading votes info');
	getVotes(link, sbdOver)
	.then(results=>{
    spinner.succeed();
    
    console.log(` - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`);
    if(results.sp>0){
      console.log(`지급 완료된 보상 : ${results.sp} SBD (저자 : ${results.tp} SBD / 큐레이터 : ${results.cp} SBD ) `);
    }else{
      console.log(`지급 대기중 보상 : ${results.pp} SBD`);
    }
    console.log(`총 보팅 : ${results.vc} 회 / 보상 ${sbdOver} SBD 이상 ${results.out.length} 회`);
    console.log(` - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`);
    

		console.log(`| ${'NO'.padStart(3)} |  ${'ID'.padStart(16)}  |  ${'SBD'.padStart(12)}  |  ${'PERCENT'.padStart(8)}  |  ${'URL'.padStart(35)}  |`);
    console.log(` - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`);
    let no = 1;
    for(let res of results.out){
      console.log(`| ${no.toString().padStart(3)} |  ${res.id.padStart(16)}  |  ${res.sbd.padStart(12)}  |  ${res.percent.padStart(8)}  |  ${('https://steemit.com/@'+res.id).padStart(35)}  |`);
      no++;
    }
	})
	.catch(e=>{
    spinner.fail();
		console.log(`____________________________________________________________`);
		console.error(e);
		console.log(`____________________________________________________________`);
		console.error('오류가 발생 했습니다.위쪽 라인을 참조 바랍니다.');
		console.log(`____________________________________________________________`);
	});

};