const help = require('./help');
const {getLocalTime} = require('../util/wdate');
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
	args = args?args:[];  // new 처리 하므로 return 처리 해야 됨에 유의

	// 1번째 : 작가
	if(args.length==0){
		if(STEEM_AUTHOR){
			args.push(STEEM_AUTHOR);
		}
	}

	// 2번째 : 엑티브키(3 steem 필요 하기 때문)
	if(args.length==1){
		if(STEEM_KEY_ACTIVE){
			args.push(STEEM_KEY_ACTIVE);
		}
	}

	return args;
}

/*
* 계정 생성 비용을 반환한다
* @param config 설정정보
* @param chainProps 설정정보
* @return 계정 생성비용
*/
function getFee(config, chainProps) {
    var ratio = config['STEEM_CREATE_ACCOUNT_WITH_STEEM_MODIFIER'];
    var fee = Number(chainProps.account_creation_fee.split(" ")[0]); // 0.100 STEEM
    return (ratio * fee).toFixed(3) + " STEEM";
}

/*
* 계정을 생성한다
* @param cid 신규계정명
*/
async function createAccount(account, wif, cid, fee, remain)
{
	const roles = ["POSTING", "ACTIVE", "OWNER", "MEMO"];

	// 랜덤 암호 생성 및 공개키, 개인키를 생성한다.
	const newAccountPassword = steem.formatter.createSuggestedPassword();
	const arrPublicKey = steem.auth.generateKeys(cid, newAccountPassword, roles);
	const arrPrivateKey = steem.auth.getPrivateKeys(cid, newAccountPassword, roles);

	const owner = {
	    weight_threshold: 1,
	    account_auths: [],
	    key_auths: [
	        [arrPublicKey["OWNER"], 1]
	    ]
	};
	const active = {
	    weight_threshold: 1,
	    account_auths: [],
	    key_auths: [
	        [arrPublicKey["ACTIVE"], 1]
	    ]
	};
	const posting = {
	    weight_threshold: 1,
	    account_auths: [],
	    key_auths: [
	        [arrPublicKey["POSTING"], 1]
	    ]
	};

	let err,created;
	[err, created] = await to(steem.broadcast.accountCreateAsync(wif, fee, account, cid, owner, active, posting, arrPublicKey.MEMO,''));

	if(err){
		return Promise.reject(err);
	}else{
		return Promise.resolve({account:account, cid:cid, fee:fee, remain:remain, arrPrivateKey:arrPrivateKey });
	}
}

/*
* 비동기 작업을 수행한다 (계정생성처리)
* @param account 계정명
* @param wif 해당 계정의 ACTIVE키
*/
async function processAsyc(account, wif){

	let err;

	// 생성하려는 아이디정보 확인
	let cid;
  [err,cid] = await to(question(`만들려고 하는 ID를 입력 바랍니다 : `));

  // 아이디 유효성 검증
	let isValidUsername = steem.utils.validateAccountName(cid);
	if(isValidUsername!=null){
		// 최소 3자, 최대 16자, .기준 최소 3글자 이상
		return Promise.reject(isValidUsername);
	}

	// 생성하려는 아이디 존재여부 확인
  let mid;
  spinner = ora().start(`check ${cid} is exist ?`);
  [err,mid] = await to(steem.api.getAccountsAsync([cid]));
  if(!err){
		spinner.succeed();

		if(mid && mid.length==1){
			return Promise.reject(`${cid} 은(는) 존재하는 ID 입니다.`);
		}else{
			console.log(`${cid} 은(는) 사용하실 수 있습니다.`);
		}
	}

	// config 정보 읽어들이기
	let config;
	if(!err){
		spinner = ora().start('loading config');
		[err,config] = await to(steem.api.getConfigAsync());
	}	

	// chainProps 정보 읽어들이기 
	let chainProps;
	if(!err){
		spinner.succeed();

		spinner = ora().start('loading chainProps');
		[err,chainProps] = await to(steem.api.getChainPropertiesAsync());
	}

	// 내계정의 잔고 확인
	let myacc;
	if(!err){
		spinner.succeed();	

	  spinner = ora().start(`check my account balance`);
	  [err,myacc] = await to(steem.api.getAccountsAsync([account]));
	}
	
	// 가져온 값 유효성 검증
	let fee, remain;
	if(!err){
		spinner.succeed();

		if(myacc && myacc.length==0){
			return Promise.reject(`내 계정 ( ${account} ) 정보가 존재하지 않습니다.`);
		}

		// 추후(HF20) 이후에는 증인들이 제시한 값만 가지고 생성 할 예정이라 함.
		let balance = myacc[0].balance;
		fee = getFee(config, chainProps);
		remain = getMoney(balance) - getMoney(fee);
		
		if(remain<0){
			return Promise.reject(`내 계정 잔고( ${balance} )가 모자릅니다 : 최소 ${fee} 이상 필요`);
		}
	}

	// 가져온 값 연산처리
	let cacc;
	if(!err){
		spinner = ora().start(`create account`);
		[err,cacc] = await to(createAccount(account, wif, cid, fee, remain));

		if(!err){
			spinner.succeed();
		}
	}
	
	if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
	return Promise.resolve(cacc);
}

module.exports = (args)=>{

  // 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length<2){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('create');
		return;	
	}

	let account = args[0];
	let wif = args[1];

	processAsyc(account, wif)
	.then(res=>{
		// 생성된 계정 정보를 화면에 출력한다
		console.log(`____________________________________________________________`);
		console.log(`${res.account} 계정에서 ${res.fee} 를 소모하여 @${res.cid} 계정을 생성하였습니다. ( 계정 잔액 : ${res.remain} STEEM )`);
		console.log(`____________________________________________________________`);
		console.log(`private key`);
		console.log(`____________________________________________________________`);
		console.log(`POSTING : ${res.arrPrivateKey.POSTING}`);
		console.log(`ACTIVE : ${res.arrPrivateKey.ACTIVE}`);
		console.log(`OWNER : ${res.arrPrivateKey.OWNER}`);
		console.log(`MEMO : ${res.arrPrivateKey.MEMO}`);
		console.log(`____________________________________________________________`);
		console.log(`public key`);
		console.log(`____________________________________________________________`);
		console.log(`POSTING : ${res.arrPrivateKey.POSTINGPubkey}`);
		console.log(`ACTIVE : ${res.arrPrivateKey.ACTIVEPubkey}`);
		console.log(`OWNER : ${res.arrPrivateKey.OWNERPubkey}`);
		console.log(`MEMO : ${res.arrPrivateKey.MEMOPubkey}`);
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