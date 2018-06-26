const help = require('./help');

const {to} = require('../util/wutil');
const {question} = require('../util/wutil');
const {getMoney} = require('../util/wsteem');

const steem = require('steem');
const dateFormat = require('dateformat');
const ora = require('ora');

// 기본값
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_ACTIVE = process.env.STEEM_KEY_ACTIVE;

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
	// 초기화
	args = args?args:[];	// new 처리 하므로 return 처리 해야 됨에 유의

	// 1번째 : 작가
	if(args.length==0){
		if(STEEM_AUTHOR){
			args = [];
			args.push(STEEM_AUTHOR);
		}
	}

	// 2번째 : 엑티브키 
	if(args.length==1){
		if(STEEM_KEY_ACTIVE){
			args.push(STEEM_KEY_ACTIVE);
		}
	}

	return args;
}

/*
* 비동기 작업을 수행한다
* @param account 계정명
* @param wif 엑티브키
*/ 
let spinner;
async function processAsyc(account, wif){

	// 오류처리용
  let err;

  // 계정정보 확인
  let acc;
  spinner = ora().start('loading account');
  [err, acc] = await to(steem.api.getAccountsAsync([account]));  
  if(acc){
    if(acc.length!=1){
      // 오류처리
      spinner.fail();
      return Promise.reject(`입력하신 ${account} 정보를 확인 바랍니다.`);
    }
  }else{
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  spinner.succeed(' ');
	
	// 기능 설명 및 계정 잔액정보 확인
  console.log(`____________________________________________________________`);
  console.log(` [convert] SBD를 STEEM으로 교환 ( 내부거래소 3.5일 간 평균 비율 기준 ) `);
  let sbd_balance = acc[0].sbd_balance;
  let sbd = getMoney(sbd_balance);
  if(sbd==0){
      // 오류처리
      return Promise.reject(`@${account} 님의 SBD 잔액이 0.000 SBD 입니다.`);
  }
  console.log(`____________________________________________________________`);
  console.log(` @${account} 님의 SBD 잔고 : ${sbd}`);
  console.log(`____________________________________________________________`);

	// 교환 금액 문의
  let amount;
  [err,amount] = await to(question(`SBD를 얼마나 교환하시겠습니까 ( Max : ${sbd} / 기본값 all ) ? `));
  if(!amount){
    // 전체
    amount = sbd;
  }else if(amount.toLowerCase()=='all'){
    // 전체
    amount = sbd;
  }else if(isNaN(amount)){
    // 오류처리
    return Promise.reject(`x.xxx 형태의 숫자만 입력 가능합니다.`);
  }else if(Number(amount)<=0){
    // 오류처리
    return Promise.reject(`0 이상으로 입력해야 됩니다.`);
  }else if(Number(amount)>sbd){
    // 오류처리
    return Promise.reject(`입력 값( ${amount} ) 는 잔고( ${sbd} ) 을(를) 초과할 수 없습니다.`);
  }

  // 계속진행할지 여부를 확인
  let go;
  [err,go] = await to(question(`교환을 진행하시겠습니까 ? ( y / n / 기본값 n ) : `));
  if(!go){
  	// 오류처리
    return Promise.reject('취소 하셨습니다.');	
  }else{
  	if(go.toLowerCase()!='y'){
  		// 오류처리
    	return Promise.reject('취소 하셨습니다.');	
  	}
  }

  // 작업 수행
	let works;
	let requestid = Number(new Date().getTime().toString().substr(4));     // 거래 취소에 필요한 order id 유니크 해야됨, uint32 : max 4294967295
  spinner = ora().start('sending convert');
  [err,works] = await to(steem.broadcast.convertAsync(wif, account, requestid, `${Number(amount).toFixed(3)} SBD`)); // SBD 대신 STEEM 또한 교환이 가능함.
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  
  // 결과 확인
  spinner.succeed(' ');
  return Promise.resolve(requestid);
}

module.exports = (args)=>{

	// 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length!=2){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('convert');
		return;	
	}

	// 비동기 작업을 수행한다
	let account = args[0];
	let wif = args[1];

	processAsyc(account, wif)
	.then(requestid=>{
		console.log(`Convert ( ${requestid} ) 가 정상적으로 등록되었습니다. (3.5일 후 확인 바랍니다)`)
	})
	.catch(e=>{
		console.log(`____________________________________________________________`);
		console.error(e);
		console.log(`____________________________________________________________`);
		console.error('거래가 실패 했습니다 - 처음부터 다시 진행 부탁 드립니다.');
		console.log(`____________________________________________________________`);
	});

};